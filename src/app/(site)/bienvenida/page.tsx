import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/repo";
import { Welcome } from "./Welcome";

export const metadata: Metadata = { title: "Bienvenida", robots: { index: false } };

export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: nextParam } = await searchParams;
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/descubre";
  const viewer = await getViewer();
  if (!viewer) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  const p = viewer.profile;
  const suggested = (viewer.email?.split("@")[0] ?? "").toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 24);

  return (
    <div className="site-wrap auth-page">
      <div className="auth-card auth-card-wide">
        <p className="overline">Bienvenida a truXanger</p>
        <h1 className="title-lg">Cuéntanos de ti</h1>
        <p className="page-intro">Con esto calculamos distancias y te mostramos primero lo que buscas.</p>
        <Welcome
          next={next}
          initial={{ username: p.username || suggested, displayName: p.displayName === "Alguien" ? "" : p.displayName, citySlug: p.citySlug, neighborhood: p.neighborhood, bio: p.bio, wants: p.wants }}
        />
      </div>
    </div>
  );
}
