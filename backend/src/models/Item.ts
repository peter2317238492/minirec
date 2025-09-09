import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  category: 'attraction' | 'food' | 'hotel';
  name: string;
  description: string;
  images: string[];
  price: number;
  rating: number;
  location: {
    city: string;
    address: string;
    coordinates?: [number, number];
  };
  tags: string[];
  details: any;
  reviews: {
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema: Schema = new Schema({
  category: {
    type: String,
    enum: ['attraction', 'food', 'hotel'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  price: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  location: {
    city: String,
    address: String,
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  tags: [String],
  details: Schema.Types.Mixed,
  reviews: [{
    userId: String,
    userName: String,
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IItem>('Item', ItemSchema);