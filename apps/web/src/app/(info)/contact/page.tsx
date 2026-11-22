import { getT } from "@/lib/locale";
import { ContactForm } from "@/components/ContactForm";

export default async function Contact() {
  const { locale, t } = await getT();
  return (
    <div className="wrap stack narrow">
      <h1 className="page-title">{t.info.contact}</h1>
      <p className="muted" style={{ margin: 0 }}>{t.info.contactLead}</p>
      <ContactForm locale={locale} />
    </div>
  );
}
