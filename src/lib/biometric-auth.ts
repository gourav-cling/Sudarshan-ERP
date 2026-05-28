import crypto from "crypto";

type VerifyResult =
  | { ok: true; mode: "apiKey" | "hmac" }
  | { ok: false; error: string };

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function verifyBiometricRequest(request: Request, rawBody: string): VerifyResult {
  const apiKey = process.env.BIOMETRIC_API_KEY || process.env.INTEGRATION_API_KEY || "";

  const apiKeyHeader =
    request.headers.get("x-biometric-key") ||
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  if (apiKey && apiKeyHeader && safeEqual(apiKeyHeader, apiKey)) {
    return { ok: true, mode: "apiKey" };
  }

  const secret = process.env.BIOMETRIC_HMAC_SECRET || "";
  const signature = request.headers.get("x-signature") || "";
  const timestamp = request.headers.get("x-timestamp") || "";

  if (secret && signature && timestamp) {
    const ts = Number(timestamp);
    if (!Number.isFinite(ts)) return { ok: false, error: "Invalid x-timestamp" };

    const now = Date.now();
    const skewMs = Math.abs(now - ts);
    if (skewMs > 5 * 60 * 1000) return { ok: false, error: "Signature expired" };

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    if (!safeEqual(signature, expected)) return { ok: false, error: "Invalid signature" };
    return { ok: true, mode: "hmac" };
  }

  return { ok: false, error: "Missing integration auth (api key or hmac)" };
}

