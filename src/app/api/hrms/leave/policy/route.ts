import { connectDB } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import LeavePolicy, { DEFAULT_LEAVE_POLICIES } from "@/lib/models/LeavePolicy";

async function seedIfEmpty() {
  const count = await LeavePolicy.countDocuments();
  if (count === 0) await LeavePolicy.insertMany(DEFAULT_LEAVE_POLICIES);
}

export async function GET() {
  try {
    await connectDB();
    await seedIfEmpty();
    const policies = await LeavePolicy.find({}).sort({ leaveType: 1 }).lean();
    return ok(policies);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed", 500);
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => null);
    if (!body?.leaveType || !body?.label) return fail("leaveType and label required", 400);

    const existing = await LeavePolicy.findOne({ leaveType: body.leaveType });
    if (existing) return fail(`Policy for ${body.leaveType} already exists`, 409);

    const policy = await LeavePolicy.create(body);
    return ok({ policy }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed", 500);
  }
}
