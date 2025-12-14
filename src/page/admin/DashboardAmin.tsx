import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { ProductType } from "../../types/productType";
import type { OrderType } from "../../types/orderTypes";
import Api from "../../api";

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [usersCount, setUsersCount] = useState(0);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [users, productList, orderList] = await Promise.all([
          Api.user.getAll(),
          (await Api.product.getAllData()).data,
          Api.order.getAll(),
        ]);
        setUsersCount(users?.data.length);
        setProducts(productList);
        setOrders(orderList);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const insight = useMemo(() => {
    const approvedRevenue = orders
      .filter((order) => order.status === "approved")
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const pending = orders.filter((order) => order.status === "pending").length;
    const cancelled = orders.filter(
      (order) => order.status === "cancelled"
    ).length;
    const approved = orders.filter(
      (order) => order.status === "approved"
    ).length;
    const averageTicket = orders.length ? Math.round(approvedRevenue) : 0;
    const activeProducts = products.filter((p) => p.stock > 0).length;
    const lowStock = products.filter(
      (p) => p.stock > 0 && p.stock <= 10
    ).length;

    return {
      approvedRevenue,
      pending,
      cancelled,
      approved,
      averageTicket,
      activeProducts,
      lowStock,
    };
  }, [orders, products]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[260px]">
        <div className="flex gap-3 items-center text-slate-300">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 items-center bg-white border border-slate-200 rounded-[14px] p-[1.1rem_1.2rem] shadow-[0_12px_26px_rgba(15,23,42,0.08)]">
        <div>
          <h1 className="my-[0.2rem] text-[1.55rem] text-slate-900 font-bold">
            Tổng quan
          </h1>
          <p className="text-slate-600 my-[0.35rem]">
            Theo dõi doanh thu, đơn hàng và hàng tồn kho trong cùng một bảng
            điều khiển.
          </p>
          <div className="flex gap-3 mt-[0.6rem]">
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
              onClick={() => navigate("/admin/orders")}
            >
              <i className="fa-solid fa-bolt"></i> Xử lý đơn chờ
            </button>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
              onClick={() => navigate("/admin/products")}
            >
              <i className="fa-solid fa-plus"></i> Tạo sản phẩm mới
            </button>
          </div>
        </div>
        <div className="border border-slate-200 rounded-[14px] p-[1.1rem] bg-[linear-gradient(145deg,rgba(34,197,94,0.08),rgba(99,102,241,0.06))]">
          <div className="inline-flex items-center gap-2 px-[0.65rem] py-[0.35rem] rounded-full bg-slate-100 text-slate-900 font-semibold mb-[0.35rem]">
            <i className="fa-solid fa-arrow-trend-up"></i>
            <span>Doanh thu đã duyệt</span>
          </div>
          <p className="text-[1.4rem] my-[0.15rem] text-slate-900 font-extrabold">
            {insight.approvedRevenue.toLocaleString()} VND
          </p>
          <p className="m-0 text-slate-600">Doanh thu tất cả đơn đã xác nhận</p>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-[0.85rem]">
        <div className="flex gap-[0.9rem] items-center p-4 rounded-[14px] bg-white border border-slate-200 text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
          <div className="w-[46px] h-[46px] grid place-items-center rounded-xl text-white text-base bg-[linear-gradient(135deg,#8b5cf6,#6366f1)]">
            <i className="fa-solid fa-users text-white"></i>
          </div>
          <div>
            <p className="text-slate-600 my-[0.35rem]">Người dùng</p>
            <h3 className="m-0 text-slate-900 text-[1.15rem] font-bold">
              {usersCount}
            </h3>
          </div>
        </div>
        <div className="flex gap-[0.9rem] items-center p-4 rounded-[14px] bg-white border border-slate-200 text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
          <div className="w-[46px] h-[46px] grid place-items-center rounded-xl text-white text-base bg-[linear-gradient(135deg,#22c55e,#16a34a)]">
            <i className="fa-solid fa-boxes-stacked text-white"></i>
          </div>
          <div>
            <p className="text-slate-600 my-[0.35rem]">Sản phẩm đang bán</p>
            <h3 className="m-0 text-slate-900 text-[1.15rem] font-bold">
              {insight.activeProducts}
            </h3>
          </div>
        </div>
        <div className="flex gap-[0.9rem] items-center p-4 rounded-[14px] bg-white border border-slate-200 text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
          <div className="w-[46px] h-[46px] grid place-items-center rounded-xl text-white text-base bg-[linear-gradient(135deg,#f97316,#fb7185)]">
            <i className="fa-solid fa-clipboard-list text-white"></i>
          </div>
          <div>
            <p className="text-slate-600 my-[0.35rem]">Đơn hàng</p>
            <h3 className="m-0 text-slate-900 text-[1.15rem] font-bold">
              {orders.length}
            </h3>
          </div>
        </div>
        <div className="flex gap-[0.9rem] items-center p-4 rounded-[14px] bg-white border border-slate-200 text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
          <div className="w-[46px] h-[46px] grid place-items-center rounded-xl text-white text-base bg-[linear-gradient(135deg,#0ea5e9,#6366f1)]">
            <i className="fa-solid fa-coins text-white"></i>
          </div>
          <div>
            <p className="text-slate-600 my-[0.35rem]">
              Tổng giá trị các đơn hàng thành công nhận được
            </p>
            <h3 className="m-0 text-slate-900 text-[1.15rem] font-bold">
              {insight.averageTicket.toLocaleString()} VND
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[0.9rem]">
        <div className="bg-white border border-slate-200 rounded-[14px] p-[1.1rem_1.2rem]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-slate-600 my-[0.35rem]">Tình trạng đơn hàng</p>
              <h3 className="m-0 text-slate-900 text-[1.15rem] font-bold">
                Tổng quan trạng thái
              </h3>
            </div>
            <button
              className="bg-transparent text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors font-medium"
              onClick={() => navigate("/admin/orders")}
            >
              Xem tất cả
            </button>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[0.6rem]">
            <div className="flex gap-[0.6rem] items-center p-[0.9rem] rounded-xl bg-white border border-slate-200">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="text-slate-600 my-[0.35rem]">Đã duyệt</p>
                <h4 className="m-0 font-bold">{insight.approved}</h4>
              </div>
            </div>
            <div className="flex gap-[0.6rem] items-center p-[0.9rem] rounded-xl bg-white border border-slate-200">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div>
                <p className="text-slate-600 my-[0.35rem]">Chờ xử lý</p>
                <h4 className="m-0 font-bold">{insight.pending}</h4>
              </div>
            </div>
            <div className="flex gap-[0.6rem] items-center p-[0.9rem] rounded-xl bg-white border border-slate-200">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div>
                <p className="text-slate-600 my-[0.35rem]">Đã hủy</p>
                <h4 className="m-0 font-bold">{insight.cancelled}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[14px] p-[1.1rem_1.2rem]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-slate-600 my-[0.35rem]">Hoạt động mới nhất</p>
              <h3 className="m-0 text-slate-900 text-[1.15rem] font-bold">
                Đơn hàng gần đây
              </h3>
            </div>
          </div>
          <div className="flex flex-col gap-[0.6rem]">
            {recentOrders.length === 0 && (
              <p className="text-slate-600 my-[0.35rem]">
                Chưa có đơn hàng nào.
              </p>
            )}
            {recentOrders.map((order) => (
              <div
                className="flex justify-between items-center p-[0.85rem_0.75rem] rounded-xl border border-slate-200 bg-white"
                key={order.id}
              >
                <div>
                  <p className="m-0 text-slate-900 font-bold">
                    #{order.id.toString().slice(0, 8)}
                  </p>
                  <p className="text-slate-600 my-[0.35rem]">
                    Trạng thái:{" "}
                    {order.status === "pending"
                      ? "Chờ xác nhận"
                      : order.status === "approved"
                      ? "Đã xác nhận"
                      : "Đã hủy"}
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  <span
                    className={`px-[0.6rem] py-1 rounded-full capitalize font-bold text-slate-900 text-[0.85rem] ${
                      order.status === "pending"
                        ? "bg-amber-400"
                        : order.status === "approved"
                        ? "bg-green-500"
                        : "bg-red-400"
                    }`}
                  >
                    {order.status}
                  </span>
                  <strong>{order.totalAmount.toLocaleString()} VND</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
