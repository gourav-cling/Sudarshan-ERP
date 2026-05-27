import { getSession } from "@/lib/session";
import { ok } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  return ok({
    isLoggedIn: session.isLoggedIn ?? false,
    user: session.user ?? null,
  });
}
