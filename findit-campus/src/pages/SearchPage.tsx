import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { getItems } from '../store';
import type { Item, ItemType, ItemCategory, User } from '../types';
import { CATEGORIES, LOCATIONS } from '../types';
import ItemCard from '../components/ItemCard';

interface SearchPageProps {
  user: User;
}

export default function SearchPage({ user: _user }: SearchPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getItems().then(setAllItems);
  }, []);

  // Filter state
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [typeFilter, setTypeFilter] = useState<ItemType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | ''>('');
  const [locationFilter, setLocationFilter] = useState('');

  const filtered = allItems.filter((item) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    const matchesType = !typeFilter || item.type === typeFilter;
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesLocation = !locationFilter || item.location === locationFilter;
    return matchesQuery && matchesType && matchesCategory && matchesLocation;
  });

  const hasFilters = query || typeFilter || categoryFilter || locationFilter;

  function clearFilters() {
    setQuery('');
    setTypeFilter('');
    setCategoryFilter('');
    setLocationFilter('');
    setSearchParams({});
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[#DDDDD8]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1">Search</p>
        <h1 className="font-display font-bold text-3xl text-[#171817]">Browse Items</h1>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6C6A] pointer-events-none" />
            <input
              id="search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, keyword…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#DDDDD8] focus:border-[#171817] outline-none text-[#171817] placeholder:text-[#6B6C6A] transition-colors"
            />
          </div>
          <button
            id="toggle-filters-btn"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 border text-sm font-medium transition-colors ${
              showFilters ? 'border-[#171817] bg-[#171817] text-[#F5F5F0]' : 'border-[#DDDDD8] text-[#6B6C6A] hover:border-[#171817] hover:text-[#171817]'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
          {hasFilters && (
            <button
              id="clear-filters-btn"
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-[#6B6C6A] hover:text-[#171817] transition-colors"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#EEEEEA] border border-[#DDDDD8]">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1.5">Type</label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ItemType | '')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#DDDDD8] text-[#171817] focus:border-[#171817] outline-none"
              >
                <option value="">All Types</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1.5">Category</label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | '')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#DDDDD8] text-[#171817] focus:border-[#171817] outline-none"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1.5">Location</label>
              <select
                id="location-filter"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#DDDDD8] text-[#171817] focus:border-[#171817] outline-none"
              >
                <option value="">All Locations</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-[#6B6C6A] mb-6">
        {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
      </p>

      {/* Results grid */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-[#6B6C6A] text-sm mb-4">No items match your search.</p>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm font-medium text-[#171817] underline underline-offset-2">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#DDDDD8] border border-[#DDDDD8]">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
