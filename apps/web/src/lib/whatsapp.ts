import { normalisePhone } from "@huquqi/core";

/** Platform WhatsApp number: WHATSAPP_NUMBER, else the first ADMIN_PHONES entry. */
export function whatsappNumber(): string | null {
  const raw = process.env.WHATSAPP_NUMBER || (process.env.ADMIN_PHONES ?? "").split(",")[0] || "";
  const n = raw.trim() ? normalisePhone(raw.trim()) : null;
  return n ? n.replace(/\D/g, "") : null;
}

export function whatsappLink(text: string): string | null {
  const n = whatsappNumber();
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}
