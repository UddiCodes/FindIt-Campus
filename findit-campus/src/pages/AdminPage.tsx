import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getItems, getClaims, approveClaim, rejectClaim, updateItemStatus } from '../store';
import type { Item, Claim } from '../types';

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<'claims' | 'items'>('claims');

  function fetchAll() {
    Promise.all([getItems(), getClaims()]).then(([itemsData, claimsData]) => {
      setItems(itemsData);
      setClaims(claimsData);
    });
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const pendingClaims = claims.filter((c) => c.status === 'pending');

  async function handleApprove(claimId: string) {
    await approveClaim(claimId);
    fetchAll();
  }

  async function handleReject(claimId: string) {
    await rejectClaim(claimId);
    fetchAll();
  }

  async function handleStatusChange(itemId: string, status: Item['status']) {
    await updateItemStatus(itemId, status);
    fetchAll();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[#DDDDD8]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1">Admin</p>
        <h1 className="font-display font-bold text-3xl text-[#171817]">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-[#DDDDD8] border border-[#DDDDD8] mb-8">
        {[
          { label: 'Total Items', value: items.length },
          { label: 'Pending Claims', value: pendingClaims.length },
          { label: 'Resolved', value: claims.filter((c) => c.status !== 'pending').length },
        ].map((s) => (
          <div key={s.label} className="bg-[#F5F5F0] py-5 text-center">
            <p className="font-display font-bold text-3xl text-[#171817]">{s.value}</p>
            <p className="text-xs text-[#6B6C6A] mt-1 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#DDDDD8] mb-6">
        {([['claims', 'Pending Claims'], ['items', 'All Items']] as const).map(([key, label]) => (
          <button
            key={key}
            id={`admin-tab-${key}`}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === key
                ? 'border-[#171817] text-[#171817]'
                : 'border-transparent text-[#6B6C6A] hover:text-[#171817]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Pending Claims */}
      {activeTab === 'claims' && (
        <div>
          {pendingClaims.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[#6B6C6A]">No pending claims.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingClaims.map((claim) => {
                const item = items.find((i) => i.id === claim.itemId);
                return (
                  <div key={claim.id} className="border border-[#DDDDD8] p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-0.5">Claim on</p>
                        <p className="font-display font-semibold text-[#171817] text-base">
                          {item ? (
                            <Link to={`/item/${item.id}`} className="hover:underline">{item.name}</Link>
                          ) : 'Unknown Item'}
                        </p>
                        {item && (
                          <p className="text-xs text-[#6B6C6A] mt-0.5">{item.category} · {item.location}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-yellow-100 text-yellow-700">Pending</span>
                    </div>
                    <p className="text-xs text-[#6B6C6A] mb-0.5">
                      Claimed by <strong className="text-[#171817]">@{claim.claimerUsername}</strong> on {new Date(claim.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-[#171817] mt-2 mb-4 bg-[#EEEEEA] px-3 py-2.5">"{claim.description}"</p>
                    <div className="flex gap-3">
                      <button
                        id={`approve-claim-${claim.id}`}
                        onClick={() => handleApprove(claim.id)}
                        className="px-4 py-2 text-xs font-semibold bg-[#C5F36B] text-[#171817] hover:bg-[#d4f77f] transition-colors"
                      >
                        Approve & Return Item
                      </button>
                      <button
                        id={`reject-claim-${claim.id}`}
                        onClick={() => handleReject(claim.id)}
                        className="px-4 py-2 text-xs font-semibold border border-[#DDDDD8] text-[#6B6C6A] hover:border-[#171817] hover:text-[#171817] transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* All Items */}
      {activeTab === 'items' && (
        <div className="space-y-0 border border-[#DDDDD8]">
          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#6B6C6A]">No items reported yet.</p>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-4 py-3 ${idx < items.length - 1 ? 'border-b border-[#DDDDD8]' : ''}`}
              >
                <div className="w-10 h-10 shrink-0 bg-[#EEEEEA] overflow-hidden">
                  {item.imagePath ? (
                    <img src={item.imagePath} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#6B6C6A] text-xs">—</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-[#171817] truncate">
                    <Link to={`/item/${item.id}`} className="hover:underline">{item.name}</Link>
                  </p>
                  <p className="text-xs text-[#6B6C6A]">@{item.reporterUsername} · {item.type} · {item.location}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${
                  item.type === 'lost' ? 'bg-[#171817] text-[#F5F5F0]' : 'bg-[#C5F36B] text-[#171817]'
                }`}>
                  {item.type}
                </span>
                <select
                  id={`status-select-${item.id}`}
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value as Item['status'])}
                  className="text-xs border border-[#DDDDD8] px-2 py-1.5 text-[#171817] bg-white focus:border-[#171817] outline-none"
                >
                  <option value="active">Active</option>
                  <option value="returned">Returned</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
