import { Schema, model, models, Types } from "mongoose";

const PostSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    comment: { type: String, default: "" },

    // 🧠 New Field — Stores the auto-generated summary
    summary: { type: String, default: "" },
  },
  { timestamps: true }
);

// Avoid recompilation errors during hot reload
export default models.Post || model("Post", PostSchema);
