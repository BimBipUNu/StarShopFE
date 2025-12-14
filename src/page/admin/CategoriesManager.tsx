/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import categoryAPI from "../../api/categories";
import type { CategoryType } from "../../types/categoryType";
import toast from "react-hot-toast";

export default function CategoryManager() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(
    null
  );
  const [formData, setFormData] = useState({ name: "", icon: "" });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response: any = await categoryAPI.getAll();
      const data = Array.isArray(response) ? response : response.data || [];
      setCategories(data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
      toast.error("Lỗi lấy danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- XÓA DANH MỤC ---
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
              <p className="text-sm font-medium text-gray-900">Xóa danh mục?</p>
              <p className="mt-1 text-sm text-gray-500">
                Nếu xóa, các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await categoryAPI.delete({ id: Number(id) });
                setCategories((prev) =>
                  prev.filter((cat) => Number(cat.id) !== Number(id))
                );
                toast.success("Đã xóa danh mục thành công!");
              } catch (error) {
                console.error(error);
                toast.error(
                  "Lỗi khi xóa (Có thể danh mục đang chứa sản phẩm)."
                );
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

  const openModal = (category?: CategoryType) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, icon: category.icon || "" });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", icon: "" });
    }
    setIsModalOpen(true);
  };

  // --- SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Tên danh mục không được để trống!");
      return;
    }

    const loadingToast = toast.loading("Đang lưu...");

    try {
      if (editingCategory) {
        const updateData = {
          ...editingCategory,
          name: formData.name,
          icon: formData.icon,
        };
        await categoryAPI.put(updateData);
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id ? { ...cat, ...updateData } : cat
          )
        );
        toast.success("Cập nhật thành công!", { id: loadingToast });
      } else {
        const newCatPayload = {
          id: "0",
          name: formData.name,
          icon: formData.icon,
        };
        const res: any = await categoryAPI.post(newCatPayload);
        if (res && res.id) setCategories([...categories, res]);
        else fetchCategories();
        toast.success("Thêm mới thành công!", { id: loadingToast });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi lưu dữ liệu.", { id: loadingToast });
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
      {/* ... Phần UI Table và Header giữ nguyên ... */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-800">Quản lý danh mục</h2>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Tìm theo tên..."
              className="w-full border rounded-lg pl-3 pr-8 py-2 text-sm"
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
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 whitespace-nowrap"
          >
            + Thêm danh mục
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-10">Đang tải dữ liệu...</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase">
              <th className="p-4 w-20">ID</th>
              <th className="p-4">Icon</th>
              <th className="p-4">Tên danh mục</th>
              <th className="p-4 text-center w-40">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCategories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-500 text-sm">#{cat.id}</td>
                <td className="p-4">
                  {cat.icon ? (
                    <i
                      className={`fa-solid fa-${cat.icon} text-2xl text-slate-500`}
                    ></i>
                  ) : (
                    <div className="text-xs text-slate-300">No Icon</div>
                  )}
                </td>
                <td className="p-4 font-medium text-slate-800">{cat.name}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => openModal(cat)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ví dụ: Laptop..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên icon font awesome
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="VD: user, home..."
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCategory ? "Lưu thay đổi" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
