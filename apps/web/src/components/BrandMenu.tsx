"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { messages, type Locale } from "@huquqi/core";

/** Clicking the "Huquqi" name opens a panel with the site's information pages. */
export function BrandMenu({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);

  const groups: { href: string; label: string }[][] = [
    [
      { href: "/", label: t.nav.home },
      { href: "/contact", label: t.info.contact },
      { href: "/feedback", label: t.info.feedback },
      { href: "/partners", label: t.info.partners },
      { href: "/about", label: t.info.about },
    ],
    [
      { href: "/how", label: t.info.how },
      { href: "/faq", label: t.info.faq },
      { href: "/join", label: t.info.joinLawyer },
      { href: "/join/provider", label: t.info.joinProvider },
      { href: "/privacy", label: t.info.privacy },
    ],
  ];
  return (
    <div className="brand-menu" ref={ref}>
      <button type="button" className="brand" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((o) => !o)}>
        <span className="mark" aria-hidden="true">ح</span>
        <span>{t.brand}</span>
        <span className="caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <nav id="site-menu" className="site-menu" aria-label={t.info.menu}>
          {groups.map((g, i) => (
            <ul key={i}>
              {g.map((l) => (
                <li key={l.href}><Link href={l.href} onClick={() => setOpen(false)} aria-current={pathname === l.href ? "page" : undefined}>{l.label}</Link></li>
              ))}
            </ul>
          ))}
        </nav>
      )}
    </div>
  );
}
