import { fail } from "@/lib/api-response";
import { verifyBiometricRequest } from "@/lib/biometric-auth";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const auth = verifyBiometricRequest(request, rawBody);
  if (!auth.ok) return fail(auth.error, 401);

  // Implemented in the Excel import todo: this endpoint will accept .xlsx uploads
  // from biometric vendors and create AttendancePunch entries.
  return fail("Excel import not implemented yet", 501);
}

