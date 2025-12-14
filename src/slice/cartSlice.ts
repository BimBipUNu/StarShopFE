/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { CartType, AddToCartPayload } from "../types/cartType";
import Api from "../api";

interface CartState {
  cart: CartType | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
};

// --- THUNKS ---

// 1. Lấy giỏ hàng
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await Api.cart.getCart();
      // Backend controller trả về json(cart), nên data nằm trong response.data hoặc response tùy cấu hình interceptor
      // Tôi dùng (response as any).data || response để an toàn
      return (response as any).data || response;
    } catch (err: any) {
      const message = err.response?.data?.message || "Lỗi tải giỏ hàng";
      return rejectWithValue(message);
    }
  }
);

// 2. Thêm sản phẩm
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (data: AddToCartPayload, { rejectWithValue }) => {
    try {
      const response = await Api.cart.add({
        productId: Number(data.productId), // Ép kiểu số
        quantity: Number(data.quantity),
      });
      // Backend (cartService) trả về toàn bộ giỏ hàng mới nhất
      return (response as any).data || response;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Lỗi thêm sản phẩm vào giỏ hàng";
      return rejectWithValue(message);
    }
  }
);

// 3. Cập nhật số lượng
export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async (
    data: { itemId: string | number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      // data.itemId ở đây thực tế là productId (theo logic controller updateCartItemQuantity)
      const response = await Api.cart.updateItem({
        itemId: Number(data.itemId),
        quantity: Number(data.quantity),
      });
      // Backend trả về toàn bộ giỏ hàng mới nhất
      return (response as any).data || response;
    } catch (err: any) {
      const message = err.response?.data?.message || "Lỗi cập nhật giỏ hàng";
      return rejectWithValue(message);
    }
  }
);

// 4. Xóa item
export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (productId: string | number, { rejectWithValue }) => {
    try {
      // Backend trả về 204 No Content
      await Api.cart.removeItem({ itemId: Number(productId) });
      return productId; // Trả về ID để Reducer tự lọc
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Lỗi xóa sản phẩm khỏi giỏ hàng";
      return rejectWithValue(message);
    }
  }
);

// 5. Xóa toàn bộ
export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      await Api.cart.clear();
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || "Lỗi xóa giỏ hàng";
      return rejectWithValue(message);
    }
  }
);

// --- SLICE ---

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    // Action để reset khi logout
    resetCart: (state) => {
      state.cart = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH CART ---
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- ADD TO CART ---
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        // QUAN TRỌNG: Backend đã xử lý việc cộng dồn và trả về giỏ hàng hoàn chỉnh.
        // Ta chỉ cần thay thế state.cart bằng dữ liệu mới.
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- UPDATE CART ITEM ---
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        // Backend trả về giỏ hàng hoàn chỉnh
        state.cart = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- REMOVE CART ITEM ---
      .addCase(removeCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        // Tự lọc item ở phía Client vì backend không trả về data
        if (state.cart) {
          // Kiểm tra xem backend trả về key là 'CartItems' hay 'items'
          // Theo cartService include model, thường là CartItems
          const items =
            (state.cart as any).CartItems || (state.cart as any).items || [];

          const newItems = items.filter(
            (item: any) => Number(item.productId) !== Number(action.payload)
          );

          // Cập nhật lại list items
          if ((state.cart as any).CartItems) {
            (state.cart as any).CartItems = newItems;
          } else {
            (state.cart as any).items = newItems;
          }
        }
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- CLEAR CART ---
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        if (state.cart) {
          // Xóa sạch danh sách item
          if ((state.cart as any).CartItems) (state.cart as any).CartItems = [];
          if ((state.cart as any).items) (state.cart as any).items = [];
        }
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCartError, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
