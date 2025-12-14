// src/admin/components/AdminLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <h2 className="text-xl font-bold text-slate-800">Admin Portal</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">
              Admin User
            </span>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <i className="fa-solid fa-user"></i>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
