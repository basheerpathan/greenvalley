import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, CheckCircle, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export default function ContactSubmissions() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');
  const [viewMessage, setViewMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [replyNote, setReplyNote] = useState('');

  const { data: contactData, isLoading } = useQuery({
    queryKey: ['contacts', filter],
    queryFn: () => api.get(`/contact${filter !== '' ? `?isRead=${filter}` : ''}&limit=100`).then(r => r.data)
  });

  const markReadMutation = useMutation({
    mutationFn: ({ id, replyNote }) => api.put(`/contact/${id}`, { replyNote }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); toast.success('Marked as read'); setViewMessage(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: id => api.delete(`/contact/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); toast.success('Message deleted'); }
  });

  const contacts = contactData?.contacts || [];
  const unread = contactData?.unread || 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Contact Submissions
            {unread > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Messages from the public website contact form</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[['', 'All'], ['false', 'Unread'], ['true', 'Read']].map(([val, label]) => (
          <button key={label} onClick={() => setFilter(val)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === val ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{label}</button>
        ))}
      </div>

      <div className="space-y-3">
        {contacts.map(contact => (
          <div key={contact._id} className={`card cursor-pointer hover:shadow-md transition-all ${!contact.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''}`} onClick={() => { setViewMessage(contact); setReplyNote(contact.replyNote || ''); }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!contact.isRead ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <Mail className={`w-5 h-5 ${!contact.isRead ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${!contact.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{contact.name}</h3>
                    {!contact.isRead && <Badge color="blue">New</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">{contact.email} {contact.phone && `• ${contact.phone}`}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{contact.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400 hidden sm:block">{format(new Date(contact.createdAt), 'dd MMM yyyy')}</span>
                {isAdmin && (
                  <button onClick={e => { e.stopPropagation(); setDeleteTarget(contact); }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!contacts.length && !isLoading && (
          <div className="text-center py-12 text-gray-400">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No messages found</p>
          </div>
        )}
      </div>

      {viewMessage && (
        <Modal isOpen={!!viewMessage} onClose={() => setViewMessage(null)} title="Contact Message" size="md">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-gray-400 text-xs uppercase tracking-wide mb-1">From</div><div className="font-semibold">{viewMessage.name}</div></div>
              <div><div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Date</div><div>{format(new Date(viewMessage.createdAt), 'dd MMM yyyy, h:mm a')}</div></div>
              <div><div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Email</div><div className="break-all">{viewMessage.email}</div></div>
              {viewMessage.phone && <div><div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Phone</div><div>{viewMessage.phone}</div></div>}
            </div>
            <div>
              <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Message</div>
              <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm leading-relaxed">{viewMessage.message}</div>
            </div>
            <div>
              <label className="label">Reply Note (internal)</label>
              <textarea className="input" rows={2} value={replyNote} onChange={e => setReplyNote(e.target.value)} placeholder="Add internal note..." />
            </div>
            {!viewMessage.isRead && (
              <button onClick={() => markReadMutation.mutate({ id: viewMessage._id, replyNote })} className="btn-primary flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Mark as Read
              </button>
            )}
          </div>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget._id)} title="Delete Message" message={`Delete message from ${deleteTarget?.name}?`} />
    </div>
  );
}
