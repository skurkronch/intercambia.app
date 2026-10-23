"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ds/Icon";
import { Button } from "@/components/ds/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

// Show Google only once the provider is set up in Supabase (Auth → Providers → Google).
const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true";

/** Supabase answers 429 both for the per-address cooldown ("after 42 seconds") and the project's hourly email cap. */
function sendErrorMessage(error: { status?: number; message: string }): string {
  if (error.status !== 429) return "No pudimos enviar el enlace. Inténtalo de nuevo.";
  const seconds = error.message.match(/(\d+)\s*second/)?.[1];
  if (seconds) return `Ya te mandamos un correo. Puedes pedir otro en ${seconds} segundos, o usa el código del correo anterior.`;
  return "Se alcanzó el límite de correos por ahora. Si ya te llegó un código, escríbelo con «Ya tengo un código»; si no, inténtalo en un rato.";
}

export function SignIn({ next, failed }: { next: string; failed: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
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
    if (error) return setError(sendErrorMessage(error));
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

  async function onCode(e: FormEvent) {
    e.preventDefault();
    if (!db) return;
    const token = code.replace(/\D/g, "");
    if (token.length < 6) return setError("Escribe el código completo.");
    setBusy(true);
    setError(null);
    const { error } = await db.auth.verifyOtp({ email: email.trim(), token, type: "email" });
    if (error) {
      setBusy(false);
      return setError("Ese código no es válido o ya venció. Pide uno nuevo.");
    }
    // The server sends people without a finished profile to /bienvenida.
    window.location.assign(next);
  }

  if (sent) {
    return (
      <div className="signin-sent" role="status">
        <h2 className="title-sm">Revisa tu correo</h2>
        <p>Te mandamos un enlace y un código a <b>{email}</b>. Abre el enlace o escribe aquí el código.</p>
        <form onSubmit={onCode} className="signin-form" noValidate>
          <label className="field">
            <span className="field-label">Código</span>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="123456"
              className="code-input"
            />
          </label>
          <Button type="submit" block disabled={busy}>{busy ? "Entrando…" : "Entrar"}</Button>
        </form>
        {error && <p className="form-error" role="alert"><Icon name="info" weight="fill" /> {error}</p>}
        <Button variant="ghost" onClick={() => { setSent(false); setCode(""); setError(null); }}>Usar otro correo</Button>
      </div>
    );
  }

  return (
    <div className="signin">
      {GOOGLE_ENABLED && (
        <>
          <Button variant="secondary" block onClick={onGoogle} disabled={busy}>
            Continuar con Google
          </Button>
          <p className="signin-or"><span>o con tu correo</span></p>
        </>
      )}
      <form onSubmit={onEmail} className="signin-form" noValidate>
        <label className="field">
          <span className="field-label">Correo</span>
          <input id="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
        </label>
        <Button type="submit" block disabled={busy}>{busy ? "Enviando…" : "Mandarme un enlace"}</Button>
      </form>
      {error && <p className="form-error" role="alert"><Icon name="info" weight="fill" /> {error}</p>}
      <Button
        variant="ghost"
        size="sm"
        className="signin-have-code"
        onClick={() => {
          if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Escribe primero el correo al que te llegó el código.");
          setError(null);
          setSent(true);
        }}
      >
        Ya tengo un código
      </Button>
      <p className="field-hint">Sin contraseñas: entras con el enlace que te llega. Al entrar aceptas los <a href="/terminos">términos</a> y el <a href="/aviso-de-privacidad">aviso de privacidad</a>.</p>
    </div>
  );
}
