// backend/src/models/Item.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

/** 嵌入在 Item 文档里的“最近评论”子文档（与独立 Review 集合对应） */
export interface IEmbeddedReview {
  reviewId: Types.ObjectId;   // 指向独立 Review 文档的 _id
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

export interface IItem extends Document {
  category: 'attraction' | 'food' | 'hotel';
  name: string;
  description: string;
  images: string[];
  price: number;

  /** 冗余统计，便于排序与快速展示 */
  rating: number;       // 平均分（ratingSum / ratingCount，保留到 2 位即可）
  ratingSum: number;    // 总分（用于 O(1) 更新）
  ratingCount: number;  // 总评分次数

  purchaseCount?: number;
  location: {
    city: string;
    address: string;
    coordinates?: [number, number]; // [lng, lat]
  };
  tags: string[];
  details: any;

  /** 仅保留最近 N 条（由控制器限制长度，避免文档过大） */
  reviews: IEmbeddedReview[];

  createdAt: Date;
  updatedAt: Date;
}

/** 嵌入式评论子文档：不自动生成 _id，使用 reviewId 关联独立集合 */
const EmbeddedReviewSchema = new Schema<IEmbeddedReview>(
  {
    reviewId: { type: Schema.Types.ObjectId, ref: 'Review', required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    taste: { type: Number, required: false, min: 1, max: 5 },
    service: { type: Number, required: false, min: 1, max: 5 },
    environment: { type: Number, required: false, min: 1, max: 5 },
    comfort: { type: Number, required: false, min: 1, max: 5 },
    location: { type: Number, required: false, min: 1, max: 5 },
    scenery: { type: Number, required: false, min: 1, max: 5 },
    transportation: { type: Number, required: false, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ItemSchema = new Schema<IItem>(
  {
    category: { type: String, enum: ['attraction', 'food', 'hotel'], required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },

    // 冗余评分统计
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingSum: { type: Number, default: 0, min: 0 },
    ratingCount: { type: Number, default: 0, min: 0 },

    purchaseCount: { type: Number, default: 0, min: 0 },

    location: {
      city: { type: String, default: '' },
      address: { type: String, default: '' },
      // 你的坐标此前就是数组索引；保留此写法即可
      coordinates: { type: [Number], index: '2dsphere' }
    },

    tags: { type: [String], default: [] },
    details: Schema.Types.Mixed,

    // 只保留最近 N 条（由控制器逻辑裁剪）
    reviews: { type: [EmbeddedReviewSchema], default: [] }
  },
  { timestamps: true }
);

// 可选索引：按评分排序/按类目筛选更快
ItemSchema.index({ category: 1, rating: -1 });
ItemSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.model<IItem>('Item', ItemSchema);
