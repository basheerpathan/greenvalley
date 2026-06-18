import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ContentAdmin() {
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState('hero');

  const { data: content, isLoading } = useQuery({
    queryKey: ['content-admin'],
    queryFn: () => api.get('/content').then(r => r.data)
  });

  const updateMutation = useMutation({
    mutationFn: ({ type, data }) => api.put(`/content/${type}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['content-admin'] }); toast.success('Content updated successfully'); }
  });

  if (isLoading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  const sections = [
    { key: 'hero', label: 'Hero Section' },
    { key: 'mission', label: 'Mission & Vision' },
    { key: 'stats', label: 'Stats' },
    { key: 'testimonials', label: 'Testimonials' },
    { key: 'about', label: 'About Us' },
    { key: 'achievement', label: 'Achievements' },
    { key: 'contact-info', label: 'Contact Info' }
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Website Content</h1>
        <p className="text-gray-500 text-sm mt-1">Edit content that appears on the public-facing website. Changes sync instantly.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {sections.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === s.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s.label}</button>
        ))}
      </div>

      <div className="card">
        {activeSection === 'hero' && (
          <HeroEditor data={content?.hero || {}} onSave={d => updateMutation.mutate({ type: 'hero', data: d })} loading={updateMutation.isPending} />
        )}
        {activeSection === 'mission' && (
          <MissionEditor data={content?.mission || {}} onSave={d => updateMutation.mutate({ type: 'mission', data: d })} loading={updateMutation.isPending} />
        )}
        {activeSection === 'stats' && (
          <StatsEditor data={content?.stats || {}} onSave={d => updateMutation.mutate({ type: 'stats', data: d })} loading={updateMutation.isPending} />
        )}
        {activeSection === 'testimonials' && (
          <TestimonialsEditor data={content?.testimonials || []} onSave={d => updateMutation.mutate({ type: 'testimonials', data: d })} loading={updateMutation.isPending} />
        )}
        {activeSection === 'about' && (
          <AboutEditor data={content?.about || {}} onSave={d => updateMutation.mutate({ type: 'about', data: d })} loading={updateMutation.isPending} />
        )}
        {activeSection === 'achievement' && (
          <AchievementEditor data={content?.achievement || {}} onSave={d => updateMutation.mutate({ type: 'achievement', data: d })} loading={updateMutation.isPending} />
        )}
        {activeSection === 'contact-info' && (
          <ContactInfoEditor data={content?.['contact-info'] || {}} onSave={d => updateMutation.mutate({ type: 'contact-info', data: d })} loading={updateMutation.isPending} />
        )}
      </div>
    </div>
  );
}

function SaveBtn({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} className="btn-primary flex items-center gap-2">
      <Save className="w-4 h-4" />
      {loading ? 'Saving...' : 'Save Changes'}
    </button>
  );
}

function HeroEditor({ data, onSave, loading }) {
  const [form, setForm] = useState({ ...data });
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-800 text-lg">Hero Section</h2>
      <div><label className="label">Title</label><input className="input" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
      <div><label className="label">Tagline</label><textarea className="input" rows={3} value={form.tagline || ''} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Primary Button Text</label><input className="input" value={form.ctaPrimary || ''} onChange={e => setForm(f => ({ ...f, ctaPrimary: e.target.value }))} /></div>
        <div><label className="label">Secondary Button Text</label><input className="input" value={form.ctaSecondary || ''} onChange={e => setForm(f => ({ ...f, ctaSecondary: e.target.value }))} /></div>
      </div>
      <SaveBtn onClick={() => onSave(form)} loading={loading} />
    </div>
  );
}

function MissionEditor({ data, onSave, loading }) {
  const [form, setForm] = useState({ mission: data.mission || '', vision: data.vision || '', values: data.values || [] });
  const [newValue, setNewValue] = useState('');
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-800 text-lg">Mission & Vision</h2>
      <div><label className="label">Mission Statement</label><textarea className="input" rows={3} value={form.mission} onChange={e => setForm(f => ({ ...f, mission: e.target.value }))} /></div>
      <div><label className="label">Vision Statement</label><textarea className="input" rows={3} value={form.vision} onChange={e => setForm(f => ({ ...f, vision: e.target.value }))} /></div>
      <div>
        <label className="label">Core Values</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(form.values || []).map((v, i) => (
            <div key={i} className="flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
              {v}
              <button onClick={() => setForm(f => ({ ...f, values: f.values.filter((_, j) => j !== i) }))} className="ml-1 text-primary-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input flex-1" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Add a value..." onKeyDown={e => { if (e.key === 'Enter' && newValue.trim()) { setForm(f => ({ ...f, values: [...f.values, newValue.trim()] })); setNewValue(''); }}} />
          <button onClick={() => { if (newValue.trim()) { setForm(f => ({ ...f, values: [...f.values, newValue.trim()] })); setNewValue(''); }}} className="btn-ghost border border-gray-200"><Plus className="w-4 h-4" /></button>
        </div>
      </div>
      <SaveBtn onClick={() => onSave(form)} loading={loading} />
    </div>
  );
}

function StatsEditor({ data, onSave, loading }) {
  const [form, setForm] = useState({ patientsHelped: data.patientsHelped || 0, yearsActive: data.yearsActive || 0, staffCount: data.staffCount || 0, successRate: data.successRate || 0 });
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-800 text-lg">Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        {[['patientsHelped', 'Patients Helped'], ['yearsActive', 'Years Active'], ['staffCount', 'Staff Count'], ['successRate', 'Success Rate (%)']].map(([k, l]) => (
          <div key={k}><label className="label">{l}</label><input type="number" className="input" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: Number(e.target.value) }))} /></div>
        ))}
      </div>
      <SaveBtn onClick={() => onSave(form)} loading={loading} />
    </div>
  );
}

function TestimonialsEditor({ data, onSave, loading }) {
  const [items, setItems] = useState(Array.isArray(data) ? data : []);
  const addItem = () => setItems(i => [...i, { id: Date.now(), name: '', text: '', role: '' }]);
  const update = (i, field, val) => setItems(prev => prev.map((item, j) => j === i ? { ...item, [field]: val } : item));
  const remove = (i) => setItems(prev => prev.filter((_, j) => j !== i));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-lg">Testimonials</h2>
        <button onClick={addItem} className="btn-ghost border border-gray-200 text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
      </div>
      {items.map((t, i) => (
        <div key={t.id || i} className="border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Testimonial {i + 1}</span>
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
          <div><label className="label">Name</label><input className="input" value={t.name} onChange={e => update(i, 'name', e.target.value)} /></div>
          <div><label className="label">Role</label><input className="input" value={t.role} placeholder="e.g. Recovered Patient" onChange={e => update(i, 'role', e.target.value)} /></div>
          <div><label className="label">Testimonial Text</label><textarea className="input" rows={2} value={t.text} onChange={e => update(i, 'text', e.target.value)} /></div>
        </div>
      ))}
      <SaveBtn onClick={() => onSave(items)} loading={loading} />
    </div>
  );
}

function AboutEditor({ data, onSave, loading }) {
  const [form, setForm] = useState({ history: data.history || '', content: data.content || '' });
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-800 text-lg">About Us</h2>
      <div><label className="label">Organization History</label><textarea className="input" rows={4} value={form.history} onChange={e => setForm(f => ({ ...f, history: e.target.value }))} /></div>
      <div><label className="label">Main Content</label><textarea className="input" rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
      <SaveBtn onClick={() => onSave(form)} loading={loading} />
    </div>
  );
}

function AchievementEditor({ data, onSave, loading }) {
  const [milestones, setMilestones] = useState(data.milestones || []);
  const [awards, setAwards] = useState(data.awards || []);
  const [newAward, setNewAward] = useState('');
  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-gray-800 text-lg">Achievements & Milestones</h2>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Milestones</label>
          <button onClick={() => setMilestones(m => [...m, { year: new Date().getFullYear(), text: '' }])} className="text-xs text-primary-600 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {milestones.map((m, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="number" className="input w-24 flex-shrink-0" value={m.year} onChange={e => setMilestones(ms => ms.map((x, j) => j === i ? { ...x, year: Number(e.target.value) } : x))} />
            <input className="input flex-1" value={m.text} onChange={e => setMilestones(ms => ms.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
            <button onClick={() => setMilestones(ms => ms.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <div>
        <label className="label">Awards</label>
        {awards.map((a, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className="input flex-1" value={a} onChange={e => setAwards(aw => aw.map((x, j) => j === i ? e.target.value : x))} />
            <button onClick={() => setAwards(aw => aw.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <div className="flex gap-2">
          <input className="input flex-1" value={newAward} onChange={e => setNewAward(e.target.value)} placeholder="Add award..." />
          <button onClick={() => { if (newAward.trim()) { setAwards(a => [...a, newAward.trim()]); setNewAward(''); }}} className="btn-ghost border border-gray-200"><Plus className="w-4 h-4" /></button>
        </div>
      </div>
      <SaveBtn onClick={() => onSave({ milestones, awards })} loading={loading} />
    </div>
  );
}

function ContactInfoEditor({ data, onSave, loading }) {
  const [form, setForm] = useState({ address: data.address || '', phone: data.phone || '', email: data.email || '', mapUrl: data.mapUrl || '', workingHours: data.workingHours || '' });
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-800 text-lg">Contact Information</h2>
      <div><label className="label">Address</label><textarea className="input" rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
        <div><label className="label">Email</label><input className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
      </div>
      <div><label className="label">Google Map Embed URL</label><input className="input" value={form.mapUrl} onChange={e => setForm(f => ({ ...f, mapUrl: e.target.value }))} placeholder="https://maps.google.com/maps?..." /></div>
      <div><label className="label">Working Hours</label><input className="input" value={form.workingHours} onChange={e => setForm(f => ({ ...f, workingHours: e.target.value }))} /></div>
      <SaveBtn onClick={() => onSave(form)} loading={loading} />
    </div>
  );
}
