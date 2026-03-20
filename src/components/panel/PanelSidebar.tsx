"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

/* ─── SVG Icon Components ─── */
const icons = {
  dashboard: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  orders: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  ),
  fulfillment: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M5 17H3V6a1 1 0 0 1 1-1h9v12M9 17h6m4 0h2V12l-3-5h-4v10" />
    </svg>
  ),
  products: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 3h15l1 16H3.5z" /><path d="M9 6v3a3 3 0 0 0 6 0V6" />
    </svg>
  ),
  categories: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  inventory: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6" /><path d="M9 16h6" />
    </svg>
  ),
  customers: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  reports: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
    </svg>
  ),
  chat: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  finance: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  payment: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  shipping: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M5 17H3V6a1 1 0 0 1 1-1h9v12M9 17h6m4 0h2V12l-3-5h-4v10" />
    </svg>
  ),
  coupons: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  returns: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  automation: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  alerts: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  whatsapp: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  ),
  campaigns: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4z" />
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  templates: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
    </svg>
  ),
  quickReplies: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  agents: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  themes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2v-.7c0-.5-.2-.9-.6-1.2-.3-.3-.5-.7-.5-1.1 0-.8.7-1.5 1.5-1.5H16c2.8 0 5-2.2 5-5 0-4.7-4.5-8.5-9-8.5z" /><circle cx="8" cy="10" r="1.5" fill="currentColor" /><circle cx="12" cy="7.5" r="1.5" fill="currentColor" /><circle cx="16" cy="10" r="1.5" fill="currentColor" />
    </svg>
  ),
  guias: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><path d="M12 12v4" /><path d="M2 12h20" />
    </svg>
  ),
  aiMode: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  help: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  logout: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

/* ─── Sequoia Logo SVG (red S icon) ─── */
function SequoiaLogo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #e53e3e, #c53030)",
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path
          d="M7 4h10l-1 4H8L7 4zM6 10h12l-1 4H7L6 10zM5 16h14l-1 4H6L5 16z"
          fill="white"
          opacity="0.95"
        />
      </svg>
    </div>
  );
}

/* ─── Nav Items (icon bar) ─── */
const mainNavItems = [
  { href: "/panel", label: "Dashboard", icon: "dashboard" },
  { href: "/panel/pedidos", label: "Pedidos", icon: "orders" },
  { href: "/panel/fulfillment", label: "Fulfillment", icon: "fulfillment" },
  { href: "/panel/productos", label: "Productos", icon: "products" },
  { href: "/panel/categorias", label: "Categorias", icon: "categories" },
  { href: "/panel/inventario", label: "Inventario", icon: "inventory" },
  { href: "/panel/clientes", label: "Clientes", icon: "customers" },
  { href: "/panel/reportes", label: "Reportes", icon: "reports" },
  { href: "/panel/preguntas", label: "Preguntas", icon: "chat" },
  { href: "/panel/finanzas", label: "Finanzas", icon: "finance" },
  { href: "/panel/pagos", label: "Pagos", icon: "payment" },
  { href: "/panel/envios", label: "Envíos", icon: "shipping" },
  { href: "/panel/cupones", label: "Cupones", icon: "coupons" },
  { href: "/panel/devoluciones", label: "Devoluciones", icon: "returns" },
  { href: "/panel/automatizaciones", label: "Automaticas", icon: "automation" },
  { href: "/panel/alertas", label: "Alertas", icon: "alerts" },
];

const whatsappSubItems = [
  { href: "/panel/whatsapp", label: "Whatsapp", icon: "whatsapp", exact: true },
  { href: "/panel/whatsapp/campaigns", label: "Campanas Masivas", icon: "campaigns" },
  { href: "/panel/whatsapp/analytics", label: "Analitica", icon: "analytics" },
  { href: "/panel/whatsapp/settings", label: "Configuracion", icon: "settings" },
  { href: "#themes", label: "Temas", icon: "themes", action: "openThemes" },
  { href: "/panel/whatsapp/guias", label: "Guias de Envio", icon: "guias" },
  { href: "/panel/whatsapp/training", label: "Entrenamiento IA", icon: "aiMode" },
  { href: "/panel/whatsapp/workflows", label: "Workflows", icon: "settings" },
  { href: "#aimode", label: "Modo IA", icon: "aiMode", action: "openAiMode" },
];

/* ─── Search Result types ─── */
interface SearchResult {
  orders: Array<{ id: string; orderNumber: string; status: string; total: number; shippingName: string }>;
  customers: Array<{ id: string; name: string; email: string }>;
  products: Array<{ id: string; name: string; slug: string }>;
}

/* ─── Main Sidebar Component ─── */
export function PanelSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isWhatsApp = pathname.startsWith("/panel/whatsapp");
  const [waExpanded, setWaExpanded] = useState(isWhatsApp);
  const [hoverItem, setHoverItem] = useState<string | null>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const hoverTimeout = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    setWaExpanded(isWhatsApp);
  }, [isWhatsApp]);

  // Alert count
  useEffect(() => {
    fetch("/api/panel/alerts?unreadOnly=true")
      .then(r => r.json())
      .then(d => setAlertCount(d.unreadCount || 0))
      .catch(() => {});
  }, []);

  // Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Search debounce
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults(null); return; }
    const t = setTimeout(() => {
      fetch(`/api/panel/search?q=${encodeURIComponent(searchQuery)}`)
        .then(r => r.json())
        .then(setSearchResults)
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleLogout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    window.location.href = "/login";
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    if (href === "/panel") return pathname === "/panel";
    return pathname.startsWith(href);
  };

  const formatPrice = (n: number) => "$ " + n.toLocaleString("es-CO");

  const showTooltip = (key: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoverItem(key);
  };
  const hideTooltip = () => {
    hoverTimeout.current = setTimeout(() => setHoverItem(null), 150);
  };

  return (
    <>
      {/* ─── Icon Bar (hidden on mobile) ─── */}
      <aside className="hidden md:flex w-[60px] min-h-screen bg-neutral-900 flex-col items-center shrink-0 z-50 border-r border-neutral-800">
        {/* Logo top */}
        <div className="py-4">
          <SequoiaLogo size={36} />
        </div>

        {/* Main nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-0.5 py-2 w-full overflow-y-auto">
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <div key={item.href} className="relative w-full flex justify-center">
                <Link
                  href={item.href}
                  className={`w-[44px] h-[44px] flex items-center justify-center rounded-xl transition-all duration-150 relative ${
                    active
                      ? "bg-[#25d366]/20 text-[#25d366]"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                  onMouseEnter={() => showTooltip(item.href)}
                  onMouseLeave={hideTooltip}
                >
                  {(icons as any)[item.icon]}
                  {item.href === "/panel/alertas" && alertCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {alertCount > 9 ? "9+" : alertCount}
                    </span>
                  )}
                </Link>
                {/* Tooltip */}
                {hoverItem === item.href && !waExpanded && (
                  <div className="absolute left-[56px] top-1/2 -translate-y-1/2 bg-neutral-800 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap z-[100] shadow-lg border border-neutral-700 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}

          {/* Divider */}
          <div className="w-8 h-px bg-neutral-800 my-2" />

          {/* WhatsApp icon */}
          <div className="relative w-full flex justify-center">
            <button
              onClick={() => setWaExpanded(prev => !prev)}
              className={`w-[44px] h-[44px] flex items-center justify-center rounded-xl transition-all duration-150 ${
                isWhatsApp
                  ? "bg-[#25d366]/20 text-[#25d366]"
                  : "text-neutral-400 hover:text-[#25d366] hover:bg-neutral-800"
              }`}
              onMouseEnter={() => { showTooltip("whatsapp"); setWaExpanded(true); }}
              onMouseLeave={hideTooltip}
            >
              <svg className="w-7 h-7 text-[#25d366]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
            {hoverItem === "whatsapp" && !waExpanded && (
              <div className="absolute left-[56px] top-1/2 -translate-y-1/2 bg-neutral-800 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap z-[100] shadow-lg border border-neutral-700 pointer-events-none">
                WhatsApp
              </div>
            )}
          </div>
        </nav>

        {/* Bottom icons */}
        <div className="flex flex-col items-center gap-1 py-3 border-t border-neutral-800 w-full">
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }}
            className="w-[44px] h-[44px] flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
            onMouseEnter={() => showTooltip("search")}
            onMouseLeave={hideTooltip}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          {hoverItem === "search" && (
            <div className="absolute left-[56px] bottom-[90px] bg-neutral-800 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap z-[100] shadow-lg border border-neutral-700 pointer-events-none">
              Buscar (Ctrl+K)
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-[44px] h-[44px] flex items-center justify-center rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-all"
            onMouseEnter={() => showTooltip("logout")}
            onMouseLeave={hideTooltip}
          >
            {icons.logout}
          </button>
          {hoverItem === "logout" && (
            <div className="absolute left-[56px] bottom-[45px] bg-neutral-800 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap z-[100] shadow-lg border border-neutral-700 pointer-events-none">
              Cerrar sesion
            </div>
          )}
        </div>
      </aside>

      {/* ─── WhatsApp Submenu Panel (hidden on mobile, slides open on desktop) ─── */}
      <div
        onMouseLeave={() => setWaExpanded(false)}
        className={`hidden md:flex min-h-screen bg-neutral-900 border-r border-neutral-800 flex-col shrink-0 transition-all duration-200 overflow-hidden z-40 ${
          waExpanded ? "w-[200px] opacity-100" : "w-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 border-b border-neutral-800">
          <h2 className="text-white font-semibold text-sm flex items-center gap-2">
            <svg className="w-6 h-6 text-[#25d366]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </h2>
        </div>

        <nav className="flex-1 py-2">
          {whatsappSubItems.map((item) => {
            const active = isActive(item.href, item.exact);
            if ((item as any).action) {
              return (
                <button
                  key={item.href}
                  onClick={(e) => {
                    e.stopPropagation();
                    const action = (item as any).action;
                    setWaExpanded(false);
                    if (window.location.pathname !== "/panel/whatsapp") {
                      router.push("/panel/whatsapp");
                      setTimeout(() => window.dispatchEvent(new CustomEvent(action)), 1000);
                    } else {
                      setTimeout(() => window.dispatchEvent(new CustomEvent(action)), 50);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                >
                  <span className="text-neutral-500">
                    {(icons as any)[item.icon]}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-[#25d366]/15 text-[#25d366] border-r-2 border-[#25d366]"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <span className={active ? "text-[#25d366]" : "text-neutral-500"}>
                  {(icons as any)[item.icon]}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-neutral-800">
          <p className="text-[10px] text-[#556677] truncate">{userName}</p>
        </div>
      </div>

      {/* ─── Universal Search Modal ─── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
          <div className="fixed inset-0 bg-black/60" />
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar pedidos, clientes, productos..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-neutral-500"
              />
              <kbd className="text-[10px] text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">ESC</kbd>
            </div>

            {searchResults && (
              <div className="max-h-80 overflow-y-auto p-2">
                {searchResults.orders.length === 0 && searchResults.customers.length === 0 && searchResults.products.length === 0 && (
                  <p className="text-neutral-500 text-sm text-center py-4">Sin resultados</p>
                )}
                {searchResults.orders.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] text-neutral-500 uppercase px-2 py-1">Pedidos</p>
                    {searchResults.orders.map(o => (
                      <Link key={o.id} href={`/panel/pedidos/${o.id}`} onClick={() => setSearchOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-800 text-sm">
                        <span className="text-primary">#{o.orderNumber}</span>
                        <span className="text-neutral-400">{formatPrice(o.total)}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.customers.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] text-neutral-500 uppercase px-2 py-1">Clientes</p>
                    {searchResults.customers.map(c => (
                      <Link key={c.id} href={`/panel/clientes/${c.id}`} onClick={() => setSearchOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-800 text-sm">
                        <span className="text-white">{c.name || c.email}</span>
                        <span className="text-neutral-500 text-xs">{c.email}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.products.length > 0 && (
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase px-2 py-1">Productos</p>
                    {searchResults.products.map(p => (
                      <Link key={p.id} href={`/panel/productos/${p.id}`} onClick={() => setSearchOpen(false)}
                        className="flex items-center px-3 py-2 rounded-lg hover:bg-neutral-800 text-sm text-white">
                        {p.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
