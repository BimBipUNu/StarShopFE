/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Api from "../../api";
import type { OrderItemType, OrderType } from "../../types/orderTypes";
import toast from "react-hot-toast"; // 1. Import toast

// Interface mở rộng để hiển thị UI
interface OrderDetail extends OrderType {
  User?: {
    name: string;
    email: string;
  };
  OrderItems?: (OrderItemType & {
    Product?: { name: string; image?: string };
  })[];
  createdAt: string;
  shippingAddress?: string;
  phoneNumber?: string;
  paymentMethod?: string;
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho bộ lọc và tìm kiếm
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await Api.order.getAll();
      const ordersList = Array.isArray(data) ? data : data.data || [];
      setOrders(ordersList.sort((a: any, b: any) => b.id - a.id));
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    // Toast loading
    const loadingToast = toast.loading("Đang cập nhật trạng thái...");

    try {
      if (newStatus === "approved") {
        await Api.order.approve(orderId);
      } else if (newStatus === "cancelled") {
        await Api.order.cancel(orderId);
      } else {
        toast.dismiss(loadingToast);
        return;
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus as any } : o
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }

      toast.success(
        `Thành công: ${
          newStatus === "approved" ? "Đã duyệt đơn" : "Đã hủy đơn"
        }`,
        { id: loadingToast }
      );
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật trạng thái", { id: loadingToast });
    }
  };

  const handleViewDetail = (orderId: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsModalOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // --- LOGIC LỌC ---
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const lowerTerm = searchTerm.toLowerCase();
    const matchesSearch =
      order.id.toString().includes(lowerTerm) ||
      (order.User?.name || "").toLowerCase().includes(lowerTerm);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-800">Quản lý đơn hàng</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Tìm mã đơn, tên khách..."
              className="border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <select
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-blue-500 bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="approved">Đã duyệt</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-center py-10">Đang tải...</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase">
              <th className="p-4 text-center">STT</th>
              <th className="p-4">ID</th>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Ngày đặt</th>
              <th className="p-4">Tổng tiền</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 font-bold text-slate-700 text-center">
                    {index + 1}
                  </td>
                  <td className="p-4 font-bold text-slate-700">#{order.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900">
                      {order.User?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {order.User?.email}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </td>
                  <td className="p-4 font-bold text-blue-600">
                    {Number(order.totalAmount).toLocaleString()} đ
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetail(order.id)}
                        className="text-blue-600 font-medium text-sm hover:underline"
                      >
                        Chi tiết
                      </button>
                      <span className="text-slate-300">|</span>

                      <select
                        className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:text-blue-600 w-24"
                        value=""
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Tác vụ
                        </option>
                        {order.status === "pending" && (
                          <option value="approved">✓ Duyệt</option>
                        )}
                        {order.status !== "cancelled" && (
                          <option value="cancelled">✕ Hủy</option>
                        )}
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-slate-500 italic"
                >
                  Không tìm thấy đơn hàng nào khớp với "{searchTerm}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT GIỮ NGUYÊN CODE CŨ CỦA BẠN (Đã ẩn bớt để gọn) */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          {/* ... Nội dung Modal giữ nguyên như file cũ ... */}
          {/* Chỉ thêm chức năng đóng modal */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">
                Chi tiết đơn hàng #{selectedOrder.id}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ✕
              </button>
            </div>
            {/* ... Body Modal ... */}
            <div className="p-6">
              {/* ... Render chi tiết (Giữ nguyên code cũ) ... */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-bold text-xs text-slate-500 uppercase mb-2">
                    Khách hàng
                  </h4>
                  <p>{selectedOrder.User?.name}</p>
                  <p className="text-sm text-slate-500">
                    {selectedOrder.User?.email}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-500 uppercase mb-2">
                    Giao tới
                  </h4>
                  <p className="text-sm">{selectedOrder.shippingAddress}</p>
                  <p className="text-sm mt-1">📞 {selectedOrder.phoneNumber}</p>
                </div>
              </div>
              {/* List sản phẩm */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                {selectedOrder.OrderItems?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between py-2 border-b last:border-0 border-slate-200"
                  >
                    <span className="text-sm font-medium">
                      {item.Product?.name} x{item.quantity}
                    </span>
                    <span className="text-sm font-bold">
                      {(item.price * item.quantity).toLocaleString()} đ
                    </span>
                  </div>
                ))}
                <div className="flex justify-between mt-4 pt-2 border-t border-slate-200">
                  <span className="font-bold">Tổng cộng</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {Number(selectedOrder.totalAmount).toLocaleString()} đ
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
