import { ok } from "@/lib/api-response";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "";
  return ok({
    sent: true,
    email: email || "rajiv@sudarshan.co.in",
    message: "If an account exists, reset instructions were sent.",
  });
}
