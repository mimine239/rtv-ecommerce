// Types pour les produits
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  images?: string[];
  stock: number;
  vendorId: string;
  vendorName: string;
  featured: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Types pour les bannières
export interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
  vendorId: string;
  vendorName: string;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  startDate: Date | string;
  endDate: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Types pour les utilisateurs
export interface User {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'buyer' | 'vendor' | 'admin';
  photoURL?: string;
  createdAt: Date | string;
}

// Types pour la pagination
export interface PaginationResult<T> {
  items: T[];
  lastDoc: any;
  hasMore: boolean;
}
