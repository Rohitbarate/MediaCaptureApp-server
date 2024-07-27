// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
}

const userSchema: Schema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

export default mongoose.model<IUser>("User", userSchema);
