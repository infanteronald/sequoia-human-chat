"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface WorkflowStep {
  id: string;
  type: "trigger" | "condition" | "check_response" | "action" | "ai_respond" | "handoff" | "delay";
  config: Record<string, any>;
  nextSteps: string[];
  branches?: { yes: string[]; no: string[] };
}

interface Workflow {
  id?: number;
  name: string;
  trigger: string;
  steps: WorkflowStep[];
  enabled: boolean;
}

const STEP_TYPES = [
  { type: "trigger", label: "Trigger", icon: "⚡", color: "bg-neutral-900 border-neutral-700" },
  { type: "condition", label: "Condición", icon: "🔀", color: "bg-neutral-900 border-neutral-700" },
  { type: "check_response", label: "¿Respondió?", icon: "💬", color: "bg-neutral-900 border-neutral-700" },
  { type: "ai_respond", label: "IA Responde", icon: "🤖", color: "bg-neutral-900 border-neutral-700" },
  { type: "action", label: "Acción", icon: "⚙️", color: "bg-neutral-900 border-neutral-700" },
  { type: "handoff", label: "Pasar a humano", icon: "👤", color: "bg-neutral-900 border-neutral-700" },
  { type: "delay", label: "Esperar", icon: "⏱️", color: "bg-neutral-800 border-neutral-600" },
];

const TRIGGERS = [
  { value: "message_received", label: "Mensaje recibido" },
  { value: "keyword_match", label: "Palabra clave detectada" },
  { value: "new_contact", label: "Contacto nuevo" },
  { value: "sentiment_negative", label: "Sentimiento negativo" },
  { value: "no_response_24h", label: "Sin respuesta 24h" },
];

// Helper: generate unique step ID
const genId = () => `step_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

// Helper: check if step type supports branching
const hasBranching = (type: string) => type === "condition" || type === "check_response";

export default function WorkflowBuilderPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [editing, setEditing] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<{ id: number; name: string }[]>([]);
  const [labels, setLabels] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    fetch("/api/sequoia-chat/workflows")
      .then(r => r.json())
      .then(d => { setWorkflows(d.workflows || []); setLoading(false); })
      .catch(() => setLoading(false));
    fetch("/api/sequoia-chat/agents").then(r => r.json()).then(d => setAgents(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/sequoia-chat/labels").then(r => r.json()).then(d => setLabels(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const newWorkflow = (): Workflow => ({
    name: "Nuevo workflow",
    trigger: "message_received",
    steps: [
      { id: "trigger_1", type: "trigger", config: { event: "message_received" }, nextSteps: [] },
    ],
    enabled: true,
  });

  // Add a step at the end of main flow or inside a branch
  const addStep = (type: string, parentStepId?: string, branch?: "yes" | "no") => {
    if (!editing) return;
    const id = genId();
    const newStep: WorkflowStep = { id, type: type as any, config: {}, nextSteps: [] };
    if (hasBranching(type)) {
      newStep.branches = { yes: [], no: [] };
    }

    if (parentStepId && branch) {
      // Add step to a branch
      const steps = editing.steps.map(s => {
        if (s.id === parentStepId && s.branches) {
          return { ...s, branches: { ...s.branches, [branch]: [...s.branches[branch], id] } };
        }
        return s;
      });
      setEditing({ ...editing, steps: [...steps, newStep] });
    } else {
      setEditing({ ...editing, steps: [...editing.steps, newStep] });
    }
  };

  const removeStep = (stepId: string) => {
    if (!editing) return;
    // Also remove from any branches
    const steps = editing.steps
      .filter(s => s.id !== stepId)
      .map(s => ({
        ...s,
        nextSteps: s.nextSteps.filter(n => n !== stepId),
        branches: s.branches ? {
          yes: s.branches.yes.filter(n => n !== stepId),
          no: s.branches.no.filter(n => n !== stepId),
        } : undefined,
      }));
    setEditing({ ...editing, steps });
  };

  const updateStepConfig = (stepId: string, config: Record<string, any>) => {
    if (!editing) return;
    const steps = editing.steps.map(s => s.id === stepId ? { ...s, config: { ...s.config, ...config } } : s);
    setEditing({ ...editing, steps });
  };

  const saveWorkflow = async () => {
    if (!editing) return;
    const res = await fetch("/api/sequoia-chat/workflows", {
      method: editing.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      const saved = await res.json();
      setWorkflows(prev => {
        const idx = prev.findIndex(w => w.id === saved.id);
        return idx >= 0 ? prev.map(w => w.id === saved.id ? saved : w) : [...prev, saved];
      });
      setEditing(null);
    }
  };

  const deleteWorkflow = async (id: number) => {
    if (!confirm("¿Eliminar este workflow?")) return;
    await fetch("/api/sequoia-chat/workflows", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  // ──────────────────────────────────────────────
  // Render a single step card
  // ──────────────────────────────────────────────
  const renderStepCard = (step: WorkflowStep, indent: number = 0) => {
    const stepType = STEP_TYPES.find(t => t.type === step.type);
    return (
      <div key={step.id} className={`${indent > 0 ? "ml-8" : ""}`}>
        <div className={`flex items-center gap-2 p-3 rounded-lg border ${stepType?.color || "bg-neutral-800 border-neutral-700"}`}>
          <span className="text-lg">{stepType?.icon}</span>
          <span className="text-sm text-white font-medium min-w-[80px]">{stepType?.label}</span>

          {/* Config inputs per type */}
          {step.type === "condition" && (
            <input value={step.config.keyword || ""} onChange={e => updateStepConfig(step.id, { keyword: e.target.value })}
              placeholder="palabra1|palabra2|..." className="flex-1 bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-xs text-white" />
          )}

          {step.type === "check_response" && (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-neutral-400">Timeout:</span>
              <input type="number" value={step.config.timeout || 1} onChange={e => updateStepConfig(step.id, { timeout: parseInt(e.target.value) || 1 })}
                className="w-16 bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-xs text-white" min={1} />
              <span className="text-xs text-neutral-500">min</span>
            </div>
          )}

          {step.type === "delay" && (
            <div className="flex items-center gap-2">
              <input type="number" value={step.config.minutes || 5} onChange={e => updateStepConfig(step.id, { minutes: parseInt(e.target.value) || 1 })}
                className="w-16 bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-xs text-white" min={1} />
              <span className="text-xs text-neutral-500">min</span>
            </div>
          )}

          {step.type === "ai_respond" && (
            <input value={step.config.message || ""} onChange={e => updateStepConfig(step.id, { message: e.target.value })}
              placeholder="Instrucción extra para la IA..." className="flex-1 bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-xs text-white" />
          )}

          {step.type === "action" && (
            <div className="flex items-center gap-2 flex-1">
              <select value={step.config.action || ""} onChange={e => updateStepConfig(step.id, { action: e.target.value })}
                className="bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-xs text-white">
                <option value="">Seleccionar acción</option>
                <option value="add_label">Agregar etiqueta</option>
                <option value="assign_agent">Asignar agente</option>
                <option value="set_status">Cambiar estado</option>
              </select>
              {step.config.action === "add_label" && (
                <select value={step.config.labelId || step.config.labelName || ""} onChange={e => {
                  const sel = labels.find(l => String(l.id) === e.target.value);
                  updateStepConfig(step.id, sel ? { labelId: sel.id, labelName: sel.title } : { labelName: e.target.value });
                }} className="bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-xs text-white">
                  <option value="">Etiqueta...</option>
                  {labels.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
              )}
              {step.config.action === "assign_agent" && (
                <select value={step.config.agentId || ""} onChange={e => updateStepConfig(step.id, { agentId: parseInt(e.target.value) })}
                  className="bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-xs text-white">
                  <option value="">Agente...</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              )}
              {step.config.action === "set_status" && (
                <select value={step.config.status ?? ""} onChange={e => updateStepConfig(step.id, { status: parseInt(e.target.value) })}
                  className="bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-xs text-white">
                  <option value="">Estado...</option>
                  <option value="0">Abierto</option>
                  <option value="1">En progreso</option>
                  <option value="2">Resuelto</option>
                </select>
              )}
            </div>
          )}

          {step.type === "handoff" && (
            <input value={step.config.message || ""} onChange={e => updateStepConfig(step.id, { message: e.target.value })}
              placeholder="Nota interna..." className="flex-1 bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-xs text-white" />
          )}

          {step.type !== "trigger" && (
            <button onClick={() => removeStep(step.id)} className="text-red-500 hover:text-red-400 text-xs ml-auto">✕</button>
          )}
        </div>

        {/* Branching UI for condition and check_response */}
        {hasBranching(step.type) && step.branches && (
          <div className="flex gap-4 mt-2 ml-4">
            {/* YES branch */}
            <div className="flex-1 border-l-2 border-neutral-600 pl-3">
              <div className="text-xs font-bold text-green-400 mb-2">
                {step.type === "check_response" ? "✅ Respondió" : "✅ SÍ (match)"}
              </div>
              <div className="space-y-2">
                {step.branches.yes.map(sid => {
                  const s = editing?.steps.find(st => st.id === sid);
                  return s ? (
                    <div key={sid}>
                      <div className="text-neutral-600 text-center text-[10px]">↓</div>
                      {renderStepCard(s, 1)}
                    </div>
                  ) : null;
                })}
                <div className="flex flex-wrap gap-1 mt-1">
                  {STEP_TYPES.filter(t => t.type !== "trigger").map(t => (
                    <button key={t.type} onClick={() => addStep(t.type, step.id, "yes")}
                      className="px-2 py-0.5 bg-neutral-800/50 hover:bg-neutral-700 text-neutral-500 hover:text-white text-[10px] rounded border border-neutral-700/50 transition">
                      {t.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* NO branch */}
            <div className="flex-1 border-l-2 border-neutral-700 pl-3">
              <div className="text-xs font-bold text-red-400 mb-2">
                {step.type === "check_response" ? "❌ No respondió" : "❌ NO (sin match)"}
              </div>
              <div className="space-y-2">
                {step.branches.no.map(sid => {
                  const s = editing?.steps.find(st => st.id === sid);
                  return s ? (
                    <div key={sid}>
                      <div className="text-neutral-600 text-center text-[10px]">↓</div>
                      {renderStepCard(s, 1)}
                    </div>
                  ) : null;
                })}
                <div className="flex flex-wrap gap-1 mt-1">
                  {STEP_TYPES.filter(t => t.type !== "trigger").map(t => (
                    <button key={t.type} onClick={() => addStep(t.type, step.id, "no")}
                      className="px-2 py-0.5 bg-neutral-800/50 hover:bg-neutral-700 text-neutral-500 hover:text-white text-[10px] rounded border border-neutral-700/50 transition">
                      {t.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Get main flow steps (not in any branch)
  const getMainFlowSteps = (): WorkflowStep[] => {
    if (!editing) return [];
    const branchedIds = new Set<string>();
    for (const s of editing.steps) {
      if (s.branches) {
        s.branches.yes.forEach(id => branchedIds.add(id));
        s.branches.no.forEach(id => branchedIds.add(id));
      }
    }
    return editing.steps.filter(s => !branchedIds.has(s.id));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflows</h1>
          <p className="text-sm text-neutral-500">Automatizaciones con branching para el chatbot</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(newWorkflow())} className="px-4 py-2 bg-white text-neutral-900 hover:bg-neutral-100 rounded-lg text-sm">+ Nuevo workflow</button>
          <Link href="/panel/whatsapp" className="text-sm text-neutral-500 hover:text-white">Volver</Link>
        </div>
      </div>

      {/* Editor */}
      {editing && (
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <input value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})}
              className="flex-1 bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="Nombre del workflow" />
            <select value={editing.trigger} onChange={e => setEditing({...editing, trigger: e.target.value})}
              className="bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm">
              {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Visual flow - main steps */}
          <div className="space-y-2 mb-4">
            {getMainFlowSteps().map((step, i) => (
              <div key={step.id}>
                {i > 0 && <div className="text-neutral-600 text-center text-xs my-1">↓</div>}
                {renderStepCard(step)}
              </div>
            ))}
          </div>

          {/* Add step to main flow */}
          <div className="flex flex-wrap gap-2 mb-4 pt-2 border-t border-neutral-800">
            <span className="text-xs text-neutral-500 self-center mr-1">Agregar paso:</span>
            {STEP_TYPES.filter(t => t.type !== "trigger").map(t => (
              <button key={t.type} onClick={() => addStep(t.type)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs rounded-lg border border-neutral-700 transition flex items-center gap-1.5">
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={saveWorkflow} className="px-4 py-2 bg-white text-neutral-900 hover:bg-neutral-100 rounded-lg text-sm">Guardar workflow</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* Workflow list */}
      {!editing && (
        <div className="space-y-3">
          {workflows.length === 0 && !loading && (
            <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-xl">
              <p className="text-neutral-500 text-lg mb-2">No hay workflows configurados</p>
              <p className="text-xs text-neutral-600">Crea tu primer workflow para automatizar conversaciones</p>
            </div>
          )}
          {workflows.map(w => (
            <div key={w.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{w.name}</p>
                <p className="text-xs text-neutral-500">
                  {w.steps.length} pasos | Trigger: {TRIGGERS.find(t => t.value === w.trigger)?.label}
                  {w.steps.some(s => hasBranching(s.type)) && <span className="text-neutral-400 ml-2">🔀 Con branching</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(w)} className="text-xs text-neutral-400 hover:text-neutral-300">Editar</button>
                <button onClick={() => w.id && deleteWorkflow(w.id)} className="text-xs text-red-500 hover:text-red-400">Eliminar</button>
                <button onClick={async () => {
                  await fetch("/api/sequoia-chat/workflows", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({id: w.id, enabled: !w.enabled}) });
                  setWorkflows(prev => prev.map(wf => wf.id === w.id ? {...wf, enabled: !wf.enabled} : wf));
                }} className={`w-10 h-5 rounded-full transition-colors relative ${w.enabled ? "bg-green-600" : "bg-neutral-600"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${w.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Executions viewer */}
      {!editing && workflows.length > 0 && <ExecutionsViewer />}
    </div>
  );
}

// ──────────────────────────────────────────────
// ExecutionsViewer — Show active/recent workflow executions
// ──────────────────────────────────────────────
function ExecutionsViewer() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [show, setShow] = useState(false);

  const loadExecutions = () => {
    fetch("/api/sequoia-chat/workflow-executions")
      .then(r => r.json())
      .then(d => setExecutions(d.executions || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (show) loadExecutions();
  }, [show]);

  return (
    <div className="mt-6">
      <button onClick={() => setShow(!show)} className="text-xs text-neutral-500 hover:text-white transition">
        {show ? "▾" : "▸"} Ejecuciones recientes
      </button>
      {show && (
        <div className="mt-3 space-y-2">
          {executions.length === 0 && <p className="text-xs text-neutral-600">No hay ejecuciones recientes</p>}
          {executions.map(ex => (
            <div key={ex.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-white">Session: {ex.session_id}</p>
                <p className="text-[10px] text-neutral-500">
                  Step: {ex.current_step_id} | Status: <span className={
                    ex.status === "active" ? "text-green-400" :
                    ex.status === "waiting" ? "text-yellow-400" :
                    ex.status === "completed" ? "text-neutral-400" : "text-red-400"
                  }>{ex.status}</span>
                  {ex.waiting_for && ` (${ex.waiting_for})`}
                </p>
              </div>
              <span className="text-[10px] text-neutral-600">{new Date(ex.started_at).toLocaleString()}</span>
            </div>
          ))}
          <button onClick={loadExecutions} className="text-[10px] text-neutral-400 hover:text-neutral-300">↻ Actualizar</button>
        </div>
      )}
    </div>
  );
}
