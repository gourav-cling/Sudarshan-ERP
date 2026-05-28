import { connectDB } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import LeavePolicy from "@/lib/models/LeavePolicy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return fail("Invalid body", 400);

    const policy = await LeavePolicy.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!policy) return fail("Policy not found", 404);
    return ok({ policy });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const policy = await LeavePolicy.findByIdAndDelete(id);
    if (!policy) return fail("Policy not found", 404);
    return ok({ deleted: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed", 500);
  }
}
