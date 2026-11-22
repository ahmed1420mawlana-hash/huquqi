import type { Metadata } from "next";
import Link from "next/link";
import { BrandMenu } from "@/components/BrandMenu";
import { dir, LOCALES } from "@huquqi/core";
import { getT } from "@/lib/locale";
import { currentUser } from "@/lib/session";
import { logout, setLocale } from "./actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Huquqi · حقوقي · হুকুকি",
  description: "Follow your salary, end-of-service, bank and court matters in Saudi Arabia from home.",
};

const LANG_LABEL = { bn: "বাংলা", ar: "العربية", en: "English" } as const;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getT();
  const user = await currentUser();
  return (
    <html lang={locale} dir={dir(locale)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Manrope:wght@400;500;700;800&display=swap"
        />
      </head>
      <body>
        <header className="top">
          <div className="wrap">
            <BrandMenu locale={locale} />
            <nav className="nav" aria-label="Main">
              {user?.role === "WORKER" && <Link href="/cases">{t.nav.myCases}</Link>}
              {user?.role === "LAWYER" && <Link href="/lawyer">{t.nav.lawyer}</Link>}
              {user?.role === "ADMIN" && (
                <>
                  <Link href="/lawyer">{t.nav.lawyer}</Link>
                  <Link href="/admin">{t.nav.admin}</Link>
                </>
              )}
              {user ? (
                <form action={logout}>
                  <button type="submit">{t.nav.logout}</button>
                </form>
              ) : (
                <Link href="/login">{t.nav.login}</Link>
              )}
              <form action={setLocale} className="langs" aria-label="Language">
                {LOCALES.map((l) => (
                  <button key={l} type="submit" name="locale" value={l} className={l} aria-pressed={l === locale}>
                    {LANG_LABEL[l]}
                  </button>
                ))}
              </form>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
