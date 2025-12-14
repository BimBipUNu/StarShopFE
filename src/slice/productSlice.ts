/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  ProductParams,
  ProductState,
  ProductType,
} from "../types/productType";
import Api from "../api";

const initialState: ProductState = {
  items: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
};

export const fetchAllProducts = createAsyncThunk(
  "product/fetchAll",
  async (_params: ProductParams | undefined, { rejectWithValue }) => {
    try {
      const response = await Api.product.getAllData();
      return response;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Lỗi tải danh sách sản phẩm";
      return rejectWithValue(message);
    }
  }
);

export const fetchProductDetail = createAsyncThunk(
  "product/fetchDetail",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await Api.product.getDataById(id);
      return response?.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Lỗi tải chi tiết sản phẩm";
      return rejectWithValue(message);
    }
  }
);

export const createProduct = createAsyncThunk(
  "product/create",
  async (data: ProductType, { rejectWithValue }) => {
    try {
      const response = await Api.product.post(data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Lỗi tạo sản phẩm";
      return rejectWithValue(message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/update",
  async (data: ProductType, { rejectWithValue }) => {
    try {
      const response = await Api.product.put(data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Lỗi cập nhật sản phẩm";
      return rejectWithValue(message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/delete",
  async (data: ProductType, { rejectWithValue }) => {
    try {
      await Api.product.delete(data.id);
      return data.id;
    } catch (err: any) {
      const message = err.response?.data?.message || "Lỗi xóa sản phẩm";
      return rejectWithValue(message);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.items = action.payload.data;
        } else {
          state.items = [];
        }
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchProductDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Cập nhật selectedProduct nếu đang xem sản phẩm này
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        // Clear selectedProduct nếu đang xem sản phẩm bị xóa
        if (state.selectedProduct?.id === action.payload) {
          state.selectedProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;
