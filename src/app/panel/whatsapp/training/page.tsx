"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface UnknownQuestion { question: string; session_id: string; nombre: string; fecha_creacion: string; }
interface Correction { customer_question: string; ai_suggestion: string; final_message: string; agent_name: string; created_at: string; }
interface TopTopic { topic: string; count: string; }

export default function TrainingPage() {
  const [unknowns, setUnknowns] = useState<UnknownQuestion[]>([]);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [topics, setTopics] = useState<TopTopic[]>([]);
  const [period, setPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [teachMode, setTeachMode] = useState<string | null>(null);
  const [teachAnswer, setTeachAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sequoia-chat/training?period=${period}`);
      const data = await res.json();
      setUnknowns(data.unknownQuestions || []);
      setCorrections(data.corrections || []);
      setTopics(data.topTopics || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [period]);

  const teachBot = async (question: string, answer: string) => {
    setSaving(true);
    try {
      // Save to knowledge base as a manual Q&A entry
      await fetch("/api/sequoia-chat/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `FAQ: ${question.substring(0, 80)}`,
          content: `Pregunta: ${question}\nRespuesta: ${answer}`,
          category: "FAQ",
        }),
      });
      setTeachMode(null);
      setTeachAnswer("");
    } catch {} finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Entrenamiento IA</h1>
          <p className="text-sm text-neutral-500 mt-1">Ensenale al bot lo que no sabe</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-800/50 rounded-lg p-0.5">
            {[{ key: "7d", label: "7 dias" }, { key: "30d", label: "30 dias" }].map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${period === p.key ? "bg-neutral-700 text-white" : "text-neutral-500"}`}
              >{p.label}</button>
            ))}
          </div>
          <Link href="/panel/whatsapp" className="text-sm text-neutral-500 hover:text-white transition">Volver al chat</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{unknowns.length}</p>
          <p className="text-xs text-neutral-500 mt-1">Preguntas sin respuesta</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{corrections.length}</p>
          <p className="text-xs text-neutral-500 mt-1">Correcciones de asesores</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{topics.length}</p>
          <p className="text-xs text-neutral-500 mt-1">Temas detectados</p>
        </div>
      </div>

      {/* Unknown Questions - THE MAIN FEATURE */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-6">
        <h3 className="text-white font-medium mb-1">Preguntas que el bot no supo responder</h3>
        <p className="text-xs text-neutral-500 mb-4">Ensenale la respuesta correcta para que no vuelva a fallar</p>
        {unknowns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-green-400 text-lg font-medium">El bot respondio todo correctamente</p>
            <p className="text-xs text-neutral-600 mt-1">No hay preguntas sin respuesta en este periodo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unknowns.map((q, i) => (
              <div key={i} className="bg-neutral-800/60 border border-neutral-700 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">&ldquo;{q.question}&rdquo;</p>
                    <p className="text-[10px] text-neutral-600 mt-1">{q.nombre} | {new Date(q.fecha_creacion).toLocaleDateString("es-CO")}</p>
                  </div>
                  {teachMode === q.question ? (
                    <div className="flex-1">
                      <textarea value={teachAnswer} onChange={e => setTeachAnswer(e.target.value)} rows={3} placeholder="Escribe la respuesta correcta..."
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-white resize-y focus:outline-none focus:border-green-500" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => teachBot(q.question, teachAnswer)} disabled={!teachAnswer.trim() || saving}
                          className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg disabled:opacity-50">
                          {saving ? "Guardando..." : "Ensenar al bot"}
                        </button>
                        <button onClick={() => { setTeachMode(null); setTeachAnswer(""); }}
                          className="px-3 py-1.5 bg-neutral-700 text-white text-xs rounded-lg">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setTeachMode(q.question); setTeachAnswer(""); }}
                      className="px-3 py-1.5 bg-green-900/50 hover:bg-green-900/80 text-green-400 text-xs rounded-lg border border-green-800/50 transition shrink-0">
                      Ensenar respuesta
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Topics */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-6">
        <h3 className="text-white font-medium mb-4">Temas mas preguntados</h3>
        <div className="space-y-2">
          {topics.map((t, i) => {
            const maxCount = parseInt(topics[0]?.count || "1");
            const pct = (parseInt(t.count) / maxCount) * 100;
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-neutral-400 w-24 truncate">{t.topic}</span>
                <div className="flex-1 h-3 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-neutral-500 w-12 text-right">{parseInt(t.count).toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corrections */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <h3 className="text-white font-medium mb-1">Correcciones de asesores</h3>
        <p className="text-xs text-neutral-500 mb-4">Lo que la IA sugirio vs lo que el asesor envio</p>
        {corrections.length === 0 ? (
          <p className="text-neutral-600 text-sm text-center py-6">Sin correcciones en este periodo</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {corrections.map((c, i) => (
              <div key={i} className="bg-neutral-800/40 border border-neutral-700/50 rounded-lg p-3">
                <p className="text-[10px] text-neutral-600 mb-2">{c.agent_name} | {new Date(c.created_at).toLocaleDateString("es-CO")}</p>
                <p className="text-xs text-neutral-400 mb-1"><span className="text-neutral-600">Cliente:</span> {c.customer_question}</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-red-950/20 border border-red-900/30 rounded p-2">
                    <p className="text-[9px] text-red-500 uppercase mb-1">IA sugirio</p>
                    <p className="text-xs text-red-300/70 line-clamp-3">{c.ai_suggestion}</p>
                  </div>
                  <div className="bg-green-950/20 border border-green-900/30 rounded p-2">
                    <p className="text-[9px] text-green-500 uppercase mb-1">Asesor envio</p>
                    <p className="text-xs text-green-300/70 line-clamp-3">{c.final_message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
