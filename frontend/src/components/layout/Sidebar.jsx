import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, UserPlus, UserMinus, CalendarCheck, Pill,
  Users, CalendarDays, Image, Mail, Settings, FileText, Video, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/patient-in', icon: UserPlus, label: 'Patient In' },
  { to: '/dashboard/patient-out', icon: UserMinus, label: 'Patient Out' },
  { to: '/dashboard/follow-ups', icon: CalendarCheck, label: 'Follow-Ups' },
  { to: '/dashboard/medicines', icon: Pill, label: 'Medicines' },
  { to: '/dashboard/staff', icon: Users, label: 'Staff' },
  { to: '/dashboard/events', icon: CalendarDays, label: 'Events' },
  { to: '/dashboard/gallery', icon: Image, label: 'Gallery' },
  { to: '/dashboard/contact-submissions', icon: Mail, label: 'Contact' },
  { to: '/dashboard/content', icon: FileText, label: 'Content', adminOnly: true },
  { to: '/dashboard/cctv', icon: Video, label: 'CCTV Feed' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings', adminOnly: true }
];

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useAuth();

  const filteredItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30
        w-64 bg-white shadow-lg flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}
      `}>
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 flex-shrink-0">
          <span className="font-bold text-primary-700">Admin Panel</span>
          <button onClick={onClose} className="md:hidden p-1 rounded hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {filteredItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => window.innerWidth < 768 && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] flex-shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Green Valley Foundation v1.0</p>
        </div>
      </aside>
    </>
  );
}
