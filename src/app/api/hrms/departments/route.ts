import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/lib/models/Employee";

export async function GET() {
  try {
    await connectDB();
    // Get unique departments that are not null or empty
    const departments = await Employee.distinct("department", { department: { $nin: [null, ""] } });
    // Sort alphabetically
    departments.sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ success: true, data: departments });
  } catch (error: any) {
    console.error("GET Departments API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
