import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/lib/models/Employee";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

function generatePassword(length = 8) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

export async function GET() {
  try {
    await connectDB();
    const employees = await Employee.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: employees.length, data: employees });
  } catch (error: any) {
    console.error("GET Employees API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const payload = await req.json();

    // Basic required fields assertion
    const requiredFields = [
      "employeeId",
      "fullName",
      "primaryContact",
      "department",
      "designation",
      "locationUnit",
      "employmentType",
      "dateJoining",
      "compensationType",
    ];

    for (const field of requiredFields) {
      if (!payload[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check for unique employeeId
    const existingEmployee = await Employee.findOne({ employeeId: payload.employeeId });
    if (existingEmployee) {
      return NextResponse.json(
        { error: `Employee ID ${payload.employeeId} already exists` },
        { status: 409 }
      );
    }

    const newEmployee = await Employee.create(payload);

    const targetEmail = payload.officialEmail || payload.personalEmail;

    if (targetEmail) {
      const tempPassword = generatePassword();
      const hashedPassword = bcrypt.hashSync(tempPassword, 10);
      
      const existingUser = await User.findOne({ email: targetEmail.toLowerCase() });
      if (!existingUser) {
        await User.create({
          email: targetEmail.toLowerCase(),
          password: hashedPassword,
          requiresPasswordReset: true,
          employeeId: newEmployee.employeeId
        });

        // Send Email
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_ID,
          to: targetEmail,
          subject: 'Welcome to Sudarshan Group - Your Login Credentials',
          text: `Hello ${payload.fullName},\n\nYour account has been created successfully.\n\nYour temporary password is: ${tempPassword}\n\nPlease log in and you will be prompted to reset your password.\n\nBest Regards,\nSudarshan Group HR`
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (mailErr) {
          console.error("Failed to send email:", mailErr);
        }
      }
    }

    return NextResponse.json({ success: true, data: newEmployee }, { status: 201 });
  } catch (error: any) {
    console.error("POST Employee API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
