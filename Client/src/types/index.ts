export enum status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface User {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'user';
  status?: status;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  // subcategory: string; // Optional, if not used
  brandId: string;
  subCategoryId: string;
  createdAt?: Date;
  // status: 'active' | 'inactive'; 
  variants: ProductVariant[];
}
export interface ProductVariant {
  id?: string;
  productId?: string;
  size: string;
  color: string;
  price: number;
  stock_qty: number;
  barcode?: string; 
  // status: 'active' | 'inactive';
  createdAt?: Date;
}
export interface Category {
  id?: string;
  name: string;
  status: status;
  slug: string;
  createdAt?: Date | string;
}

export interface SubCategory {
  id?: string;
  name: string;
  status: status;
  categoryId: string;
}

export interface Brand {
  id?: string;
  name: string;
  status: status;
  slug: string;
  createdAt?: Date;
}

export interface Invoice {
  id?: string;
  invoiceNumber?: string;
  customerName?: string;
  customerPhone?: string;
  invoiceItems: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'cheque';
  createdAt?: Date;
  status: 'paid' | 'pending' | 'cancelled';
}

export interface InvoiceItem {
  id?: string;
  productId: string;
  variantId: any;
  variant: any;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalSalesToday: number;
  totalInvoices: number;
  inventoryValue: number;
  outOfStockCount: number;
  lowStockCount: number;
}

export interface ChartData {
  date: string;
  sales: number;
  revenue: number;
}

export type AlertType = 'success' | 'error' | 'warning' | 'info';