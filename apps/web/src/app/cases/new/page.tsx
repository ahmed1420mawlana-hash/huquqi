import { isCaseType } from "@huquqi/core";
import { getT } from "@/lib/locale";
import { requireUser } from "@/lib/session";
import { directUploads } from "@/lib/storage";
import { CaseStarter } from "@/components/CaseStarter";

export default async function NewCase({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requireUser(["WORKER", "ADMIN"]);
  const { type } = await searchParams;
  const { locale, t } = await getT();
  return (
    <div className="wrap stack" style={{ maxWidth: 760 }}>
      <h1 className="page-title">{t.home.pick}</h1>
      <p className="muted" style={{ margin: 0 }}>{t.home.pickLead}</p>
      <CaseStarter locale={locale} direct={directUploads()} loggedIn initialType={isCaseType(type) ? type : undefined} />
    </div>
  );
}
