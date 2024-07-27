// src/models/Media.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IMedia extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  url: string;
  key: string;
  fileType: string;
  createdAt: Date;
}

const mediaSchema: Schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true },
  fileType: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMedia>("Media", mediaSchema);
