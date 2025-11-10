'use client';

import { useState, useEffect } from 'react';
import InfoIcon from './InfoIcon';

export default function ImageManager({ images = [], onChange, maxImages = 5 }) {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [failedImages, setFailedImages] = useState(new Set());

  // Reset failed images when images array changes (e.g., reordering or removing)
  useEffect(() => {
    setFailedImages(new Set());
  }, [images.length]);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed.`);
      return;
    }
    onChange([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    onChange(newImages);
  };

  const handleMoveDown = (index) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    onChange(newImages);
  };

  const handleSetAsPrimary = (index) => {
    if (index === 0) return; // Already primary
    const newImages = [...images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-zinc-600">Product Images</h3>
        <InfoIcon tooltip={`Add up to ${maxImages} image URLs. The first image is the primary product image. Click the star icon (top right) on any image to set it as primary, or use the up/down arrows to reorder.`} />
      </div>
      
      {/* Existing Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((imageUrl, index) => {
            const hasFailed = failedImages.has(index);
            return (
              <div key={index} className="group relative rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50">
                <div className="aspect-square w-full overflow-hidden">
                  {hasFailed ? (
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
                  ) : (
                    <img
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={() => {
                        setFailedImages((prev) => new Set([...prev, index]));
                      }}
                    />
                  )}
                </div>
              
              {/* Set as primary button - top right */}
              {index !== 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetAsPrimary(index);
                  }}
                  className="absolute top-2 right-2 z-10 rounded-full bg-emerald-500/80 p-1.5 text-white shadow-sm transition hover:bg-emerald-600 hover:shadow-md"
                  title="Set as primary image"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
              )}

              {/* Primary badge - top right if it's the first image */}
              {index === 0 && (
                <div className="absolute top-2 right-2 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                  Primary
                </div>
              )}

              {/* Controls overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveUp(index);
                  }}
                  disabled={index === 0}
                  className="rounded-full bg-white/90 p-1.5 text-zinc-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Move up"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveDown(index);
                  }}
                  disabled={index === images.length - 1}
                  className="rounded-full bg-white/90 p-1.5 text-zinc-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Move down"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                  className="rounded-full bg-rose-500/90 p-1.5 text-white hover:bg-rose-600 transition"
                  title="Remove image"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Image number badge */}
              <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                {index + 1}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Add new image */}
      {images.length < maxImages && (
        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddImage();
              }
            }}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddImage}
            disabled={!newImageUrl.trim()}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Image
          </button>
        </div>
      )}

      {images.length >= maxImages && (
        <p className="text-xs text-zinc-500">Maximum {maxImages} images reached.</p>
      )}

      {images.length === 0 && (
        <p className="text-sm text-zinc-400">No images added yet. Add an image URL above.</p>
      )}
    </div>
  );
}

