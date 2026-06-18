import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Events from './pages/public/Events';
import Gallery from './pages/public/Gallery';
import Contact from './pages/public/Contact';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import PatientIn from './pages/dashboard/PatientIn';
import PatientOut from './pages/dashboard/PatientOut';
import FollowUps from './pages/dashboard/FollowUps';
import Medicines from './pages/dashboard/Medicines';
import StaffManagement from './pages/dashboard/StaffManagement';
import EventsAdmin from './pages/dashboard/EventsAdmin';
import GalleryAdmin from './pages/dashboard/GalleryAdmin';
import ContentAdmin from './pages/dashboard/ContentAdmin';
import CCTVFeed from './pages/dashboard/CCTVFeed';
import ContactSubmissions from './pages/dashboard/ContactSubmissions';
import Settings from './pages/dashboard/Settings';
import LoadingSpinner from './components/ui/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>;

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardLayout /></ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="patient-in" element={<PatientIn />} />
        <Route path="patient-out" element={<PatientOut />} />
        <Route path="follow-ups" element={<FollowUps />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="events" element={<EventsAdmin />} />
        <Route path="gallery" element={<GalleryAdmin />} />
        <Route path="contact-submissions" element={<ContactSubmissions />} />
        <Route path="content" element={<ProtectedRoute adminOnly><ContentAdmin /></ProtectedRoute>} />
        <Route path="cctv" element={<CCTVFeed />} />
        <Route path="settings" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
