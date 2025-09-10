import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  itemId: string;
  userId: string;
  userName: string;
  rating: number;
  taste: number;
  packaging: number;
  comment: string;
  date: Date;
}

const ReviewSchema: Schema = new Schema({
  itemId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true },
  taste: { type: Number, required: true },
  packaging: { type: Number, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model<IReview>('Review', ReviewSchema);