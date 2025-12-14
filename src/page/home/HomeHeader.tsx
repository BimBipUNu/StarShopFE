/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate } from "react-router-dom";
import HomeNavLink from "./HomeNavLink";
import { useEffect, useState } from "react";
import { logout } from "../../slice/authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faBars,
  faBox,
  faCartShopping,
  faCircleUser,
  faStore,
  faXmark,
  faScrewdriverWrench,
  faRightFromBracket, // Icon cho popup
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import Api from "../../api";
import type { OrderType } from "../../types/orderTypes";

// 1. Import React-Hot-Toast
import toast from "react-hot-toast";

function HomeHeader() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  const fetchCounts = async () => {
    if (!isAuthenticated || !user) return;
    try {
      const cartRes: any = await Api.cart.getCart();
      if (cartRes) {
        const items = cartRes.CartItems || [];
        setCartItemCount(items.length);
      }
      const orderRes: any = await Api.order.getMyOrders();
      if (orderRes) {
        const orders = Array.isArray(orderRes) ? orderRes : orderRes.data || [];
        const orderPending = orders.filter(
          (order: OrderType) => order.status === "pending"
        ).length;
        setOrderCount(orderPending);
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin header:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCounts();
  }, [isAuthenticated, user]);

  // --- 2. HÀM XỬ LÝ LOGOUT VỚI CONFIRM TOAST ---
  const handleLogout = () => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
        >
          <div className="w-0 flex-1 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                {/* Icon cảnh báo */}
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                    className="text-red-600"
                  />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Xác nhận đăng xuất
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <div className="flex w-full flex-col divide-y divide-gray-200">
              {/* Nút Đồng ý */}
              <button
                onClick={() => {
                  toast.dismiss(t.id); // Đóng toast
                  dispatch(logout()); // Thực hiện logout
                  navigate("/login"); // Chuyển trang
                  toast.success("Đã đăng xuất thành công");

                  setTimeout(() => {
                    dispatch(logout()); // Xóa Redux state
                    navigate("/login"); // Chuyển trang
                  }, 1000); // Chờ 1 giây (1000ms)
                }}
                className="flex w-full flex-1 items-center justify-center rounded-none rounded-tr-lg border border-transparent p-4 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Đăng xuất
              </button>
              {/* Nút Hủy */}
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex w-full flex-1 items-center justify-center rounded-none rounded-br-lg border border-transparent p-4 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      ),
      {
        duration: 5000, // Tự tắt sau 5s nếu không chọn
        position: "top-center", // Vị trí hiển thị
      }
    );
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isAdmin = isAuthenticated && user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 text-slate-300 shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/home/dashboard")}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
            <FontAwesomeIcon icon={faStore} className="text-white text-sm" />
          </div>
          <div className="text-xl font-bold text-white bg-clip-text">
            StartShop
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <HomeNavLink to={"dashboard"} content={"Trang chủ"} />
          <HomeNavLink to={"product"} content={"Sản phẩm"} />

          {isAdmin && (
            <div
              onClick={() => navigate("/admin")}
              className="cursor-pointer text-yellow-400 hover:text-yellow-300 font-medium transition flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faScrewdriverWrench} />
              Quản lý
            </div>
          )}
        </nav>

        <div className="flex items-center gap-5">
          {/* GIỎ HÀNG */}
          <div
            className="relative cursor-pointer hover:text-white transition"
            onClick={() => navigate("/home/cart")}
            title="Giỏ hàng"
          >
            <FontAwesomeIcon icon={faCartShopping} className="text-xl" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm border border-slate-900 animate-pulse">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </div>

          {/* ĐƠN HÀNG */}
          <div
            className="relative cursor-pointer hover:text-white transition"
            onClick={() => navigate("/home/order")}
            title="Đơn hàng của tôi"
          >
            <FontAwesomeIcon icon={faBox} className="text-xl text-white" />
            {orderCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white shadow-sm border border-slate-900">
                {orderCount > 99 ? "99+" : orderCount}
              </span>
            )}
          </div>

          {isAuthenticated && user ? (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/home/profile")}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full object-cover border border-slate-600"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faCircleUser}
                  className="text-2xl text-slate-400"
                />
              )}
              <span className="hidden md:block text-sm font-medium">
                {user.name || "User"}
              </span>
            </div>
          ) : (
            <Link
              className="text-white hover:text-blue-400 transition"
              to="/login"
            >
              Đăng nhập/ Đăng ký
            </Link>
          )}

          {isAuthenticated && (
            <FontAwesomeIcon
              icon={faArrowRightFromBracket}
              className="text-xl cursor-pointer hover:text-red-500 transition"
              // 4. Gọi hàm handleLogout mới
              onClick={handleLogout}
              title="Đăng xuất"
            />
          )}

          <button
            className="md:hidden focus:outline-none hover:text-white"
            onClick={toggleMobileMenu}
          >
            <FontAwesomeIcon
              icon={mobileMenuOpen ? faXmark : faBars}
              className="text-xl"
            />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-slate-700 bg-slate-800 px-4 py-2 shadow-lg">
          <div className="flex flex-col space-y-2">
            <HomeNavLink
              to={"dashboard"}
              content={"Trang chủ"}
              onClick={() => setMobileMenuOpen(false)}
            />
            <HomeNavLink
              to={"product"}
              content={"Sản phẩm"}
              onClick={() => setMobileMenuOpen(false)}
            />

            {isAdmin && (
              <div
                onClick={() => {
                  navigate("/admin");
                  setMobileMenuOpen(false);
                }}
                className="cursor-pointer px-4 py-2 text-sm font-medium text-yellow-400 hover:text-yellow-300 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faScrewdriverWrench} />
                Quản lý hệ thống
              </div>
            )}

            <HomeNavLink
              to={"cart"}
              content={`Giỏ hàng (${cartItemCount})`}
              onClick={() => setMobileMenuOpen(false)}
            />
            <HomeNavLink
              to={"order"}
              content={`Đơn hàng (${orderCount})`}
              onClick={() => setMobileMenuOpen(false)}
            />

            {isAuthenticated && user && (
              <div
                className="cursor-pointer px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300"
                // 5. Gọi hàm handleLogout mới cho cả mobile menu
                onClick={handleLogout}
              >
                Đăng xuất
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export default HomeHeader;
