import { connectDB } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import SalarySheet from "@/lib/models/SalarySheet";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) return fail("Unauthorized", 401);

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return fail("Invalid body", 400);

    // Prevent changing identity fields
    delete body.employeeId;
    delete body.cycle;

    const sheet = await SalarySheet.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!sheet) return fail("Salary sheet not found", 404);
    return ok({ sheet });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Update failed", 500);
  }
}
