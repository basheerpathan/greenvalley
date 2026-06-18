import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Pencil, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

const ROLES = ['Doctor', 'Counselor', 'Nurse', 'Admin', 'Support'];
const roleColors = { Doctor: 'blue', Counselor: 'purple', Nurse: 'green', Admin: 'red', Support: 'orange' };

const defaultForm = { name: '', role: 'Doctor', contact: '', email: '', qualification: '', joiningDate: '', bio: '', photo: null };

export default function StaffManagement() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff', roleFilter],
    queryFn: () => api.get(`/staff${roleFilter ? `?role=${roleFilter}` : ''}`).then(r => r.data)
  });

  const createMutation = useMutation({
    mutationFn: formData => api.post('/staff', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); toast.success('Staff added'); closeForm(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => api.put(`/staff/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); toast.success('Staff updated'); closeForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: id => api.delete(`/staff/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); toast.success('Staff removed'); }
  });

  const closeForm = () => { setShowForm(false); setEditStaff(null); setForm(defaultForm); setPhotoFile(null); setPhotoPreview(''); };

  const handleEdit = (s) => {
    setEditStaff(s);
    setForm({ name: s.name, role: s.role, contact: s.contact, email: s.email || '', qualification: s.qualification || '', joiningDate: s.joiningDate?.split('T')[0] || '', bio: s.bio || '' });
    setPhotoPreview(s.photo || '');
    setShowForm(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) formData.append(k, v); });
    if (photoFile) formData.append('photo', photoFile);
    if (editStaff) {
      updateMutation.mutate({ id: editStaff._id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your team members and their profiles</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setShowForm(true); setEditStaff(null); setForm(defaultForm); }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', ...ROLES].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${roleFilter === r ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{r || 'All'}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {staff.map(s => (
          <div key={s._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              {s.photo ? (
                <img src={s.photo} alt={s.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-primary-600" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate">{s.name}</h3>
                <Badge color={roleColors[s.role]}>{s.role}</Badge>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-500">
              {s.qualification && <p className="truncate">🎓 {s.qualification}</p>}
              <p>📞 {s.contact}</p>
              {s.email && <p className="truncate">✉️ {s.email}</p>}
              <p>📅 Since {s.joiningDate ? format(new Date(s.joiningDate), 'MMM yyyy') : '—'}</p>
            </div>
            {isAdmin && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                <button onClick={() => handleEdit(s)} className="flex-1 btn-ghost text-xs py-1.5 border border-gray-200">Edit</button>
                <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        ))}
        {!staff.length && !isLoading && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No staff members found</p>
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={closeForm} title={editStaff ? 'Edit Staff' : 'Add Staff Member'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            {photoPreview ? (
              <img src={photoPreview} className="w-20 h-20 rounded-xl object-cover" />
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div>
              <label className="btn-ghost border border-gray-200 text-sm cursor-pointer inline-block">
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Full Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div><label className="label">Role *</label><select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required>{ROLES.map(r => <option key={r}>{r}</option>)}</select></div>
            <div><label className="label">Contact *</label><input type="tel" className="input" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} required /></div>
            <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><label className="label">Qualification</label><input className="input" placeholder="e.g. MBBS, MD" value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} /></div>
            <div className="sm:col-span-2"><label className="label">Joining Date *</label><input type="date" className="input" value={form.joiningDate} onChange={e => setForm(f => ({ ...f, joiningDate: e.target.value }))} required /></div>
            <div className="sm:col-span-2"><label className="label">Bio</label><textarea className="input" rows={2} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>{createMutation.isPending || updateMutation.isPending ? 'Saving...' : editStaff ? 'Update' : 'Add Staff'}</button>
            <button type="button" onClick={closeForm} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget._id)} title="Remove Staff" message={`Remove ${deleteTarget?.name} from staff? Their records will be preserved.`} />
    </div>
  );
}
