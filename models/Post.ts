import { Schema, model, models, Types } from "mongoose";

const PostSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true },
  comment: { type: String, default: "" },
}, { timestamps: true });

export default models.Post || model("Post", PostSchema);
