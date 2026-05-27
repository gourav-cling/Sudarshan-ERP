import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Role, { DEFAULT_ROLES } from "@/lib/models/Role";

async function seedDefaultRoles() {
  const count = await Role.countDocuments();
  if (count === 0) {
    await Role.insertMany(DEFAULT_ROLES);
  }
}

export async function GET() {
  try {
    await connectDB();
    await seedDefaultRoles();
    const roles = await Role.find({}).sort({ isSystem: -1, label: 1 });
    return NextResponse.json({ success: true, data: roles });
  } catch (error: any) {
    console.error("GET Roles Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const payload = await req.json();

    if (!payload.roleKey || !payload.label) {
      return NextResponse.json({ error: "roleKey and label are required" }, { status: 400 });
    }

    // Prevent overwriting system roles
    const existing = await Role.findOne({ roleKey: payload.roleKey.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: `Role key "${payload.roleKey}" already exists` }, { status: 409 });
    }

    const role = await Role.create({
      ...payload,
      roleKey: payload.roleKey.toLowerCase(),
      isSystem: false,
    });

    return NextResponse.json({ success: true, data: role }, { status: 201 });
  } catch (error: any) {
    console.error("POST Role Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
