import mongoose, { Schema } from "mongoose";

const LocationSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    accuracy: { type: Number },
    address: { type: String, trim: true },        // human-readable reverse-geocoded address
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false }
);

const AttendancePunchSchema = new Schema(
  {
    employeeId: { type: String, index: true },
    userId: { type: String, index: true },
    userEmail: { type: String, index: true, lowercase: true, trim: true },
    punchType: { type: String, enum: ["in", "out"], required: true, index: true },
    punchedAt: { type: Date, required: true, index: true },
    source: { type: String, enum: ["web", "mobile", "machine"], default: "web", index: true },
    deviceId: { type: String },
    location: { type: LocationSchema },
    notes: { type: String, trim: true },
    raw: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AttendancePunchSchema.index({ employeeId: 1, punchedAt: -1 });
AttendancePunchSchema.index({ userId: 1, punchedAt: -1 });

export default mongoose.models.AttendancePunch ||
  mongoose.model("AttendancePunch", AttendancePunchSchema);

