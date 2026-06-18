import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CATEGORIES = ['All', 'Event', 'Achievement', 'Milestone', 'Workshop', 'Awareness'];

export default function Events() {
  const [filter, setFilter] = useState('All');
  const [showUpcoming, setShowUpcoming] = useState('all');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events-public'],
    queryFn: () => api.get('/events').then(r => r.data)
  });

  const filtered = events.filter(e => {
    const categoryMatch = filter === 'All' || e.category === filter;
    const now = new Date();
    const timeMatch =
      showUpcoming === 'all' ||
      (showUpcoming === 'upcoming' && new Date(e.date) > now) ||
      (showUpcoming === 'past' && new Date(e.date) <= now);
    return categoryMatch && timeMatch;
  });

  return (
    <div>
      <section className="py-16 bg-gradient-to-br from-primary-700 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Events & Achievements</h1>
          <p className="text-xl text-white/80">Stay updated with our activities and milestones</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filter === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2 sm:ml-auto">
              {['all', 'upcoming', 'past'].map(t => (
                <button
                  key={t}
                  onClick={() => setShowUpcoming(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                    showUpcoming === t ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner className="py-20" />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No events found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(event => {
                const isUpcoming = new Date(event.date) > new Date();
                return (
                  <div key={event._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    {event.photos?.[0] && (
                      <div className="aspect-video overflow-hidden">
                        <img src={event.photos[0].url} alt={event.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isUpcoming ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {isUpcoming ? 'Upcoming' : 'Past'}
                        </span>
                        <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">{event.category}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{event.title}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(event.date), 'dd MMM yyyy')}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-3">{event.description}</p>
                      {event.photos?.length > 1 && (
                        <div className="flex gap-1 mt-3">
                          {event.photos.slice(1, 4).map((p, i) => (
                            <img key={i} src={p.url} alt="" className="w-12 h-12 object-cover rounded-lg" />
                          ))}
                          {event.photos.length > 4 && (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 font-medium">
                              +{event.photos.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
