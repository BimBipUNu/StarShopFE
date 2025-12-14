/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CartItemType } from "../../types/cartType";
import Api from "../../api";
import { createOrder } from "../../api/order";
// 1. Import Toast
import toast from "react-hot-toast";

// Interface User Profile
interface UserProfile {
  id: number;
  name: string;
  phone?: string;
  address?: string;
}

export default function Cart() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subtotal, setSubtotal] = useState(0);

  // State lưu thông tin user
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // --- HÀM GIẢI MÃ TOKEN ĐỂ LẤY ID ---
  const getUserIdFromToken = () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");

      if (!token) return null;

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const decoded = JSON.parse(jsonPayload);
      return decoded.id || decoded.userId;
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      return null;
    }
  };

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await Api.cart.getCart();
      if (response) {
        const items = (response as any).CartItems || [];
        const itemsWithSelect = items.map((item: any) => ({
          ...item,
          isSelected: false,
        }));
        setCartItems(itemsWithSelect);
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
      toast.error("Không thể tải giỏ hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) return;

      const response: any = await Api.user.getById({ id: userId });
      const userData = response.data || response;

      if (userData) {
        setUserProfile(userData);
      }
    } catch (error) {
      console.error("Không thể lấy thông tin người dùng", error);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchUserInfo();
  }, []);

  // Tính tổng tiền
  useEffect(() => {
    const total = cartItems.reduce((acc, item) => {
      if (!item.isSelected) return acc;
      const product = (item as any).Product;
      return acc + (product ? product.price * item.quantity : 0);
    }, 0);
    setSubtotal(total);
  }, [cartItems]);

  const handleToggleSelect = (productId: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        Number(item.productId) === productId
          ? { ...item, isSelected: !item.isSelected }
          : item
      )
    );
  };

  const handleToggleAll = () => {
    const isAllSelected =
      cartItems.length > 0 && cartItems.every((i) => i.isSelected);
    setCartItems((prev) =>
      prev.map((item) => ({ ...item, isSelected: !isAllSelected }))
    );
  };

  const handleQuantityChange = async (
    item: CartItemType,
    newQuantity: number
  ) => {
    try {
      await Api.cart.updateItem({
        itemId: Number(item.productId),
        quantity: newQuantity,
      });
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, quantity: newQuantity } : i
        )
      );
    } catch (error) {
      console.error("Failed to update quantity", error);
      toast.error("Lỗi cập nhật số lượng");
    }
  };

  // --- 2. XÓA ITEM VỚI CONFIRM TOAST ---
  const handleRemoveItem = (productId: number) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">Xóa sản phẩm?</p>
              <p className="mt-1 text-sm text-gray-500">
                Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await Api.cart.removeItem({ itemId: productId });
                setCartItems((prev) =>
                  prev.filter((i) => Number(i.productId) !== Number(productId))
                );
                toast.success("Đã xóa sản phẩm");
              } catch (error) {
                console.error("Failed to remove item", error);
                toast.error("Xóa thất bại");
              }
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
          >
            Xóa
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
          >
            Hủy
          </button>
        </div>
      </div>
    ));
  };

  // --- 3. XÓA ALL CART VỚI CONFIRM TOAST ---
  const handleClearCart = () => {
    if (cartItems.length === 0) return;

    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Xóa toàn bộ giỏ hàng?
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await Api.cart.clear();
                setCartItems([]);
                toast.success("Đã xóa toàn bộ giỏ hàng");
              } catch (error) {
                console.error("Failed to clear cart", error);
                toast.error("Lỗi khi xóa giỏ hàng");
              }
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
          >
            Đồng ý
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
          >
            Hủy
          </button>
        </div>
      </div>
    ));
  };

  // --- 4. CHECKOUT VỚI TOAST VÀ CONFIRM ---
  const handleCheckout = () => {
    const selectedItems = cartItems.filter((item) => item.isSelected);

    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }

    if (!userProfile) {
      toast.error("Vui lòng đăng nhập lại để xác thực.");
      return;
    }

    // Kiểm tra thông tin User
    if (
      !userProfile.phone ||
      !userProfile.address ||
      userProfile.phone.trim() === "" ||
      userProfile.address.trim() === ""
    ) {
      // Toast Confirm chuyển trang Profile
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Thiếu thông tin giao hàng
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Bạn cần cập nhật Số điện thoại và Địa chỉ trước khi đặt hàng.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate("/home/profile");
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              Cập nhật ngay
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
            >
              Để sau
            </button>
          </div>
        </div>
      ));
      return;
    }

    // Confirm Đặt hàng
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Xác nhận đặt hàng?
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Tổng tiền:{" "}
                <span className="font-bold text-blue-600">
                  {subtotal.toLocaleString()} VND
                </span>
                <br />
                Số lượng: {selectedItems.length} sản phẩm
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              processCheckout(selectedItems); // Gọi hàm xử lý logic
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
          >
            Đặt hàng
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
          >
            Hủy
          </button>
        </div>
      </div>
    ));
  };

  // Hàm xử lý logic checkout tách riêng để code gọn hơn
  const processCheckout = async (selectedItems: CartItemType[]) => {
    setIsLoading(true);
    const checkoutToast = toast.loading("Đang xử lý đơn hàng...");

    try {
      const orderItems = selectedItems.map((item) => ({
        productId: Number(item.productId),
        quantity: item.quantity,
      }));

      await createOrder({
        cartItems: orderItems,
        paymentMethod: "COD",
        shippingAddress: userProfile?.address || "",
        phoneNumber: userProfile?.phone || "",
      });

      setCartItems((prev) =>
        prev.map((item) => ({ ...item, isSelected: false }))
      );

      toast.success("Đặt hàng thành công!", { id: checkoutToast });
      navigate("/home/order");
    } catch (error) {
      console.error("Checkout failed", error);
      toast.error("Đặt hàng thất bại. Vui lòng thử lại.", {
        id: checkoutToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-6 flex justify-center text-slate-200">
          <i className="fa-solid fa-cart-arrow-down text-6xl"></i>
        </div>
        <h2 className="mb-4 text-2xl font-bold text-slate-800">
          Giỏ hàng của bạn đang trống
        </h2>
        <Link
          to="/home/product"
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  const isAllSelected =
    cartItems.length > 0 && cartItems.every((i) => i.isSelected);
  const selectedCount = cartItems.filter((i) => i.isSelected).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            <i className="fa-solid fa-cart-shopping mr-2"></i> Giỏ hàng
          </h1>
          <button
            onClick={handleClearCart}
            className="flex items-center text-sm font-medium text-red-600 hover:text-red-700"
          >
            <i className="fa-solid fa-trash mr-1"></i> Xóa toàn bộ
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {/* Header chọn tất cả */}
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                checked={isAllSelected}
                onChange={handleToggleAll}
              />
              <span className="font-medium text-slate-700">
                Chọn tất cả ({cartItems.length} sản phẩm)
              </span>
            </div>

            {cartItems.map((item) => {
              const product = (item as any).Product;
              if (!product) return null;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col items-center gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row transition-all ${
                    item.isSelected
                      ? "border-blue-500 ring-1 ring-blue-500"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={item.isSelected}
                      onChange={() =>
                        handleToggleSelect(Number(item.productId))
                      }
                    />
                  </div>

                  <div
                    className="h-24 w-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-slate-100"
                    onClick={() => navigate(`/home/product/${item.productId}`)}
                  >
                    <img
                      src={product.image || "https://via.placeholder.com/150"}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h3
                      className="cursor-pointer font-bold text-slate-800 line-clamp-1 hover:text-blue-600"
                      onClick={() =>
                        navigate(`/home/product/${item.productId}`)
                      }
                    >
                      {product.name}
                    </h3>
                    <p className="mb-1 text-sm text-slate-500">
                      {product.categoryId || "General"}
                    </p>
                    <p className="font-bold text-blue-600">
                      {product.price?.toLocaleString()} VND
                    </p>

                    {item.quantity > product.stock && (
                      <p className="mt-1 text-xs font-medium text-red-500">
                        <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                        Chỉ còn {product.stock} sản phẩm
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center overflow-hidden rounded-lg border border-slate-200">
                      <button
                        className="px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                        onClick={() =>
                          handleQuantityChange(item, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="w-12 border-none text-center text-sm font-bold text-slate-800 focus:ring-0"
                        value={item.quantity}
                        readOnly
                      />
                      <button
                        className="px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                        onClick={() =>
                          handleQuantityChange(item, item.quantity + 1)
                        }
                        disabled={item.quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {(product.price * item.quantity).toLocaleString()} VND
                    </p>

                    <button
                      onClick={() => handleRemoveItem(Number(item.productId))}
                      className="text-slate-400 transition hover:text-red-500"
                    >
                      <i className="fa-solid fa-trash"></i>Xóa sản phấm
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">
                Tóm tắt đơn hàng
              </h3>
              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Đã chọn:</span>
                  <span className="font-medium text-blue-600">
                    {selectedCount} sản phẩm
                  </span>
                </div>

                {/* HIỂN THỊ THÔNG TIN USER */}
                <div className="border-t border-b border-slate-100 py-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Giao tới:</span>
                    <span className="font-medium text-right truncate w-40">
                      {userProfile?.address || (
                        <span className="text-red-500">Chưa có địa chỉ</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">SĐT:</span>
                    <span className="font-medium">
                      {userProfile?.phone || (
                        <span className="text-red-500">Chưa có SĐT</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-slate-600 pt-2">
                  <span>Tạm tính:</span>
                  <span className="font-medium">
                    {subtotal.toLocaleString()} VND
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold text-slate-900">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">
                    {subtotal.toLocaleString()} VND
                  </span>
                </div>
              </div>

              <button
                className={`mb-3 w-full rounded-xl py-3 font-bold text-white shadow-lg transition
                    ${
                      selectedCount > 0
                        ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                        : "bg-slate-300 cursor-not-allowed"
                    }`}
                onClick={handleCheckout}
                disabled={selectedCount === 0}
              >
                Thanh toán ({selectedCount})
              </button>

              <Link to="/home/product">
                <button className="w-full rounded-xl border border-blue-600 bg-white py-3 font-bold text-blue-600 transition hover:bg-blue-50">
                  Tiếp tục mua sắm
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
