import mongoose, { Schema } from "mongoose";

const AttendanceDeviceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    provider: { type: String, trim: true }, // zkteco/essl/mobile/etc.
    kind: { type: String, enum: ["machine", "mobile"], default: "machine" },
    externalId: { type: String, trim: true },
    locationUnit: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AttendanceDeviceSchema.index({ provider: 1, externalId: 1 }, { unique: false });

export default mongoose.models.AttendanceDevice ||
  mongoose.model("AttendanceDevice", AttendanceDeviceSchema);

