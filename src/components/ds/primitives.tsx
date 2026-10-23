import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "spark" | "ghost";

function btnClass(variant: Variant, size?: "md" | "sm", block?: boolean, extra?: string) {
  return ["tx-btn", `tx-btn-${variant}`, size === "sm" && "tx-btn-sm", block && "tx-btn-block", extra].filter(Boolean).join(" ");
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: "md" | "sm"; block?: boolean; icon?: IconName };

export function Button({ variant = "primary", size, block, icon, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={btnClass(variant, size, block, className)} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: "md" | "sm"; block?: boolean; icon?: IconName };

export function ButtonLink({ variant = "primary", size, block, icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={btnClass(variant, size, block, className)} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </Link>
  );
}

export type ChipTone = "neutral" | "violet" | "want" | "save" | "pass" | "surface" | "photo";

export function Chip({
  tone = "neutral", icon, selected, onClick, className, children, href,
}: { tone?: ChipTone; icon?: IconName; selected?: boolean; onClick?: () => void; className?: string; children: ReactNode; href?: string }) {
  const cls = ["tx-chip", tone !== "neutral" && `tx-chip-${tone}`, selected && "tx-chip-selected", className].filter(Boolean).join(" ");
  const kids = (
    <>
      {icon && <Icon name={icon} />}
      {children}
    </>
  );
  if (href) return <Link href={href} className={cls}>{kids}</Link>;
  if (onClick) return <button type="button" className={cls} onClick={onClick} aria-pressed={!!selected}>{kids}</button>;
  return <span className={cls}>{kids}</span>;
}

const STAMP = { want: "Lo quiero", pass: "Paso", save: "Guardar" } as const;

export function Stamp({ action, children }: { action: keyof typeof STAMP; children?: ReactNode }) {
  return <span className={`tx-stamp tx-stamp-${action}`}>{children ?? STAMP[action]}</span>;
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const letters = name.split(/\s+/).map((p) => p.charAt(0)).join("").slice(0, 2).toUpperCase();
  return (
    <span className="tx-avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }} aria-hidden="true">
      {letters}
    </span>
  );
}
