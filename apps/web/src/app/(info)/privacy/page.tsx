import { getT } from "@/lib/locale";

export default async function Privacy() {
  const { t } = await getT();
  return (
    <div className="wrap stack narrow">
      <h1 className="page-title">{t.info.privacy}</h1>
      {t.info.privacyBody.map((p) => <p key={p} style={{ margin: 0 }}>{p}</p>)}
    </div>
  );
}
