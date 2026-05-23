'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { PropertyImage } from '@indiatownship/types';

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

const IMAGE_TYPES = ['outdoor', 'indoor', 'floor_plan', 'master_plan'] as const;
type ImageType = (typeof IMAGE_TYPES)[number];

const TYPE_LABELS: Record<ImageType, string> = {
  outdoor: 'Exterior',
  indoor: 'Interior',
  floor_plan: 'Floor Plan',
  master_plan: 'Master Plan',
};

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeType, setActiveType] = useState<ImageType | 'all'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const availableTypes = IMAGE_TYPES.filter((t) => images.some((img) => img.type === t));
  const filtered = activeType === 'all' ? images : images.filter((img) => img.type === activeType);

  function openLightbox(index: number) {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }

  function prev() {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length);
  }

  function next() {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filtered.length);
  }

  if (!images.length) return null;

  return (
    <div>
      {/* Type filter tabs */}
      {availableTypes.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveType('all')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeType === 'all' ? 'bg-navy text-white' : 'border border-gray-200 text-gray-600 hover:border-navy'
            }`}
          >
            All
          </button>
          {availableTypes.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeType === t ? 'bg-navy text-white' : 'border border-gray-200 text-gray-600 hover:border-navy'
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      )}

      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {filtered.map((img, i) => (
          <button
            key={img.url}
            onClick={() => openLightbox(i)}
            className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <Image
              src={img.url}
              alt={img.caption || title}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
            {img.caption && (
              <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl max-h-screen w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={filtered[lightboxIndex].url}
                alt={filtered[lightboxIndex].caption || title}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>

            {filtered[lightboxIndex].caption && (
              <p className="text-white text-center text-sm mt-2 opacity-80">
                {filtered[lightboxIndex].caption}
              </p>
            )}

            <p className="text-white text-center text-xs mt-1 opacity-50">
              {lightboxIndex + 1} / {filtered.length}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gold"
            aria-label="Close gallery"
          >
            ×
          </button>

          {/* Prev/Next */}
          {filtered.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl leading-none hover:text-gold"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl leading-none hover:text-gold"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
