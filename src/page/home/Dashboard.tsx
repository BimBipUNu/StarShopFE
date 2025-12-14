import HomeHeader from "./HomeHeader";
import HomeFooter from "./HomeFooter";
import { Outlet } from "react-router-dom";

function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <HomeHeader />

      <Outlet />
      <main className="flex-grow container mx-auto px-4 py-6"></main>

      <HomeFooter />
    </div>
  );
}

export default Dashboard;
