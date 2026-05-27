import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    requiresPasswordReset: {
      type: Boolean,
      default: true,
    },
    employeeId: {
      type: String,
    },
  },
  { timestamps: true }
);

// Prevent compiling model multiple times due to Next.js HMR
export default mongoose.models.User || mongoose.model("User", UserSchema);
