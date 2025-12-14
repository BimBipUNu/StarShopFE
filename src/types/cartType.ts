import type { ProductType } from "./productType";

export interface CartType {
  id: string;
  userId: string;
  items: ({
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    total: number;
    selected: boolean;
  } & { product: ProductType })[];
}

export interface CartItemType {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  total: number;
  isSelected: boolean;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
}
