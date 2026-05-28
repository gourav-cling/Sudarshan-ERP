import mongoose, { Schema } from "mongoose";

const AttendanceImportJobSchema = new Schema(
  {
    status: { type: String, enum: ["pending", "processed", "failed"], default: "pending", index: true },
    source: { type: String, enum: ["excel", "api"], default: "excel" },
    filename: { type: String, trim: true },
    processedAt: { type: Date },
    error: { type: String, trim: true },
    stats: {
      rows: { type: Number, default: 0 },
      created: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
      errors: { type: Number, default: 0 },
    },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.AttendanceImportJob ||
  mongoose.model("AttendanceImportJob", AttendanceImportJobSchema);

