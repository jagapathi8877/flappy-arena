import mongoose, { Schema, type Document } from 'mongoose';

export interface IScore extends Document {
  userId: mongoose.Types.ObjectId;
  score: number;
  createdAt: Date;
}

const ScoreSchema = new Schema<IScore>({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score:     { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

ScoreSchema.index({ score: -1 });
ScoreSchema.index({ createdAt: -1 });
ScoreSchema.index({ userId: 1, score: -1 });

export const Score = mongoose.model<IScore>('Score', ScoreSchema);
