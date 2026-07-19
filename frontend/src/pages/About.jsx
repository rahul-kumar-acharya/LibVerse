import React from 'react';
import { History, Award, BookMarked, Users, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';

const About = () => {
  const sections = [
    {
      title: 'Our Mission',
      desc: 'To provide comprehensive access to quality info, promote learning, support student success, and support curriculum objectives with state-of-the-art archives and reference assistance.',
      icon: BookMarked,
    },
    {
      title: 'History & Milestones',
      desc: 'Established in 2012, our library began with 500 books and has grown to over 25,000+ volumes, including digital research indices, e-databases, and quiet study room cabins.',
      icon: History,
    },
    {
      title: 'Quality Excellence',
      desc: 'We are committed to intellectual freedom, equal access to knowledge resources, user privacy, and building collection diversity across technical streams.',
      icon: Award,
    },
  ];

  const rules = [
    'Silence must be observed strictly in the reading halls.',
    'A valid library card must be presented for issuing or returning books.',
    'Books are lent out for a maximum period of 10 days.',
    'Late returns are subject to a fine of ₹10 per day.',
    'Eating, drinking (except bottled water), or smoking inside library premises is prohibited.',
    'Users must not damage or write inside books; replacement fees apply for damaged inventory.',
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-300">
      <SEO title="About Us" description="Learn about the LibVerse mission, digital holdings system, library hours, and standard operation schedules." />
      
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-805 dark:text-slate-50 tracking-tight">
          About Our Library
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Serving as the intellectual heart of the college campus, providing academic references and circulation workflows.
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div key={idx} className="glass-card p-6 space-y-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-xl inline-block">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{sec.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{sec.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Timing and Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Core Rules */}
        <div className="glass-card p-8 space-y-6">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-50 flex items-center gap-2">
            Library Rules & Regulations
          </h3>
          <ul className="space-y-3 text-xs text-slate-550 dark:text-slate-400 font-medium">
            {rules.map((rule, idx) => (
              <li key={idx} className="flex gap-2.5 items-start">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-450 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Administration info */}
        <div className="glass-card p-8 space-y-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-50 flex items-center gap-2 mb-4">
              Librarian Directory & Staff
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed mb-6">
              Our professional staff is always ready to guide you to reference books, help resolve issues with portal log-ins, or manage checkouts.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight">Dr. Anand Verma</h4>
                  <p className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider mt-0.5">Chief Librarian</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight">Mrs. Kiran Saxena</h4>
                  <p className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider mt-0.5">Assistant Librarian</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default About;
