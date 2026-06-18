import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pill, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

const MEDICINE_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Topical', 'Drops', 'Other'];

const defaultForm = { name: '', type: 'Tablet', dosage: '', stockQuantity: 0, expiryDate: '', lowStockThreshold: 10, manufacturer: '' };
const defaultAssignForm = { patientId: '', medicineId: '', dosageNote: '', schedule: { morning: false, afternoon: false, night: false }, startDate: new Date().toISOString().split('T')[0], notes: '' };

export default function Medicines() {
  const { isAdmin, isStaff } = useAuth();
  const qc = useQueryClient();
  const [showMedForm, setShowMedForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [medForm, setMedForm] = useState(defaultForm);
  const [assignForm, setAssignForm] = useState(defaultAssignForm);
  const [tab, setTab] = useState('inventory');

  const { data: medicines = [] } = useQuery({ queryKey: ['medicines'], queryFn: () => api.get('/medicines').then(r => r.data) });
  const { data: lowStock = [] } = useQuery({ queryKey: ['low-stock'], queryFn: () => api.get('/medicines/low-stock').then(r => r.data) });
  const { data: assignments = [] } = useQuery({ queryKey: ['assignments'], queryFn: () => api.get('/medicines/assignments').then(r => r.data) });
  const { data: patientsData } = useQuery({ queryKey: ['patients-for-med'], queryFn: () => api.get('/patients?status=admitted&limit=100').then(r => r.data) });

  const createMed = useMutation({ mutationFn: d => api.post('/medicines', d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['medicines'] }); toast.success('Medicine added'); closeMedForm(); } });
  const updateMed = useMutation({ mutationFn: ({ id, d }) => api.put(`/medicines/${id}`, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['medicines'] }); toast.success('Medicine updated'); closeMedForm(); } });
  const deleteMed = useMutation({ mutationFn: id => api.delete(`/medicines/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['medicines'] }); toast.success('Medicine removed'); } });
  const createAssign = useMutation({ mutationFn: d => api.post('/medicines/assignments', d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments'] }); toast.success('Medicine assigned'); setShowAssignForm(false); setAssignForm(defaultAssignForm); } });
  const deleteAssign = useMutation({ mutationFn: id => api.delete(`/medicines/assignments/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments'] }); toast.success('Assignment removed'); } });

  const closeMedForm = () => { setShowMedForm(false); setEditMed(null); setMedForm(defaultForm); };

  const handleEditMed = (m) => { setEditMed(m); setMedForm({ name: m.name, type: m.type, dosage: m.dosage, stockQuantity: m.stockQuantity, expiryDate: m.expiryDate?.split('T')[0] || '', lowStockThreshold: m.lowStockThreshold, manufacturer: m.manufacturer || '' }); setShowMedForm(true); };

  const handleSubmitMed = (e) => { e.preventDefault(); editMed ? updateMed.mutate({ id: editMed._id, d: medForm }) : createMed.mutate(medForm); };

  const isExpiringSoon = (date) => { if (!date) return false; const d = new Date(date); const m = new Date(); m.setMonth(m.getMonth() + 3); return d < m; };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicine Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage inventory and patient medicine assignments</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isStaff && (
            <>
              <button onClick={() => setShowAssignForm(true)} className="btn-ghost border border-gray-200 text-sm flex items-center gap-2"><Pill className="w-4 h-4" /> Assign Medicine</button>
              <button onClick={() => { setShowMedForm(true); setEditMed(null); setMedForm(defaultForm); }} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Medicine</button>
            </>
          )}
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-800 text-sm">Low Stock Alert</p>
            <p className="text-orange-700 text-sm">{lowStock.map(m => `${m.name} (${m.stockQuantity} left)`).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {['inventory', 'assignments'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
        ))}
      </div>

      {tab === 'inventory' ? (
        <div className="card p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Name', 'Type', 'Dosage', 'Stock', 'Expiry', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody>
                {medicines.map(m => (
                  <tr key={m._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{m.name}{m.manufacturer && <span className="text-xs text-gray-400 block">{m.manufacturer}</span>}</td>
                    <td className="px-4 py-3 text-gray-600">{m.type}</td>
                    <td className="px-4 py-3 text-gray-600">{m.dosage}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${m.stockQuantity <= m.lowStockThreshold ? 'text-red-600' : 'text-gray-800'}`}>{m.stockQuantity}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className={isExpiringSoon(m.expiryDate) ? 'text-orange-600 font-medium' : ''}>
                        {m.expiryDate ? format(new Date(m.expiryDate), 'dd MMM yyyy') : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {m.stockQuantity <= m.lowStockThreshold ? <Badge color="red">Low Stock</Badge> : <Badge color="green">In Stock</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {isStaff && <button onClick={() => handleEditMed(m)} className="p-1.5 rounded hover:bg-yellow-50 text-gray-400 hover:text-yellow-600"><Pencil className="w-4 h-4" /></button>}
                        {isAdmin && <button onClick={() => setDeleteTarget(m)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {!medicines.length && <tr><td colSpan={7} className="text-center py-10 text-gray-400">No medicines in inventory</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Patient', 'Medicine', 'Dosage', 'Schedule', 'Start Date', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{a.patientId?.fullName || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{a.medicineId?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{a.medicineId?.dosage || '—'}{a.dosageNote && <span className="text-xs text-gray-400 block">{a.dosageNote}</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {a.schedule?.morning && <Badge color="orange">AM</Badge>}
                        {a.schedule?.afternoon && <Badge color="blue">PM</Badge>}
                        {a.schedule?.night && <Badge color="purple">Night</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.startDate ? format(new Date(a.startDate), 'dd MMM yyyy') : '—'}</td>
                    <td className="px-4 py-3">{isAdmin && <button onClick={() => deleteAssign.mutate(a._id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}</td>
                  </tr>
                ))}
                {!assignments.length && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No assignments</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showMedForm} onClose={closeMedForm} title={editMed ? 'Edit Medicine' : 'Add Medicine'} size="md">
        <form onSubmit={handleSubmitMed} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Medicine Name *</label><input className="input" value={medForm.name} onChange={e => setMedForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div><label className="label">Type *</label><select className="input" value={medForm.type} onChange={e => setMedForm(f => ({ ...f, type: e.target.value }))} required>{MEDICINE_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label">Dosage *</label><input className="input" placeholder="e.g. 500mg" value={medForm.dosage} onChange={e => setMedForm(f => ({ ...f, dosage: e.target.value }))} required /></div>
            <div><label className="label">Stock Quantity *</label><input type="number" min={0} className="input" value={medForm.stockQuantity} onChange={e => setMedForm(f => ({ ...f, stockQuantity: Number(e.target.value) }))} required /></div>
            <div><label className="label">Low Stock Threshold</label><input type="number" min={0} className="input" value={medForm.lowStockThreshold} onChange={e => setMedForm(f => ({ ...f, lowStockThreshold: Number(e.target.value) }))} /></div>
            <div><label className="label">Expiry Date *</label><input type="date" className="input" value={medForm.expiryDate} onChange={e => setMedForm(f => ({ ...f, expiryDate: e.target.value }))} required /></div>
            <div><label className="label">Manufacturer</label><input className="input" value={medForm.manufacturer} onChange={e => setMedForm(f => ({ ...f, manufacturer: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3"><button type="submit" className="btn-primary" disabled={createMed.isPending || updateMed.isPending}>{createMed.isPending || updateMed.isPending ? 'Saving...' : editMed ? 'Update' : 'Add Medicine'}</button><button type="button" onClick={closeMedForm} className="btn-ghost">Cancel</button></div>
        </form>
      </Modal>

      <Modal isOpen={showAssignForm} onClose={() => setShowAssignForm(false)} title="Assign Medicine to Patient" size="md">
        <form onSubmit={e => { e.preventDefault(); createAssign.mutate(assignForm); }} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div><label className="label">Patient *</label><select className="input" value={assignForm.patientId} onChange={e => setAssignForm(f => ({ ...f, patientId: e.target.value }))} required><option value="">Select patient...</option>{(patientsData?.patients || []).map(p => <option key={p._id} value={p._id}>{p.fullName} ({p.patientId})</option>)}</select></div>
            <div><label className="label">Medicine *</label><select className="input" value={assignForm.medicineId} onChange={e => setAssignForm(f => ({ ...f, medicineId: e.target.value }))} required><option value="">Select medicine...</option>{medicines.map(m => <option key={m._id} value={m._id}>{m.name} — {m.dosage}</option>)}</select></div>
            <div><label className="label">Dosage Note</label><input className="input" placeholder="Special instructions..." value={assignForm.dosageNote} onChange={e => setAssignForm(f => ({ ...f, dosageNote: e.target.value }))} /></div>
            <div>
              <label className="label">Schedule</label>
              <div className="flex gap-4">
                {['morning', 'afternoon', 'night'].map(s => (
                  <label key={s} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
                    <input type="checkbox" checked={assignForm.schedule[s]} onChange={e => setAssignForm(f => ({ ...f, schedule: { ...f.schedule, [s]: e.target.checked } }))} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div><label className="label">Start Date</label><input type="date" className="input" value={assignForm.startDate} onChange={e => setAssignForm(f => ({ ...f, startDate: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3"><button type="submit" className="btn-primary" disabled={createAssign.isPending}>{createAssign.isPending ? 'Assigning...' : 'Assign Medicine'}</button><button type="button" onClick={() => setShowAssignForm(false)} className="btn-ghost">Cancel</button></div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMed.mutate(deleteTarget._id)} title="Delete Medicine" message={`Remove ${deleteTarget?.name} from inventory?`} />
    </div>
  );
}
