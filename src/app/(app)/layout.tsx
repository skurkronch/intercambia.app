import { Moments } from "@/components/Moments";
import { BottomNav, SideNav, TopBar } from "@/components/shell/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <SideNav />
      <TopBar />
      <main className="app-main" id="contenido">
        {children}
      </main>
      <BottomNav />
      <Moments />
    </div>
  );
}
