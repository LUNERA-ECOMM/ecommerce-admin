'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function ProductItem({ product, isSelected, canSelect, onToggle }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const hasImage = product.images && product.images.length > 0 && product.images[0];
  const totalStock = product.totalStock ?? 0;

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleToggleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/admin/products/${product.id}/edit`} target="_blank" rel="noopener noreferrer" className="block">
        <div className="aspect-square w-full overflow-hidden bg-zinc-100 rounded-lg relative cursor-pointer group">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-zinc-100">
              <svg
                className="h-8 w-8 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
          )}
          {/* Seamless radio button overlay */}
          <div className="absolute inset-0 flex items-start justify-end p-1 pointer-events-none">
            <div className="relative group pointer-events-auto">
              <button
                type="button"
                onClick={handleToggleClick}
                disabled={!canSelect}
                className={`relative h-5 w-5 rounded-full border-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-500 shadow-lg'
                    : canSelect
                    ? 'bg-white/90 border-zinc-300 hover:border-emerald-400 hover:bg-white'
                    : 'bg-white/50 border-zinc-200 opacity-50 cursor-not-allowed'
                }`}
                aria-label={isSelected ? 'Deselect preview image' : 'Select preview image'}
              >
                {isSelected && (
                  <svg
                    className="absolute inset-0 m-auto h-3 w-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              {/* Radio button tooltip */}
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                <div className="bg-zinc-900 text-white text-xs rounded-lg px-2 py-1 shadow-lg">
                  {isSelected
                    ? 'Remove from homepage preview'
                    : canSelect
                    ? 'Add to homepage preview (1-4 products)'
                    : 'Maximum 4 products selected'}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-zinc-900 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-1">
          <p className="text-xs font-medium text-zinc-800 truncate" title={product.name}>
            {product.name}
          </p>
          <p className="text-xs text-zinc-500">Stock: {totalStock}</p>
        </div>
      </Link>

      {/* Product info tooltip - shows after 1 second hover */}
      {showTooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-30 pointer-events-none">
          <div className="bg-zinc-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-xs">
            <div className="font-semibold mb-1">{product.name}</div>
            <div className="space-y-1 text-zinc-300">
              <div>Price: ${product.basePrice?.toFixed(2) || '0.00'}</div>
              <div>Stock: {totalStock} units</div>
              {product.description && (
                <div className="mt-2 pt-2 border-t border-zinc-700 line-clamp-2">
                  {product.description}
                </div>
              )}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900" />
          </div>
        </div>
      )}
    </div>
  );
}

