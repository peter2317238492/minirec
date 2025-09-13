import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  itemId: string;
  userId: string;
  userName: string;
  rating: number;
  taste?: number;
  service?: number;
  environment?: number;
  comfort?: number;
  location?: number;
  scenery?: number;
  transportation?: number;
  comment: string;
  date: Date;
}

const ReviewSchema: Schema = new Schema({
  itemId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true },
  taste: { type: Number, required: false },
  service: { type: Number, required: false },
  environment: { type: Number, required: false },
  comfort: { type: Number, required: false },
  location: { type: Number, required: false },
  scenery: { type: Number, required: false },
  transportation: { type: Number, required: false },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model<IReview>('Review', ReviewSchema);