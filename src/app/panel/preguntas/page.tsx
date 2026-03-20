"use client";

import { useState, useEffect, useCallback } from "react";

interface Question {
  id: string;
  authorName: string;
  authorEmail: string | null;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  isPublished: boolean;
  helpfulYes: number;
  helpfulNo: number;
  createdAt: string;
  product: { name: string; slug: string };
}

export default function PanelPreguntasPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<"pending" | "answered" | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/panel/questions?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
      }
    } catch {
      console.error("Error fetching questions");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAnswer = async (id: string) => {
    const answer = answerText[id]?.trim();
    if (!answer) return;

    setSubmitting(id);
    try {
      const res = await fetch("/api/panel/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, answer }),
      });

      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setAnswerText((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    } catch {
      console.error("Error answering question");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Preguntas de Clientes</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Responde las preguntas de tus clientes. Al responder se publican automáticamente.
          </p>
        </div>
        <div className="flex gap-2">
          {(["pending", "answered", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {f === "pending" ? "⏳ Pendientes" : f === "answered" ? "✅ Respondidas" : "📋 Todas"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-500">Cargando...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 text-lg">
            {filter === "pending"
              ? "🎉 No hay preguntas pendientes"
              : "No hay preguntas con este filtro"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3"
            >
              {/* Product info */}
              <div className="flex items-center justify-between">
                <a
                  href={`/producto/${q.product.slug}`}
                  target="_blank"
                  className="text-xs text-primary hover:underline"
                >
                  {q.product.name}
                </a>
                <span className="text-[10px] text-neutral-600">
                  {new Date(q.createdAt).toLocaleDateString("es-CO")}
                </span>
              </div>

              {/* Question */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {q.authorName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{q.question}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {q.authorName}
                    {q.authorEmail && ` · ${q.authorEmail}`}
                  </p>
                </div>
              </div>

              {/* Answer (if exists) */}
              {q.answer ? (
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                  <p className="text-sm text-neutral-300">{q.answer}</p>
                  <p className="text-[10px] text-neutral-600 mt-1">
                    Respondida el{" "}
                    {q.answeredAt
                      ? new Date(q.answeredAt).toLocaleDateString("es-CO")
                      : ""}
                    {" · "}👍 {q.helpfulYes} · 👎 {q.helpfulNo}
                  </p>
                </div>
              ) : (
                /* Answer form */
                <div className="space-y-2">
                  <textarea
                    placeholder="Escribe tu respuesta..."
                    value={answerText[q.id] || ""}
                    onChange={(e) =>
                      setAnswerText((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    rows={3}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary transition resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleAnswer(q.id)}
                      disabled={!answerText[q.id]?.trim() || submitting === q.id}
                      className="px-6 py-2 bg-primary hover:bg-primary-dark disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-bold rounded-lg text-sm transition"
                    >
                      {submitting === q.id ? "Enviando..." : "Responder y publicar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
