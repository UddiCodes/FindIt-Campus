import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
import { addItem, uploadImage } from '../store';
import type { Item, ItemType, ItemCategory, User } from '../types';
import { CATEGORIES, LOCATIONS } from '../types';

interface ReportPageProps {
  user: User;
}

export default function ReportPage({ user }: ReportPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [reportType, setReportType] = useState<ItemType>(
    (searchParams.get('prefill') as ItemType) || 'lost'
  );
  const [name, setName] = useState(searchParams.get('name') || '');
  const [category, setCategory] = useState<ItemCategory | ''>(
    (searchParams.get('category') as ItemCategory) || ''
  );
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Item name is required.';
    if (!category) errs.category = 'Category is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    if (!location) errs.location = 'Location is required.';
    if (!date) errs.date = 'Date is required.';
    else if (date > today) errs.date = 'Date cannot be in the future.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setUploading(true);
    let finalImagePath = undefined;
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) finalImagePath = url;
    }

    const item: Omit<Item, 'id' | 'createdAt' | 'reporterUsername'> = {
      type: reportType,
      name: name.trim(),
      category: category as ItemCategory,
      description: description.trim(),
      location,
      date,
      imagePath: finalImagePath,
      reportedBy: user.id,
      status: 'active',
    };

    await addItem(item);
    setUploading(false);
    setSubmitted(true);
    setTimeout(() => navigate('/my-reports'), 1500);
  }

  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <CheckCircle size={40} className="text-[#C5F36B] mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl text-[#171817] mb-2">Report Submitted!</h2>
        <p className="text-sm text-[#6B6C6A]">Redirecting to My Reports…</p>
      </div>
    );
  }

  const fieldClass = (key: string) =>
    `w-full px-4 py-2.5 text-sm bg-white border ${errors[key] ? 'border-red-400' : 'border-[#DDDDD8]'} focus:border-[#171817] outline-none text-[#171817] placeholder:text-[#6B6C6A] transition-colors`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[#DDDDD8]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1">Reporting</p>
        <h1 className="font-display font-bold text-3xl text-[#171817]">Report an Item</h1>
      </div>

      {/* Type toggle */}
      <div className="flex mb-8 border border-[#DDDDD8]">
        {(['lost', 'found'] as ItemType[]).map((t) => (
          <button
            key={t}
            type="button"
            id={`report-type-${t}`}
            onClick={() => setReportType(t)}
            className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${
              reportType === t
                ? 'bg-[#171817] text-[#F5F5F0]'
                : 'text-[#6B6C6A] hover:text-[#171817]'
            }`}
          >
            I {t === 'lost' ? 'Lost' : 'Found'} something
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1.5" htmlFor="item-name">
            Item Name *
          </label>
          <input
            id="item-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
            placeholder="e.g. Blue Backpack"
            className={fieldClass('name')}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1 flex gap-1 items-center"><AlertCircle size={11} />{errors.name}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1.5" htmlFor="item-category">
            Category *
          </label>
          <select
            id="item-category"
            value={category}
            onChange={(e) => { setCategory(e.target.value as ItemCategory); setErrors((p) => ({ ...p, category: '' })); }}
            className={fieldClass('category')}
          >
            <option value="">Select category…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-xs text-red-500 mt-1 flex gap-1 items-center"><AlertCircle size={11} />{errors.category}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1.5" htmlFor="item-description">
            Description *
          </label>
          <textarea
            id="item-description"
            rows={3}
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })); }}
            placeholder="Describe the item — colour, brand, distinguishing marks…"
            className={`${fieldClass('description')} resize-none`}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1 flex gap-1 items-center"><AlertCircle size={11} />{errors.description}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1.5" htmlFor="item-location">
            {reportType === 'lost' ? 'Last Known Location' : 'Location Found'} *
          </label>
          <select
            id="item-location"
            value={location}
            onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: '' })); }}
            className={fieldClass('location')}
          >
            <option value="">Select location…</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          {errors.location && <p className="text-xs text-red-500 mt-1 flex gap-1 items-center"><AlertCircle size={11} />{errors.location}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1.5" htmlFor="item-date">
            {reportType === 'lost' ? 'Date Lost' : 'Date Found'} *
          </label>
          <input
            id="item-date"
            type="date"
            max={today}
            value={date}
            onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: '' })); }}
            className={fieldClass('date')}
          />
          {errors.date && <p className="text-xs text-red-500 mt-1 flex gap-1 items-center"><AlertCircle size={11} />{errors.date}</p>}
        </div>

        {/* Image */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1.5">
            Photo (Optional)
          </label>
          {imagePreview ? (
            <div className="relative w-full aspect-video bg-[#EEEEEA] overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 p-1.5 bg-[#171817] text-white hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="item-image"
              className="flex flex-col items-center justify-center gap-2 w-full py-8 border border-dashed border-[#DDDDD8] cursor-pointer hover:border-[#171817] transition-colors bg-white"
            >
              <Upload size={20} className="text-[#6B6C6A]" />
              <span className="text-xs text-[#6B6C6A]">Click to upload a photo</span>
              <input id="item-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        <div className="pt-2">
          <button
            id="submit-report-btn"
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-[#171817] text-[#F5F5F0] text-sm font-semibold hover:bg-[#C5F36B] hover:text-[#171817] transition-colors disabled:opacity-70"
          >
            {uploading ? 'Uploading...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
