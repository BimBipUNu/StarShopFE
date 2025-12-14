function HomeFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Grid Container */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Cột 1: About */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <i className="fa-solid fa-store text-xl text-blue-500"></i>
              <span className="text-xl font-bold">StartShop</span>
            </div>
            <p className="text-sm leading-relaxed mb-4 text-slate-400">
              Sàn thương mại điện tử hàng đầu, cung cấp sản phẩm chính hãng với
              giá tốt nhất.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="hover:text-white transition">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="hover:text-white transition">
                <i className="fa-brands fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Sản phẩm
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Danh mục
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Giỏ hàng
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Chính sách bảo hành
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot mt-1 text-blue-500"></i>
                <span>97 Man Thiện, Hiệp Phú, Thủ Đức, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fa-solid fa-phone text-blue-500"></i>
                <span>0123456789</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fa-solid fa-envelope text-blue-500"></i>
                <span>support@startshop.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Line */}
        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          &copy; 2025 StartShop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default HomeFooter;
