import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PanelSidebar } from "@/components/panel/PanelSidebar";
import { PanelMainContent } from "@/components/panel/PanelMainContent";

export const metadata = { title: "Panel Admin — Sequoia Speed" };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex">
      <PanelSidebar userName={user.name || user.email} />
      <PanelMainContent>{children}</PanelMainContent>
    </div>
  );
}
