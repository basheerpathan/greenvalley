import { useQuery } from '@tanstack/react-query';
import { Award, Calendar, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export default function About() {
  const { data: content } = useQuery({
    queryKey: ['content', 'all'],
    queryFn: () => api.get('/content').then(r => r.data)
  });

  const about = content?.about || {};
  const achievement = content?.achievement || {};

  return (
    <div>
      <section className="py-20 bg-gradient-to-br from-primary-700 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">Our story, values, and commitment to your recovery</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our History</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {about.history || 'Founded in 2009, Green Valley Foundation has been at the forefront of addiction treatment in the region.'}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {about.content || 'We believe in a holistic approach to recovery that addresses the physical, psychological, and social aspects of addiction.'}
              </p>
            </div>
            <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100">
              <div className="grid grid-cols-2 gap-6">
                {[['1200+', 'Patients Helped'], ['15+', 'Years Active'], ['45+', 'Staff Members'], ['87%', 'Success Rate']].map(([v, l], i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-bold text-primary-700">{v}</div>
                    <div className="text-sm text-gray-500 mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title">Milestones</h2>
          <p className="section-subtitle">Our journey of impact</p>
          <div className="mt-12 relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 transform -translate-x-1/2" />
            <div className="space-y-8">
              {(achievement.milestones || []).map((m, i) => (
                <div key={i} className={`relative flex items-center gap-4 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="flex-1 md:text-right">
                    <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 inline-block ${i % 2 === 0 ? '' : 'md:text-left'}`}>
                      <div className="text-2xl font-bold text-primary-600">{m.year}</div>
                      <div className="text-gray-700 mt-1">{m.text}</div>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary-600 rounded-full border-2 border-white shadow transform -translate-x-1/2 flex-shrink-0" />
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {(achievement.awards || []).length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title">Awards & Recognition</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {(achievement.awards || []).map((award, i) => (
                <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="font-medium text-gray-800">{award}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
