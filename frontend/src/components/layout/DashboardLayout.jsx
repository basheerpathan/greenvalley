import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, Leaf, Video, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import toast from 'react-hot-toast';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-4 sm:px-6 h-16 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-gray-800 hidden sm:block">Green Valley Foundation</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/dashboard/cctv')}
              className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Live CCTV</span>
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-800 leading-tight">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-gray-500"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
