import pool from "@/lib/sequoia-chat-db";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function FAQPage() {
  let articles: any[] = [];
  try {
    const res = await pool.query(
      "SELECT id, title, content, category FROM knowledge_base WHERE enabled = true AND category IN ('FAQ', 'Politicas', 'General', 'Productos', 'Envios', 'Pagos') ORDER BY category, title"
    );
    articles = res.rows;
  } catch {}

  const categories = [...new Set(articles.map(a => a.category))];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif", color: "#e0e0e0", background: "#111", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#25d366", marginBottom: 8 }}>Preguntas Frecuentes</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>Sequoia Speed — Equipos de proteccion para motociclistas</p>

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#25d366", marginBottom: 16, borderBottom: "1px solid #333", paddingBottom: 8 }}>{cat}</h2>
          {articles.filter(a => a.category === cat).map(a => (
            <details key={a.id} style={{ marginBottom: 8, background: "#1a1a1a", borderRadius: 8, border: "1px solid #333" }}>
              <summary style={{ padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#fff" }}>{a.title}</summary>
              <div style={{ padding: "0 16px 16px", fontSize: 13, lineHeight: 1.6, color: "#aaa", whiteSpace: "pre-wrap" }}>{a.content}</div>
            </details>
          ))}
        </div>
      ))}

      {articles.length === 0 && (
        <p style={{ textAlign: "center", color: "#666", padding: 40 }}>No hay preguntas frecuentes disponibles</p>
      )}

      <div style={{ textAlign: "center", marginTop: 40, paddingTop: 20, borderTop: "1px solid #333" }}>
        <p style={{ color: "#666", fontSize: 12 }}>No encontraste lo que buscabas?</p>
        <a href="https://wa.me/573213260357" style={{ display: "inline-block", marginTop: 8, padding: "10px 24px", background: "#25d366", color: "#fff", borderRadius: 20, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Escribenos por WhatsApp</a>
      </div>
    </div>
  );
}
