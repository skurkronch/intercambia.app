"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveProfile } from "@/app/actions";
import { Icon } from "@/components/ds/Icon";
import { Button, Chip } from "@/components/ds/primitives";
import { CITIES } from "@/lib/data/catalog";

const SUGGESTED = ["Vinilos", "Cámara analógica", "Bicicleta", "Consola", "Audífonos", "Libros", "Plantas", "Ropa vintage"];

export function Welcome({ next, initial }: {
  next: string;
  initial: { username: string; displayName: string; citySlug: string; neighborhood: string; bio: string; wants: string[] };
}) {
  const [username, setUsername] = useState(initial.username);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [citySlug, setCitySlug] = useState(initial.citySlug || "cdmx");
  const [neighborhood, setNeighborhood] = useState(initial.neighborhood);
  const [bio, setBio] = useState(initial.bio);
  const [wants, setWants] = useState<string[]>(initial.wants);
  const [custom, setCustom] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locState, setLocState] = useState<"idle" | "asking" | "ok" | "denied">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function toggle(w: string) {
    setWants((cur) => (cur.includes(w) ? cur.filter((x) => x !== w) : cur.length < 5 ? [...cur, w] : cur));
  }

  function addCustom() {
    const w = custom.trim();
    if (w && !wants.includes(w) && wants.length < 5) setWants([...wants, w]);
    setCustom("");
  }

  function askLocation() {
    if (!navigator.geolocation) return setLocState("denied");
    setLocState("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocState("ok");
      },
      () => setLocState("denied"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await saveProfile({ username, displayName, citySlug, neighborhood, bio, wants, location }, next);
      if (res && "error" in res) setError(res.error);
    });
  }

  return (
    <form className="welcome" onSubmit={onSubmit} noValidate>
      <label className="field">
        <span className="field-label">Tu usuario</span>
        <input id="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))} maxLength={24} autoComplete="username" placeholder="ana_vinilos" />
        <span className="field-hint">Minúsculas, números, punto o guion bajo. Lo ve quien hace trueque contigo.</span>
      </label>
      <label className="field">
        <span className="field-label">Cómo quieres que te vean</span>
        <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} autoComplete="name" placeholder="Ana R." />
      </label>
      <div className="value-row">
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Ciudad</span>
          <select id="city" value={citySlug} onChange={(e) => setCitySlug(e.target.value)} className="select">
            {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </label>
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Colonia</span>
          <input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} maxLength={60} placeholder="Roma Norte" />
        </label>
      </div>
      <div className="field">
        <span className="field-label">Distancias más precisas <span className="field-optional">opcional</span></span>
        <Button variant="secondary" size="sm" icon={locState === "ok" ? "check" : "pin"} onClick={askLocation} disabled={locState === "asking"}>
          {locState === "ok" ? "Ubicación aproximada lista" : locState === "asking" ? "Buscando…" : "Usar mi ubicación aproximada"}
        </Button>
        <span className="field-hint">
          {locState === "denied" ? "Sin permiso de ubicación: usamos el centro de tu ciudad." : "La redondeamos a 1 km y nunca mostramos tu dirección."}
        </span>
      </div>
      <div className="field">
        <span className="field-label">Qué estás buscando <span className="field-optional">hasta 5</span></span>
        <div className="chip-cloud">
          {Array.from(new Set([...SUGGESTED, ...wants])).map((w) => (
            <Chip key={w} selected={wants.includes(w)} onClick={() => toggle(w)}>{w}</Chip>
          ))}
        </div>
        <div className="add-row">
          <label htmlFor="custom" className="sr-only">Otra cosa</label>
          <input id="custom" value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} placeholder="Otra cosa…" maxLength={40} />
          <Button variant="secondary" size="sm" icon="plus" onClick={addCustom}>Agregar</Button>
        </div>
      </div>
      <label className="field">
        <span className="field-label">Sobre ti <span className="field-optional">opcional</span></span>
        <textarea id="bio" rows={2} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} placeholder="Me gustan los trueques justos y rápidos." />
      </label>
      {error && <p className="form-error" role="alert"><Icon name="info" weight="fill" /> {error}</p>}
      <Button type="submit" block disabled={pending}>{pending ? "Guardando…" : "Empezar a hacer trueque"}</Button>
    </form>
  );
}
