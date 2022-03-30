export interface Product {
  id: number;
  name: string;
  date_created_gmt: string;
  featured: boolean;
  sku: string;
  price: string;
  sale_price: string;
  categories: {
    id: number;
    name: string;
  }[];
  tags: string[];
  images: { id: number; src: string }[];
  stock_status: string;
}

export interface Credentials {
    userKey: string;
    userSecretKey: string;
    website: string;
  }