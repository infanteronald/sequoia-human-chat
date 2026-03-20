"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Customer {
  id: string; name: string | null; email: string; phone: string | null;
  orderCount: number; totalSpent: number; createdAt: string;
}

export default function ClientesPage() {
  const [users, setUsers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("q", search);

    fetch(`/api/panel/users?${params}`)
      .then((r) => r.json())
      .then((d) => { setUsers(d.users || []); setTotal(d.total || 0); setPages(d.pages || 1); setLoading(false); });
  }, [page, search]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Clientes ({total})</h1>

      <div className="mb-4">
        <input type="text" placeholder="Buscar por nombre, email o teléfono..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none" />
      </div>

      <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400">
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Teléfono</th>
              <th className="text-center p-3">Pedidos</th>
              <th className="text-right p-3">Total gastado</th>
              <th className="text-right p-3">Registro</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-neutral-500">Cargando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-neutral-500">No hay clientes</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                <td className="p-3">
                  <Link href={`/panel/clientes/${u.id}`} className="text-primary hover:underline font-medium">
                    {u.name || "Sin nombre"}
                  </Link>
                </td>
                <td className="p-3 text-neutral-300">{u.email}</td>
                <td className="p-3 text-neutral-400">{u.phone || "—"}</td>
                <td className="p-3 text-center text-neutral-300">{u.orderCount}</td>
                <td className="p-3 text-right text-white">{formatPrice(u.totalSpent)}</td>
                <td className="p-3 text-right text-neutral-500 text-xs">{new Date(u.createdAt).toLocaleDateString("es-CO")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`px-3 py-1 rounded text-sm ${p === page ? "bg-primary text-black" : "bg-neutral-800 text-neutral-400 hover:text-white"}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
