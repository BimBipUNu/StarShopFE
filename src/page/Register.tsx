import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../slice/authSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
// Import Toast
import toast from "react-hot-toast";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Không cần lấy error từ redux nữa vì ta sẽ bắt trực tiếp từ action result
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!formData.name.trim()) {
      newErrors.name = "Họ tên không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    // Validate Password & Replace Alert with Toast
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (!passwordRegex.test(formData.password)) {
      // Thay thế alert bằng toast error
      toast.error(
        "Mật khẩu quá yếu! Phải có ít nhất 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt.",
        { duration: 5000 }
      );
      newErrors.password = "Mật khẩu không đủ mạnh";
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    const loadingId = toast.loading("Đang đăng ký tài khoản...");

    try {
      // Sử dụng unwrap hoặc check match để xử lý kết quả
      const resultAction = await dispatch(
        registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })
      );

      if (registerUser.fulfilled.match(resultAction)) {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.", {
          id: loadingId,
        });
        navigate("/login");
      } else if (registerUser.rejected.match(resultAction)) {
        const errorMsg = (resultAction.payload as string) || "Đăng ký thất bại";
        toast.error(errorMsg, { id: loadingId });
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại.", { id: loadingId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-900 py-10">
      <div className="w-full max-w-[450px] rounded-lg bg-white p-8 shadow-2xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-slate-600">
          Đăng ký tài khoản
        </h2>
        <p className="mb-6 text-center text-sm text-slate-500">
          Nhập thông tin để tạo tài khoản mới
        </p>

        {/* Đã xóa div hiển thị error từ redux */}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-semibold text-slate-700">
              Họ và tên
            </label>
            <input
              type="text"
              name="name"
              placeholder="Ví dụ: Nguyễn Văn A"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded border px-3 py-2 text-slate-700 transition focus:outline-none focus:ring-1 ${
                errors.name
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
              }`}
            />
            {errors.name && (
              <span className="text-xs text-red-500">{errors.name}</span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="nhap@email.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded border px-3 py-2 text-slate-700 transition focus:outline-none focus:ring-1 ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
              }`}
            />
            {errors.email && (
              <span className="text-xs text-red-500">{errors.email}</span>
            )}
          </div>

          {/* Mật khẩu */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-semibold text-slate-700">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu..."
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded border px-3 py-2 text-slate-700 transition focus:outline-none focus:ring-1 ${
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
              }`}
            />
            {errors.password && (
              <span className="text-xs text-red-500">{errors.password}</span>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-semibold text-slate-700">
              Nhập lại mật khẩu
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu..."
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full rounded border px-3 py-2 text-slate-700 transition focus:outline-none focus:ring-1 ${
                errors.confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
              }`}
            />
            {errors.confirmPassword && (
              <span className="text-xs text-red-500">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Button Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-6 w-full rounded py-2.5 text-center font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isSubmitting
                ? "cursor-not-allowed bg-slate-400 opacity-70"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90"
            }`}
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Bạn đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-500 hover:text-blue-600 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
