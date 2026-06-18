import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Phone, Heart, Users, Award, Star, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export default function Home() {
  const { data: content } = useQuery({
    queryKey: ['content', 'all'],
    queryFn: () => api.get('/content').then(r => r.data)
  });

  const hero = content?.hero || {};
  const mission = content?.mission || {};
  const stats = content?.stats || {};
  const testimonials = content?.testimonials || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-emerald-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white rounded-full" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Heart className="w-4 h-4 text-red-300" />
              <span className="text-sm font-medium">Compassionate Care for Recovery</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              {hero.title || 'Welcome to Green Valley Foundation'}
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
              {hero.tagline || 'Helping individuals overcome addiction and reclaim their lives with compassion, dignity, and expert care.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg">
                <Phone className="w-5 h-5" />
                {hero.ctaPrimary || 'Get Help Now'}
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 py-3.5 rounded-xl font-bold hover:bg-white/20 transition-colors">
                {hero.ctaSecondary || 'Learn More'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: `${stats.patientsHelped || 1200}+`, label: 'Patients Helped', icon: Users, color: 'bg-primary-50 text-primary-600' },
              { value: `${stats.yearsActive || 15}+`, label: 'Years Active', icon: Award, color: 'bg-blue-50 text-blue-600' },
              { value: `${stats.staffCount || 45}+`, label: 'Expert Staff', icon: Heart, color: 'bg-red-50 text-red-600' },
              { value: `${stats.successRate || 87}%`, label: 'Success Rate', icon: Star, color: 'bg-yellow-50 text-yellow-600' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Mission & Vision</h2>
            <p className="section-subtitle">Guided by compassion, driven by purpose</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">{mission.mission || 'To provide compassionate, evidence-based treatment for substance use disorders.'}</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">{mission.vision || 'A society free from the devastating effects of addiction.'}</p>
            </div>
          </div>
          {(mission.values || []).length > 0 && (
            <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Core Values</h3>
              <div className="flex flex-wrap gap-3">
                {(mission.values || []).map((val, i) => (
                  <div key={i} className="flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium text-sm">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title">Success Stories</h2>
            <p className="section-subtitle">Real people, real recoveries</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-primary-600">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Recovery Journey?</h2>
          <p className="text-xl text-white/80 mb-8">Our compassionate team is available 24/7 to help you take the first step.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-white text-primary-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg">
              Contact Us Today
            </Link>
            <a href="tel:+919876543210" className="flex items-center justify-center gap-2 border-2 border-white/50 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
              <Phone className="w-5 h-5" />
              +91 98765 43210
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
