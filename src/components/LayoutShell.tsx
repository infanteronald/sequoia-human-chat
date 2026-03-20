"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CartProvider } from "@/lib/cart-context";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPanel = pathname.startsWith("/panel");

  if (isPanel) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </CartProvider>
  );
}
