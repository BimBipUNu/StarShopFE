// src/api/order.ts
import axiosConfig from "./axiosConfig";

export interface OrderItemInput {
  productId: number;
  quantity: number;
}

export interface CreateOrderPayload {
  cartItems: OrderItemInput[];
  shippingAddress?: string;
  phoneNumber?: string;
  paymentMethod?: "COD" | "ONLINE";
}

export async function createOrder(data: CreateOrderPayload) {
  try {
    const response = await axiosConfig.post("/orders", {
      cartItems: data.cartItems,
      shippingAddress: data.shippingAddress,
      phoneNumber: data.phoneNumber,
      paymentMethod: data.paymentMethod || "COD",
    });
    return response.data;
  } catch (err) {
    console.log("Error creating order:", err);
    throw err;
  }
}

export async function getMyOrders() {
  try {
    const response = await axiosConfig.get("/orders");
    return response.data;
  } catch (err) {
    console.log("Error fetching my orders:", err);
    throw err;
  }
}

export async function getAllOrders() {
  try {
    const response = await axiosConfig.get("/orders/all");
    return response.data.data || response.data;
  } catch (err) {
    console.log("Error fetching all orders:", err);
    throw err;
  }
}

export async function approveOrder(orderId: number) {
  try {
    const response = await axiosConfig.put(`/orders/${orderId}/approve`);
    return response.data;
  } catch (err) {
    console.log("Error approving order:", err);
    throw err;
  }
}

// Giả định Route BE là: PUT /orders/:id/cancel
export async function cancelOrder(orderId: number) {
  try {
    const response = await axiosConfig.put(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (err) {
    console.log("Error cancelling order:", err);
    throw err;
  }
}

const orderAPI = {
  create: createOrder,
  getMyOrders: getMyOrders,
  getAll: getAllOrders,
  approve: approveOrder,
  cancel: cancelOrder,
};

export default orderAPI;
