import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';
import SEO from '../components/SEO';

const Contact = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Validations
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.message) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    // Simulate submission delay
    setTimeout(() => {
      setLoading(false);
      showToast('Thank you for contacting us! We will respond shortly.', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-300">
      <SEO title="Contact Us" description="Reach out to the LibVerse administrators for general inquiries, fine clearances, account registrations, or support." />
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-805 dark:text-slate-50 tracking-tight">
          Contact Library
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Have query about borrowing rules, e-journal setups, or membership? Reach out to us.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info (4 Columns) */}
        <div className="md:col-span-5 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-50">
              Get in Touch
            </h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider">Address</p>
                  <p className="text-slate-700 dark:text-slate-350 mt-1 leading-relaxed">
                    College Campus, Block C,<br />
                    Outer Ring Road, New Delhi, India
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider">Phone</p>
                  <p className="text-slate-700 dark:text-slate-350 mt-1 leading-relaxed">
                    +91 11 2345 6789 <br />
                    +91 98765 43210
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider">Email</p>
                  <p className="text-slate-700 dark:text-slate-350 mt-1 leading-relaxed">
                    library@college.edu <br />
                    circulation@college.edu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 Columns) */}
        <div className="md:col-span-7 glass-card p-6 md:p-8">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-50 flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" /> Send a Message
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Rahul Sharma"
                error={errors.name}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="rahul@college.edu"
                error={errors.email}
                required
              />
            </div>

            <Input
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="e.g. Inquiry regarding group discussion rooms"
              error={errors.subject}
              required
            />

            <Input
              label="Your Message"
              name="message"
              type="textarea"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Write your query or feedback in detail here..."
              error={errors.message}
              required
            />

            <Button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 mt-2"
              loading={loading}
              icon={Send}
            >
              Send Message
            </Button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Contact;
