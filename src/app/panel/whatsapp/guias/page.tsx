"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface GuiaResult {
  filename: string;
  url: string;
  extracted: {
    nombre?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    numeroGuia?: string;
  };
  match: {
    found: boolean;
    sessionId?: string;
    nombre?: string;
    telefono?: string;
    confidence: string;
  };
  sent?: boolean;
  sending?: boolean;
}

export default function GuiasPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<GuiaResult[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter(f => f.type.startsWith("image/"));
    setFiles(prev => [...prev, ...arr]);
    arr.forEach(f => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  }, []);

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const processGuias = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResults([]);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append("files", f));
      const res = await fetch("/api/sequoia-chat/guias/process", { method: "POST", body: formData });
      const data = await res.json();
      if (data.results) setResults(data.results);
    } catch (err) {
      console.error("Error processing guias:", err);
    }
    setProcessing(false);
  };

  const sendGuia = async (idx: number) => {
    const r = results[idx];
    if (!r.match.found || !r.match.sessionId || r.sent) return;
    setResults(prev => prev.map((g, i) => i === idx ? { ...g, sending: true } : g));
    try {
      await fetch("/api/sequoia-chat/guias/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guiaUrl: r.url, sessionId: r.match.sessionId }),
      });
      setResults(prev => prev.map((g, i) => i === idx ? { ...g, sent: true, sending: false } : g));
    } catch {
      setResults(prev => prev.map((g, i) => i === idx ? { ...g, sending: false } : g));
    }
  };

  const sendAll = async () => {
    setSendingAll(true);
    for (let i = 0; i < results.length; i++) {
      if (results[i].match.found && results[i].match.sessionId && !results[i].sent) {
        await sendGuia(i);
      }
    }
    setSendingAll(false);
  };

  const matched = results.filter(r => r.match.found);
  const unmatched = results.filter(r => !r.match.found);
  const allSent = matched.length > 0 && matched.every(r => r.sent);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/panel/whatsapp" className="text-neutral-500 hover:text-white transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </Link>
              <h1 className="text-2xl font-bold text-white">📦 Guías de Envío</h1>
            </div>
            <p className="text-sm text-neutral-500 mt-1 ml-8">Sube fotos de guías y la IA identifica a cada cliente</p>
          </div>
          <p className="text-xs text-neutral-600">{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>

        {/* Dropzone - only show if no results yet */}
        {results.length === 0 && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => document.getElementById("guia-file-input")?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                dragOver ? "border-green-500 bg-green-500/10" : "border-neutral-700 hover:border-neutral-500 hover:bg-neutral-900/50"
              }`}
            >
              <div className="text-5xl mb-4 opacity-50">📦</div>
              <p className="text-lg text-neutral-300 font-medium">Arrastra las fotos de guías aquí</p>
              <p className="text-sm text-neutral-500 mt-1">o haz click para seleccionar</p>
              <p className="text-xs text-neutral-600 mt-3">JPG, PNG, HEIC — múltiples archivos</p>
            </div>
            <input
              id="guia-file-input"
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }}
            />

            {/* File previews */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-neutral-400">{files.length} guía{files.length > 1 ? "s" : ""} seleccionada{files.length > 1 ? "s" : ""}</p>
                  <button onClick={() => { setFiles([]); setPreviews([]); }} className="text-xs text-red-400 hover:text-red-300">Quitar todas</button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {previews.map((p, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={p} alt={`Guía ${i + 1}`} className="w-full h-full object-cover rounded-lg border border-neutral-700" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >✕</button>
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] text-white bg-black/60 px-1 rounded">{i + 1}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={processGuias}
                  disabled={processing}
                  className="mt-6 w-full py-3 bg-green-700 hover:bg-green-600 disabled:bg-neutral-700 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Procesando {files.length} guía{files.length > 1 ? "s" : ""} con IA...
                    </>
                  ) : (
                    <>📦 Procesar {files.length} guía{files.length > 1 ? "s" : ""}</>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-6 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3">
              <div className="flex gap-4 text-sm">
                <span className="text-green-400">✅ {matched.length} coincidencia{matched.length !== 1 ? "s" : ""}</span>
                {unmatched.length > 0 && <span className="text-red-400">❌ {unmatched.length} sin match</span>}
              </div>
              <div className="flex gap-2">
                {matched.length > 0 && !allSent && (
                  <button
                    onClick={sendAll}
                    disabled={sendingAll}
                    className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:bg-neutral-700 text-white rounded-lg text-sm transition flex items-center gap-2"
                  >
                    {sendingAll ? (
                      <><div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" /> Enviando...</>
                    ) : (
                      <>📤 Enviar todas ({matched.filter(r => !r.sent).length})</>
                    )}
                  </button>
                )}
                <button
                  onClick={() => { setResults([]); setFiles([]); setPreviews([]); }}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm transition"
                >
                  Nueva carga
                </button>
              </div>
            </div>

            {/* Matched results */}
            {matched.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-green-400 mb-3">✅ Guías con cliente identificado</h3>
                <div className="space-y-3">
                  {matched.map((r, i) => {
                    const realIdx = results.indexOf(r);
                    return (
                      <div key={i} className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                        <img src={r.url} alt="Guía" className="w-20 h-20 object-cover rounded-lg border border-neutral-700 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {r.extracted.numeroGuia && <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">#{r.extracted.numeroGuia}</span>}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${r.match.confidence === "alto" ? "bg-green-900/50 text-green-400" : "bg-amber-900/50 text-amber-400"}`}>
                              {r.match.confidence}
                            </span>
                          </div>
                          <p className="text-sm text-white font-medium truncate">{r.match.nombre}</p>
                          <p className="text-xs text-neutral-500">{r.match.telefono}</p>
                          {r.extracted.direccion && <p className="text-[10px] text-neutral-600 truncate">{r.extracted.direccion}</p>}
                        </div>
                        <button
                          onClick={() => sendGuia(realIdx)}
                          disabled={r.sent || r.sending}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition shrink-0 ${
                            r.sent ? "bg-green-900/30 text-green-400 cursor-default" :
                            r.sending ? "bg-neutral-700 text-neutral-400" :
                            "bg-green-700 hover:bg-green-600 text-white"
                          }`}
                        >
                          {r.sent ? "✅ Enviada" : r.sending ? "Enviando..." : "📤 Enviar"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unmatched results */}
            {unmatched.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-400 mb-3">❌ Guías sin coincidencia</h3>
                <div className="space-y-3">
                  {unmatched.map((r, i) => (
                    <div key={i} className="flex items-center gap-4 bg-neutral-900 border border-red-900/30 rounded-xl p-3">
                      <img src={r.url} alt="Guía" className="w-20 h-20 object-cover rounded-lg border border-neutral-700 shrink-0" />
                      <div className="flex-1 min-w-0">
                        {r.extracted.numeroGuia && <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">#{r.extracted.numeroGuia}</span>}
                        <p className="text-sm text-white mt-1">{r.extracted.nombre || "Nombre no detectado"}</p>
                        <p className="text-xs text-neutral-500">{r.extracted.telefono || "Teléfono no detectado"}</p>
                        {r.extracted.direccion && <p className="text-[10px] text-neutral-600 truncate">{r.extracted.direccion}</p>}
                      </div>
                      <span className="text-xs text-red-400/60 shrink-0">Sin match en DB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
