import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
  rollNumber: string;
  name: string;
  passwordHash: string;
  bestScore: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  rollNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name:         { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  bestScore:    { type: Number, default: 0 },
  createdAt:    { type: Date, default: Date.now },
});

UserSchema.index({ bestScore: -1, rollNumber: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
