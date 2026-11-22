import { getT } from "@/lib/locale";
import { ContactForm } from "@/components/ContactForm";

export default async function Feedback() {
  const { locale, t } = await getT();
  return (
    <div className="wrap stack narrow">
      <h1 className="page-title">{t.info.feedback}</h1>
      <p className="muted" style={{ margin: 0 }}>{t.info.feedbackLead}</p>
      <ContactForm locale={locale} feedback />
    </div>
  );
}
