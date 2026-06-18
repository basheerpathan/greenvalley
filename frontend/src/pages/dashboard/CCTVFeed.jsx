import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Plus, Settings, Trash2, X, Camera } from 'lucide-react';
import Hls from 'hls.js';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

function HLSPlayer({ url, label }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url || !videoRef.current) return;
    setError(false);

    if (Hls.isSupported() && (url.includes('.m3u8') || url.startsWith('http'))) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setError(true);
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url;
    } else {
      videoRef.current.src = url;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white text-xs font-medium">{label}</span>
        </div>
        <span className="text-green-400 text-xs">LIVE</span>
      </div>
      {error ? (
        <div className="aspect-video flex flex-col items-center justify-center text-gray-500">
          <Camera className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm">Stream unavailable</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full aspect-video object-cover"
          autoPlay
          muted
          playsInline
          controls
        />
      )}
    </div>
  );
}

const defaultForm = { name: '', location: '', streamUrl: '' };

export default function CCTVFeed() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editCamera, setEditCamera] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [gridSize, setGridSize] = useState(2);

  const { data: cameras = [] } = useQuery({
    queryKey: ['cameras'],
    queryFn: () => api.get('/cameras').then(r => r.data)
  });

  const createMutation = useMutation({
    mutationFn: d => api.post('/cameras', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cameras'] }); toast.success('Camera added'); closeForm(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }) => api.put(`/cameras/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cameras'] }); toast.success('Camera updated'); closeForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: id => api.delete(`/cameras/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cameras'] }); toast.success('Camera removed'); }
  });

  const closeForm = () => { setShowForm(false); setEditCamera(null); setForm(defaultForm); };

  const handleEdit = (cam) => {
    setEditCamera(cam);
    setForm({ name: cam.name, location: cam.location, streamUrl: cam.streamUrl });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editCamera) {
      updateMutation.mutate({ id: editCamera._id, d: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const gridCols = { 1: 'grid-cols-1', 2: 'grid-cols-1 md:grid-cols-2', 3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-2 lg:grid-cols-4' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            Live CCTV Feed
          </h1>
          <p className="text-gray-500 text-sm mt-1">{cameras.length} camera{cameras.length !== 1 ? 's' : ''} connected</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[1, 2, 3, 4].map(n => (
              <button key={n} onClick={() => setGridSize(n)} className={`w-8 h-7 rounded text-xs font-medium transition-colors ${gridSize === n ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
                {n}×
              </button>
            ))}
          </div>
          {isAdmin && (
            <button onClick={() => setShowSettings(true)} className="btn-ghost border border-gray-200 flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4" /> Manage
            </button>
          )}
        </div>
      </div>

      {cameras.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-16 text-center">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No cameras configured</h3>
          <p className="text-gray-600 mb-4">Add camera stream URLs to start live monitoring</p>
          {isAdmin && (
            <button onClick={() => setShowSettings(true)} className="bg-gray-700 text-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-colors">
              Configure Cameras
            </button>
          )}
        </div>
      ) : (
        <div className={`grid ${gridCols[gridSize] || gridCols[2]} gap-4`}>
          {cameras.map(cam => (
            <HLSPlayer key={cam._id} url={cam.streamUrl} label={`${cam.name} — ${cam.location}`} />
          ))}
        </div>
      )}

      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Camera Management" size="lg">
        <div className="space-y-3 mb-4">
          {cameras.map(cam => (
            <div key={cam._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{cam.name}</p>
                <p className="text-xs text-gray-400 truncate">{cam.location} — {cam.streamUrl}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(cam)} className="p-1.5 rounded hover:bg-white text-gray-400 hover:text-blue-600 transition-colors"><Settings className="w-4 h-4" /></button>
                <button onClick={() => setDeleteTarget(cam)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {!cameras.length && <p className="text-center text-gray-400 py-4">No cameras added yet</p>}
        </div>
        <button onClick={() => { setShowForm(true); setEditCamera(null); setForm(defaultForm); }} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Camera
        </button>
      </Modal>

      <Modal isOpen={showForm} onClose={closeForm} title={editCamera ? 'Edit Camera' : 'Add Camera'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Camera Name *</label><input className="input" placeholder="e.g. Main Gate" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><label className="label">Location *</label><input className="input" placeholder="e.g. Building Entrance" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required /></div>
          <div>
            <label className="label">Stream URL *</label>
            <input className="input" placeholder="https://... or rtsp://..." value={form.streamUrl} onChange={e => setForm(f => ({ ...f, streamUrl: e.target.value }))} required />
            <p className="text-xs text-gray-400 mt-1">Supports HLS (.m3u8), WebRTC, or direct video URLs. RTSP requires an HLS proxy (e.g., nginx-rtmp).</p>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>{createMutation.isPending || updateMutation.isPending ? 'Saving...' : editCamera ? 'Update' : 'Add Camera'}</button>
            <button type="button" onClick={closeForm} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget._id)} title="Remove Camera" message={`Remove "${deleteTarget?.name}" from the system?`} />
    </div>
  );
}
