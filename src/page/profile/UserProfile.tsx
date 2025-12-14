/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCalendar,
  faCamera,
  faSave,
  faPenToSquare,
  faLock,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Api from "../../api"; //
import { updateCurrentUser } from "../../slice/authSlice"; // Import action mới tạo ở Bước 1
import toast from "react-hot-toast";

export default function UserProfile() {
  const dispatch = useDispatch();

  // 1. Lấy user hiện tại từ Redux
  const { user } = useSelector((state: RootState) => state.auth);

  // State form
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    age: 0,
    avatar: "",
    password: "", // Mật khẩu mới (nếu muốn đổi)
    confirmPassword: "",
  });

  // Sync data từ Redux vào form khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "", // Email hiển thị nhưng không sửa
        phone: user.phone || "",
        address: user.address || "",
        age: user.age || 0,
        avatar: user.avatar || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  // Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate mật khẩu nếu người dùng có nhập
    if (formData.password) {
      // Check khớp confirm password
      if (formData.password !== formData.confirmPassword) {
        toast.error("Mật khẩu không khớp!");
        return;
      }

      // Check mật khẩu mạnh
      const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!PASSWORD_REGEX.test(formData.password)) {
        toast.error(
          "Mật khẩu mới chưa đủ mạnh!\n\nPhải bao gồm:\n- Ít nhất 8 ký tự\n- 1 ký tự viết thường\n- 1 ký tự in hoa\n- 1 chữ số\n- 1 ký tự đặc biệt"
        );
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Chuẩn bị payload
      const updatePayload: any = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        age: Number(formData.age),
        avatar: formData.avatar,
      };

      // Chỉ gửi password nếu người dùng nhập mới
      if (formData.password) {
        updatePayload.password = formData.password;
      }

      // 2. Gọi API cập nhật
      const res: any = await Api.user.put({
        id: Number(user.id), // Đảm bảo ID đúng kiểu
        ...updatePayload,
      });

      // 3. Xử lý kết quả trả về
      // (Tuỳ vào BE trả về: res.data hoặc res trực tiếp)
      const updatedUser = res.data || res;

      if (updatedUser) {
        // 4. Cập nhật ngược lại vào Redux để Header đổi tên/avatar ngay lập tức
        dispatch(updateCurrentUser(updatedUser));

        toast.success("Cập nhật thông tin thành công!");
        setIsEditing(false);
        // Reset password fields
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      }
    } catch (error: any) {
      console.error("Lỗi cập nhật:", error);
      const msg =
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-10 text-slate-500">
        Vui lòng đăng nhập để xem hồ sơ.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:-translate-y-0.5"
            >
              <FontAwesomeIcon icon={faPenToSquare} /> Chỉnh sửa
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT COLUMN: AVATAR CARD */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center h-full">
              <div className="relative mb-4 group">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-blue-50 shadow-inner">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <FontAwesomeIcon icon={faUser} className="text-5xl" />
                    </div>
                  )}
                </div>
                {/* Gợi ý edit avatar */}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <FontAwesomeIcon icon={faCamera} />
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-800">
                {user.name || "Chưa đặt tên"}
              </h2>
              <p className="text-slate-500 text-sm mb-4 bg-slate-100 px-3 py-1 rounded-full mt-2">
                {user.role === "admin"
                  ? "Quản trị viên"
                  : "Khách hàng thành viên"}
              </p>

              {isEditing && (
                <div className="w-full mt-4 text-left">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block ml-1">
                    Link Avatar URL
                  </label>
                  <input
                    type="text"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: FORM INFO */}
          <div className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
            >
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  Thông tin chi tiết
                </h3>
                {isEditing && (
                  <span className="text-xs text-blue-600 font-medium animate-pulse">
                    Đang chỉnh sửa...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email (READ ONLY - VÔ HIỆU HÓA) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="mr-2 text-slate-400"
                    />
                    Email (Không thể thay đổi)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 cursor-not-allowed focus:outline-none select-none"
                  />
                </div>

                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="mr-2 text-slate-400"
                    />
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full rounded-xl border px-4 py-3 transition-all ${
                      isEditing
                        ? "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                        : "border-transparent bg-transparent p-0 font-bold text-lg text-slate-800"
                    }`}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="mr-2 text-slate-400"
                    />
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Chưa cập nhật"
                    className={`w-full rounded-xl border px-4 py-3 transition-all ${
                      isEditing
                        ? "border-slate-300 focus:border-blue-500 bg-white"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className="mr-2 text-slate-400"
                    />
                    Tuổi
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full rounded-xl border px-4 py-3 transition-all ${
                      isEditing
                        ? "border-slate-300 focus:border-blue-500 bg-white"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="mr-2 text-slate-400"
                    />
                    Địa chỉ
                  </label>
                  <textarea
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Chưa cập nhật địa chỉ"
                    className={`w-full rounded-xl border px-4 py-3 transition-all resize-none ${
                      isEditing
                        ? "border-slate-300 focus:border-blue-500 bg-white"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  />
                </div>

                {/* PASSWORD SECTION (Chỉ hiện khi Edit Mode) */}
                {isEditing && (
                  <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-100 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
                    <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center">
                      <FontAwesomeIcon
                        icon={faLock}
                        className="mr-2 text-yellow-500"
                      />
                      Đổi mật khẩu{" "}
                      <span className="text-slate-400 font-normal text-sm ml-2 italic">
                        (Để trống nếu không muốn đổi)
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none bg-white"
                          placeholder="••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Xác nhận mật khẩu
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none bg-white"
                          placeholder="••••••"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* ACTION BUTTONS */}
              {isEditing && (
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form về lại dữ liệu ban đầu từ Redux
                      if (user)
                        setFormData({
                          name: user.name || "",
                          email: user.email || "",
                          phone: user.phone || "",
                          address: user.address || "",
                          age: user.age || 0,
                          avatar: user.avatar || "",
                          password: "",
                          confirmPassword: "",
                        });
                    }}
                    className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faXmark} /> Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>Đang lưu...</>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} /> Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
