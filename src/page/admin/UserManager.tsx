/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import userAPI from "../../api/user";
import type { UserType } from "../../types/userTypes";
import toast from "react-hot-toast";

export default function UserManager() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const [formData, setFormData] = useState<UserType>({
    id: "",
    email: "",
    password: "",
    name: "",
    role: "user",
    phone: "",
    address: "",
    age: 0,
    avatar: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response: any = await userAPI.getAll();
      const data = response.data || response;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (id: string | number) => {
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
                Xóa người dùng?
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
                await userAPI.delete(Number(id));
                setUsers((prev) =>
                  prev.filter((u) => Number(u.id) !== Number(id))
                );
                toast.success("Đã xóa người dùng thành công!");
              } catch (error: any) {
                const msg =
                  error.response?.data?.message || "Lỗi khi xóa người dùng.";
                toast.error(msg);
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

  const openEditModal = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      ...user,
      password: "", // Reset mật khẩu khi mở modal để tránh hiện mật khẩu mã hóa
      age: user.age || 0,
    });
    setIsModalOpen(true);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // 1. Validate Password
    if (formData.password) {
      const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

      if (!PASSWORD_REGEX.test(formData.password)) {
        toast.error(
          "Mật khẩu quá yếu! Yêu cầu:\n- Tối thiểu 8 ký tự\n- 1 chữ hoa, 1 thường\n- 1 số, 1 ký tự đặc biệt",
          { duration: 5000 }
        );
        return;
      }
    }

    const loadingToast = toast.loading("Đang cập nhật...");

    try {
      const updatePayload: any = {
        ...formData,
        age: Number(formData.age),
      };

      // Xóa field password nếu rỗng để không gửi lên server
      if (!updatePayload.password) delete updatePayload.password;
      delete updatePayload.email;
      delete updatePayload.id;

      const res: any = await userAPI.put({
        id: editingUser.id,
        ...updatePayload,
      });

      const updatedUserFromServer = res.data || res;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, ...updatedUserFromServer } : u
        )
      );

      toast.success("Cập nhật thông tin thành công!", { id: loadingToast });
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Lỗi Update:", error);

      if (error.response) {
        const { status, data } = error.response;
        if (status === 400 && data.errors) {
          toast.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.", {
            id: loadingToast,
          });
        } else {
          toast.error(`Lỗi: ${data.message || "Có lỗi xảy ra."}`, {
            id: loadingToast,
          });
        }
      } else {
        toast.error("Không thể kết nối tới server.", { id: loadingToast });
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-800">Quản lý người dùng</h2>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="🔍 Tìm tên hoặc email..."
              className="w-full border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-10">Đang tải dữ liệu...</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase">
              <th className="p-4 w-20">ID</th>
              <th className="p-4">Người dùng</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4">Liên hệ</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-500 text-sm">#{user.id}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          className="h-full w-full object-cover"
                          alt="avatar"
                        />
                      ) : (
                        <span>{(user.name || "U")[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {user.name || "No Name"}
                      </div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  <p>📞 {user.phone || "---"}</p>
                  <p className="truncate w-32">📍 {user.address || "---"}</p>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold">
                Chỉnh sửa: {editingUser.name}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    disabled
                    className="w-full border bg-slate-100 rounded-lg px-3 py-2 text-slate-500 cursor-not-allowed"
                    value={formData.email}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <p className="text-xs text-slate-400 mt-1 italic">
                    Để trống nếu không muốn đổi mật khẩu.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Vai trò
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as any })
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SĐT</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tuổi</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.avatar}
                    onChange={(e) =>
                      setFormData({ ...formData, avatar: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Địa chỉ
                  </label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 resize-none"
                    rows={3}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4 border-t mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
