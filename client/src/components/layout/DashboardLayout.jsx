import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Hospital } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../common/NotificationBell';
import useSocket from '../../hooks/useSocket';

const DashboardLayout = ({ children, menuItems, accentColor, roleLabel }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useSocket(user?._id);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const accentClasses = {
    slate: 'bg-slate-800',
    blue: 'bg-blue-700',
    green: 'bg-green-700',
    purple: 'bg-purple-700',
    amber: 'bg-amber-600',
    teal: 'bg-teal-700',
    orange: 'bg-orange-600',
    sky: 'bg-sky-600',
  };

  const sidebarBg = accentClasses[accentColor] || accentClasses.blue;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${sidebarBg} text-white transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Hospital size={28} />
            <div>
              <h1 className="font-bold text-lg">CareLink</h1>
              <p className="text-xs text-white/70">{roleLabel}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link sidebar-link-inactive w-full">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 hidden lg:block">CareLink Hospital</h2>
          <NotificationBell />
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
