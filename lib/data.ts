import { prisma } from "./prisma";
import { toProxyUrl } from "./img-proxy";

const order = [{ order: "asc" as const }, { createdAt: "desc" as const }];

export async function getEvents() {
  try {
    const rows = await prisma.event.findMany({ orderBy: order });
    return rows.map((r) => ({
      ...r,
      imageUrl: r.imageUrl ? toProxyUrl(r.imageUrl, `resource:events:${r.id}:imageUrl`) : null,
    }));
  } catch { return []; }
}
export async function getGalleries() {
  try {
    const rows = await prisma.gallery.findMany({ orderBy: order });
    return rows.map((r) => ({
      ...r,
      imageUrl: r.imageUrl ? toProxyUrl(r.imageUrl, `resource:galleries:${r.id}:imageUrl`) : null,
    }));
  } catch { return []; }
}
export async function getTestimonials() {
  try { return await prisma.testimonial.findMany({ orderBy: order }); } catch { return []; }
}
export async function getPartners() {
  try {
    const rows = await prisma.partner.findMany({ orderBy: order });
    return rows.map((r) => ({
      ...r,
      logoUrl: r.logoUrl ? toProxyUrl(r.logoUrl, `resource:partners:${r.id}:logoUrl`) : null,
    }));
  } catch { return []; }
}
export async function getServices() {
  try {
    const rows = await prisma.service.findMany({ orderBy: order });
    return rows.map((r) => ({
      ...r,
      imageUrl: r.imageUrl ? toProxyUrl(r.imageUrl, `resource:services:${r.id}:imageUrl`) : null,
    }));
  } catch { return []; }
}
export async function getPackages() {
  try {
    const pkgs = await prisma.package.findMany({ orderBy: order });
    return pkgs.map((p) => ({
      ...p,
      features: typeof p.features === "string"
        ? (() => { try { return JSON.parse(p.features as string); } catch { return []; } })()
        : p.features,
    }));
  } catch { return []; }
}
// Cheap deterministic hash of a string → used as image cache-buster.
// Changes whenever the stored images change, so the CDN serves fresh images
// immediately after a save — without needing an updatedAt DB column.
function hashStr(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export async function getMerchandises() {
  try {
    const rows = await prisma.merchandise.findMany({ orderBy: order });
    return rows.map((r) => {
      let count = 0;
      if (r.mediaUrls) {
        try {
          const arr = JSON.parse(r.mediaUrls as string);
          count = Array.isArray(arr) ? arr.length : 0;
        } catch { count = 0; }
      }
      const v = hashStr(r.mediaUrls ?? "");
      return {
        ...r,
        mediaUrls: Array.from({ length: count }, (_, i) => `/api/merch-img?id=${r.id}&i=${i}&v=${v}`),
      };
    });
  } catch { return []; }
}
