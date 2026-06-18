import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Plus, Pencil, Trash2, Image, X } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Event', 'Achievement', 'Milestone', 'Workshop', 'Awareness'];

const defaultForm = { title: '', date: '', description: '', category: 'Event' };

export default function EventsAdmin() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events-admin'],
    queryFn: () => api.get('/events').then(r => r.data)
  });

  const createMutation = useMutation({
    mutationFn: formData => api.post('/events', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events-admin'] }); toast.success('Event created'); closeForm(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => api.put(`/events/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events-admin'] }); toast.success('Event updated'); closeForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: id => api.delete(`/events/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events-admin'] }); toast.success('Event deleted'); }
  });

  const deletePhotoMutation = useMutation({
    mutationFn: ({ eventId, publicId }) => api.delete(`/events/${eventId}/photos`, { data: { publicId } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events-admin'] }); toast.success('Photo removed'); }
  });

  const closeForm = () => { setShowForm(false); setEditEvent(null); setForm(defaultForm); setPhotoFiles([]); setPhotoPreviews([]); };

  const handleEdit = (event) => {
    setEditEvent(event);
    setForm({ title: event.title, date: event.date?.split('T')[0] || '', description: event.description, category: event.category });
    setShowForm(true);
  };

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    setPhotoFiles(files);
    setPhotoPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    photoFiles.forEach(f => fd.append('photos', f));
    if (editEvent) {
      updateMutation.mutate({ id: editEvent._id, formData: fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const catColor = { Event: 'blue', Achievement: 'yellow', Milestone: 'green', Workshop: 'purple', Awareness: 'orange' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events & Achievements</h1>
          <p className="text-gray-500 text-sm mt-1">Manage events that appear on the public website</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setShowForm(true); setEditEvent(null); setForm(defaultForm); }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Create Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map(event => {
          const isUpcoming = new Date(event.date) > new Date();
          return (
            <div key={event._id} className="card hover:shadow-md transition-shadow">
              {event.photos?.[0] && (
                <div className="-mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl h-44">
                  <img src={event.photos[0].url} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge color={catColor[event.category]}>{event.category}</Badge>
                <span className={`text-xs font-medium ${isUpcoming ? 'text-green-600' : 'text-gray-400'}`}>
                  {isUpcoming ? 'Upcoming' : 'Past'}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{event.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{format(new Date(event.date), 'dd MMMM yyyy')}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
              {event.photos?.length > 1 && (
                <div className="flex gap-1 mt-2">
                  {event.photos.slice(1, 4).map((p, i) => (
                    <div key={i} className="relative group">
                      <img src={p.url} alt="" className="w-10 h-10 object-cover rounded-lg" />
                      {isAdmin && (
                        <button
                          onClick={() => deletePhotoMutation.mutate({ eventId: event._id, publicId: p.publicId })}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white hidden group-hover:flex items-center justify-center"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {event.photos.length > 4 && <span className="text-xs text-gray-400 self-center ml-1">+{event.photos.length - 4}</span>}
                </div>
              )}
              {isAdmin && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <button onClick={() => handleEdit(event)} className="flex-1 btn-ghost border border-gray-200 text-xs py-1.5 flex items-center justify-center gap-1">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(event)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          );
        })}
        {!events.length && !isLoading && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No events yet. Create one!</p>
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={closeForm} title={editEvent ? 'Edit Event' : 'Create Event'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Event Title *</label><input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Date *</label><input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
            <div><label className="label">Category</label><select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div><label className="label">Description *</label><textarea className="input" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required /></div>
          <div>
            <label className="label">Photos {editEvent ? '(add more)' : ''}</label>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
              <Image className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload photos (max 10)</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
            </label>
            {photoPreviews.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {photoPreviews.map((url, i) => <img key={i} src={url} className="w-16 h-16 object-cover rounded-lg" />)}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>{createMutation.isPending || updateMutation.isPending ? 'Saving...' : editEvent ? 'Update Event' : 'Create Event'}</button>
            <button type="button" onClick={closeForm} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget._id)} title="Delete Event" message={`Delete "${deleteTarget?.title}"? This cannot be undone.`} />
    </div>
  );
}
