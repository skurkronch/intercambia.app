import { SiteFooter, SiteHeader } from "@/components/shell/Site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <SiteHeader />
      <main id="contenido">{children}</main>
      <SiteFooter />
    </div>
  );
}
