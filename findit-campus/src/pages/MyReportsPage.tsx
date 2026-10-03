import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Package, Trash2 } from 'lucide-react';
import { getItems, getClaimsByUser, deleteItem } from '../store';
import type { User, Item, Claim } from '../types';

interface MyReportsPageProps {
  user: User;
}

type Tab = 'lost' | 'found' | 'claims';

export default function MyReportsPage({ user }: MyReportsPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('lost');
  
  const [myLost, setMyLost] = useState<Item[]>([]);
  const [myFound, setMyFound] = useState<Item[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [itemsMap, setItemsMap] = useState<Record<string, Item>>({});

  useEffect(() => {
    Promise.all([getItems(), getClaimsByUser(user.id)]).then(([items, claims]) => {
      setMyLost(items.filter((i) => i.reportedBy === user.id && i.type === 'lost'));
      setMyFound(items.filter((i) => i.reportedBy === user.id && i.type === 'found'));
      setMyClaims(claims);
      
      const map: Record<string, Item> = {};
      items.forEach(i => map[i.id] = i);
      setItemsMap(map);
    });
  }, [user.id]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'lost', label: 'My Lost Items', count: myLost.length },
    { key: 'found', label: 'My Found Reports', count: myFound.length },
    { key: 'claims', label: 'My Claims', count: myClaims.length },
  ];

  const claimStatusStyle: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-[#C5F36B] text-[#171817]',
    rejected: 'bg-[#EEEEEA] text-[#6B6C6A]',
  };

  function ItemRow({ item }: { item: Item }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
      if (!window.confirm('Are you sure you want to delete this report?')) {
        return;
      }
      
      setIsDeleting(true);
      setError(null);
      
      try {
        const success = await deleteItem(item.id, item.imagePath);
        if (success) {
          if (item.type === 'lost') {
            setMyLost(prev => prev.filter(i => i.id !== item.id));
          } else {
            setMyFound(prev => prev.filter(i => i.id !== item.id));
          }
        } else {
          setError('Failed to delete report. Please try again.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <div className="relative border-b border-[#DDDDD8] -mx-4 px-4 hover:bg-[#EEEEEA] transition-colors group flex items-start gap-4 py-4">
        <Link to={`/item/${item.id}`} className="shrink-0">
          <div className="w-14 h-14 bg-[#EEEEEA] overflow-hidden">
            {item.imagePath ? (
              <img src={item.imagePath} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#6B6C6A]">
                <Package size={18} strokeWidth={1.5} />
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/item/${item.id}`} className="block">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-0.5">{item.category}</p>
            <p className="font-display font-semibold text-[#171817] text-sm group-hover:underline truncate">{item.name}</p>
            <div className="flex gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-[#6B6C6A]"><MapPin size={10} />{item.location}</span>
              <span className="flex items-center gap-1 text-xs text-[#6B6C6A]"><Calendar size={10} />{item.date}</span>
            </div>
          </Link>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
        
        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${
            item.status === 'active' ? 'bg-[#C5F36B] text-[#171817]' : item.status === 'returned' ? 'bg-[#171817] text-[#F5F5F0]' : 'bg-[#EEEEEA] text-[#6B6C6A]'
          }`}>
            {item.status}
          </span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-1.5 text-[#6B6C6A] hover:text-red-600 hover:bg-red-50 transition-colors rounded ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Delete report"
            aria-label="Delete report"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  function ClaimRow({ claim }: { claim: Claim }) {
    const item = itemsMap[claim.itemId];
    return (
      <div className="py-4 border-b border-[#DDDDD8]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display font-semibold text-sm text-[#171817] truncate">
              {item ? (
                <Link to={`/item/${item.id}`} className="hover:underline">{item.name}</Link>
              ) : 'Item no longer available'}
            </p>
            <p className="text-xs text-[#6B6C6A] mt-0.5 line-clamp-1">"{claim.description}"</p>
            <p className="text-xs text-[#6B6C6A] mt-1">{new Date(claim.createdAt).toLocaleDateString()}</p>
          </div>
          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${claimStatusStyle[claim.status]}`}>
            {claim.status}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[#DDDDD8]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1">@{user.username}</p>
        <h1 className="font-display font-bold text-3xl text-[#171817]">My Reports</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#DDDDD8] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-[#171817] text-[#171817]'
                : 'border-transparent text-[#6B6C6A] hover:text-[#171817]'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 text-xs bg-[#EEEEEA] text-[#6B6C6A] px-1.5 py-0.5">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'lost' && (
        <div>
          {myLost.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[#6B6C6A] mb-4">You haven't reported any lost items yet.</p>
              <Link to="/report" className="text-sm font-medium text-[#171817] underline underline-offset-2">Report a lost item</Link>
            </div>
          ) : (
            myLost.map((item) => <ItemRow key={item.id} item={item} />)
          )}
        </div>
      )}

      {activeTab === 'found' && (
        <div>
          {myFound.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[#6B6C6A] mb-4">You haven't reported any found items yet.</p>
              <Link to="/report" className="text-sm font-medium text-[#171817] underline underline-offset-2">Report a found item</Link>
            </div>
          ) : (
            myFound.map((item) => <ItemRow key={item.id} item={item} />)
          )}
        </div>
      )}

      {activeTab === 'claims' && (
        <div>
          {myClaims.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[#6B6C6A] mb-4">You haven't submitted any claims yet.</p>
              <Link to="/search" className="text-sm font-medium text-[#171817] underline underline-offset-2">Browse found items</Link>
            </div>
          ) : (
            myClaims.map((claim) => <ClaimRow key={claim.id} claim={claim} />)
          )}
        </div>
      )}
    </div>
  );
}
