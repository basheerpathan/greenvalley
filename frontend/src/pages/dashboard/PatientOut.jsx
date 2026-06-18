import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserMinus, Settings2, Search } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import FieldManager from '../../components/FieldManager';
import DynamicForm from '../../components/DynamicForm';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';

const CONDITIONS = ['Recovered', 'Against Advice', 'Referred'];

export default function PatientOut() {
  const { isAdmin, isStaff } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showFieldManager, setShowFieldManager] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    dischargeDate: new Date().toISOString().split('T')[0],
    dischargeCondition: 'Recovered', dischargeNotes: '',
    authorizedStaff: '', followUpSchedule: '', dischargeCustomFields: {}
  });

  const { data: admittedData } = useQuery({
    queryKey: ['patients-admitted'],
    queryFn: () => api.get('/patients?status=admitted&limit=100').then(r => r.data)
  });

  const { data: dischargedData } = useQuery({
    queryKey: ['patients-discharged', search],
    queryFn: () => api.get(`/patients?status=discharged&search=${search}&limit=50`).then(r => r.data)
  });

  const { data: customFields = [] } = useQuery({
    queryKey: ['fields', 'patient-out'],
    queryFn: () => api.get('/fields/patient-out').then(r => r.data)
  });

  const dischargeMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/patients/${id}/discharge`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient discharged successfully');
      setShowForm(false);
      setSelectedPatient(null);
    }
  });

  const handleDischarge = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    dischargeMutation.mutate({ id: selectedPatient._id, data: form });
  };

  const conditionBadge = (c) => ({ 'Recovered': 'green', 'Against Advice': 'red', 'Referred': 'blue' }[c] || 'gray');

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Discharge</h1>
          <p className="text-gray-500 text-sm mt-1">Process discharges and view discharge history</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button onClick={() => setShowFieldManager(true)} className="flex items-center gap-2 btn-ghost border border-gray-200 text-sm">
              <Settings2 className="w-4 h-4" /> Manage Fields
            </button>
          )}
        </div>
      </div>

      {isStaff && (admittedData?.patients?.length > 0) && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">Discharge a Patient</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="input flex-1"
              value={selectedPatient?._id || ''}
              onChange={e => {
                const p = admittedData.patients.find(p => p._id === e.target.value);
                setSelectedPatient(p || null);
              }}
            >
              <option value="">Select admitted patient...</option>
              {admittedData.patients.map(p => (
                <option key={p._id} value={p._id}>{p.fullName} ({p.patientId})</option>
              ))}
            </select>
            <button
              onClick={() => selectedPatient && setShowForm(true)}
              disabled={!selectedPatient}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <UserMinus className="w-4 h-4" /> Process Discharge
            </button>
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-10" placeholder="Search discharged patients..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Discharge History</h2>
        </div>
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                {['Patient ID', 'Name', 'Discharge Date', 'Condition', 'Authorized By', 'Follow-Up'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(dischargedData?.patients || []).map(p => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.patientId}</td>
                  <td className="px-4 py-3 font-medium">{p.fullName}</td>
                  <td className="px-4 py-3 text-gray-500">{p.dischargeDate ? format(new Date(p.dischargeDate), 'dd MMM yyyy') : '—'}</td>
                  <td className="px-4 py-3"><Badge color={conditionBadge(p.dischargeCondition)}>{p.dischargeCondition || '—'}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{p.authorizedStaff || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.followUpSchedule || '—'}</td>
                </tr>
              ))}
              {!dischargedData?.patients?.length && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No discharge records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showForm && !!selectedPatient} onClose={() => setShowForm(false)} title={`Discharge — ${selectedPatient?.fullName}`} size="lg">
        <form onSubmit={handleDischarge} className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
            Patient: <strong>{selectedPatient?.fullName}</strong> ({selectedPatient?.patientId}) • Admitted: {selectedPatient?.admissionDate ? format(new Date(selectedPatient.admissionDate), 'dd MMM yyyy') : '—'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Discharge Date *</label><input type="date" className="input" value={form.dischargeDate} onChange={e => setForm(f => ({ ...f, dischargeDate: e.target.value }))} required /></div>
            <div><label className="label">Discharge Condition *</label><select className="input" value={form.dischargeCondition} onChange={e => setForm(f => ({ ...f, dischargeCondition: e.target.value }))} required>{CONDITIONS.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label">Authorized Staff</label><input className="input" value={form.authorizedStaff} onChange={e => setForm(f => ({ ...f, authorizedStaff: e.target.value }))} /></div>
            <div><label className="label">Follow-Up Schedule</label><input className="input" placeholder="e.g. Monthly check-in for 6 months" value={form.followUpSchedule} onChange={e => setForm(f => ({ ...f, followUpSchedule: e.target.value }))} /></div>
            <div className="sm:col-span-2"><label className="label">Discharge Notes</label><textarea className="input" rows={3} value={form.dischargeNotes} onChange={e => setForm(f => ({ ...f, dischargeNotes: e.target.value }))} /></div>
          </div>
          <DynamicForm fields={customFields} values={form.dischargeCustomFields} onChange={cf => setForm(f => ({ ...f, dischargeCustomFields: cf }))} />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={dischargeMutation.isPending}>
              {dischargeMutation.isPending ? 'Processing...' : 'Confirm Discharge'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </Modal>

      <FieldManager formType="patient-out" isOpen={showFieldManager} onClose={() => setShowFieldManager(false)} />
    </div>
  );
}
