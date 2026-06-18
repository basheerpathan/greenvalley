import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Plus, Settings2, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import FieldManager from '../../components/FieldManager';
import DynamicForm from '../../components/DynamicForm';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

const TYPES = ['Call', 'Visit', 'Video'];
const STATUSES = ['Pending', 'Completed', 'Missed'];

const defaultForm = {
  patientId: '', date: new Date().toISOString().split('T')[0], time: '',
  type: 'Call', staffResponsible: '', status: 'Pending', notes: '', customFields: {}
};

export default function FollowUps() {
  const { isAdmin, isStaff } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showFieldManager, setShowFieldManager] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState(defaultForm);

  const { data: followUpsData, isLoading } = useQuery({
    queryKey: ['followups', statusFilter],
    queryFn: () => api.get(`/followups?${statusFilter ? `status=${statusFilter}` : ''}&limit=100`).then(r => r.data)
  });

  const { data: patientsData } = useQuery({
    queryKey: ['patients-for-followup'],
    queryFn: () => api.get('/patients?status=admitted&limit=100').then(r => r.data)
  });

  const { data: customFields = [] } = useQuery({
    queryKey: ['fields', 'follow-up'],
    queryFn: () => api.get('/fields/follow-up').then(r => r.data)
  });

  const createMutation = useMutation({
    mutationFn: data => api.post('/followups', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['followups'] }); toast.success('Follow-up scheduled'); closeForm(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/followups/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['followups'] }); toast.success('Follow-up updated'); closeForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: id => api.delete(`/followups/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['followups'] }); toast.success('Follow-up deleted'); }
  });

  const closeForm = () => { setShowForm(false); setEditItem(null); setForm(defaultForm); };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      patientId: item.patientId?._id || '',
      date: item.date?.split('T')[0] || '',
      time: item.time || '',
      type: item.type,
      staffResponsible: item.staffResponsible,
      status: item.status,
      notes: item.notes || '',
      customFields: Object.fromEntries(item.customFields || [])
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editItem) {
      updateMutation.mutate({ id: editItem._id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const statusColor = { Pending: 'yellow', Completed: 'green', Missed: 'red' };
  const followUps = followUpsData?.followUps || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Follow-Ups</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage patient follow-up schedules</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isAdmin && (
            <button onClick={() => setShowFieldManager(true)} className="flex items-center gap-2 btn-ghost border border-gray-200 text-sm">
              <Settings2 className="w-4 h-4" /> Manage Fields
            </button>
          )}
          {isStaff && (
            <button onClick={() => { setShowForm(true); setEditItem(null); setForm(defaultForm); }} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Follow-Up
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'Pending', 'Completed', 'Missed'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Patient', 'Date & Time', 'Type', 'Staff', 'Status', 'Notes', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {followUps.map(f => (
                <tr key={f._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{f.patientId?.fullName || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {f.date ? format(new Date(f.date), 'dd MMM yyyy') : '—'}
                    {f.time && <span className="text-gray-400 ml-1 text-xs">{f.time}</span>}
                  </td>
                  <td className="px-4 py-3"><Badge color="blue">{f.type}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{f.staffResponsible}</td>
                  <td className="px-4 py-3"><Badge color={statusColor[f.status]}>{f.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate text-xs">{f.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {isStaff && <button onClick={() => handleEdit(f)} className="p-1.5 rounded hover:bg-yellow-50 text-gray-400 hover:text-yellow-600"><Pencil className="w-4 h-4" /></button>}
                      {isAdmin && <button onClick={() => setDeleteTarget(f)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!followUps.length && !isLoading && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No follow-ups found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={closeForm} title={editItem ? 'Edit Follow-Up' : 'Schedule Follow-Up'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Patient *</label>
              <select className="input" value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} required>
                <option value="">Select patient...</option>
                {(patientsData?.patients || []).map(p => <option key={p._id} value={p._id}>{p.fullName} ({p.patientId})</option>)}
              </select>
            </div>
            <div><label className="label">Follow-Up Date *</label><input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
            <div><label className="label">Time</label><input type="time" className="input" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
            <div><label className="label">Type *</label><select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} required>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label">Status</label><select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="sm:col-span-2"><label className="label">Staff Responsible *</label><input className="input" value={form.staffResponsible} onChange={e => setForm(f => ({ ...f, staffResponsible: e.target.value }))} required /></div>
            <div className="sm:col-span-2"><label className="label">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DynamicForm fields={customFields} values={form.customFields} onChange={cf => setForm(f => ({ ...f, customFields: cf }))} />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editItem ? 'Update' : 'Schedule'}
            </button>
            <button type="button" onClick={closeForm} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget._id)} title="Delete Follow-Up" message="Are you sure you want to delete this follow-up record?" />
      <FieldManager formType="follow-up" isOpen={showFieldManager} onClose={() => setShowFieldManager(false)} />
    </div>
  );
}
