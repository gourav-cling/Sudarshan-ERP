import bcrypt from "bcryptjs";
import { connectDB, isDbConfigured } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSession } from "@/lib/session";
import { ok, fail } from "@/lib/api-response";
import { SEED_DATA } from "@/lib/seed-data";
import { useMockDataEnabled } from "@/lib/bootstrap-meta";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return fail("Email and password are required", 400);
  }

  if (!isDbConfigured()) {
    if (!useMockDataEnabled()) {
      return fail(
        "Database not configured. Set MONGODB_URI in .env.local and run npm run seed.",
        503
      );
    }
    const demo = SEED_DATA.USERS.find((u) => u.email === email);
    if (!demo || password !== "sudarshan123") {
      return fail("Invalid credentials", 401);
    }
    const session = await getSession();
    session.user = {
      id: demo.employeeId ?? "demo",
      email: demo.email,
      name: demo.name,
      role: demo.role,
    };
    session.isLoggedIn = true;
    await session.save();
    return ok({ user: session.user, next: "/select-company" });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email }).lean();
    if (!user) return fail("Invalid credentials", 401);
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return fail("Invalid credentials", 401);

    const session = await getSession();
    session.user = {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
    };
    session.isLoggedIn = true;
    await session.save();

    return ok({ user: session.user, next: "/select-company" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Login failed";
    return fail(message, 500);
  }
}
