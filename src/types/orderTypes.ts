export interface OrderType {
  id: number;
  userId: number;
  totalAmount: number;
  status: "pending" | "approved" | "cancelled";
}

export interface OrderItemType {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
}
