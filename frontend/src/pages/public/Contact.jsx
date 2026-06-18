import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const { data: content } = useQuery({
    queryKey: ['content', 'all'],
    queryFn: () => api.get('/content').then(r => r.data)
  });

  const info = content?.['contact-info'] || {};

  const mutation = useMutation({
    mutationFn: data => api.post('/contact', data),
    onSuccess: () => {
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', message: '' });
      toast.success('Message sent successfully!');
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed to send message')
  });

  const handleSubmit = e => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div>
      <section className="py-16 bg-gradient-to-br from-primary-700 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-white/80">We're here to help. Reach out anytime.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h2>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: 'Address', value: info.address || '123 Green Valley Road, Hyderabad, Telangana 500001', color: 'text-primary-600 bg-primary-50' },
                  { icon: Phone, label: 'Phone', value: info.phone || '+91 98765 43210', color: 'text-blue-600 bg-blue-50' },
                  { icon: Mail, label: 'Email', value: info.email || 'info@greenvalleyfoundation.org', color: 'text-purple-600 bg-purple-50' },
                  { icon: Clock, label: 'Working Hours', value: info.workingHours || 'Mon - Sun: 24/7', color: 'text-orange-600 bg-orange-50' }
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
                      <div className="text-gray-700 mt-0.5">{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-gray-100 rounded-2xl overflow-hidden h-56">
                {info.mapUrl ? (
                  <iframe src={info.mapUrl} className="w-full h-full border-0" title="Location Map" allowFullScreen loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Map will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-500 mb-4">We'll get back to you within 24 hours.</p>
                    <button onClick={() => setSubmitted(false)} className="btn-primary">Send Another</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Full Name *</label>
                        <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Your name" />
                      </div>
                      <div>
                        <label className="label">Email *</label>
                        <input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="your@email.com" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input type="tel" className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="label">Message *</label>
                      <textarea className="input min-h-[120px] resize-y" rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required placeholder="How can we help you?" />
                    </div>
                    <button type="submit" disabled={mutation.isPending} className="btn-primary w-full flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      {mutation.isPending ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
