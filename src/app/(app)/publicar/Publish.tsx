"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { createListing } from "@/app/actions";
import { Confetti } from "@/components/Confetti";
import { Icon } from "@/components/ds/Icon";
import { Button, ButtonLink, Chip } from "@/components/ds/primitives";
import { CATEGORIES, CONDITIONS } from "@/lib/data/catalog";
import { supabaseBrowser } from "@/lib/supabase/client";
import { PHOTO_BUCKET } from "@/lib/supabase/env";
import type { CategorySlug, Condition, Currency } from "@/lib/types";

const MAX_PHOTOS = 6;
const MAX_WANTS = 5;
const SUGGESTED_WANTS = ["Vinilos", "Cámara analógica", "Sintetizador", "Bicicleta", "Consola", "Audífonos", "Libros", "Plantas"];
const STEPS = ["Lo visual", "El estado", "Lo que quieres"];

interface PickedPhoto {
  blob: Blob;
  preview: string;
}

/** Downscale and re-encode in the browser: smaller uploads and no EXIF location data. */
async function shrink(file: File, max = 1400): Promise<PickedPhoto> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.82));
  return { blob, preview: URL.createObjectURL(blob) };
}

export function Publish({ defaultPlace }: { defaultPlace: string }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ slug: string; title: string } | null>(null);

  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategorySlug | null>(null);
  const [condition, setCondition] = useState<Condition | null>(null);
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState<Currency>("MXN");
  const [wants, setWants] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [openToAnything, setOpenToAnything] = useState(false);
  const [acceptsCash, setAcceptsCash] = useState(false);
  const [place, setPlace] = useState(defaultPlace);

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const room = MAX_PHOTOS - photos.length;
      const picked = await Promise.all(Array.from(files).slice(0, room).map((f) => shrink(f)));
      setPhotos((p) => [...p, ...picked]);
      setError(null);
    } catch {
      setError("No pudimos leer esa foto. Prueba con otra en JPG o PNG.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function toggleWant(w: string) {
    setWants((cur) => (cur.includes(w) ? cur.filter((x) => x !== w) : cur.length < MAX_WANTS ? [...cur, w] : cur));
  }

  function addCustom() {
    const w = custom.trim();
    if (!w) return;
    if (wants.length >= MAX_WANTS) return setError(`Puedes elegir hasta ${MAX_WANTS} cosas.`);
    if (!wants.includes(w)) setWants([...wants, w]);
    setCustom("");
    setError(null);
  }

  function validate(s: number): string | null {
    if (s === 0) {
      if (!photos.length) return "Sube al menos una foto: es lo primero que ven.";
      if (title.trim().length < 3) return "Escribe un título de al menos 3 letras.";
    }
    if (s === 1) {
      if (!category) return "Elige una categoría.";
      if (!condition) return "Elige el estado del objeto.";
    }
    if (s === 2 && !openToAnything && !wants.length) return "Elige al menos una cosa o marca «Abierto a todo».";
    return null;
  }

  async function next(e: FormEvent) {
    e.preventDefault();
    const problem = validate(step);
    if (problem) return setError(problem);
    setError(null);
    if (step < 2) return setStep(step + 1);

    const db = supabaseBrowser();
    if (!db) return setError("Publicar todavía no está activo en este entorno.");
    setBusy(true);
    try {
      const { data } = await db.auth.getUser();
      if (!data.user) return router.push("/entrar?next=/publicar");

      // Photos go to <my id>/<listing id>/, the only folder storage lets me write to.
      const id = crypto.randomUUID();
      const paths: string[] = [];
      for (const [i, p] of photos.entries()) {
        const path = `${data.user.id}/${id}/${i}.jpg`;
        const { error: upErr } = await db.storage.from(PHOTO_BUCKET).upload(path, p.blob, { contentType: "image/jpeg", upsert: false });
        if (upErr) {
          if (paths.length) await db.storage.from(PHOTO_BUCKET).remove(paths);
          return setError("No pudimos subir tus fotos. Revisa tu conexión e inténtalo de nuevo.");
        }
        paths.push(path);
      }

      const res = await createListing({
        id,
        title,
        description,
        category: category!,
        condition: condition!,
        value: value ? Number(value) : null,
        currency,
        photos: paths,
        wants,
        openToAnything,
        acceptsCash,
        neighborhood: place.split(",")[0]?.trim() ?? "",
      });
      if ("error" in res) {
        await db.storage.from(PHOTO_BUCKET).remove(paths);
        return setError(res.error);
      }
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
      setDone({ slug: res.slug, title: title.trim() });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="publish-done">
        <Confetti />
        <p className="overline">Publicado</p>
        <h1 className="display-lg">¡Tu objeto está en vivo!</h1>
        <p className="publish-done-body">Tu {done.title} ya aparece en Descubre para la gente cerca de ti.</p>
        <div className="publish-done-actions">
          <ButtonLink href={`/objeto/${done.slug}`} variant="spark">Ver publicación</ButtonLink>
          <ButtonLink href="/descubre" variant="ghost">Seguir explorando</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form className="publish" onSubmit={next} noValidate>
      <header className="publish-head">
        <div className="publish-top">
          {step > 0 ? (
            <button type="button" className="icon-btn" onClick={() => { setStep(step - 1); setError(null); }} aria-label="Paso anterior">
              <Icon name="back" />
            </button>
          ) : (
            <Link href="/descubre" className="icon-btn" aria-label="Salir"><Icon name="x" /></Link>
          )}
          <p className="publish-step">Paso {step + 1} de 3 · {STEPS[step]}</p>
        </div>
        <div className="publish-progress" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1} aria-label="Progreso">
          {STEPS.map((s, i) => <span key={s} className={i <= step ? "is-on" : undefined} />)}
        </div>
      </header>

      {step === 0 && (
        <fieldset className="publish-step-body">
          <legend className="title-lg">¿Qué vas a cambiar?</legend>
          <div className="photo-grid">
            {photos.map((p, i) => (
              <div key={i} className="photo-slot is-filled">
                <Image src={p.preview} alt={`Foto ${i + 1}`} fill unoptimized style={{ objectFit: "cover" }} />
                {i === 0 && <span className="photo-cover">Portada</span>}
                <button type="button" className="photo-remove" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} aria-label={`Quitar foto ${i + 1}`}>
                  <Icon name="x" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button type="button" className={`photo-slot photo-add${photos.length === 0 ? " is-first" : ""}`} onClick={() => fileInput.current?.click()} disabled={busy}>
                {photos.length === 0 && <span className="photo-guide" aria-hidden="true" />}
                <Icon name="camera" />
                <span>{busy ? "Procesando…" : photos.length === 0 ? "Foto de portada" : "Agregar"}</span>
              </button>
            )}
          </div>
          <p className="field-hint">Hasta 6 fotos. Centra el objeto, con luz natural y fondo liso.</p>
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(e.target.files)} id="photos" />

          <label className="field">
            <span className="field-label">Título</span>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Bicicleta urbana rodada 26" />
          </label>
          <label className="field">
            <span className="field-label">Descripción <span className="field-optional">opcional</span></span>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1000} placeholder="Marca, modelo, detalles de uso…" />
          </label>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="publish-step-body">
          <legend className="title-lg">¿Cómo está?</legend>
          <div className="field">
            <span className="field-label" id="cat-label">Categoría</span>
            <div className="big-chips" role="radiogroup" aria-labelledby="cat-label">
              {CATEGORIES.map((c) => (
                <button key={c.slug} type="button" role="radio" aria-checked={category === c.slug} className={`big-chip${category === c.slug ? " is-on" : ""}`} onClick={() => setCategory(c.slug)}>
                  <Icon name={c.slug} weight={category === c.slug ? "fill" : "bold"} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="field-label" id="cond-label">Estado</span>
            <div className="big-chips big-chips-row" role="radiogroup" aria-labelledby="cond-label">
              {CONDITIONS.map((c) => (
                <button key={c.value} type="button" role="radio" aria-checked={condition === c.value} className={`big-chip${condition === c.value ? " is-on" : ""}`} onClick={() => setCondition(c.value)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="value">Valor de referencia <span className="field-optional">opcional</span></label>
            <div className="value-row">
              <input id="value" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))} placeholder="0" />
              <div className="seg" role="radiogroup" aria-label="Moneda">
                {(["MXN", "USD"] as const).map((c) => (
                  <button key={c} type="button" role="radio" aria-checked={currency === c} className={currency === c ? "is-on" : undefined} onClick={() => setCurrency(c)}>{c}</button>
                ))}
              </div>
            </div>
            <p className="field-hint">Ayuda a emparejar trueques parejos. Nadie paga nada.</p>
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="publish-step-body">
          <legend className="title-lg">¿Qué te gustaría a cambio?</legend>
          <Chip icon={openToAnything ? "check" : "swap"} selected={openToAnything} onClick={() => setOpenToAnything(!openToAnything)}>
            Abierto a todo
          </Chip>
          {!openToAnything && (
            <>
              <div className="chip-cloud" aria-label="Sugerencias">
                {Array.from(new Set([...SUGGESTED_WANTS, ...wants])).map((w) => (
                  <Chip key={w} selected={wants.includes(w)} onClick={() => toggleWant(w)}>{w}</Chip>
                ))}
              </div>
              <div className="add-row">
                <label htmlFor="custom" className="sr-only">Otra cosa</label>
                <input id="custom" value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} placeholder="Otra cosa…" maxLength={40} />
                <Button variant="secondary" size="sm" icon="plus" onClick={addCustom}>Agregar</Button>
              </div>
              <p className="field-hint">{wants.length}/{MAX_WANTS} elegidas.</p>
            </>
          )}
          <label className="check">
            <input type="checkbox" id="cash" checked={acceptsCash} onChange={(e) => setAcceptsCash(e.target.checked)} />
            Acepto también una diferencia en efectivo
          </label>
          <label className="field">
            <span className="field-label">Dónde lo entregas</span>
            <input id="place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Colonia, ciudad" />
            <span className="field-hint">Solo mostramos la colonia, nunca tu dirección.</span>
          </label>
        </fieldset>
      )}

      {error && (
        <p className="form-error" role="alert"><Icon name="info" weight="fill" /> {error}</p>
      )}

      <div className="publish-foot">
        <Button type="submit" block disabled={busy}>{step < 2 ? "Siguiente" : busy ? "Publicando…" : "Publicar"}</Button>
      </div>
    </form>
  );
}
