import { connectDB } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import SalarySheet from "@/lib/models/SalarySheet";

export async function GET(request: Request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const cycle = url.searchParams.get("cycle");
    const department = url.searchParams.get("department");
    const status = url.searchParams.get("status");

    const q: Record<string, any> = {};
    if (cycle) q.cycle = cycle;
    if (department) q.department = department;
    if (status) q.status = status;

    const sheets = await SalarySheet.find(q).sort({ employeeName: 1 }).lean();
    return ok(sheets);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed", 500);
  }
}
