"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

/* ─── Sequoia Logo ─── */
function SequoiaLogo() {
  return (
    <div
      className="flex items-center justify-center rounded-lg"
      style={{ width: 28, height: 28, background: "linear-gradient(135deg, #e53e3e, #c53030)" }}
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <path d="M7 4h10l-1 4H8L7 4zM6 10h12l-1 4H7L6 10zM5 16h14l-1 4H6L5 16z" fill="white" opacity="0.95" />
      </svg>
    </div>
  );
}

/* ─── Chevron for collapsible sections ─── */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-200 text-neutral-500 ${open ? "rotate-90" : ""}`}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

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
  const [alertCount, setAlertCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    whatsapp: pathname.startsWith("/panel/whatsapp"),
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Auto-expand WhatsApp section when on WA pages
  useEffect(() => {
    if (pathname.startsWith("/panel/whatsapp")) {
      setOpenSections(prev => ({ ...prev, whatsapp: true }));
    }
  }, [pathname]);

  // Alert count
  useEffect(() => {
    fetch("/api/panel/alerts?unreadOnly=true")
      .then(r => r.json())
      .then(d => setAlertCount(d.unreadCount || 0))
      .catch(() => {});
  }, []);

  // Ctrl+K shortcut
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

  /* ─── Sidebar mobile toggle ─── */
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-[60] bg-neutral-800 p-2 rounded-lg text-neutral-300"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[70] bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-[80] md:z-40
        w-[240px] bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0
        transition-transform duration-200 md:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Header: Logo + Store Name + Search */}
        <div className="px-3 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5 mb-3">
            <SequoiaLogo />
            <div className="flex-1 min-w-0">
              <h1 className="text-white text-[13px] font-semibold truncate">Sequoia Speed</h1>
            </div>
            {/* Mobile close */}
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-neutral-400 hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          {/* Search bar */}
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }}
            className="w-full flex items-center gap-2 px-2.5 py-[6px] rounded-lg bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/50 text-neutral-500 text-xs transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <span className="flex-1 text-left">Buscar...</span>
            <kbd className="text-[10px] text-neutral-600 bg-neutral-700/50 px-1 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>

        {/* ─── Navigation ─── */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin">

          {/* Inicio */}
          <NavItem href="/panel" label="Inicio" icon={<IconHome />} active={isActive("/panel", true)} onClick={() => setMobileOpen(false)} />

          {/* ── Pedidos Section ── */}
          <SectionLabel>Pedidos</SectionLabel>
          <NavItem href="/panel/pedidos" label="Pedidos" icon={<IconOrders />} active={isActive("/panel/pedidos")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/fulfillment" label="Despachos" icon={<IconFulfillment />} active={isActive("/panel/fulfillment")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/envios" label="Envíos" icon={<IconShipping />} active={isActive("/panel/envios")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/devoluciones" label="Devoluciones" icon={<IconReturns />} active={isActive("/panel/devoluciones")} onClick={() => setMobileOpen(false)} />

          {/* ── Productos Section ── */}
          <SectionLabel>Productos</SectionLabel>
          <NavItem href="/panel/productos" label="Productos" icon={<IconProducts />} active={isActive("/panel/productos")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/categorias" label="Categorías" icon={<IconCategories />} active={isActive("/panel/categorias")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/inventario" label="Inventario" icon={<IconInventory />} active={isActive("/panel/inventario")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/cupones" label="Descuentos" icon={<IconCoupons />} active={isActive("/panel/cupones")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/gift-cards" label="Tarjetas de regalo" icon={<IconGiftCard />} active={isActive("/panel/gift-cards")} onClick={() => setMobileOpen(false)} />

          {/* ── Clientes ── */}
          <SectionLabel>Clientes</SectionLabel>
          <NavItem href="/panel/clientes" label="Clientes" icon={<IconCustomers />} active={isActive("/panel/clientes")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/clientes/segmentos" label="Segmentos" icon={<IconSegments />} active={isActive("/panel/clientes/segmentos")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/preguntas" label="Preguntas" icon={<IconChat />} active={isActive("/panel/preguntas")} onClick={() => setMobileOpen(false)} />

          {/* ── Finanzas ── */}
          <SectionLabel>Finanzas</SectionLabel>
          <NavItem href="/panel/finanzas" label="Finanzas" icon={<IconFinance />} active={isActive("/panel/finanzas")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/pagos" label="Pagos" icon={<IconPayment />} active={isActive("/panel/pagos")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/reportes" label="Analítica" icon={<IconReports />} active={isActive("/panel/reportes")} onClick={() => setMobileOpen(false)} />

          {/* ── Marketing ── */}
          <SectionLabel>Marketing</SectionLabel>
          <NavItem href="/panel/marketing" label="Campañas" icon={<IconMarketing />} active={isActive("/panel/marketing")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/carritos-abandonados" label="Carritos abandonados" icon={<IconCart />} active={isActive("/panel/carritos-abandonados")} onClick={() => setMobileOpen(false)} />

          {/* ── Contenido ── */}
          <SectionLabel>Contenido</SectionLabel>
          <NavItem href="/panel/contenido" label="Blog" icon={<IconBlog />} active={isActive("/panel/contenido")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/seo" label="SEO" icon={<IconSEO />} active={isActive("/panel/seo")} onClick={() => setMobileOpen(false)} />

          {/* ── Automatización ── */}
          <SectionLabel>Automatización</SectionLabel>
          <NavItem href="/panel/automatizaciones" label="Reglas" icon={<IconAutomation />} active={isActive("/panel/automatizaciones")} onClick={() => setMobileOpen(false)} />
          <NavItem href="/panel/alertas" label="Alertas" icon={<IconAlerts />} active={isActive("/panel/alertas")} onClick={() => setMobileOpen(false)}
            badge={alertCount > 0 ? (alertCount > 9 ? "9+" : String(alertCount)) : undefined}
          />

          {/* ── WhatsApp (collapsible) ── */}
          <SectionLabel>Canales de venta</SectionLabel>
          <button
            onClick={() => toggleSection("whatsapp")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-colors mb-0.5 ${
              pathname.startsWith("/panel/whatsapp")
                ? "text-[#25d366]"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
            }`}
          >
            <IconWhatsApp />
            <span className="flex-1 text-left font-medium">WhatsApp</span>
            <Chevron open={openSections.whatsapp || false} />
          </button>

          {openSections.whatsapp && (
            <div className="ml-3 pl-3 border-l border-neutral-800 mb-1">
              <SubNavItem href="/panel/whatsapp" label="Chat en vivo" active={isActive("/panel/whatsapp", true)} onClick={() => setMobileOpen(false)} />
              <SubNavItem href="/panel/whatsapp/campaigns" label="Campañas masivas" active={isActive("/panel/whatsapp/campaigns")} onClick={() => setMobileOpen(false)} />
              <SubNavItem href="/panel/whatsapp/workflows" label="Workflows" active={isActive("/panel/whatsapp/workflows")} onClick={() => setMobileOpen(false)} />
              <SubNavItem href="/panel/whatsapp/training" label="Entrenamiento IA" active={isActive("/panel/whatsapp/training")} onClick={() => setMobileOpen(false)} />
              <SubNavItem href="/panel/whatsapp/analytics" label="Analítica" active={isActive("/panel/whatsapp/analytics")} onClick={() => setMobileOpen(false)} />
              <SubNavItem href="/panel/whatsapp/guias" label="Guías de envío" active={isActive("/panel/whatsapp/guias")} onClick={() => setMobileOpen(false)} />
              <SubNavItem href="/panel/whatsapp/settings" label="Configuración" active={isActive("/panel/whatsapp/settings")} onClick={() => setMobileOpen(false)} />
            </div>
          )}
        </nav>

        {/* ─── Bottom: Settings + User ─── */}
        <div className="border-t border-neutral-800 px-2 py-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] text-neutral-400 hover:text-red-400 hover:bg-neutral-800/60 transition-colors"
          >
            <IconLogout />
            <span>Cerrar sesión</span>
          </button>
          <div className="px-2.5 pt-2 pb-1">
            <p className="text-[11px] text-neutral-600 truncate">{userName}</p>
          </div>
        </div>
      </aside>

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

/* ─── Reusable Nav Components ─── */

function NavItem({ href, label, icon, active, badge, onClick }: {
  href: string; label: string; icon: React.ReactNode; active: boolean; badge?: string; onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-colors mb-0.5 ${
        active
          ? "bg-neutral-800 text-white font-medium"
          : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
      }`}
    >
      <span className={active ? "text-white" : "text-neutral-500"}>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {badge}
        </span>
      )}
    </Link>
  );
}

function SubNavItem({ href, label, active, onClick }: {
  href: string; label: string; active: boolean; onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-2.5 py-[6px] rounded-md text-[12.5px] transition-colors mb-0.5 ${
        active
          ? "text-[#25d366] bg-[#25d366]/10 font-medium"
          : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/40"
      }`}
    >
      {label}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider px-2.5 pt-4 pb-1.5">
      {children}
    </p>
  );
}

/* ─── Icon Components (18x18, consistent) ─── */

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconOrders() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  );
}

function IconFulfillment() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconShipping() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="7.5 4.21 12 6.81 16.5 4.21" /><polyline points="7.5 19.79 7.5 14.6 3 12" /><polyline points="21 12 16.5 14.6 16.5 19.79" />
    </svg>
  );
}

function IconReturns() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

function IconProducts() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconCategories() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconInventory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6" /><path d="M9 16h6" />
    </svg>
  );
}

function IconCoupons() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function IconCustomers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconFinance() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IconPayment() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function IconReports() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
    </svg>
  );
}

function IconAutomation() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconAlerts() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#25d366]">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function IconGiftCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13" /><path d="M3 12h18" /><path d="M12 8c-2-3-6-3-6 0s4 3 6 0" /><path d="M12 8c2-3 6-3 6 0s-4 3-6 0" />
    </svg>
  );
}

function IconSegments() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 10 10" /><path d="M12 2v10l7.07 7.07" />
    </svg>
  );
}

function IconMarketing() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4z" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconBlog() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function IconSEO() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
