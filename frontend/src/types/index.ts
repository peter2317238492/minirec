// frontend/src/types/index.ts
export interface Item {
  _id: string;
  category: 'attraction' | 'food' | 'hotel';
  name: string;
  description: string;
  images: string[];
  price: number;
  rating: number;
  purchaseCount?: number;
  location: {
    city: string;
    address: string;
    coordinates?: [number, number];
  };
  tags: string[];
  reviews: Review[];
  distance?: number;
  details?: {
    // 景点相关
    openingHours?: string;
    openingMonths?: string;
    ticketInfo?: string;
    transportationOptions?: string[];
    highlights?: string[];
    features?: string;
    
    // 酒店相关
    checkIn?: string;
    checkOut?: string;
    facilities?: string[];
    services?: string[];
    roomTypes?: string[];
    
    // 餐厅相关
    phone?: string;
    specialties?: string[];
    averagePrice?: string;
  };
}

export interface Review {
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
  date: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  preferences?: {
    categories: string[];
    tags: string[];
  };
}

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
  loginDate: string;
  loginType: 'password' | 'third_party';
  ipAddress: string;
  userAgent: string;
}

export interface Merchant {
  id: string;
  username: string;
  email: string;
  merchantInfo: MerchantInfo;
  permissions: MerchantPermission;
  loginHistory?: LoginRecord[];
  lastLoginAt?: string;
}

export interface MerchantLoginInfo {
  date: string;
  loginType: string;
  receiver: string;
  handler: string;
  description: string;
  processingTime: string;
  submitter: string;
}