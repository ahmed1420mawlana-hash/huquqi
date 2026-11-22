import Link from "next/link";
import { localNum, type Locale, type Messages } from "@huquqi/core";
import { db } from "@/lib/db";

type Tab = "home" | "inbox" | "clients" | "lawyers" | "articles";

/** Tabs across the admin pages. The lawyer tab shows how many applications are waiting. */
export async function AdminNav({ active, t, locale }: { active: Tab; t: Messages; locale: Locale }) {
  const pending = await db.lawyerApplication.count({ where: { status: "pending" } });
  const tabs: [Tab, string, string][] = [
    ["home", "/admin", t.admin.title],
    ["inbox", "/inbox", t.inbox.title],
    ["clients", "/admin/clients", t.staff.clients],
    ["lawyers", "/admin/lawyers", t.staff.apps],
    ["articles", "/admin/articles", t.article.manage],
  ];
  return (
    <nav className="admin-nav" aria-label={t.staff.nav}>
      {tabs.map(([key, href, label]) => (
        <Link key={key} href={href} className={key === active ? "on" : ""} aria-current={key === active ? "page" : undefined}>
          {label}
          {key === "lawyers" && pending > 0 && <span className="pill new num">{localNum(pending, locale)}</span>}
        </Link>
      ))}
    </nav>
  );
}
