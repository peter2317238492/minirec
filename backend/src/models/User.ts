// src/models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

/** ---------- Domain interfaces (plain data) ---------- */
export interface Preference {
  categories: string[];
  tags: string[];
  /** Optional price range: [min, max] */
  priceRange?: [number, number];
}

export interface PurchaseRecord {
  itemId: string;
  itemName: string;
  category: string;
  price: number;
  purchaseDate: Date;
}

export interface ViewRecord {
  itemId: string;
  viewDate: Date;
  duration: number; // seconds
}

/** ---------- Base user shape (without Mongoose props) ---------- */
export interface IUser {
  username: string;
  email: string;
  password: string;
  preferences: Preference;
  purchaseHistory: PurchaseRecord[];
  viewHistory: ViewRecord[];
}

/** ---------- Mongoose document & model typings ---------- */
export interface IUserDoc extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDoc> {}

/** ---------- Sub-schemas (for nested arrays) ---------- */
const PurchaseSchema = new Schema<PurchaseRecord>(
  {
    itemId: { type: String, required: true, trim: true },
    itemName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ViewSchema = new Schema<ViewRecord>(
  {
    itemId: { type: String, required: true, trim: true },
    viewDate: { type: Date, default: Date.now },
    duration: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

/** ---------- Main User schema ---------- */
const UserSchema = new Schema<IUserDoc>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    preferences: {
      categories: { type: [String], default: [] },
      tags: { type: [String], default: [] },
      // priceRange stored as an array of two numbers: [min, max]
      priceRange: {
        type: [Number],
        validate: {
          validator: function (arr: number[]) {
            // allow undefined or empty; if provided, must be length 2
            if (!arr || arr.length === 0) return true;
            return arr.length === 2 && arr.every((n) => typeof n === 'number');
          },
          message: 'priceRange must be an array of two numbers: [min, max]',
        },
      },
    },
    purchaseHistory: {
      type: [PurchaseSchema],
      default: [],
    },
    viewHistory: {
      type: [ViewSchema],
      default: [],
    },
  },
  { timestamps: true }
);

/** ---------- Pre-save hook for hashing password ----------
 * IMPORTANT: Use function (this: IUserDoc) to type the `this` binding.
 */
UserSchema.pre('save', async function (this: IUserDoc, next) {
  try {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    // Here `this.password` is strongly typed as string (not unknown)
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

/** ---------- Instance methods ---------- */
UserSchema.methods.comparePassword = async function (
  this: IUserDoc,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/** ---------- Model ---------- */
const User = mongoose.model<IUserDoc, IUserModel>('User', UserSchema);
export default User;
