import { getT } from "@/lib/locale";
import { requireUser } from "@/lib/session";
import { NewCaseForm } from "./NewCaseForm";

export default async function NewCase() {
  await requireUser(["WORKER", "ADMIN"]);
  const { locale, t } = await getT();
  return (
    <div className="wrap stack" style={{ maxWidth: 720 }}>
      <h1 className="page-title">{t.nav.newCase}</h1>
      <NewCaseForm locale={locale} />
    </div>
  );
}
