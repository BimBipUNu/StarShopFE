// src/api/cart.ts
import axiosConfig from "./axiosConfig";

// Interface tạm cho payload thêm vào giỏ
interface AddToCartPayload {
  productId: number;
  quantity: number;
}

interface UpdateCartItemPayload {
  itemId: number; // ID của CartItem
  quantity: number;
}

// Lấy giỏ hàng của User hiện tại (User lấy từ Token)
export async function getMyCart() {
  try {
    const response = await axiosConfig.get(`/cart`);
    return response;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Thêm sản phẩm vào giỏ
export async function addToCart(data: AddToCartPayload) {
  try {
    const response = await axiosConfig.post(`/cart`, data);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Cập nhật số lượng item trong giỏ
export async function updateCartItem(data: UpdateCartItemPayload) {
  try {
    const response = await axiosConfig.put(`/cart/${data.itemId}`, {
      quantity: data.quantity,
    });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Xóa 1 item khỏi giỏ
export async function removeCartItem(data: { itemId: number }) {
  try {
    await axiosConfig.delete(`/cart/item/${data.itemId}`);
    return data.itemId;
  } catch (err) {
    console.log(err);
  }
}

export async function clearCart() {
  try {
    await axiosConfig.delete(`/cart`);
    return true;
  } catch (err) {
    console.log(err);
  }
}

const cartAPI = {
  getCart: getMyCart,
  add: addToCart,
  updateItem: updateCartItem,
  removeItem: removeCartItem,
  clear: clearCart,
};

export default cartAPI;
