"use client";

import { usePathname } from "next/navigation";

export function PanelMainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWhatsApp = pathname.startsWith("/panel/whatsapp");

  if (isWhatsApp) {
    return (
      <main className="flex-1 overflow-hidden min-w-0">
        <div className="h-full">{children}</div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto min-w-0">
      <div className="max-w-7xl mx-auto p-6">{children}</div>
    </main>
  );
}
