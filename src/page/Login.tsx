/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { AuthType } from "../types/authTypes";
import { useDispatch } from "react-redux";
import { loginFlow } from "../slice/authSlice";
import type { AppDispatch } from "../store/store";
// 1. Import Toast
import toast from "react-hot-toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [remember, setRemember] = useState(false);
  const [authForm, setAuthForm] = useState<AuthType>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AuthType, string>>>(
    {}
  );

  // const handleRemember = () => setRemember((prev) => !prev);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));

    // Clear error inline khi user bắt đầu gõ lại
    if (errors[name as keyof AuthType]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AuthType, string>> = {};
    let isValid = true;

    if (!authForm.email.trim()) {
      newErrors.email = "Email không được để trống";
      isValid = false;
    } else if (!EMAIL_REGEX.test(authForm.email)) {
      newErrors.email = "Email không đúng định dạng";
      isValid = false;
    }

    if (!authForm.password) {
      newErrors.password = "Mật khẩu không được để trống";
      isValid = false;
    } else if (authForm.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin đăng nhập");
      return;
    }

    setIsSubmitting(true);
    // 2. Hiện toast loading
    const loadingId = toast.loading("Đang đăng nhập...");

    try {
      const resultAction = await dispatch(
        loginFlow({ email: authForm.email, password: authForm.password })
      );

      if (loginFlow.fulfilled.match(resultAction)) {
        // 3. Success -> Cập nhật toast & Chuyển trang
        toast.success("Đăng nhập thành công!", { id: loadingId });
        navigate("/home");
      } else if (loginFlow.rejected.match(resultAction)) {
        // 4. Error -> Cập nhật toast với message lỗi từ API
        const errorMsg =
          (resultAction.payload as string) || "Đăng nhập thất bại";
        toast.error(errorMsg, { id: loadingId });
      }
    } catch (error: any) {
      const msg = error?.message || "Lỗi hệ thống, vui lòng thử lại sau.";
      toast.error(msg, { id: loadingId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-900">
      <div className="w-full max-w-[450px] rounded-lg bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-slate-600">
          Đăng nhập
        </h2>

        {/* Đã xóa phần hiển thị apiError div vì dùng toast rồi */}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-700"
            >
              Email
            </label>
            <input
              ref={inputRef}
              type="email"
              id="email"
              name="email"
              placeholder="Nhập vào email..."
              value={authForm.email}
              onChange={handleChangeInput}
              className={`w-full rounded border px-3 py-2 text-slate-700 placeholder-slate-400 transition focus:outline-none focus:ring-1 ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
              }`}
            />
            {errors.email && (
              <span className="text-xs text-red-500">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Nhập vào password..."
              value={authForm.password}
              onChange={handleChangeInput}
              className={`w-full rounded border px-3 py-2 text-slate-700 placeholder-slate-400 transition focus:outline-none focus:ring-1 ${
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
              }`}
            />
            {errors.password && (
              <span className="text-xs text-red-500">{errors.password}</span>
            )}
          </div>

          {/* <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={remember}
              onChange={handleRemember}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="rememberMe" className="text-sm text-slate-600">
              Ghi nhớ tôi
            </label>
          </div> */}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-4 w-full rounded py-2.5 text-center font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isSubmitting
                ? "cursor-not-allowed bg-slate-400 opacity-70"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90"
            }`}
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Bạn chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-500 hover:text-blue-600 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
