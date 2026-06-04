import type { ReactNode } from "react";
import { PintorProvider } from "@/lib/pintor-store";
import BottomNav from "@/components/BottomNav";
import MockStatusBar from "@/components/MockStatusBar"; // [MOCKUP DESKTOP] remover ao publicar

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PintorProvider>
      <div className="pintor-app">
        <MockStatusBar />{/* [MOCKUP DESKTOP] some no mobile via CSS */}
        <div className="pintor-scroll">{children}</div>
        <BottomNav />
      </div>
    </PintorProvider>
  );
}
