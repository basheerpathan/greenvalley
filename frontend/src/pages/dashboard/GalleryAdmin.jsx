import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { Image, Upload, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Events', 'Facilities', 'Staff', 'Activities', 'General'];

export default function GalleryAdmin() {
  const { isAdmin, isStaff } = useAuth();
  const qc = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [uploadCategory, setUploadCategory] = useState('General');
  const [caption, setCaption] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['gallery-admin', selectedCategory],
    queryFn: () => api.get(`/gallery${selectedCategory !== 'All' ? `?category=${selectedCategory}` : ''}`).then(r => r.data)
  });

  const deleteMutation = useMutation({
    mutationFn: id => api.delete(`/gallery/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gallery-admin'] }); toast.success('Photo deleted'); }
  });

  const onDrop = useCallback((acceptedFiles) => {
    setPendingFiles(prev => [...prev, ...acceptedFiles.map(f => ({ file: f, preview: URL.createObjectURL(f) }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 20
  });

  const handleUpload = async () => {
    if (!pendingFiles.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      pendingFiles.forEach(({ file }) => fd.append('photos', file));
      fd.append('category', uploadCategory);
      fd.append('caption', caption);
      await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      qc.invalidateQueries({ queryKey: ['gallery-admin'] });
      toast.success(`${pendingFiles.length} photo(s) uploaded`);
      setPendingFiles([]);
      setCaption('');
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Photo Gallery</h1>
        <p className="text-gray-500 text-sm mt-1">Manage photos that appear on the public gallery page</p>
      </div>

      {isStaff && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Upload Photos</h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}
          >
            <input {...getInputProps()} />
            <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragActive ? 'text-primary-500' : 'text-gray-400'}`} />
            <p className="font-medium text-gray-700">{isDragActive ? 'Drop photos here...' : 'Drag & drop photos, or click to browse'}</p>
            <p className="text-sm text-gray-400 mt-1">JPG, PNG, WebP up to 10MB each (max 20)</p>
          </div>

          {pendingFiles.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {pendingFiles.map(({ preview, file }, i) => (
                  <div key={i} className="relative group">
                    <img src={preview} alt="" className="w-20 h-20 object-cover rounded-lg" />
                    <button
                      onClick={() => setPendingFiles(pf => pf.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white hidden group-hover:flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-0.5 truncate w-20">{file.name.slice(0, 12)}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <select className="input sm:w-48" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input className="input flex-1" placeholder="Caption (optional)" value={caption} onChange={e => setCaption(e.target.value)} />
                <button onClick={handleUpload} disabled={uploading} className="btn-primary flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : `Upload ${pendingFiles.length} Photo(s)`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" /></div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No photos in this category</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
          {photos.map(photo => (
            <div key={photo._id} className="break-inside-avoid relative group rounded-xl overflow-hidden">
              <img src={photo.url} alt={photo.caption} className="w-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                <div>
                  {photo.caption && <p className="text-white text-xs font-medium line-clamp-2">{photo.caption}</p>}
                  <span className="text-white/70 text-xs">{photo.category}</span>
                </div>
                {isAdmin && (
                  <button onClick={() => setDeleteTarget(photo)} className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget._id)} title="Delete Photo" message="Permanently delete this photo? This cannot be undone." />
    </div>
  );
}
