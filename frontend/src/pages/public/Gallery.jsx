import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image, X } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CATEGORIES = ['All', 'Events', 'Facilities', 'Staff', 'Activities', 'General'];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['gallery-public'],
    queryFn: () => api.get('/gallery').then(r => r.data)
  });

  const filtered = activeCategory === 'All' ? photos : photos.filter(p => p.category === activeCategory);

  return (
    <div>
      <section className="py-16 bg-gradient-to-br from-primary-700 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Photo Gallery</h1>
          <p className="text-xl text-white/80">A glimpse into our facilities and activities</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 flex-wrap mb-8 justify-center">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <LoadingSpinner className="py-20" />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No photos in this category yet</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
              {filtered.map(photo => (
                <div
                  key={photo._id}
                  className="break-inside-avoid cursor-pointer group rounded-xl overflow-hidden"
                  onClick={() => setLightbox(photo)}
                >
                  <div className="relative">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Gallery photo'}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-xl flex items-end p-3">
                      {photo.caption && (
                        <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightbox.url}
            alt={lightbox.caption}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
          {lightbox.caption && (
            <p className="absolute bottom-6 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              {lightbox.caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
