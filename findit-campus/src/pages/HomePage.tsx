import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Plus, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { getItems } from '../store';
import type { Item, User } from '../types';
import ItemCard from '../components/ItemCard';

interface HomePageProps {
  user: User;
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Report an Item',
    desc: 'Lost something or found an item? Submit a report in under two minutes — name, location, date, and an optional photo.',
  },
  {
    step: '02',
    title: 'Browse Listings',
    desc: 'Search or filter through all active reports by category, location, and type. Find what you\'re looking for fast.',
  },
  {
    step: '03',
    title: 'Submit a Claim',
    desc: 'Found your item? Submit a claim describing why it\'s yours. An admin reviews and confirms the return.',
  },
];

export default function HomePage({ user }: HomePageProps) {
  const [query, setQuery] = useState('');
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getItems().then((items) => {
      setAllItems(items);
      setRecentItems(items.filter((i) => i.status === 'active').slice(0, 6));
    });
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/search');
    }
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section className="border-b border-[#DDDDD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Greeting strip */}
          <div className="py-4 border-b border-[#DDDDD8]">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6C6A]">
              {greeting}, @{user.username}
            </p>
          </div>

          {/* Hero grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[480px]">
            {/* Left: headline + actions */}
            <div className="lg:col-span-7 py-12 lg:py-16 lg:pr-12 flex flex-col justify-between">
              <div>
                <h1 className="font-display font-bold text-[#171817] text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight mb-6">
                  Lost something?{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10">Let's find it.</span>
                    <span
                      className="absolute bottom-1 left-0 right-0 h-4 bg-[#C5F36B] -z-0 -skew-x-1"
                      aria-hidden
                    />
                  </span>
                </h1>
                <p className="text-[#6B6C6A] text-lg leading-relaxed max-w-lg mb-8">
                  FindIt Campus centralises all lost & found reports on campus.
                  Search listings, report items, and get belongings back — no sign-up required.
                </p>
              </div>

              {/* Search bar */}
              <div>
                <form onSubmit={handleSearch} className="flex items-stretch mb-6" role="search">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6C6A] pointer-events-none"
                    />
                    <input
                      ref={inputRef}
                      id="hero-search"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by item name, category…"
                      className="w-full pl-10 pr-4 py-3.5 text-sm bg-white border border-[#DDDDD8] focus:border-[#171817] outline-none text-[#171817] placeholder:text-[#6B6C6A] transition-colors"
                      aria-label="Search items"
                    />
                  </div>
                  <button
                    type="submit"
                    id="hero-search-btn"
                    className="px-6 bg-[#171817] text-[#F5F5F0] text-sm font-medium hover:bg-[#C5F36B] hover:text-[#171817] transition-colors duration-150 whitespace-nowrap"
                  >
                    Search
                  </button>
                </form>

                {/* Quick actions */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/search"
                    id="browse-items-cta"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#171817] text-sm font-medium text-[#171817] hover:bg-[#171817] hover:text-[#F5F5F0] transition-colors"
                  >
                    <ClipboardList size={15} />
                    Browse Items
                  </Link>
                  <Link
                    to="/report"
                    id="report-item-cta"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#171817] text-sm font-medium text-[#F5F5F0] hover:bg-[#C5F36B] hover:text-[#171817] transition-colors"
                  >
                    <Plus size={15} />
                    Report an Item
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: photo mosaic */}
            <div className="lg:col-span-5 hidden lg:grid grid-cols-2 gap-px bg-[#DDDDD8] border-l border-[#DDDDD8] overflow-hidden">
              {recentItems.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  to={`/item/${item.id}`}
                  className="relative bg-[#EEEEEA] overflow-hidden group"
                >
                  {item.imagePath ? (
                    <img
                      src={item.imagePath}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#EEEEEA]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-white text-xs font-medium line-clamp-1">{item.name}</span>
                    </div>
                  </div>
                  {/* type label */}
                  <span
                    className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 ${
                      item.type === 'lost'
                        ? 'bg-[#171817] text-white'
                        : 'bg-[#C5F36B] text-[#171817]'
                    }`}
                  >
                    {item.type}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats strip ───────────────────────────────────────────────── */}
      <section className="border-b border-[#DDDDD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-[#DDDDD8]">
            {[
              { label: 'Active Listings', value: allItems.filter((i) => i.status === 'active').length },
              { label: 'Items Found', value: allItems.filter((i) => i.type === 'found').length },
              { label: 'Items Returned', value: allItems.filter((i) => i.status === 'returned').length },
            ].map((stat) => (
              <div key={stat.label} className="py-6 text-center">
                <p className="font-display font-bold text-3xl text-[#171817]">{stat.value}</p>
                <p className="text-xs text-[#6B6C6A] mt-1 uppercase tracking-widest font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Recent Listings ───────────────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-[#DDDDD8]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1">Recent Activity</p>
              <h2 className="font-display font-bold text-2xl text-[#171817]">Latest Listings</h2>
            </div>
            <Link
              to="/search"
              className="flex items-center gap-1.5 text-sm font-medium text-[#171817] hover:text-[#6B6C6A] transition-colors group"
            >
              View all
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Grid */}
          {recentItems.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[#6B6C6A] text-sm">No items reported yet.</p>
              <Link to="/report" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#171817] underline underline-offset-2">
                Be the first to report one
              </Link>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#DDDDD8] border border-[#DDDDD8]"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07 } },
              }}
            >
              {recentItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                  }}
                >
                  <ItemCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────── */}
      <section className="border-t border-[#DDDDD8] py-14 bg-[#171817]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-2">Simple Process</p>
            <h2 className="font-display font-bold text-2xl text-[#F5F5F0]">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#2a2b2a]">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="py-8 md:py-0 md:px-8 first:md:pl-0 last:md:pr-0">
                <p className="font-display font-bold text-5xl text-[#C5F36B] mb-4 leading-none">{step.step}</p>
                <h3 className="font-display font-semibold text-[#F5F5F0] text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-[#6B6C6A] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 pt-8 border-t border-[#2a2b2a] flex flex-col sm:flex-row gap-4">
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C5F36B] text-[#171817] text-sm font-semibold hover:bg-[#d4f77f] transition-colors"
            >
              <Plus size={15} />
              Report an Item Now
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#2a2b2a] text-[#F5F5F0] text-sm font-medium hover:border-[#6B6C6A] transition-colors"
            >
              Browse All Listings
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
