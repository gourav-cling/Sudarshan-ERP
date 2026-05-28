import mongoose, { Schema } from "mongoose";

const HolidaySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true, index: true },
    type: {
      type: String,
      enum: ["national", "regional", "optional"],
      default: "national",
    },
    year: { type: Number, required: true, index: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

HolidaySchema.index({ date: 1, type: 1 });

export default mongoose.models.Holiday ||
  mongoose.model("Holiday", HolidaySchema);
