import { NavLink } from "react-router-dom";

interface HomeNavLinkProps {
  to: string;
  content: string;
  onClick?: () => void;
}

function HomeNavLink({ to, content, onClick }: HomeNavLinkProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `px-4 py-2 font-medium transition-colors duration-200 hover:text-blue-600 ${
          isActive
            ? "text-blue-600 font-bold border-b-2 border-blue-600"
            : "text-slate-600"
        }`
      }
    >
      {content}
    </NavLink>
  );
}

export default HomeNavLink;
