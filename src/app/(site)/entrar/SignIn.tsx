"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ds/Icon";
import { Button } from "@/components/ds/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

export function SignIn({ next, failed }: { next: string; failed: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(failed ? "El enlace venció o ya se usó. Pide uno nuevo." : null);
  const db = supabaseBrowser();

  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    if (!db) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Escribe un correo válido.");
    setBusy(true);
    setError(null);
    const { error } = await db.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo() } });
    setBusy(false);
    if (error) return setError(error.status === 429 ? "Pediste muchos enlaces seguidos. Espera unos minutos." : "No pudimos enviar el enlace. Inténtalo de nuevo.");
    setSent(true);
  }

  async function onGoogle() {
    if (!db) return;
    setBusy(true);
    const { error } = await db.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (error) {
      setBusy(false);
      setError("No pudimos abrir Google. Entra con tu correo.");
    }
  }

  if (!db) {
    return (
      <p className="form-error" role="alert">
        <Icon name="info" weight="fill" /> Las cuentas todavía no están activas en este entorno.
      </p>
    );
  }

  if (sent) {
    return (
      <div className="signin-sent" role="status">
        <h2 className="title-sm">Revisa tu correo</h2>
        <p>Te mandamos un enlace a <b>{email}</b>. Ábrelo en este mismo dispositivo para entrar.</p>
        <Button variant="ghost" onClick={() => setSent(false)}>Usar otro correo</Button>
      </div>
    );
  }

  return (
    <div className="signin">
      <Button variant="secondary" block onClick={onGoogle} disabled={busy}>
        Continuar con Google
      </Button>
      <p className="signin-or"><span>o con tu correo</span></p>
      <form onSubmit={onEmail} className="signin-form" noValidate>
        <label className="field">
          <span className="field-label">Correo</span>
          <input id="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
        </label>
        <Button type="submit" block disabled={busy}>{busy ? "Enviando…" : "Mandarme un enlace"}</Button>
      </form>
      {error && <p className="form-error" role="alert"><Icon name="info" weight="fill" /> {error}</p>}
      <p className="field-hint">Sin contraseñas: entras con el enlace que te llega. Al entrar aceptas los <a href="/terminos">términos</a> y el <a href="/aviso-de-privacidad">aviso de privacidad</a>.</p>
    </div>
  );
}
