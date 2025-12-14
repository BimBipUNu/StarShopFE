/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { CategoryType } from "../types/categoryType";
import Api from "../api";

interface CategoryState {
  items: CategoryType[];
  selectedCategory: CategoryType | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
};

// Lấy tất cả categories
export const fetchAllCategories = createAsyncThunk(
  "category/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await Api.category.getAll();
      // Response đã được unwrap bởi axiosConfig interceptor
      return response;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Lỗi tải danh sách danh mục";
      return rejectWithValue(message);
    }
  }
);

// Lấy category theo ID
export const fetchCategoryById = createAsyncThunk(
  "category/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await Api.category.getById({ id: Number(id) });
      return response.data || response;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Lỗi tải thông tin danh mục";
      return rejectWithValue(message);
    }
  }
);

// Tạo category mới
export const createCategory = createAsyncThunk(
  "category/create",
  async (data: CategoryType, { rejectWithValue }) => {
    try {
      const response = await Api.category.post(data);
      return response.data || response;
    } catch (err: any) {
      const message = err.response?.data?.message || "Lỗi tạo danh mục";
      return rejectWithValue(message);
    }
  }
);

// Cập nhật category
export const updateCategory = createAsyncThunk(
  "category/update",
  async (data: CategoryType, { rejectWithValue }) => {
    try {
      const response = await Api.category.put(data);
      return response.data || response;
    } catch (err: any) {
      const message = err.response?.data?.message || "Lỗi cập nhật danh mục";
      return rejectWithValue(message);
    }
  }
);

// Xóa category
export const deleteCategory = createAsyncThunk(
  "category/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await Api.category.delete({ id: Number(id) });
      return id;
    } catch (err: any) {
      const message = err.response?.data?.message || "Lỗi xóa danh mục";
      return rejectWithValue(message);
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH ALL CATEGORIES ---
      .addCase(fetchAllCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        // Xử lý nhiều format response khác nhau
        if (action.payload) {
          if (Array.isArray(action.payload)) {
            state.items = action.payload;
          } else if (action.payload.categories && Array.isArray(action.payload.categories)) {
            state.items = action.payload.categories;
          } else if (action.payload.data && Array.isArray(action.payload.data)) {
            state.items = action.payload.data;
          } else {
            state.items = [];
          }
        } else {
          state.items = [];
        }
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- FETCH CATEGORY BY ID ---
      .addCase(fetchCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- CREATE CATEGORY ---
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- UPDATE CATEGORY ---
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Cập nhật selectedCategory nếu đang xem category này
        if (state.selectedCategory?.id === action.payload.id) {
          state.selectedCategory = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- DELETE CATEGORY ---
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        // Clear selectedCategory nếu đang xem category bị xóa
        if (state.selectedCategory?.id === action.payload) {
          state.selectedCategory = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const categoryReducer = categorySlice.reducer;
export const courseAction = categorySlice.actions;
