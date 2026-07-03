"use client";
import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, ChevronLeft, ChevronRight, X, Tag } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";

interface MerchItem {
  id: string;
  name: string;
  description?: string | null;
  price?: string | null;
  mediaUrls?: string[] | null;
  link?: string | null;
  badge?: string | null;
}

// ─── Reusable slideshow ────────────────────────────────────────────────────
function ImageSlider({ images, name, compact = false }: { images: string[]; name: string; compact?: boolean }) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [errored, setErrored] = useState<Set<number>>(new Set());

  const visible = images.filter((_, i) => !errored.has(i));
  const clamped = Math.min(current, Math.max(0, visible.length - 1));

  const prev = useCallback(() => setCurrent((c) => (c - 1 + visible.length) % visible.length), [visible.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % visible.length), [visible.length]);

  useEffect(() => {
    if (!isHovered || visible.length < 2) return;
    const id = setInterval(next, 2500);
    return () => clearInterval(id);
  }, [isHovered, visible.length, next]);

  useEffect(() => { setCurrent(0); setErrored(new Set()); }, [images.length]);

  if (visible.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <ShoppingBag className={compact ? "h-12 w-12 text-gray-200" : "h-20 w-20 text-gray-200"} />
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {images.map((url, i) => {
        if (errored.has(i)) return null;
        const vi = visible.indexOf(url);
        return (
          <div
            key={url}
            className="absolute inset-0"
            style={{ opacity: vi === clamped ? 1 : 0, transition: "opacity 0.45s ease-in-out", zIndex: vi === clamped ? 1 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${name} ${i + 1}`}
              className={`h-full w-full object-contain ${compact ? "p-3" : "p-6"}`}
              onError={() => setErrored((p) => new Set(p).add(i))}
            />
          </div>
        );
      })}

      {visible.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-1.5 top-1/2 z-10 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full bg-black/15 text-gray-700 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/25"
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full bg-black/15 text-gray-700 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/25"
            aria-label="Berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {visible.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === clamped ? "w-4 bg-amber" : "w-1.5 bg-gray-300 hover:bg-gray-400"}`}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>

          <span className="absolute right-2 top-2 z-10 rounded-full bg-black/15 px-2 py-0.5 font-heading text-[10px] font-semibold text-gray-700 backdrop-blur-sm">
            {clamped + 1}/{visible.length}
          </span>
        </>
      )}
    </div>
  );
}

// ─── Detail modal ──────────────────────────────────────────────────────────
function MerchModal({ item, onClose }: { item: MerchItem; onClose: () => void }) {
  const images = (item.mediaUrls ?? []).filter(Boolean);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal box — flex row on desktop, column on mobile */}
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-ink-2 shadow-2xl md:flex-row">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>

        {/* LEFT — white pane, image square centered vertically */}
        <div className="relative flex shrink-0 items-center justify-center overflow-hidden bg-white md:w-[46%] md:rounded-l-2xl">
          {item.badge && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-crimson px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-white shadow">
              {item.badge}
            </span>
          )}
          {/* aspect-square gives the div real height so flex can center it */}
          <div className="group aspect-square w-full">
            <ImageSlider images={images} name={item.name} />
          </div>
        </div>

        {/* RIGHT — detail pane, scrollable */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-7">
          <div>
            <h2 className="font-heading text-2xl font-black uppercase leading-tight tracking-wide text-bone">
              {item.name}
            </h2>
            {item.price ? (
              <p className="mt-2 font-heading text-2xl font-extrabold text-amber">{item.price}</p>
            ) : (
              <p className="mt-2 font-heading text-base text-muted">Hubungi kami untuk harga</p>
            )}
          </div>

          {item.description && (
            <div className="border-t border-line pt-5">
              <h3 className="mb-3 flex items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
                <Tag className="h-3.5 w-3.5" />
                Deskripsi &amp; Spesifikasi
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-bone/80">
                {item.description}
              </p>
            </div>
          )}

          <div className="mt-auto pt-4">
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-glow transition-colors hover:bg-crimson-dark"
              >
                <ShoppingBag className="h-4 w-4" />
                Pesan Sekarang
              </a>
            ) : (
              <p className="text-center text-sm text-muted">Hubungi kami untuk informasi pemesanan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product card ──────────────────────────────────────────────────────────
function MerchCard({ item, onOpen }: { item: MerchItem; onOpen: () => void }) {
  const images = (item.mediaUrls ?? []).filter(Boolean);

  return (
    <div
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-ink-2 transition-all duration-300 hover:-translate-y-1 hover:border-amber/40 hover:shadow-[0_0_30px_rgba(212,168,67,0.1)]"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpen(); }}
      aria-label={`Lihat detail ${item.name}`}
    >
      {/* Image area — white bg, square, object-contain */}
      <div className="relative border-b border-line/60 bg-white" style={{ paddingTop: "100%" }}>
        <div className="absolute inset-0 group">
          <ImageSlider images={images} name={item.name} compact />
        </div>

        {item.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-crimson px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-white shadow">
            {item.badge}
          </span>
        )}

        {/* "Lihat detail" hover hint */}
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-end justify-center bg-black/0 pb-3 opacity-0 transition-all duration-300 group-hover:bg-black/8 group-hover:opacity-100">
          <span className="rounded-full bg-black/50 px-4 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
            Lihat Detail
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-heading text-base font-bold uppercase leading-tight tracking-wide text-bone">
          {item.name}
        </h3>
        {item.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-white/60">
            {item.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          {item.price ? (
            <span className="font-heading text-lg font-extrabold text-amber">{item.price}</span>
          ) : (
            <span className="font-heading text-sm text-muted">Hubungi kami</span>
          )}
          <span className="font-heading text-xs font-semibold uppercase tracking-wide text-amber/70 underline-offset-2 group-hover:text-amber group-hover:underline">
            Detail →
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Grid ──────────────────────────────────────────────────────────────────
export function MerchGrid({ items }: { items: MerchItem[] }) {
  const [selected, setSelected] = useState<MerchItem | null>(null);

  return (
    <>
      <SectionHeading
        eyebrow="Official Store"
        title="3GRT Merchandise"
        subtitle="Kenakan semangat juang. Koleksi resmi 3GRT Management."
        align="center"
        className="mb-14"
      />

      {items.length === 0 ? (
        <EmptyState title="Belum ada produk" desc="Produk merchandise akan segera tersedia. Pantau terus halaman ini." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Reveal key={item.id}>
              <MerchCard item={item} onOpen={() => setSelected(item)} />
            </Reveal>
          ))}
        </div>
      )}

      {selected && (
        <MerchModal item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
