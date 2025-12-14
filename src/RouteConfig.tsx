import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./page/Login";
import Register from "./page/Register";
import Dashboard from "./page/home/Dashboard";
import HomeLayout from "./page/home/HomeLayout";
import ProductsDetail from "./page/product/ProductsDetail";
import Cart from "./page/cart/Cart";
import Orders from "./page/order/Orders";
import AdminRoute from "./page/admin/AdminRoute";
import AdminLayout from "./page/admin/component/AdminLayout";
import DashboardAdmin from "./page/admin/DashboardAmin";
import OrdersManager from "./page/admin/OrderManager";
import ProductManager from "./page/admin/product/ProductsManager";
import UserManager from "./page/admin/UserManager";
import CategoriesManager from "./page/admin/CategoriesManager";
import Product from "./page/product/Product";
import UserProfile from "./page/profile/UserProfile";

const RouteConfig = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="categories" element={<CategoriesManager />} />
        </Route>
      </Route>
      <Route path="/auth/login" element={<Login />} />
      <Route
        path="/login"
        element={<Navigate to="/auth/login" replace />}
      />{" "}
      <Route path="/auth/register" element={<Register />} />
      <Route
        path="/register"
        element={<Navigate to="/auth/register" replace />}
      />
      <Route path="/home" element={<Dashboard />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HomeLayout />} />
        <Route path="cart" element={<Cart />} />
        <Route path="order" element={<Orders />} />
        <Route path="product" element={<Product />} />
        <Route path="product/:id" element={<ProductsDetail />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>
      <Route path="/" element={<Navigate to="/home/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/home/dashboard" replace />} />
    </Routes>
  );
};

export default RouteConfig;
