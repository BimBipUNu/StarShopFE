import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/authSlice";
import productReducer from "../slice/productSlice";
import cartReducer from "../slice/cartSlice";
import { categoryReducer } from "../slice/categorySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    category: categoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
