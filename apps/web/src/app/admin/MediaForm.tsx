"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { localNum, messages, type Locale } from "@huquqi/core";
import { MEDIA_ACCEPT, fileType } from "@/lib/documents";
import { registerMedia, uploadMedia } from "./media-actions";

export function MediaForm({ locale, direct }: { locale: Locale; direct: boolean }) {
  const t = messages[locale];
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const files = [...((form.elements.namedItem("file") as HTMLInputElement).files ?? [])];
    const caption = (form.elements.namedItem("caption") as HTMLInputElement).value;
    if (!files.length) return;
    setPending(true);
    let failed = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setMsg({ ok: true, text: t.cases.uploading(localNum(i + 1, locale), localNum(files.length, locale)) });
      try {
        if (direct) {
          const safe = file.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-80) || "media";
          const blob = await upload(`media/${safe}`, file, {
            access: "private", handleUploadUrl: "/api/upload-media",
            contentType: fileType(file.name, file.type) || undefined, multipart: file.size > 8 * 1024 * 1024,
          });
          if ((await registerMedia(blob.pathname, caption))?.error) failed++;
        } else {
          const fd = new FormData();
          fd.set("file", file);
          fd.set("caption", caption);
          if ((await uploadMedia(undefined, fd))?.error) failed++;
        }
      } catch {
        failed++;
      }
    }
    setPending(false);
    setMsg(failed ? { ok: false, text: t.gallery.failed } : { ok: true, text: t.gallery.done });
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="stack" style={{ gap: 10 }}>
      <div className="row2">
        <label className="f" htmlFor="media-file">
          {t.gallery.file}
          <span className="hint">{t.gallery.hint}</span>
          <input id="media-file" name="file" type="file" multiple accept={MEDIA_ACCEPT} required />
        </label>
        <label className="f" htmlFor="media-caption">{t.gallery.caption}<input id="media-caption" name="caption" type="text" maxLength={200} /></label>
      </div>
      {msg && <p className={msg.ok ? "hint num" : "err"} role={msg.ok ? "status" : "alert"} style={{ margin: 0 }}>{msg.text}</p>}
      <div><button className="btn small" disabled={pending}>{t.gallery.upload}</button></div>
    </form>
  );
}
