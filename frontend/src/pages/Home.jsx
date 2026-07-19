import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, ShieldCheck, Bookmark, GraduationCap, ArrowRight } from 'lucide-react';
import bookService from '../services/bookService';
import Button from '../components/Button';
import SEO from '../components/SEO';

const Home = () => {
  const { user } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [booksRes, catsRes] = await Promise.all([
          bookService.getBooks({ page_size: 3 }),
          bookService.getCategories(),
        ]);
        setFeaturedBooks(booksRes.data.results || []);
        setTotalBooks(booksRes.data.count || 0);
        setTotalCategories(catsRes.data?.length || 0);
      } catch (err) {
        console.error('Error fetching public landing stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingData();
  }, []);

  const stats = [
    { label: 'Books Available', value: loading ? '...' : `${totalBooks}+` },
    { label: 'Book Categories', value: loading ? '...' : `${totalCategories}+` },
    { label: 'Study Desks', value: '180+' },
    { label: 'Research Journals', value: '1,200+' },
  ];

  const features = [
    {
      title: 'Easy Borrowing',
      desc: 'Issue books instantly and check return dates directly from the student dashboard portal.',
      icon: BookOpen,
    },
    {
      title: 'Digital Search',
      desc: 'Quickly query and discover books using advanced search filters, categories, and ISBN indexes.',
      icon: Search,
    },
    {
      title: 'Member Security',
      desc: 'Secured student and admin login system powered by secure JSON Web Tokens (JWT) technology.',
      icon: ShieldCheck,
    },
  ];

  // Soft fallback gradients for book covers in the organic palette
  const coverGradients = [
    'from-primary-brown to-black',
    'from-emerald-700 to-emerald-950',
    'from-amber-700 to-amber-950',
  ];

  return (
    <div className="space-y-20 pb-20 py-12">
      <SEO title="Digital Book Portal" description="Explore LibVerse, the ultimate library management system. Access book catalogs, search classification registers, and check account statuses." />
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-olive-green/10 text-olive-green text-xs font-bold uppercase tracking-wider rounded-full">
            <GraduationCap className="w-3.5 h-3.5" /> Welcome to LibVerse
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-800 leading-tight">
            Unlock Knowledge. <br className="hidden sm:inline" />
            <span className="text-olive-green">Navigate Learning.</span>
          </h1>
          <p className="text-slate-550 text-base md:text-lg leading-relaxed max-w-xl">
            Welcome to your digital companion for exploration and academic excellence. Access extensive book databases, catalog classifications, digital archives, and real-time portal checkouts.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" icon={ArrowRight}>
                  Enter Portal Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg" icon={ArrowRight}>
                  Get Started
                </Button>
              </Link>
            )}
            <Link to="/about">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Image / Visual Box */}
        <div className="relative flex justify-center">
          {/* Decorative gradients */}
          <div className="absolute w-72 h-72 bg-olive-green/15 rounded-full filter blur-2xl top-10 left-10 -z-10" />
          <div className="absolute w-72 h-72 bg-light-beige/25 rounded-full filter blur-2xl bottom-10 right-10 -z-10" />
          
          <div className="w-full max-w-md bg-white border border-slate-200/80 p-8 rounded-3xl shadow-md relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Library Timings</span>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-105 pb-3">
                <span className="text-sm font-semibold">Monday - Friday</span>
                <span className="text-sm font-bold text-olive-green">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-slate-105 pb-3">
                <span className="text-sm font-semibold">Saturday</span>
                <span className="text-sm font-bold text-olive-green">10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-sm font-semibold">Sunday</span>
                <span className="text-sm font-bold text-rose-500">Closed</span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-primary-brown rounded-2xl text-white flex items-center gap-4">
              <BookOpen className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Catalog Status</p>
                <p className="text-sm font-semibold">{loading ? 'Counting...' : `${totalBooks}+ books live inside search`}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-slate-100/50 py-12 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center space-y-2">
              <span className="text-3xl md:text-4xl font-extrabold text-slate-800">
                {stat.value}
              </span>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850">
            Engineered for Modern Libraries
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Discover a list of rich operational tools designed to make book circulation, profile records tracking, and fine tracking effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="bg-white border border-slate-205 rounded-2xl p-6 flex flex-col items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="p-3 bg-olive-green/10 text-olive-green rounded-xl">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 text-base">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Book Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-12 pb-10">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850">
              Featured Books
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">Selected curriculum references and catalog entries</p>
          </div>
          <Link to="/login" className="text-xs font-semibold text-olive-green hover:text-primary-brown hover:underline flex items-center gap-1.5">
            Search Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-2xl p-6 h-56 flex items-center justify-center animate-pulse">
                <span className="text-slate-400 text-sm font-semibold">Loading book details...</span>
              </div>
            ))}
          </div>
        ) : featuredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {featuredBooks.map((b, idx) => {
              const gradient = coverGradients[idx % coverGradients.length];
              return (
                <div key={b.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
                  <div className="space-y-4">
                    {b.cover_image ? (
                      <div className="h-44 overflow-hidden border-b border-slate-100 relative">
                        <img src={b.cover_image} alt={b.title} className="w-full h-full object-cover" />
                        <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider bg-white/90 text-primary-brown px-2 py-0.5 rounded shadow-sm">
                          {b.category_name}
                        </span>
                      </div>
                    ) : (
                      <div className={`h-40 bg-gradient-to-br ${gradient} flex items-center justify-center p-4 text-center text-white relative`}>
                        <div className="space-y-1.5">
                          <BookOpen className="w-8 h-8 mx-auto opacity-70" />
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                            {b.category_name}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="px-5 pb-5 space-y-1">
                      <h3 className="font-bold text-sm text-slate-800 leading-snug truncate" title={b.title}>
                        {b.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        By: {b.author}
                      </p>
                      <p className="text-[10px] text-slate-450 tracking-wider uppercase font-semibold">
                        ISBN: {b.isbn}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
            <BookOpen className="w-10 h-10 text-slate-350 mb-3" />
            <p className="text-slate-500 font-medium">No books loaded in catalog yet.</p>
          </div>
        )}
      </section>

    </div>
  );
};

export default Home;
