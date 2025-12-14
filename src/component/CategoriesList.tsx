import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import type { AppDispatch, RootState } from "../store/store";
import { fetchAllCategories } from "../slice/categorySlice";
import type { CategoryType } from "../types/categoryType";

const CategoriesList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); // 2. Khởi tạo hook navigate

  const {
    items: categories,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.category);

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  // 3. Cập nhật hàm xử lý click
  const handleCategoryClick = (id: string | number) => {
    // Chuyển hướng sang trang Product kèm theo tham số categoryId trên URL
    navigate(`/home/product?categoryId=${id}`);

    // Tùy chọn: Scroll lên đầu trang cho mượt
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-2">
        <h2 className="text-2xl font-bold text-slate-800 relative">
          Danh mục sản phẩm
          <span className="absolute bottom-[-9px] left-0 w-24 h-1 bg-blue-600 rounded-full"></span>
        </h2>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-center text-red-600 border border-red-100">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categories.map((cat: CategoryType) => (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                >
                  <i
                    className={`
                      fa-solid fa-${cat.icon || "layer-group"}
                      text-4xl text-gray-500 transition-colors
                      group-hover:text-blue-600
                    `}
                  ></i>

                  <div className="text-center font-bold text-slate-700 group-hover:text-blue-700">
                    {cat.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <i className="fa-regular fa-folder-open text-4xl mb-3 block opacity-50"></i>
              <p>Chưa có danh mục nào.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoriesList;
