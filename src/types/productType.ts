export interface ProductType {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  featured: boolean;
}

export interface ProductState {
  items: ProductType[]; // Danh sách tất cả sản phẩm
  selectedProduct: ProductType | null; // Sản phẩm đang xem chi tiết
  isLoading: boolean;
  error: string | null;
}

export interface ProductParams {
  keyword?: string;
  pageNumber?: number;
}
