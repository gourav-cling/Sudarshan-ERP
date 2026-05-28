import { connectDB } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import LeaveRequest from "@/lib/models/LeaveRequest";
import LeavePolicy from "@/lib/models/LeavePolicy";
import Employee from "@/lib/models/Employee";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const department = url.searchParams.get("department");
    const employeeId = url.searchParams.get("employeeId");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const q: Record<string, any> = {};
    if (status) q.status = status;
    if (department) q.department = department;
    if (employeeId) q.employeeId = employeeId;
    if (from || to) {
      q.fromDate = {};
      if (from) q.fromDate.$gte = new Date(from);
      if (to)   q.fromDate.$lte = new Date(to);
    }

    const leaves = await LeaveRequest.find(q).sort({ createdAt: -1 }).lean();
    return ok(leaves);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed", 500);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user?.email) return fail("Unauthorized", 401);

  try {
    await connectDB();
    const body = await request.json().catch(() => null);
    if (!body) return fail("Invalid body", 400);

    const { employeeId, leaveType, fromDate, toDate, days, reason } = body;
    if (!employeeId || !leaveType || !fromDate || !toDate || !days) {
      return fail("employeeId, leaveType, fromDate, toDate, days are required", 400);
    }

    const employee = await Employee.findOne({ employeeId }).lean();
    if (!employee) return fail(`Employee ${employeeId} not found`, 404);

    const created = await LeaveRequest.create({
      employeeId,
      employeeName: employee.fullName,
      department: employee.department,
      reportingManager: employee.reportingManager,
      leaveType,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      days,
      reason: reason || "",
      status: "pending",
    });

    return ok({ leave: created }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Apply failed", 500);
  }
}
