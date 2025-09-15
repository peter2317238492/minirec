// backend/src/models/Merchant.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

/** ---------- Domain interfaces (plain data) ---------- */
export interface MerchantInfo {
  shopName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  businessHours: {
    open: string;
    close: string;
  };
  category: 'attraction' | 'food' | 'hotel';
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
}

export interface MerchantPermission {
  // 商品管理权限
  canAddItems: boolean;
  canEditItems: boolean;
  canDeleteItems: boolean;
  canManageCategories: boolean;
  
  // 数据分析权限
  canViewAnalytics: boolean;
  canViewRevenue: boolean;
  canExportData: boolean;
  
  // 订单管理权限
  canManageOrders: boolean;
  canProcessRefunds: boolean;
  canViewCustomerInfo: boolean;
  
  // 评价管理权限
  canRespondToReviews: boolean;
  canDeleteReviews: boolean;
  canViewReviewAnalytics: boolean;
  
  // 店铺管理权限
  canUpdateShopInfo: boolean;
  canManageBusinessHours: boolean;
  canUploadImages: boolean;
  
  // 营销推广权限
  canCreatePromotions: boolean;
  canManageDiscounts: boolean;
  canViewMarketingStats: boolean;
  
  // 系统设置权限
  canManageUsers: boolean;
  canViewSystemLogs: boolean;
  canManageApiKeys: boolean;
}

export interface LoginRecord {
  loginDate: Date;
  loginType: 'password' | 'third_party';
  ipAddress: string;
  userAgent: string;
}

/** ---------- Base merchant shape (without Mongoose props) ---------- */
export interface IMerchant {
  username: string;
  email: string;
  password: string;
  merchantInfo: MerchantInfo;
  permissions: MerchantPermission;
  loginHistory: LoginRecord[];
  isActive: boolean;
  lastLoginAt?: Date;
}

/** ---------- Mongoose document & model typings ---------- */
export interface IMerchantDoc extends IMerchant, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  recordLogin(loginType: 'password' | 'third_party', ipAddress: string, userAgent: string): Promise<void>;
}

export interface IMerchantModel extends Model<IMerchantDoc> {}

/** ---------- Sub-schemas (for nested arrays) ---------- */
const LoginRecordSchema = new Schema<LoginRecord>(
  {
    loginDate: { type: Date, default: Date.now },
    loginType: { type: String, enum: ['password', 'third_party'], required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
  },
  { _id: false }
);

const MerchantInfoSchema = new Schema<MerchantInfo>(
  {
    shopName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    businessHours: {
      open: { type: String, required: true },
      close: { type: String, required: true },
    },
    category: { type: String, enum: ['attraction', 'food', 'hotel'], required: true },
    images: { type: [String], default: [] },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'suspended'], 
      default: 'pending' 
    },
  },
  { _id: false }
);

const MerchantPermissionSchema = new Schema<MerchantPermission>(
  {
    // 商品管理权限
    canAddItems: { type: Boolean, default: true },
    canEditItems: { type: Boolean, default: true },
    canDeleteItems: { type: Boolean, default: false },
    canManageCategories: { type: Boolean, default: false },
    
    // 数据分析权限
    canViewAnalytics: { type: Boolean, default: true },
    canViewRevenue: { type: Boolean, default: true },
    canExportData: { type: Boolean, default: false },
    
    // 订单管理权限
    canManageOrders: { type: Boolean, default: true },
    canProcessRefunds: { type: Boolean, default: false },
    canViewCustomerInfo: { type: Boolean, default: true },
    
    // 评价管理权限
    canRespondToReviews: { type: Boolean, default: true },
    canDeleteReviews: { type: Boolean, default: false },
    canViewReviewAnalytics: { type: Boolean, default: true },
    
    // 店铺管理权限
    canUpdateShopInfo: { type: Boolean, default: true },
    canManageBusinessHours: { type: Boolean, default: true },
    canUploadImages: { type: Boolean, default: true },
    
    // 营销推广权限
    canCreatePromotions: { type: Boolean, default: false },
    canManageDiscounts: { type: Boolean, default: false },
    canViewMarketingStats: { type: Boolean, default: true },
    
    // 系统设置权限
    canManageUsers: { type: Boolean, default: false },
    canViewSystemLogs: { type: Boolean, default: false },
    canManageApiKeys: { type: Boolean, default: false },
  },
  { _id: false }
);

/** ---------- Main Merchant schema ---------- */
const MerchantSchema = new Schema<IMerchantDoc>(
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
    merchantInfo: {
      type: MerchantInfoSchema,
      required: true,
    },
    permissions: {
      type: MerchantPermissionSchema,
      default: () => ({}),
    },
    loginHistory: {
      type: [LoginRecordSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

/** ---------- Pre-save hook for hashing password ---------- */
MerchantSchema.pre('save', async function (this: IMerchantDoc, next) {
  try {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

/** ---------- Instance methods ---------- */
MerchantSchema.methods.comparePassword = async function (
  this: IMerchantDoc,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

MerchantSchema.methods.recordLogin = async function (
  this: IMerchantDoc,
  loginType: 'password' | 'third_party',
  ipAddress: string,
  userAgent: string
): Promise<void> {
  this.loginHistory.push({
    loginDate: new Date(),
    loginType,
    ipAddress,
    userAgent,
  });
  this.lastLoginAt = new Date();
  await this.save();
};

/** ---------- Model ---------- */
const Merchant = mongoose.model<IMerchantDoc, IMerchantModel>('Merchant', MerchantSchema);
export default Merchant;