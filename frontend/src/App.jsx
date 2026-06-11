import { Activity, HardDrive, LayoutDashboard, LogOut, Shield, Ticket, Users } from "lucide-react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./api/AuthContext.jsx";
import Assets from "./pages/Assets.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Monitoring from "./pages/Monitoring.jsx";
import Tickets from "./pages/Tickets.jsx";
import UsersPage from "./pages/Users.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assets", label: "Assets", icon: HardDrive },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/monitoring", label: "Monitoring", icon: Activity },
  { to: "/users", label: "Users", icon: Users, admin: true }
];

export default function App() {
  const { user, logout } = useAuth();
  const visibleNav = navItems.filter((item) => !item.admin || user?.role === "admin");

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Shield size={26} />
          <div>
            <strong>InfraOps</strong>
            <span>Operations Portal</span>
          </div>
        </div>
        <nav className="nav">
          {visibleNav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="profile">
          <div>
            <strong>{user?.username}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="icon-button" onClick={logout} title="Log out" aria-label="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </main>
    </div>
  );
}
