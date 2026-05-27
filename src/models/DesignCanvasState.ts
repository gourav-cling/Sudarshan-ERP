import mongoose, { Schema, models, model } from "mongoose";

const DesignCanvasStateSchema = new Schema(
  {
    key: { type: String, default: "default", unique: true },
    sections: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const DesignCanvasState =
  models.DesignCanvasState || model("DesignCanvasState", DesignCanvasStateSchema);
