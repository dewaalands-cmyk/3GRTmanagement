import { Instagram, Youtube, MessageCircle } from "lucide-react";
import type { SiteContentData } from "@/lib/content";

const NAV = [
  { label: "Layanan" },
  { label: "Event" },
  { label: "Kontak" },
];

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.5 2h-3v13.5a2.5 2.5 0 1 1-2.5-2.5c.3 0 .5 0 .8.1V9.9a5.6 5.6 0 0 0-.8-.1 5.6 5.6 0 1 0 5.6 5.6V8.3a7 7 0 0 0 4 1.3V6.3a4 4 0 0 1-4-4.3z" />
    </svg>
  );
}

export function Footer({ content }: { content: SiteContentData }) {
  const c = content.contact;
  const wa = `https://wa.me/${c.wa}`;

  return (
    <footer className="bg-white text-ink">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-crimson via-amber to-crimson" />

      <div className="mx-auto w-[92%] max-w-wrap py-16">
        <div className="grid gap-12 border-b border-ink/10 pb-12 md:grid-cols-[2fr_1fr]">

          {/* Brand kolom */}
          <div>
            <div className="mb-6">
              {content.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={content.logoUrl} alt={content.brandName} className="h-40 w-auto object-contain" style={{ filter: "invert(1)" }} />
              ) : (
                <span className="font-heading text-4xl font-black uppercase tracking-widest text-ink">
                  3GRT<span className="text-crimson">.</span>
                </span>
              )}
            </div>
            {content.footerTagline && (
              <p className="max-w-xs text-xl leading-relaxed text-ink/60">{content.footerTagline}</p>
            )}
            <div className="mt-6 flex gap-2">
              {[
                { href: c.instagram, label: "Instagram", Icon: Instagram },
                { href: c.youtube, label: "YouTube", Icon: Youtube },
                { href: c.wa ? wa : "", label: "WhatsApp", Icon: MessageCircle },
                { href: c.tiktok, label: "TikTok", Icon: TiktokIcon },
              ].filter(({ href }) => href).map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="grid h-12 w-12 place-items-center rounded-lg border border-ink/15 bg-ink/5 text-ink/60 transition-all duration-200 hover:border-crimson hover:bg-crimson hover:text-white">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-heading text-lg font-bold uppercase tracking-[0.2em] text-crimson">Navigasi</h4>
            <ul className="mt-6 space-y-5">
              {NAV.map((l) => (
                <li key={l.label}>
                  <span className="cursor-default text-xl font-medium text-ink/70 transition-colors hover:text-crimson">{l.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 pt-8 text-sm text-ink/40 sm:flex-row">
          <p className="text-base font-medium">© {new Date().getFullYear()} <span className="text-ink/70 font-bold">{content.brandName}</span>. Hak cipta dilindungi.</p>
          <p>
            Dibuat oleh{" "}
            <a href="https://pagiversestudio.vercel.app" target="_blank" rel="noopener noreferrer"
              className="font-semibold text-ink/50 transition-colors hover:text-crimson">
              Pagiverse Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
