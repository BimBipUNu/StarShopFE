// src/admin/components/Sidebar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";

const menus = [
  { path: "/admin/dashboard", label: "Dashboard", icon: "fa-chart-line" },
  { path: "/admin/products", label: "Products", icon: "fa-box" },
  { path: "/admin/categories", label: "Categories", icon: "fa-tags" },
  { path: "/admin/orders", label: "Orders", icon: "fa-cart-shopping" },
  { path: "/admin/users", label: "Users", icon: "fa-users" },
];

export default function Sidebar() {
  const location = useLocation();
  const nav = useNavigate();

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col">
      <div
        className="p-6 text-2xl font-bold text-blue-400 text-center border-b border-slate-700"
        onClick={() => nav("/home")}
      >
        StarShop
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menus.map((menu) => (
          <Link
            key={menu.path}
            to={menu.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === menu.path
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <i className={`fa-solid ${menu.icon} w-5`}></i>
            <span className="font-medium">{menu.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
