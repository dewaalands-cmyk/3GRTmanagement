"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Save, ImageOff, GripVertical } from "lucide-react";
import { RESOURCES, type FieldConfig } from "@/lib/fields";
import { Label, Input, Textarea, Select } from "@/components/forms/FormField";
import { ImageUpload } from "./ImageUpload";
import { MediaUpload } from "./MediaUpload";
import { MultiImageUpload } from "./MultiImageUpload";
import { TagsInput } from "./TagsInput";
import { Toggle } from "./Toggle";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Item = Record<string, any>;

export function ResourceManager({ resourceKey }: { resourceKey: string }) {
  const cfg = RESOURCES[resourceKey];
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${resourceKey}`);
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, [resourceKey]);

  useEffect(() => { load(); }, [load]);

  function blankItem(): Item {
    const obj: Item = {};
    cfg.fields.forEach((f) => {
      obj[f.name] =
        f.type === "boolean" ? false :
        f.type === "tags" || f.type === "multi-image" ? [] :
        f.type === "number" ? (f.name === "rating" ? 5 : 0) :
        f.type === "select" ? (f.options?.[0]?.value ?? "") : "";
    });
    return obj;
  }

  function startNew() { setEditing(blankItem()); setIsNew(true); setError(""); }
  function startEdit(item: Item) { setEditing({ ...item }); setIsNew(false); setError(""); }
  function setField(name: string, val: any) { setEditing((e) => (e ? { ...e, [name]: val } : e)); }

  async function save() {
    if (!editing) return;
    // validasi: field judul wajib diisi
    if (!String(editing[cfg.titleField] ?? "").trim()) {
      setError(`${cfg.fields.find((f) => f.name === cfg.titleField)?.label ?? "Judul"} wajib diisi`);
      return;
    }
    setSaving(true);
    setError("");
    const url = isNew ? `/api/admin/${resourceKey}` : `/api/admin/${resourceKey}/${editing.id}`;
    try {
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) {
        let msg = `Gagal menyimpan (kode ${res.status}).`;
        if (res.status === 401) msg = "Sesi login habis. Muat ulang halaman lalu login kembali.";
        else if (res.status === 413) msg = "Foto terlalu besar. Kurangi jumlah/ukuran foto lalu simpan lagi.";
        else {
          try { const body = await res.json(); if (body?.error) msg = String(body.error); } catch {}
        }
        setError(msg);
        return;
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(`Gagal terhubung ke server: ${err instanceof Error ? err.message : "coba lagi"}`);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Yakin ingin menghapus item ini? Tindakan ini tidak bisa dibatalkan.")) return;
    const res = await fetch(`/api/admin/${resourceKey}/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  function getThumb(item: Item): string {
    if (resourceKey === "galleries" && item.type === "video" && item.youtubeId) {
      return `https://img.youtube.com/vi/${item.youtubeId}/default.jpg`;
    }
    if (cfg.imageField) return item[cfg.imageField] || "";
    // multi-image: use first item
    const multiField = cfg.fields.find((f) => f.type === "multi-image");
    if (multiField) {
      const arr = item[multiField.name];
      return Array.isArray(arr) && arr[0] ? arr[0] : "";
    }
    return "";
  }

  function renderField(f: FieldConfig) {
    const v = editing![f.name];
    const id = `f-${f.name}`;
    if (f.type === "textarea") return <Textarea id={id} value={v ?? ""} onChange={(e) => setField(f.name, e.target.value)} placeholder={f.placeholder} />;
    if (f.type === "number") return <Input id={id} type="number" value={v ?? 0} onChange={(e) => setField(f.name, e.target.value)} placeholder={f.placeholder} />;
    if (f.type === "select") return (
      <Select id={id} value={v ?? ""} onChange={(e) => setField(f.name, e.target.value)}>
        {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Select>
    );
    if (f.type === "image") return <ImageUpload value={v || ""} onChange={(val) => setField(f.name, val)} />;
    if (f.type === "media") return <MediaUpload value={v || ""} onChange={(val) => setField(f.name, val)} />;
    if (f.type === "multi-image") return <MultiImageUpload value={Array.isArray(v) ? v : []} onChange={(val) => setField(f.name, val)} />;
    if (f.type === "boolean") return <Toggle checked={!!v} onChange={(val) => setField(f.name, val)} />;
    if (f.type === "tags") return <TagsInput value={v || []} onChange={(val) => setField(f.name, val)} />;
    if (f.type === "paragraphs") {
      const paras: string[] = Array.isArray(v) ? v : [];
      return (
        <div className="space-y-2">
          {paras.map((p, i) => (
            <div key={i} className="flex gap-2">
              <GripVertical className="mt-3 h-4 w-4 shrink-0 text-muted-dark" />
              <Textarea
                value={p}
                onChange={(e) => setField(f.name, paras.map((x, j) => j === i ? e.target.value : x))}
                placeholder={`Paragraf ${i + 1}...`}
              />
              <button
                type="button"
                onClick={() => setField(f.name, paras.filter((_, j) => j !== i))}
                className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-bone/60 hover:border-crimson hover:text-crimson"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setField(f.name, [...paras, ""])}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber hover:underline"
          >
            <Plus className="h-4 w-4" /> Tambah Paragraf
          </button>
        </div>
      );
    }
    return <Input id={id} value={v ?? ""} onChange={(e) => setField(f.name, e.target.value)} placeholder={f.placeholder} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">{loading ? "Memuat..." : `${items.length} item`}</p>
        <button onClick={startNew} className="inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-white shadow-glow transition-colors hover:bg-crimson-dark">
          <Plus className="h-4 w-4" /> Tambah
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-crimson" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-ink-2 py-16 text-center">
          <p className="text-muted">Belum ada {cfg.plural.toLowerCase()}. Klik <span className="text-amber">Tambah</span> untuk membuat.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => {
            const thumb = getThumb(item);
            return (
              <li key={item.id} className="flex items-center gap-4 rounded-xl border border-line bg-ink-2 p-3 transition-colors hover:border-line">
                <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-ink-3">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageOff className="h-5 w-5 text-muted-dark" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading font-semibold text-bone">{item[cfg.titleField] || "(tanpa judul)"}</p>
                  {cfg.subtitleField && item[cfg.subtitleField] && (
                    <p className="truncate text-sm text-muted">{String(item[cfg.subtitleField])}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button onClick={() => startEdit(item)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-bone/70 transition-colors hover:border-amber hover:text-amber" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(item.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-bone/70 transition-colors hover:border-crimson hover:text-crimson" aria-label="Hapus">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-2xl border border-line bg-ink-2">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="font-heading text-lg font-semibold uppercase tracking-wide">
                {isNew ? `Tambah ${cfg.singular}` : `Edit ${cfg.singular}`}
              </h3>
              <button onClick={() => setEditing(null)} className="grid h-9 w-9 place-items-center rounded-lg border border-line" aria-label="Tutup">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-6">
              {cfg.fields.map((f) => (
                <div key={f.name} className={f.type === "boolean" ? "flex items-center justify-between" : ""}>
                  <Label htmlFor={`f-${f.name}`}>{f.label}</Label>
                  {renderField(f)}
                  {f.help && f.type !== "boolean" && <p className="mt-1.5 text-xs text-muted-dark">{f.help}</p>}
                </div>
              ))}
              {error && <p className="rounded-lg border border-crimson/30 bg-crimson/10 px-4 py-2.5 text-sm text-crimson-light">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
              <button onClick={() => setEditing(null)} className="rounded-full border border-line px-5 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-bone/80 transition-colors hover:bg-ink-3">
                Batal
              </button>
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-white shadow-glow transition-colors hover:bg-crimson-dark disabled:opacity-60">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan</> : <><Save className="h-4 w-4" /> Simpan</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
