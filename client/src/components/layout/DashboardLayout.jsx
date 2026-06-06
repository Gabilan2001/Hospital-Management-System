import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Hospital } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../common/NotificationBell';
import Avatar from '../common/Avatar';
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

  const sidebarGradients = {
    slate: 'from-slate-800 to-slate-900',
    blue: 'from-blue-700 to-blue-900',
    green: 'from-emerald-700 to-emerald-900',
    purple: 'from-violet-700 to-purple-900',
    amber: 'from-amber-600 to-orange-700',
    teal: 'from-teal-700 to-cyan-900',
    orange: 'from-orange-600 to-red-700',
    sky: 'from-sky-600 to-blue-800',
  };

  const sidebarBg = sidebarGradients[accentColor] || sidebarGradients.blue;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b ${sidebarBg} text-white transform transition-transform lg:translate-x-0 flex flex-col shadow-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Hospital size={28} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">CareLink</h1>
              <p className="text-xs text-white/60">{roleLabel}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
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

        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-white/5">
            <Avatar src={user?.avatar} name={user?.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link sidebar-link-inactive w-full">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">CareLink Hospital</h2>
              <p className="text-xs text-gray-400 hidden sm:block">Sri Lanka Healthcare Management</p>
            </div>
          </div>
          <NotificationBell />
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
