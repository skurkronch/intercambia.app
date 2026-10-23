"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMounted, useStore } from "@/lib/store";
import { Icon, type IconName } from "../ds/Icon";
import { Wordmark, XMark } from "../ds/XMark";

const ITEMS: { href: string; label: string; icon: IconName; primary?: boolean }[] = [
  { href: "/descubre", label: "Descubre", icon: "compass" },
  { href: "/buscar", label: "Buscar", icon: "search" },
  { href: "/publicar", label: "Publicar", icon: "plus", primary: true },
  { href: "/mensajes", label: "Mensajes", icon: "chat" },
  { href: "/perfil", label: "Perfil", icon: "user" },
];

function useUnread() {
  const mounted = useMounted();
  const unread = useStore((s) => s.conversations.reduce((n, c) => n + c.unread, 0));
  return mounted ? unread : 0;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Phones and tablets: fixed bottom tab bar. */
export function BottomNav() {
  const pathname = usePathname();
  const unread = useUnread();
  return (
    <nav className="bottom-nav" aria-label="Principal">
      {ITEMS.map((it) => {
        const active = isActive(pathname, it.href);
        return (
          <Link key={it.href} href={it.href} className={`bn-item${active ? " is-active" : ""}${it.primary ? " is-primary" : ""}`} aria-current={active ? "page" : undefined}>
            <span className="bn-icon">
              <Icon name={it.icon} weight={active || it.primary ? "fill" : "bold"} />
              {it.href === "/mensajes" && unread > 0 && <span className="bn-dot" aria-label={`${unread} sin leer`}>{unread}</span>}
            </span>
            <span className="bn-label">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Desktop: left rail with the wordmark. */
export function SideNav() {
  const pathname = usePathname();
  const unread = useUnread();
  return (
    <nav className="side-nav" aria-label="Principal">
      <Link href="/" className="side-brand" aria-label="truXanger, inicio">
        <Wordmark size={24} />
      </Link>
      <ul>
        {ITEMS.map((it) => {
          const active = isActive(pathname, it.href);
          if (it.primary) {
            return (
              <li key={it.href} className="side-cta">
                <Link href={it.href} className="tx-btn tx-btn-primary tx-btn-block">
                  <Icon name="plus" /> Subir objeto
                </Link>
              </li>
            );
          }
          return (
            <li key={it.href}>
              <Link href={it.href} className={`side-item${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
                <Icon name={it.icon} weight={active ? "fill" : "bold"} />
                <span>{it.label}</span>
                {it.href === "/mensajes" && unread > 0 && <span className="side-count">{unread}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="side-foot">
        <Link href="/anunciate">Anúnciate</Link>
        <Link href="/terminos">Términos</Link>
        <Link href="/aviso-de-privacidad">Privacidad</Link>
      </div>
    </nav>
  );
}

/** Phones: slim top bar with the isotype. */
export function TopBar() {
  return (
    <header className="top-bar">
      <Link href="/" className="top-brand" aria-label="truXanger, inicio">
        <XMark size={28} />
        <span className="tx-wordmark" style={{ fontSize: 20 }} aria-hidden="true">
          <span>tru<span className="tx-x">X</span>anger</span>
        </span>
      </Link>
    </header>
  );
}
