export type PriceHistoryItem = {
  price: number;
  recordedAt: string;
};

export type Subscriber = {
  email: string;
  subscribedAt: string;
};

export type Product = {
  id: number;
  url: string;
  currency: string;
  image: string;
  title: string;
  currentPrice: number;
  originalPrice: number;
  priceHistory: PriceHistoryItem[];
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  discountRate: number;
  description: string;
  category: string;
  reviewsCount: number;
  stars: number;
  isOutOfStock: boolean;
  subscribers: Subscriber[];
  createdAt: string;
  updatedAt: string;
};