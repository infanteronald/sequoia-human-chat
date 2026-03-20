import Link from "next/link";

const mainCategories = [
  { name: "Chaquetas", slug: "chaquetas" },
  { name: "Cascos", slug: "cascos" },
  { name: "Guantes", slug: "guantes-para-moto-impermeables-cuero-o-tela-bogota" },
  { name: "Impermeables", slug: "impermeables" },
  { name: "Botas", slug: "botas" },
  { name: "Indumentaria", slug: "dotaciones-mensajeros-motorizados" },
];

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="font-heading text-7xl text-primary mb-4">404</h1>
      <h2 className="font-heading text-3xl mb-4">PÁGINA NO ENCONTRADA</h2>
      <p className="text-neutral-400 mb-8 max-w-md mx-auto">
        La página que buscas ya no existe o fue movida. Usa el buscador o navega
        por nuestras categorías.
      </p>

      {/* Search */}
      <form action="/buscar" method="get" className="max-w-md mx-auto mb-12">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            placeholder="Buscar productos..."
            className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Categories */}
      <h3 className="font-heading text-2xl mb-6">EXPLORAR CATEGORÍAS</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {mainCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categoria/${cat.slug}`}
            className="bg-surface hover:bg-surface-light rounded-xl p-4 transition border border-neutral-800 hover:border-primary/50"
          >
            <span className="text-sm font-medium text-neutral-300 hover:text-white">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="inline-block px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg transition text-sm uppercase tracking-wider"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
