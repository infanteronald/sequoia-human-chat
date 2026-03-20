"use client";

import { useState, useCallback, useMemo } from "react";

interface Question {
  id: string;
  authorName: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  helpfulYes: number;
  helpfulNo: number;
  createdAt: string;
}

interface Props {
  productId: string;
  productName: string;
  initialQuestions: Question[];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return "hace un momento";
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays === 1) return "hace 1 día";
  if (diffDays < 7) return `hace ${diffDays} días`;
  if (diffWeeks === 1) return "hace 1 semana";
  if (diffWeeks < 4) return `hace ${diffWeeks} semanas`;
  if (diffMonths === 1) return "hace 1 mes";
  return `hace ${diffMonths} meses`;
}

export function ProductQuestions({ productId, productName, initialQuestions }: Props) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!search.trim()) return questions;
    const lower = search.toLowerCase();
    return questions.filter(
      (q) =>
        q.question.toLowerCase().includes(lower) ||
        (q.answer && q.answer.toLowerCase().includes(lower))
    );
  }, [questions, search]);

  const visible = showAll ? filtered : filtered.slice(0, 5);
  const hasMore = filtered.length > 5 && !showAll;

  const handleVote = useCallback(
    async (questionId: string, vote: "yes" | "no") => {
      if (votedIds.has(questionId)) return;
      setVotedIds((prev) => new Set(prev).add(questionId));

      try {
        const res = await fetch(`/api/questions/${questionId}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vote }),
        });
        if (res.ok) {
          const data = await res.json();
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === questionId
                ? { ...q, helpfulYes: data.helpfulYes, helpfulNo: data.helpfulNo }
                : q
            )
          );
        }
      } catch {
        // Silent fail
      }
    },
    [votedIds]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !questionText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          authorName: name.trim(),
          authorEmail: email.trim() || undefined,
          question: questionText.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setName("");
        setQuestionText("");
        setEmail("");
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch {
      // Silent fail
    } finally {
      setSubmitting(false);
    }
  };

  // Suggestions while typing the question
  const suggestions = useMemo(() => {
    if (questionText.length < 3) return [];
    const lower = questionText.toLowerCase();
    return questions
      .filter((q) => q.question.toLowerCase().includes(lower))
      .slice(0, 3);
  }, [questionText, questions]);

  return (
    <div className="bg-neutral-800/30 rounded-xl border border-neutral-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base text-white flex items-center gap-2">
          <span className="text-lg">💬</span>
          PREGUNTAS DE CLIENTES
          {questions.length > 0 && (
            <span className="text-xs text-neutral-500 font-normal">
              ({questions.length})
            </span>
          )}
        </h3>
      </div>

      {/* Search */}
      {questions.length > 3 && (
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Busca tu pregunta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary transition"
          />
        </div>
      )}

      {/* Questions list */}
      {visible.length > 0 ? (
        <div className="space-y-3">
          {visible.map((q) => (
            <div
              key={q.id}
              className="bg-neutral-900/50 rounded-lg p-4 space-y-2.5"
            >
              {/* Question */}
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold text-sm mt-0.5 flex-shrink-0">
                  P:
                </span>
                <p className="text-sm text-white font-medium leading-snug">
                  {q.question}
                </p>
              </div>

              {/* Answer */}
              {q.answer && (
                <div className="flex items-start gap-2 ml-0">
                  <span className="text-green-400 font-bold text-sm mt-0.5 flex-shrink-0">
                    R:
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-300 leading-snug">
                      {q.answer}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                        Sequoia Speed
                      </span>
                      <span className="text-[10px] text-neutral-600">
                        · {q.answeredAt ? timeAgo(q.answeredAt) : ""}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer: votes + time */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-neutral-500">
                    ¿Te fue útil?
                  </span>
                  <button
                    onClick={() => handleVote(q.id, "yes")}
                    disabled={votedIds.has(q.id)}
                    className={`flex items-center gap-1 text-[11px] transition ${
                      votedIds.has(q.id)
                        ? "text-neutral-600 cursor-default"
                        : "text-neutral-400 hover:text-green-400"
                    }`}
                  >
                    👍 {q.helpfulYes}
                  </button>
                  <button
                    onClick={() => handleVote(q.id, "no")}
                    disabled={votedIds.has(q.id)}
                    className={`flex items-center gap-1 text-[11px] transition ${
                      votedIds.has(q.id)
                        ? "text-neutral-600 cursor-default"
                        : "text-neutral-400 hover:text-red-400"
                    }`}
                  >
                    👎 {q.helpfulNo}
                  </button>
                </div>
                <span className="text-[10px] text-neutral-600">
                  {q.authorName} · {timeAgo(q.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : search ? (
        <p className="text-sm text-neutral-500 text-center py-4">
          No encontramos preguntas con &quot;{search}&quot;
        </p>
      ) : (
        <p className="text-sm text-neutral-500 text-center py-4">
          Sé el primero en hacer una pregunta sobre este producto.
        </p>
      )}

      {/* Show more */}
      {hasMore && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full text-center text-sm text-primary hover:text-primary-light transition py-2"
        >
          Ver las {filtered.length - 5} preguntas restantes
        </button>
      )}

      {/* Divider */}
      <div className="border-t border-neutral-800" />

      {/* Ask form */}
      {submitted ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center space-y-1">
          <p className="text-sm text-green-400 font-medium">
            ✅ ¡Pregunta enviada!
          </p>
          <p className="text-xs text-neutral-400">
            Nuestro equipo responderá en menos de 24 horas.
          </p>
        </div>
      ) : !showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm text-white font-medium transition flex items-center justify-center gap-2"
        >
          <span>✍️</span> Hacer una pregunta
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm text-neutral-300 font-medium">
            ¿No encontraste tu respuesta?
          </p>

          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary transition"
          />

          <div className="relative">
            <textarea
              placeholder="Escribe tu pregunta..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              minLength={10}
              maxLength={500}
              rows={3}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary transition resize-none"
            />
            <span className="absolute bottom-2 right-3 text-[10px] text-neutral-600">
              {questionText.length}/500
            </span>
          </div>

          {/* Suggestions while typing */}
          {suggestions.length > 0 && (
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 space-y-2">
              <p className="text-[11px] text-amber-400 font-medium">
                💡 ¿Alguna de estas responde tu pregunta?
              </p>
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="text-xs text-neutral-400 pl-2 border-l border-neutral-700"
                >
                  <span className="text-white">{s.question}</span>
                  {s.answer && (
                    <span className="text-neutral-500">
                      {" "}
                      — {s.answer.slice(0, 80)}
                      {s.answer.length > 80 ? "..." : ""}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <input
            type="email"
            placeholder="Email (opcional, para notificarte la respuesta)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary transition"
          />

          <button
            type="submit"
            disabled={submitting || questionText.trim().length < 10}
            className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-bold rounded-lg text-sm uppercase tracking-wider transition"
          >
            {submitting ? "Enviando..." : "ENVIAR PREGUNTA"}
          </button>

          <p className="text-[11px] text-neutral-500 text-center">
            Tu pregunta será respondida por nuestro equipo en menos de 24 horas.
          </p>
        </form>
      )}
    </div>
  );
}
