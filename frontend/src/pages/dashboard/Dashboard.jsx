import { useQuery } from '@tanstack/react-query';
import { UserPlus, Users, CalendarCheck, Pill, AlertTriangle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/ui/StatsCard';
import api from '../../services/api';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: patientStats } = useQuery({
    queryKey: ['patient-stats'],
    queryFn: () => api.get('/patients/stats').then(r => r.data)
  });

  const { data: recentPatients } = useQuery({
    queryKey: ['recent-patients'],
    queryFn: () => api.get('/patients?limit=5').then(r => r.data)
  });

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => api.get('/medicines/low-stock').then(r => r.data)
  });

  const { data: followUpsData } = useQuery({
    queryKey: ['pending-followups'],
    queryFn: () => api.get('/followups?status=Pending&limit=5').then(r => r.data)
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening today — {format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard title="Total Patients" value={patientStats?.total} icon={Users} color="primary" subtitle="All time" />
        <StatsCard title="Currently Admitted" value={patientStats?.admitted} icon={UserPlus} color="blue" subtitle="Active patients" />
        <StatsCard title="Discharged" value={patientStats?.discharged} icon={TrendingUp} color="teal" subtitle="Recovered" />
        <StatsCard title="This Month" value={patientStats?.thisMonth} icon={CalendarCheck} color="orange" subtitle="New admissions" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Patients</h2>
            <Link to="/dashboard/patient-in" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="table-responsive">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-medium text-gray-500 pb-3">Patient ID</th>
                  <th className="text-left py-2 font-medium text-gray-500 pb-3">Name</th>
                  <th className="text-left py-2 font-medium text-gray-500 pb-3 hidden sm:table-cell">Addiction</th>
                  <th className="text-left py-2 font-medium text-gray-500 pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(recentPatients?.patients || []).map(p => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs text-gray-500">{p.patientId}</td>
                    <td className="py-3 font-medium text-gray-800">{p.fullName}</td>
                    <td className="py-3 text-gray-600 hidden sm:table-cell">{p.addictionType}</td>
                    <td className="py-3">
                      <span className={`badge ${p.status === 'admitted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!recentPatients?.patients?.length && (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">No patients yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {lowStock && lowStock.length > 0 && (
            <div className="card border-orange-200 bg-orange-50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h2 className="font-semibold text-orange-800">Low Stock Alert</h2>
              </div>
              <div className="space-y-2">
                {lowStock.slice(0, 4).map(med => (
                  <div key={med._id} className="flex justify-between items-center text-sm">
                    <span className="text-orange-800 truncate flex-1">{med.name}</span>
                    <span className="text-orange-600 font-semibold ml-2">{med.stockQuantity} left</span>
                  </div>
                ))}
              </div>
              <Link to="/dashboard/medicines" className="block mt-3 text-xs text-orange-600 hover:underline">View medicines →</Link>
            </div>
          )}

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Pending Follow-Ups</h2>
              <Link to="/dashboard/follow-ups" className="text-sm text-primary-600 hover:underline">All</Link>
            </div>
            <div className="space-y-2">
              {(followUpsData?.followUps || []).map(f => (
                <div key={f._id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                  <div>
                    <div className="font-medium text-gray-800">{f.patientId?.fullName || 'Unknown'}</div>
                    <div className="text-xs text-gray-400">{format(new Date(f.date), 'dd MMM')} • {f.type}</div>
                  </div>
                  <span className="badge bg-yellow-100 text-yellow-700">Pending</span>
                </div>
              ))}
              {!followUpsData?.followUps?.length && (
                <p className="text-sm text-gray-400 py-2">No pending follow-ups</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Patient In', to: '/dashboard/patient-in', icon: '👤' },
          { label: 'Patient Out', to: '/dashboard/patient-out', icon: '🚪' },
          { label: 'Follow Ups', to: '/dashboard/follow-ups', icon: '📅' },
          { label: 'Medicines', to: '/dashboard/medicines', icon: '💊' },
          { label: 'Staff', to: '/dashboard/staff', icon: '👨‍⚕️' },
          { label: 'Events', to: '/dashboard/events', icon: '🎉' }
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:shadow-md hover:border-primary-200 transition-all"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-xs font-medium text-gray-700">{item.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
