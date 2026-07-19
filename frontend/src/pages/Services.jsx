import React from 'react';
import { BookOpen, MapPin, Laptop, HelpCircle, Network, Group } from 'lucide-react';
import SEO from '../components/SEO';

const Services = () => {
  const serviceList = [
    {
      title: 'Circulation & Borrowing',
      desc: 'Students can borrow up to 5 books at a time for a maximum duration of 10 days. Renewal is allowed if there is no active reservation queue.',
      icon: BookOpen,
    },
    {
      title: 'Reading Hall & Desks',
      desc: 'Our library offers 180+ quiet desks equipped with power sockets, reading lamps, and high-speed campus Wi-Fi access for self-study.',
      icon: MapPin,
    },
    {
      title: 'E-Library & Journals',
      desc: 'Access thousands of premium research journals, IEEE databases, and e-books directly on terminal workstations in the digital lab.',
      icon: Laptop,
    },
    {
      title: 'Reference Guidance Desk',
      desc: 'Get expert guidance from library staff for locating catalog items, finding research materials, or formatting bibliographies.',
      icon: HelpCircle,
    },
    {
      title: 'Inter-Library Lending',
      desc: 'If a book is unavailable in our local archive, we can request copies from allied partner college libraries across the state.',
      icon: Network,
    },
    {
      title: 'Study & Discussion Rooms',
      desc: 'Reserve collaborative group study rooms for team projects, presentations, and group study. Prior booking on dashboard is required.',
      icon: Group,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-300">
      <SEO title="Our Services" description="Discover LibVerse catalog search facilities, room reservations, digital archives, and allied resource inter-library loans." />
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-805 dark:text-slate-50 tracking-tight">
          Library Services
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Leverage a list of tools, spaces, and digital catalogs engineered to help you succeed in your curriculum.
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {serviceList.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <div key={idx} className="glass-card p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-xl inline-block">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{srv.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{srv.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Services;
