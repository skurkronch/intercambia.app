import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/ds/XMark";
import { getViewer } from "@/lib/repo";
import { SignIn } from "./SignIn";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/descubre";
}

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const target = safeNext(next);
  if (await getViewer()) redirect(target);
  return (
    <div className="site-wrap auth-page">
      <div className="auth-card">
        <Wordmark size={28} layout="vertical" />
        <h1 className="title-lg">Entra para hacer trueque</h1>
        <p className="page-intro">Desliza, haz match y cierra tratos con gente cerca de ti.</p>
        <SignIn next={target} failed={Boolean(error)} />
      </div>
    </div>
  );
}
