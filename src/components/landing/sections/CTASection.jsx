import React, { useState } from 'react';
import { useModal } from '../../../contexts/ModalContext';
import { toast } from 'react-hot-toast';

export default function CTASection() {
  const { openAuthModal } = useModal();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    enquiry: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_key: '7f0ee5aa-676e-4165-b176-4804d5195a7a',
          from_name: formData.name,
          from_email: formData.email,
          subject: 'New Enquiry from Botnoi Website',
          message: formData.enquiry,
          to: 'admin@botnoigroup.com',
          replyTo: formData.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', enquiry: '' });
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-32 bg-[#0D1117] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#01BFFB]/5 to-purple-500/5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* CTA Content */}
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Ready to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#01BFFB] to-purple-500">
                Transform
              </span>
              {' '}Your Business?
            </h2>
            <p className="text-xl text-white/70">
              Get in touch with us to learn how our AI agents can help transform your business.
              We'll get back to you within 24 hours.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={openAuthModal}
                className="group relative px-8 py-4 bg-[#01BFFB] rounded-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#01BFFB] to-purple-500 opacity-0 
                              group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative text-lg font-medium text-white">
                  Get Started Now
                </span>
              </button>
              <button
                onClick={() => window.open('https://docs.botnoigroup.com', '_blank')}
                className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg 
                         text-lg font-medium text-white hover:bg-white/10 transition-all"
              >
                View Documentation
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-white mb-6">Contact Us</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-[#01BFFB] focus:border-transparent"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-[#01BFFB] focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="enquiry" className="block text-sm font-medium text-white/70 mb-2">
                  Enquiry
                </label>
                <textarea
                  id="enquiry"
                  value={formData.enquiry}
                  onChange={(e) => setFormData({ ...formData, enquiry: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-[#01BFFB] focus:border-transparent"
                  placeholder="Tell us about your needs..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-all ${
                  isSubmitting
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-[#01BFFB] hover:bg-[#01BFFB]/90'
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}