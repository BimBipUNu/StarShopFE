/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import Api from "../../api";
import type { OrderType, OrderItemType } from "../../types/orderTypes";
import type { ProductType } from "../../types/productType";

interface OrderItemDetail extends OrderItemType {
  product: ProductType;
}

interface OrderDetail extends OrderType {
  createdAt: string;
  items: OrderItemDetail[];
}

function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem("token")) {
      navigate("/auth/login");
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await (Api as any).order.getMyOrders();

        const ordersData = Array.isArray(response)
          ? response
          : response.data || [];

        const sortedOrders = [...ordersData].sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(sortedOrders);
        console.log(sortedOrders);
      } catch (error) {
        console.error("Lỗi tải danh sách đơn hàng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
            Đã hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
            Đã hủy
          </span>
        );
      case "pending":
      default:
        return (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
            Chờ giao hàng
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-6 flex justify-center text-slate-200">
          <i className="fa-solid fa-receipt text-6xl"></i>
        </div>
        <h2 className="mb-4 text-2xl font-bold text-slate-800">
          Bạn chưa có đơn hàng nào
        </h2>
        <p className="mb-8 text-slate-500">
          Hãy khám phá các sản phẩm và đặt hàng ngay hôm nay!
        </p>
        <Link
          to="/home/product"
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <i className="fa-solid fa-shopping-bag mr-2"></i> Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            <i className="fa-solid fa-receipt mr-2"></i> Đơn hàng của tôi
          </h1>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-700">#{order.id}</span>
                  <span className="text-sm text-slate-500">
                    Ngày đặt hàng:
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="font-bold text-blue-600">
                  Tổng tiền: {order.totalAmount.toLocaleString()} VND
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4">
                {(order as any).OrderItems &&
                  ((order as any).OrderItems as OrderItemDetail[]).map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-slate-100 bg-white">
                          <img
                            src={
                              (item as any).Product.image ||
                              "https://placehold.co/100"
                            }
                            alt={(item as any).Product.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800 line-clamp-1">
                            {(item as any).Product.name}
                          </h4>
                          <div className="text-left">
                            {(item as any).Product.description}
                          </div>
                        </div>
                        <p className="text-sm text-slate-500">
                          {item.price.toLocaleString()} VND x {item.quantity}
                        </p>

                        <div className="text-right font-medium text-slate-900">
                          {(item.price * item.quantity).toLocaleString()} VND
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Orders;
