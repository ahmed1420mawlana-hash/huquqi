import Link from "next/link";
import { getT } from "@/lib/locale";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <div className="wrap stack">
      <h1 className="page-title">{t.common.notFound}</h1>
      <p><Link href="/">{t.nav.home}</Link></p>
    </div>
  );
}
