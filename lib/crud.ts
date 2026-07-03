import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { getSession } from "./session";
import { RESOURCES } from "./fields";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Map resource key -> Prisma delegate
function delegate(resource: string): any {
  const map: Record<string, any> = {
    events: prisma.event,
    galleries: prisma.gallery,
    testimonials: prisma.testimonial,
    partners: prisma.partner,
    services: prisma.service,
    packages: prisma.package,
    merchandises: prisma.merchandise,
  };
  return map[resource] ?? null;
}

const unauthorized = () => NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
const notFound = () => NextResponse.json({ error: "Resource tidak ditemukan" }, { status: 404 });

async function authed() {
  return Boolean(await getSession());
}

// Field yang disimpan sebagai JSON string di DB
const JSON_FIELDS: Record<string, string[]> = {
  packages: ["features"],
  services: ["description"],
  merchandises: ["mediaUrls"],
};

function encodeJsonFields(resource: string, data: Record<string, any>) {
  const fields = JSON_FIELDS[resource] ?? [];
  const out = { ...data };
  for (const f of fields) {
    if (f in out) out[f] = JSON.stringify(Array.isArray(out[f]) ? out[f] : []);
  }
  return out;
}

function decodeJsonFields(resource: string, item: Record<string, any>) {
  const fields = JSON_FIELDS[resource] ?? [];
  const out = { ...item };
  for (const f of fields) {
    if (f in out && typeof out[f] === "string") {
      try { out[f] = JSON.parse(out[f]); } catch { out[f] = []; }
    }
  }
  return out;
}

// Saring body hanya ke field yang diizinkan + paksa tipe yang benar
function clean(resource: string, body: Record<string, any>) {
  const fields = RESOURCES[resource]?.fields ?? [];
  const out: Record<string, any> = {};
  for (const f of fields) {
    if (!(f.name in body)) continue;
    let v = body[f.name];
    if (f.type === "number") v = Number(v) || 0;
    else if (f.type === "boolean") v = Boolean(v);
    else if (f.type === "tags" || f.type === "paragraphs" || f.type === "multi-image") v = Array.isArray(v) ? v.filter(Boolean) : [];
    else v = v ?? "";
    out[f.name] = v;
  }
  return encodeJsonFields(resource, out);
}

const ORDER = [{ order: "asc" as const }, { createdAt: "desc" as const }];

export async function listHandler(resource: string) {
  if (!(await authed())) return unauthorized();
  const d = delegate(resource);
  if (!d) return notFound();
  const items = await d.findMany({ orderBy: ORDER });
  return NextResponse.json(items.map((i: Record<string, any>) => decodeJsonFields(resource, i)));
}

export async function createHandler(resource: string, req: Request) {
  if (!(await authed())) return unauthorized();
  const d = delegate(resource);
  if (!d) return notFound();
  try {
    const body = await req.json();
    const item = await d.create({ data: clean(resource, body) });
    revalidatePath("/", "layout");
    return NextResponse.json(decodeJsonFields(resource, item), { status: 201 });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error(`[crud] create ${resource} failed:`, detail);
    return NextResponse.json({ error: `Gagal menyimpan: ${detail}` }, { status: 400 });
  }
}

export async function updateHandler(resource: string, id: string, req: Request) {
  if (!(await authed())) return unauthorized();
  const d = delegate(resource);
  if (!d) return notFound();
  try {
    const body = await req.json();
    const item = await d.update({ where: { id }, data: clean(resource, body) });
    revalidatePath("/", "layout");
    return NextResponse.json(decodeJsonFields(resource, item));
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error(`[crud] update ${resource}/${id} failed:`, detail);
    return NextResponse.json({ error: `Gagal memperbarui: ${detail}` }, { status: 400 });
  }
}

export async function deleteHandler(resource: string, id: string) {
  if (!(await authed())) return unauthorized();
  const d = delegate(resource);
  if (!d) return notFound();
  try {
    await d.delete({ where: { id } });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 400 });
  }
}
