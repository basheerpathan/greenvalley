import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, Plus, Trash2, Save, User } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

const ROLES = ['Admin', 'Staff', 'Viewer'];
const roleColors = { Admin: 'red', Staff: 'blue', Viewer: 'gray' };

export default function Settings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showAddUser, setShowAddUser] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'Staff' });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/auth/users').then(r => r.data)
  });

  const createUserMutation = useMutation({
    mutationFn: d => api.post('/auth/register', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User created'); setShowAddUser(false); setUserForm({ name: '', email: '', password: '', role: 'Staff' }); },
    onError: err => toast.error(err.response?.data?.message || 'Failed to create user')
  });

  const deleteUserMutation = useMutation({
    mutationFn: id => api.delete(`/auth/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deleted'); }
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage system settings and user accounts</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">User Accounts</h2>
          <button onClick={() => setShowAddUser(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
        <div className="space-y-3">
          {users.map(u => (
            <div key={u._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 text-sm">{u.name}</span>
                    {u._id === user._id && <span className="text-xs text-gray-400">(you)</span>}
                  </div>
                  <span className="text-xs text-gray-500">{u.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={roleColors[u.role]}>{u.role}</Badge>
                {u._id !== user._id && (
                  <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Role Permissions</h2>
        <div className="space-y-2 text-sm">
          {[
            ['Admin', 'Full access — manage all features, users, and content'],
            ['Staff', 'Can add/edit patients, follow-ups, medicines, and gallery'],
            ['Viewer', 'Read-only access to dashboard data']
          ].map(([role, desc]) => (
            <div key={role} className="flex items-center gap-3 py-2">
              <Badge color={roleColors[role]}>{role}</Badge>
              <span className="text-gray-600">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showAddUser} onClose={() => setShowAddUser(false)} title="Create New User" size="md">
        <form onSubmit={e => { e.preventDefault(); createUserMutation.mutate(userForm); }} className="space-y-4">
          <div><label className="label">Full Name *</label><input className="input" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><label className="label">Email *</label><input type="email" className="input" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} required /></div>
          <div><label className="label">Password *</label><input type="password" className="input" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} required minLength={6} /></div>
          <div><label className="label">Role *</label><select className="input" value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} required>{ROLES.map(r => <option key={r}>{r}</option>)}</select></div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={createUserMutation.isPending}>{createUserMutation.isPending ? 'Creating...' : 'Create User'}</button>
            <button type="button" onClick={() => setShowAddUser(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteUserMutation.mutate(deleteTarget._id)} title="Delete User" message={`Delete account for ${deleteTarget?.name}? They will lose access immediately.`} />
    </div>
  );
}
