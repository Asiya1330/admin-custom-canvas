'use client'
export interface User {
  email: string;
  role: 'admin' | 'user';
  name: string;
}

export interface Artist {
  name: string;
  bio: string;
  imageUrl: string;
}

export interface HomeImage {
  url: string;
  title: string;
  order: number;
}

export interface Image {
  url: string;
  title: string;
  artistId: string;
  subjects: string[];
}

export interface Order {
  userId: string;
  products: Array<{
    productId: string;
    quantity: number;
  }>;
  status: 'pending' | 'processing' | 'completed';
  total: number;
}

export interface Product {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface QueueItem {
  type: 'image' | 'product';
  itemId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface Subject {
  name: string;
  description: string;
}
