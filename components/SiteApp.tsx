"use client";
import { useState, useEffect } from "react";
import { MessageCircle, Mail, MapPin, Clock, Instagram, Youtube, ShieldCheck } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { ServiceBlock } from "@/components/sections/ServiceBlock";
import { EventCard } from "@/components/sections/EventCard";
import { PartnerStrip } from "@/components/sections/PartnerStrip";
import { Timeline } from "@/components/sections/Timeline";
import { MerchGrid } from "@/components/sections/MerchGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContactForm } from "@/components/forms/ContactForm";
import { AthleteForm } from "@/components/forms/AthleteForm";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Footer } from "@/components/Footer";
import type { SiteContentData } from "@/lib/content";

type Section = "beranda" | "layanan" | "event" | "kontak" | "merch";

function Divider() {
  return <div className="h-1.5 w-full bg-gradient-to-r from-crimson via-amber to-crimson" />;
}

function bgStyle(url?: string, overlayPct = 60): React.CSSProperties {
  if (!url) return {};
  const o = (overlayPct / 100).toFixed(2);
  return {
    backgroundImage: `linear-gradient(rgba(8,8,8,${o}), rgba(8,8,8,${o})), url(${url})`,
    backgroundSize: "cover",
    backgroundPosition: "center top", // center top shows the subject on portrait/mobile
    backgroundAttachment: "scroll",   // scroll (not fixed) works correctly on iOS
    backgroundRepeat: "no-repeat",
  };
}

function isYouTube(url: string) {
  return /youtu(\.be|be\.com)/.test(url);
}
function youtubeEmbed(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}
function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg)$/i.test(url) || url.includes("t=video");
}

function AboutMedia({ url }: { url: string }) {
  const wrap = "group relative aspect-square w-full overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,168,67,0.15)]";
  if (isYouTube(url)) {
    return (
      <div className={wrap}>
        <iframe src={youtubeEmbed(url)} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" allowFullScreen title="About video" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    );
  }
  if (isVideoUrl(url)) {
    return (
      <div className={wrap}>
        <video
          src={url}
          muted
          autoPlay
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    );
  }
  return (
    <div className={wrap}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Tentang Kami" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}

interface Props {
  content: SiteContentData;
  services: any[];
  events: any[];
  testimonials: any[];
  partners: any[];
  merchandises: any[];
}

export function SiteApp({ content, services, events, testimonials, partners, merchandises }: Props) {
  const [active, setActive] = useState<Section>("beranda");

  useEffect(() => {
    const scale = content.fontScale ?? 100;
    document.documentElement.style.fontSize = `${scale}%`;
    return () => { document.documentElement.style.fontSize = ""; };
  }, [content.fontScale]);

  const navigate = (s: Section) => {
    setActive(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const c = content.contact;
  const wa = `https://wa.me/${c.wa}`;

  // Hanya tampilkan baris yang datanya diisi di admin.
  // WhatsApp: tampilkan tanpa nomor (klik untuk chat), sesuai permintaan.
  const contactRows = [
    { icon: MessageCircle, label: "WhatsApp", value: "Klik untuk chat", href: wa, color: "text-[#25D366]", show: !!c.wa },
    { icon: Mail, label: "Email", value: c.email, href: `mailto:${c.email}`, color: "text-crimson", show: !!c.email },
    { icon: MapPin, label: "Lokasi", value: c.location, color: "text-amber", show: !!c.location },
    { icon: Clock, label: "Venue", value: c.address, color: "text-bone", show: !!c.address },
  ].filter((r) => r.show);

  return (
    <>
      <SiteNavbar active={active} onNavigate={navigate} logoUrl={content.logoUrl} />

      <main className="min-h-screen">

        {/* ===== BERANDA ===== */}
        {active === "beranda" && (
          <div key="beranda">
            <Hero content={content} onNavigate={navigate} />
            
            {/* Tentang — background-nya sendiri */}
            <section className="py-20 md:py-28" style={bgStyle(content.tentangBg, content.bgOverlay)}>
              <div className="wrap">
                <SectionHeading eyebrow={content.about.eyebrow} title={content.about.title} className="max-w-3xl mb-14" />
                <div className="grid items-center gap-14 lg:grid-cols-2">
                  <Reveal>
                    <div className="space-y-5">
                      {content.about.paragraphs.map((p, i) => (
                        <p key={i} className="font-medium leading-relaxed text-white/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">{p}</p>
                      ))}
                    </div>
                  </Reveal>
                  {content.about.mediaUrl && (
                    <Reveal>
                      <AboutMedia url={content.about.mediaUrl} />
                    </Reveal>
                  )}
                </div>
              </div>
            </section>

            
            {/* Mengapa Kami — background-nya sendiri */}
            <section
              className="py-20 md:py-28"
              style={bgStyle(content.whyusBg, content.bgOverlay)}
            >
              <div className="wrap grid items-center gap-14 lg:grid-cols-2">
                {content.whyus.mediaUrl ? (
                  <Reveal>
                    <AboutMedia url={content.whyus.mediaUrl} />
                  </Reveal>
                ) : (
                  <Reveal>
                    <ul className="space-y-3">
                      {content.whyus.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-4 rounded-xl border border-line bg-ink-3 px-6 py-5 transition-transform duration-200 hover:translate-x-1.5">
                          <ShieldCheck className="h-6 w-6 shrink-0 text-amber" />
                          <span className="font-medium text-bone/90">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )}
                <div>
                  <Reveal>
                    <h2 className="text-3xl leading-[1.05] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-4xl md:text-5xl">
                      {content.whyus.title}
                    </h2>
                    {content.whyus.subtitle && (
                      <p className="mt-4 max-w-2xl font-medium text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                        {content.whyus.subtitle}
                      </p>
                    )}
                  </Reveal>
                  {content.whyus.mediaUrl && (
                    <Reveal>
                      <ul className="mt-8 space-y-3">
                        {content.whyus.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-4 rounded-xl border border-line bg-ink-3 px-6 py-5 transition-transform duration-200 hover:translate-x-1.5">
                            <ShieldCheck className="h-6 w-6 shrink-0 text-amber" />
                            <span className="font-medium text-bone/90">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Reveal>
                  )}
                </div>
              </div>
            </section>

            {/* Timeline — background-nya sendiri */}
            {content.timeline.length > 0 && (
              <>
                                <section
                  className="py-20 md:py-28"
                  style={bgStyle(content.timelineBg, content.bgOverlay)}
                >
                  <div className="wrap">
                    <SectionHeading eyebrow="Perjalanan Kami" title="Dari Indonesia, Menuju Panggung Dunia" align="center" className="mb-14" />
                    <Timeline items={content.timeline} />
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* ===== LAYANAN ===== */}
        {active === "layanan" && (
          <div key="layanan" className="pt-24" style={bgStyle(content.layananBg, content.bgOverlay)}>
            {services.length > 0 && (
              <section className="py-20 md:py-28">
                <div className="wrap">
                  <SectionHeading eyebrow={content.servicesIntro.eyebrow} title={content.servicesIntro.title} subtitle={content.servicesIntro.subtitle} className="max-w-2xl mb-4" />
                  <div className="divide-y divide-white/10">
                    {services.map((s, i) => (
                      <ServiceBlock
                        key={s.id}
                        title={s.title}
                        description={s.description}
                        imageUrl={s.imageUrl}
                        imagePosition={s.imagePosition ?? "right"}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}
                      </div>
        )}

        {/* ===== EVENT ===== */}
        {active === "event" && (
          <div key="event" className="pt-24" style={bgStyle(content.eventBg, content.bgOverlay)}>
            <section className="py-20 md:py-28">
              <div className="wrap">
                <SectionHeading eyebrow="Rekam Jejak" title="Event Kami" subtitle="Panggung tempat para petarung membuktikan diri dan menulis sejarah." className="max-w-2xl mb-12" />
                {events.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:-mx-6 md:px-6">
                    {events.map((e) => (
                      <div key={e.id} className="shrink-0 w-[calc(50%-8px)] snap-start min-w-[280px]">
                        <EventCard event={e} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="Belum ada event" desc="Event akan segera diumumkan. Pantau terus halaman ini." />
                )}
              </div>
            </section>
                      </div>
        )}

        {/* ===== KONTAK ===== */}
        {active === "kontak" && (
          <div key="kontak" className="pt-24" style={bgStyle(content.kontakBg, content.bgOverlay)}>
            <section className="py-20 md:py-28">
              <div className="wrap">
                <SectionHeading eyebrow="Hubungi Kami" title="Mari Bangun Langkah Berikutnya" subtitle="Atlet, sponsor, atau promotor — tim 3GRT siap berdiskusi dan menyusun solusi terbaik untuk Anda." className="max-w-2xl mb-14" />
                <div className="grid items-start gap-12 lg:grid-cols-2">
                  <Reveal>
                    <ul className="space-y-4">
                      {contactRows.map((r) => {
                        const Inner = (
                          <>
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-line bg-ink-2">
                              <r.icon className={`h-5 w-5 ${r.color}`} />
                            </span>
                            <span>
                              <span className="block font-heading text-xs font-medium uppercase tracking-wider text-muted">{r.label}</span>
                              <span className="font-medium text-bone">{r.value}</span>
                            </span>
                          </>
                        );
                        return (
                          <li key={r.label}>
                            {r.href ? (
                              <a href={r.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 transition-opacity hover:opacity-80">{Inner}</a>
                            ) : (
                              <div className="flex items-center gap-4">{Inner}</div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-8 flex gap-3">
                      {[
                        { href: c.instagram, label: "Instagram", Icon: Instagram },
                        { href: c.youtube, label: "YouTube", Icon: Youtube },
                        { href: c.wa ? wa : "", label: "WhatsApp", Icon: MessageCircle },
                      ].filter(({ href }) => href).map(({ href, label, Icon }) => (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center rounded-lg border border-line text-bone/70 transition-colors hover:border-amber hover:text-amber"><Icon className="h-5 w-5" /></a>
                      ))}
                    </div>
                  </Reveal>
                  <Reveal>
                    <ContactForm />
                  </Reveal>
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden bg-white py-20 md:py-28">
              {/* Gradient accent line separating from dark section above */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-crimson via-amber to-crimson" />
              {/* Subtle background texture */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(220,38,38,0.06),transparent)]" />
              <div className="wrap relative">
                <Reveal className="mb-12 text-center">
                  <p className="mb-3 font-heading text-xs font-bold uppercase tracking-[0.2em] text-crimson">
                    Untuk Para Petarung
                  </p>
                  <h2 className="font-heading text-3xl font-black uppercase leading-[1.05] text-gray-900 sm:text-4xl md:text-5xl">
                    Bergabung Sebagai Atlet
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl font-medium text-gray-600">
                    Punya semangat juang dan ingin naik ring? Daftarkan diri Anda dan tim matchmaking kami akan meninjau profil Anda.
                  </p>
                </Reveal>
                <div className="mx-auto max-w-2xl">
                  <Reveal><AthleteForm light /></Reveal>
                </div>
              </div>
            </section>
                      </div>
        )}

        {/* ===== MERCHANDISE ===== */}
        {active === "merch" && (
          <div key="merch" className="pt-24" style={bgStyle(content.merchBg, content.bgOverlay)}>
            <section className="py-20 md:py-28">
              <div className="wrap">
                <MerchGrid items={merchandises} />
              </div>
            </section>
          </div>
        )}

        {/* Mitra — tampil di semua halaman */}
        <PartnerStrip partners={partners} />
      </main>

      <Footer content={content} onNavigate={navigate} />
    </>
  );
}
