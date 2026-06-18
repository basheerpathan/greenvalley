import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Settings2, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import FieldManager from '../../components/FieldManager';
import DynamicForm from '../../components/DynamicForm';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useEffect } from 'react';
import Badge from '../../components/ui/Badge';

const GENDERS = ['Male', 'Female', 'Other'];
const ADDICTION_TYPES = ['Alcohol', 'Drugs', 'Tobacco', 'Multiple Substances', 'Other'];

const defaultForm = {
  fullName: '', age: '', gender: '', address: '', addictionType: '',
  admissionDate: new Date().toISOString().split('T')[0],
  assignedDoctor: '', emergencyContactName: '', emergencyContactNumber: '',
  wardNumber: '', customFields: {}
};

export default function PatientIn() {
  const { isAdmin, isStaff } = useAuth();
  const qc = useQueryClient();
  const socket = useSocket();
  const [showForm, setShowForm] = useState(false);
  const [showFieldManager, setShowFieldManager] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [viewPatient, setViewPatient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(defaultForm);

  const { data: patientsData, isLoading } = useQuery({
    queryKey: ['patients', { status: 'admitted', search }],
    queryFn: () => api.get(`/patients?status=admitted&search=${search}&limit=50`).then(r => r.data)
  });

  const { data: customFields = [] } = useQuery({
    queryKey: ['fields', 'patient-in'],
    queryFn: () => api.get('/fields/patient-in').then(r => r.data)
  });

  useEffect(() => {
    if (!socket) return;
    const refresh = () => qc.invalidateQueries({ queryKey: ['patients'] });
    socket.on('patient:created', refresh);
    socket.on('patient:updated', refresh);
    socket.on('fields:updated', () => qc.invalidateQueries({ queryKey: ['fields', 'patient-in'] }));
    return () => { socket.off('patient:created', refresh); socket.off('patient:updated', refresh); };
  }, [socket, qc]);

  const createMutation = useMutation({
    mutationFn: data => api.post('/patients', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patients'] }); toast.success('Patient admitted successfully'); closeForm(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/patients/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patients'] }); toast.success('Patient updated'); closeForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: id => api.delete(`/patients/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patients'] }); toast.success('Patient record deleted'); }
  });

  const closeForm = () => { setShowForm(false); setEditPatient(null); setForm(defaultForm); };

  const handleEdit = (patient) => {
    setEditPatient(patient);
    setForm({
      fullName: patient.fullName, age: patient.age, gender: patient.gender,
      address: patient.address, addictionType: patient.addictionType,
      admissionDate: patient.admissionDate?.split('T')[0] || '',
      assignedDoctor: patient.assignedDoctor || '', emergencyContactName: patient.emergencyContactName,
      emergencyContactNumber: patient.emergencyContactNumber, wardNumber: patient.wardNumber || '',
      customFields: Object.fromEntries(patient.customFields || [])
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editPatient) {
      updateMutation.mutate({ id: editPatient._id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const patients = patientsData?.patients || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Admissions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage incoming patients and their records</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isAdmin && (
            <button onClick={() => setShowFieldManager(true)} className="flex items-center gap-2 btn-ghost border border-gray-200 text-sm">
              <Settings2 className="w-4 h-4" /> Manage Fields
            </button>
          )}
          {isStaff && (
            <button onClick={() => { setShowForm(true); setEditPatient(null); setForm(defaultForm); }} className="btn-primary flex items-center gap-2 text-sm">
              <UserPlus className="w-4 h-4" /> Admit Patient
            </button>
          )}
        </div>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-10"
            placeholder="Search patients by name, ID or addiction type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Patient ID', 'Name', 'Age/Gender', 'Addiction', 'Admitted', 'Ward', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.patientId}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{p.age}y / {p.gender}</td>
                  <td className="px-4 py-3"><Badge color="blue">{p.addictionType}</Badge></td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.admissionDate ? format(new Date(p.admissionDate), 'dd MMM yy') : '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.wardNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewPatient(p)} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                      {isStaff && <button onClick={() => handleEdit(p)} className="p-1.5 rounded hover:bg-yellow-50 text-gray-400 hover:text-yellow-600"><Pencil className="w-4 h-4" /></button>}
                      {isAdmin && <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!patients.length && !isLoading && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No admitted patients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={closeForm} title={editPatient ? 'Edit Patient' : 'Admit New Patient'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Full Name *</label><input className="input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required /></div>
            <div><label className="label">Age *</label><input type="number" className="input" min={1} max={120} value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} required /></div>
            <div><label className="label">Gender *</label><select className="input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} required><option value="">Select</option>{GENDERS.map(g => <option key={g}>{g}</option>)}</select></div>
            <div className="sm:col-span-2"><label className="label">Address *</label><textarea className="input" rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required /></div>
            <div><label className="label">Addiction Type *</label><select className="input" value={form.addictionType} onChange={e => setForm(f => ({ ...f, addictionType: e.target.value }))} required><option value="">Select</option>{ADDICTION_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label">Admission Date *</label><input type="date" className="input" value={form.admissionDate} onChange={e => setForm(f => ({ ...f, admissionDate: e.target.value }))} required /></div>
            <div><label className="label">Assigned Doctor</label><input className="input" value={form.assignedDoctor} onChange={e => setForm(f => ({ ...f, assignedDoctor: e.target.value }))} /></div>
            <div><label className="label">Ward / Room Number</label><input className="input" value={form.wardNumber} onChange={e => setForm(f => ({ ...f, wardNumber: e.target.value }))} /></div>
            <div><label className="label">Emergency Contact Name *</label><input className="input" value={form.emergencyContactName} onChange={e => setForm(f => ({ ...f, emergencyContactName: e.target.value }))} required /></div>
            <div><label className="label">Emergency Contact Number *</label><input type="tel" className="input" value={form.emergencyContactNumber} onChange={e => setForm(f => ({ ...f, emergencyContactNumber: e.target.value }))} required /></div>
          </div>
          <DynamicForm fields={customFields} values={form.customFields} onChange={cf => setForm(f => ({ ...f, customFields: cf }))} />
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editPatient ? 'Update Patient' : 'Admit Patient'}
            </button>
            <button type="button" onClick={closeForm} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </Modal>

      {viewPatient && (
        <Modal isOpen={!!viewPatient} onClose={() => setViewPatient(null)} title={`Patient — ${viewPatient.fullName}`} size="lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[['Patient ID', viewPatient.patientId], ['Name', viewPatient.fullName], ['Age', viewPatient.age], ['Gender', viewPatient.gender], ['Addiction', viewPatient.addictionType], ['Ward', viewPatient.wardNumber || '—'], ['Doctor', viewPatient.assignedDoctor || '—'], ['Emergency Contact', `${viewPatient.emergencyContactName} — ${viewPatient.emergencyContactNumber}`], ['Address', viewPatient.address]].map(([k, v]) => (
              <div key={k} className={k === 'Address' ? 'col-span-2' : ''}>
                <div className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{k}</div>
                <div className="font-medium text-gray-800">{v}</div>
              </div>
            ))}
            {viewPatient.customFields && Object.keys(Object.fromEntries(viewPatient.customFields || [])).map(key => (
              <div key={key}>
                <div className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{key}</div>
                <div className="font-medium text-gray-800">{String(Object.fromEntries(viewPatient.customFields)[key])}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        title="Delete Patient Record"
        message={`Are you sure you want to permanently delete the record for ${deleteTarget?.fullName}? This action cannot be undone.`}
      />

      <FieldManager formType="patient-in" isOpen={showFieldManager} onClose={() => setShowFieldManager(false)} />
    </div>
  );
}
