import { Link } from 'react-router-dom';
import { MapPin, Calendar, Package } from 'lucide-react';
import type { Item } from '../types';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const isLost = item.type === 'lost';

  return (
    <Link
      to={`/item/${item.id}`}
      className="group block bg-white border border-[#DDDDD8] hover:border-[#171817] transition-colors duration-200 overflow-hidden"
    >
      {/* Image area */}
      <div className="aspect-[4/3] overflow-hidden bg-[#EEEEEA] relative">
        {item.imagePath ? (
          <img
            src={item.imagePath}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#6B6C6A]">
            <Package size={32} strokeWidth={1.5} />
            <span className="text-xs">No image</span>
          </div>
        )}
        {/* Type badge */}
        <span
          className={`absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 ${
            isLost
              ? 'bg-[#171817] text-[#F5F5F0]'
              : 'bg-[#C5F36B] text-[#171817]'
          }`}
        >
          {item.type}
        </span>
        {/* Status badge */}
        {item.status !== 'active' && (
          <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 bg-[#EEEEEA] text-[#6B6C6A]">
            {item.status}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6C6A] mb-1">
          {item.category}
        </p>
        <h3 className="font-display font-semibold text-[#171817] text-base leading-snug group-hover:underline mb-3 line-clamp-1">
          {item.name}
        </h3>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6B6C6A]">
            <MapPin size={11} />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B6C6A]">
            <Calendar size={11} />
            <span>
              {new Date(item.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
