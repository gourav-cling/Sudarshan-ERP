import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Role from "@/lib/models/Role";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const role = await Role.findOne({ roleKey: id });
    if (!role) {
      return NextResponse.json({ error: `Role "${id}" not found` }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: role });
  } catch (error: any) {
    console.error("GET Role Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const payload = await req.json();

    const role = await Role.findOne({ roleKey: id });
    if (!role) {
      return NextResponse.json({ error: `Role "${id}" not found` }, { status: 404 });
    }

    // Prevent changing roleKey or isSystem of system roles
    if (role.isSystem) {
      delete payload.roleKey;
      delete payload.isSystem;
    }

    const updated = await Role.findOneAndUpdate(
      { roleKey: id },
      { $set: payload },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT Role Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const role = await Role.findOne({ roleKey: id });
    if (!role) {
      return NextResponse.json({ error: `Role "${id}" not found` }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json({ error: "System roles cannot be deleted" }, { status: 403 });
    }

    await Role.deleteOne({ roleKey: id });
    return NextResponse.json({ success: true, message: `Role "${id}" deleted` });
  } catch (error: any) {
    console.error("DELETE Role Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
