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