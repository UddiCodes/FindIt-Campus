import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, User as UserIcon, ArrowLeft, Share2,
  Package, AlertCircle, CheckCircle, Search, FileText,
} from 'lucide-react';
import { getItemById, getClaimsForItem, addClaim } from '../store';
import type { Item, Claim, User } from '../types';

interface ItemDetailPageProps {
  user: User;
}

export default function ItemDetailPage({ user }: ItemDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | undefined>(undefined);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimReason, setClaimReason] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getItemById(id),
      getClaimsForItem(id)
    ]).then(([found, itemClaims]) => {
      setItem(found);
      setClaims(itemClaims);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-[#6B6C6A]">Loading item...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-[#6B6C6A]">Item not found.</p>
        <Link to="/search" className="mt-4 inline-block text-sm font-medium text-[#171817] underline">Back to Browse</Link>
      </div>
    );
  }

  const myExistingClaim = claims.find((c) => c.claimedBy === user.id);
  const isOwnReport = item.reportedBy === user.id;

  function handleShare() {
    const text = `[FindIt Campus] ${item!.type === 'lost' ? 'LOST' : 'FOUND'}: ${item!.name} — ${item!.category}, ${item!.location}, ${item!.date}. Check FindIt Campus for details.`;
    if (navigator.share) {
      navigator.share({ title: item!.name, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert('Item details copied to clipboard!'));
    }
  }

  async function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    const reason = claimReason.trim();
    if (!reason) { setClaimError('Please describe why this item belongs to you.'); return; }
    if (reason.length < 10) { setClaimError('Please provide a more detailed description (at least 10 characters).'); return; }

    const claim: Omit<Claim, 'id' | 'createdAt' | 'claimerUsername'> = {
      itemId: item!.id,
      claimedBy: user.id,
      description: reason,
      status: 'pending',
    };
    await addClaim(claim);
    const updatedClaims = await getClaimsForItem(item!.id);
    setClaims(updatedClaims);
    setClaimSuccess(true);
    setShowClaimForm(false);
    setClaimReason('');
  }

  const statusColors: Record<string, string> = {
    active: 'bg-[#C5F36B] text-[#171817]',
    returned: 'bg-[#171817] text-[#F5F5F0]',
    closed: 'bg-[#EEEEEA] text-[#6B6C6A]',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#6B6C6A] hover:text-[#171817] transition-colors mb-8">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="bg-[#EEEEEA] aspect-[4/3] overflow-hidden flex items-center justify-center">
          {item.imagePath ? (
            <img src={item.imagePath} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-[#6B6C6A]">
              <Package size={48} strokeWidth={1} />
              <span className="text-sm">No image provided</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${item.type === 'lost' ? 'bg-[#171817] text-[#F5F5F0]' : 'bg-[#C5F36B] text-[#171817]'}`}>
              {item.type}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${statusColors[item.status]}`}>
              {item.status}
            </span>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1">{item.category}</p>
          <h1 className="font-display font-bold text-3xl text-[#171817] mb-4">{item.name}</h1>
          <p className="text-sm text-[#6B6C6A] leading-relaxed mb-6">{item.description}</p>

          <div className="space-y-2.5 mb-6 py-4 border-t border-b border-[#DDDDD8]">
            <div className="flex items-center gap-2.5 text-sm text-[#171817]">
              <MapPin size={14} className="text-[#6B6C6A] shrink-0" />
              {item.location}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-[#171817]">
              <Calendar size={14} className="text-[#6B6C6A] shrink-0" />
              {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-[#171817]">
              <UserIcon size={14} className="text-[#6B6C6A] shrink-0" />
              Reported by @{item.reporterUsername}
            </div>
          </div>

          {/* ── FOUND item: claim action ───────────────────────────── */}
          {item.type === 'found' && item.status === 'active' && !isOwnReport && !myExistingClaim && !showClaimForm && (
            <div className="mb-5 p-4 border border-[#DDDDD8] bg-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1">Is this yours?</p>
              <p className="text-sm text-[#171817] mb-3">
                If this item belongs to you, submit a claim describing why. An admin will review and confirm the return.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  id="claim-item-btn"
                  onClick={() => setShowClaimForm(true)}
                  className="px-5 py-2.5 bg-[#171817] text-[#F5F5F0] text-sm font-medium hover:bg-[#C5F36B] hover:text-[#171817] transition-colors"
                >
                  Submit a Claim
                </button>
                <button
                  id="share-item-btn"
                  onClick={handleShare}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[#DDDDD8] text-sm font-medium text-[#6B6C6A] hover:border-[#171817] hover:text-[#171817] transition-colors"
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          )}

          {/* ── LOST item: help the reporter get it back ───────────── */}
          {item.type === 'lost' && item.status === 'active' && !isOwnReport && (
            <div className="mb-5 p-4 border border-[#DDDDD8] bg-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1">Did you find this item?</p>
              <p className="text-sm text-[#171817] mb-3">
                If you've found <strong>{item.name}</strong>, report it as Found so the owner (@{item.reporterUsername}) can claim it back.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  id="report-found-this-btn"
                  to={`/report?prefill=found&name=${encodeURIComponent(item.name)}&category=${encodeURIComponent(item.category)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#171817] text-[#F5F5F0] text-sm font-medium hover:bg-[#C5F36B] hover:text-[#171817] transition-colors"
                >
                  <FileText size={14} /> I Found This Item
                </Link>
                <button
                  id="share-lost-item-btn"
                  onClick={handleShare}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[#DDDDD8] text-sm font-medium text-[#6B6C6A] hover:border-[#171817] hover:text-[#171817] transition-colors"
                >
                  <Share2 size={14} /> Spread the Word
                </button>
              </div>
            </div>
          )}

          {/* ── OWN lost report: guide them ────────────────────────── */}
          {item.type === 'lost' && isOwnReport && item.status === 'active' && (
            <div className="mb-5 p-4 bg-[#EEEEEA]">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1">This is your lost item report</p>
              <p className="text-sm text-[#6B6C6A] mb-3">
                When someone finds it and reports it as Found, search for it and submit a claim on their Found listing.
              </p>
              <Link
                to={`/search?q=${encodeURIComponent(item.name)}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#171817] hover:underline"
              >
                <Search size={13} /> Search for a matching Found report
              </Link>
            </div>
          )}

          {/* ── OWN found report ───────────────────────────────────── */}
          {item.type === 'found' && isOwnReport && (
            <div className="mb-5 p-4 bg-[#EEEEEA]">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1">This is your found item report</p>
              <p className="text-sm text-[#6B6C6A]">
                Claims from other users will appear in the admin queue. Check{' '}
                <Link to="/my-reports" className="text-[#171817] font-medium underline underline-offset-2">My Reports</Link>{' '}
                for updates.
              </p>
            </div>
          )}

          {/* Status messages */}
          {item.status !== 'active' && (
            <div className="mb-5 p-3 bg-[#EEEEEA]">
              <p className="text-xs text-[#6B6C6A]">This item is <strong>{item.status}</strong>. No new claims are accepted.</p>
            </div>
          )}
          {myExistingClaim && (
            <div className={`flex items-start gap-2.5 mb-5 p-3 ${myExistingClaim.status === 'approved' ? 'bg-[#C5F36B]' : 'bg-[#EEEEEA]'}`}>
              {myExistingClaim.status === 'approved' && <CheckCircle size={14} className="text-[#171817] shrink-0 mt-0.5" />}
              {myExistingClaim.status === 'pending' && <AlertCircle size={14} className="text-yellow-600 shrink-0 mt-0.5" />}
              {myExistingClaim.status === 'rejected' && <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />}
              <div>
                <p className="text-xs font-semibold text-[#171817] capitalize">{myExistingClaim.status === 'pending' ? 'Claim submitted — awaiting review' : `Claim ${myExistingClaim.status}`}</p>
                {myExistingClaim.status === 'pending' && (
                  <p className="text-xs text-[#6B6C6A] mt-0.5">An admin will review your claim. Check <Link to="/my-reports" className="underline">My Reports</Link> for updates.</p>
                )}
              </div>
            </div>
          )}
          {claimSuccess && (
            <div className="flex items-center gap-2 text-xs bg-[#C5F36B] px-3 py-2.5 mb-5">
              <CheckCircle size={13} className="text-[#171817] shrink-0" />
              <span>Claim submitted! Check <Link to="/my-reports" className="underline font-medium">My Reports</Link> for status updates.</span>
            </div>
          )}

          {/* Always-visible share + bottom actions when not showing main action block */}
          {(item.status !== 'active' || isOwnReport) && (
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#DDDDD8] text-sm font-medium text-[#6B6C6A] hover:border-[#171817] hover:text-[#171817] transition-colors"
            >
              <Share2 size={14} /> Share
            </button>
          )}
        </div>
      </div>

      {/* Claim form */}
      {showClaimForm && (
        <div className="mt-10 border-t border-[#DDDDD8] pt-8 max-w-lg">
          <h2 className="font-display font-semibold text-xl text-[#171817] mb-2">Submit a Claim</h2>
          <p className="text-sm text-[#6B6C6A] mb-5">
            Describe why this item belongs to you — mention specific details like markings, what's inside, or when you lost it. The admin will review your claim.
          </p>
          <form onSubmit={handleClaimSubmit} noValidate>
            <label htmlFor="claim-description" className="block text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-2">
              Claim Description *
            </label>
            <textarea
              id="claim-description"
              rows={4}
              value={claimReason}
              onChange={(e) => { setClaimReason(e.target.value); setClaimError(''); }}
              placeholder="e.g. It's my wallet — it has my college ID inside, a blue card holder, and ₹500 in cash…"
              className={`w-full px-4 py-3 text-sm bg-white border ${claimError ? 'border-red-400' : 'border-[#DDDDD8]'} focus:border-[#171817] outline-none text-[#171817] placeholder:text-[#6B6C6A] resize-none transition-colors`}
            />
            {claimError && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} /> {claimError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                id="submit-claim-btn"
                type="submit"
                className="px-5 py-2.5 bg-[#171817] text-[#F5F5F0] text-sm font-medium hover:bg-[#C5F36B] hover:text-[#171817] transition-colors"
              >
                Submit Claim
              </button>
              <button
                type="button"
                onClick={() => { setShowClaimForm(false); setClaimError(''); setClaimReason(''); }}
                className="px-5 py-2.5 border border-[#DDDDD8] text-sm text-[#6B6C6A] hover:border-[#171817] hover:text-[#171817] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
