"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface AutomationRule {
  id: number;
  name: string;
  description: string;
  event: string;
  conditions: any;
  actions: any;
  is_active: boolean;
  execution_count: number;
}

interface Settings {
  business_hours: {
    enabled: boolean;
    timezone: string;
    schedule: { [key: string]: { start: string; end: string; enabled: boolean } };
    out_of_hours_message: string;
  };
  welcome_message: {
    enabled: boolean;
    message: string;
    delay_seconds: number;
  };
  csat: {
    enabled: boolean;
    message: string;
    trigger: string;
  };
}

interface Agent {
  id: number;
  name: string;
  email: string;
  role: string;
  is_online: boolean;
}

interface CannedResponse {
  id: number;
  short_code: string;
  content: string;
  media?: { url: string; type: string; name: string }[];
}

interface Integration {
  id: string;
  name: string;
  connected: boolean;
  config: any;
  updated_at: string;
}

const INTEGRATION_META: Record<string, { color: string; icon: string; description: string; fields: { key: string; label: string; placeholder: string; type?: string }[] }> = {
  mercadolibre: {
    color: "#FFE600",
    icon: "🟡",
    description: "Recibe preguntas de tus publicaciones de MercadoLibre",
    fields: [
      { key: "app_id", label: "App ID", placeholder: "Tu App ID de MercadoLibre" },
      { key: "client_secret", label: "Client Secret", placeholder: "Tu Client Secret", type: "password" },
      { key: "redirect_uri", label: "Redirect URI", placeholder: "https://sequoiaspeed.com.co/api/integrations/mercadolibre/callback" },
    ],
  },
  facebook: {
    color: "#1877F2",
    icon: "🔵",
    description: "Recibe mensajes de tu pagina de Facebook",
    fields: [
      { key: "page_id", label: "Page ID", placeholder: "ID de tu pagina de Facebook" },
      { key: "page_access_token", label: "Page Access Token", placeholder: "Token de acceso de la pagina", type: "password" },
    ],
  },
  instagram: {
    color: "#E4405F",
    icon: "🟣",
    description: "Recibe mensajes directos de Instagram",
    fields: [
      { key: "account_id", label: "Instagram Business Account ID", placeholder: "ID de cuenta Business" },
      { key: "access_token", label: "Access Token", placeholder: "Token de acceso de Instagram", type: "password" },
    ],
  },
  tiktok: {
    color: "#000000",
    icon: "⬛",
    description: "Recibe mensajes de TikTok Business",
    fields: [
      { key: "business_id", label: "Business Account ID", placeholder: "ID de cuenta Business de TikTok" },
      { key: "access_token", label: "Access Token", placeholder: "Token de acceso de TikTok", type: "password" },
    ],
  },
  webchat: {
    color: "#22C55E",
    icon: "🟢",
    description: "Widget de chat en vivo para tu sitio web",
    fields: [
      { key: "primary_color", label: "Color primario", placeholder: "#22C55E", type: "color" },
      { key: "welcome_message", label: "Mensaje de bienvenida", placeholder: "Hola! En que podemos ayudarte?" },
      { key: "position", label: "Posicion", placeholder: "bottom-right" },
    ],
  },
};

const EVENT_TYPES = [
  { value: "message_created", label: "Nuevo mensaje recibido" },
  { value: "conversation_created", label: "Nueva conversacion" },
  { value: "conversation_status_changed", label: "Estado cambiado" },
  { value: "conversation_assigned", label: "Conversacion asignada" },
];

const ACTION_TYPES = [
  { value: "assign_agent", label: "Asignar agente" },
  { value: "send_message", label: "Enviar mensaje" },
  { value: "change_status", label: "Cambiar estado" },
  { value: "add_label", label: "Agregar etiqueta" },
];

const DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

export default function WhatsAppSettingsPage() {
  const [tab, setTab] = useState<"general" | "automation" | "agents" | "canned" | "integrations" | "rules" | "knowledge">("general");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [canned, setCanned] = useState<CannedResponse[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // New agent form
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentEmail, setNewAgentEmail] = useState("");

  // New canned form
  const [newCannedCode, setNewCannedCode] = useState("");
  const [newCannedContent, setNewCannedContent] = useState("");
  const [newCannedMedia, setNewCannedMedia] = useState<{ url: string; type: string; name: string }[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [editingCanned, setEditingCanned] = useState<number | null>(null);
  const [editCannedCode, setEditCannedCode] = useState("");
  const [editCannedContent, setEditCannedContent] = useState("");

  // New rule form
  const [showNewRule, setShowNewRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", event: "message_created", description: "" });

  // Integrations
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [aiRules, setAiRules] = useState<{id:string;category:string;title:string;content:string;enabled:boolean;editable:boolean}[]>([]);
  const [editingRule, setEditingRule] = useState<string|null>(null);
  const [editRuleContent, setEditRuleContent] = useState("");
  const [savingRules, setSavingRules] = useState(false);
  const [showNewAiRule, setShowNewAiRule] = useState(false);
  const [newAiRule, setNewAiRule] = useState({ title: "", content: "", category: "Comercial" });
  const [kbItems, setKbItems] = useState<{id:number;title:string;content:string;source_type:string;source_url?:string;file_name?:string;category:string;enabled:boolean;tokens_estimate:number;created_at:string}[]>([]);
  const [kbLoading, setKbLoading] = useState(false);
  const [kbAddMode, setKbAddMode] = useState<"" | "manual" | "file" | "url">("");
  const [kbNewManual, setKbNewManual] = useState({ title: "", content: "", category: "General" });
  const [kbNewUrl, setKbNewUrl] = useState({ url: "", category: "Web" });
  const [kbEditId, setKbEditId] = useState<number | null>(null);
  const [kbEditContent, setKbEditContent] = useState("");
  const [kbUploadStatus, setKbUploadStatus] = useState("");
  const [tonePreset, setTonePreset] = useState("profesional");
    // Fetch knowledge base items on tab change
  useEffect(() => { if (tab === "knowledge") fetchKB(); }, [tab]);
  useEffect(() => {
    fetch("/api/sequoia-chat/settings?key=tone_preset").then(r => r.json()).then(d => {
      if (d.value) setTonePreset(typeof d.value === "string" ? d.value.replace(/"/g, "") : d.value);
    }).catch(() => {});
  }, []);
  const fetchKB = async () => {
    setKbLoading(true);
    try {
      const res = await fetch("/api/sequoia-chat/knowledge");
      const data = await res.json();
      setKbItems(data.items || []);
    } catch {} finally { setKbLoading(false); }
  };

  const [testingRule, setTestingRule] = useState<string|null>(null);
  const [testResult, setTestResult] = useState<{question: string; answer: string} | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<string | null>(null);
  const [integrationConfig, setIntegrationConfig] = useState<Record<string, string>>({});
  const [savingIntegration, setSavingIntegration] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/sequoia-chat/settings");
      if (res.ok) setSettings(await res.json());
    } catch {}
  }, []);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch("/api/sequoia-chat/automation");
      if (res.ok) setRules(await res.json());
    } catch {}
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/sequoia-chat/agents");
      if (res.ok) setAgents(await res.json());
    } catch {}
  }, []);

  const fetchCanned = useCallback(async () => {
    try {
      const res = await fetch("/api/sequoia-chat/canned?search=");
      if (res.ok) setCanned(await res.json());
    } catch {}
  }, []);

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch("/api/sequoia-chat/integrations");
      if (res.ok) setIntegrations(await res.json());
    } catch {}
  }, []);

  const fetchAiRules = useCallback(async () => {
    try {
      const res = await fetch("/api/sequoia-chat/settings/rules");
      if (res.ok) { const d = await res.json(); setAiRules(d.rules || []); }
    } catch {}
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchRules();
    fetchAgents();
    fetchCanned();
    fetchIntegrations();
    fetchAiRules();
  }, [fetchSettings, fetchRules, fetchAgents, fetchCanned, fetchIntegrations, fetchAiRules]);

  const saveSetting = async (key: string, value: any) => {
    setSaving(true);
    try {
      await fetch("/api/sequoia-chat/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      setSaveMsg("Guardado");
      setTimeout(() => setSaveMsg(""), 2000);
      fetchSettings();
    } catch { setSaveMsg("Error"); }
    setSaving(false);
  };

  const toggleRule = async (rule: AutomationRule) => {
    try {
      await fetch("/api/sequoia-chat/automation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id, is_active: !rule.is_active }),
      });
      fetchRules();
    } catch {}
  };

  const deleteRule = async (id: number) => {
    try {
      await fetch(`/api/sequoia-chat/automation?id=${id}`, { method: "DELETE" });
      fetchRules();
    } catch {}
  };

  const createRule = async () => {
    if (!newRule.name) return;
    try {
      await fetch("/api/sequoia-chat/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newRule,
          conditions: {},
          actions: {},
        }),
      });
      setShowNewRule(false);
      setNewRule({ name: "", event: "message_created", description: "" });
      fetchRules();
    } catch {}
  };

  const createAgent = async () => {
    if (!newAgentName || !newAgentEmail) return;
    try {
      await fetch("/api/sequoia-chat/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAgentName, email: newAgentEmail }),
      });
      setNewAgentName("");
      setNewAgentEmail("");
      fetchAgents();
    } catch {}
  };

  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const updateAgent = async () => {
    if (!editingAgent) return;
    try {
      await fetch("/api/sequoia-chat/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingAgent.id, name: editingAgent.name, email: editingAgent.email, role: editingAgent.role }),
      });
      setEditingAgent(null);
      fetchAgents();
    } catch {}
  };

  const deleteAgent = async (id: number) => {
    try {
      await fetch(`/api/sequoia-chat/agents?id=${id}`, { method: "DELETE" });
      fetchAgents();
    } catch {}
  };

  const uploadCannedMedia = async (files: FileList) => {
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("files", f));
      const res = await fetch("/api/sequoia-chat/canned/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setNewCannedMedia(prev => [...prev, ...(data.files || [])]);
      }
    } catch {} finally { setUploadingMedia(false); }
  };

  const createCanned = async () => {
    if (!newCannedCode || (!newCannedContent && newCannedMedia.length === 0)) return;
    try {
      await fetch("/api/sequoia-chat/canned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ short_code: newCannedCode, content: newCannedContent, media: newCannedMedia }),
      });
      setNewCannedCode("");
      setNewCannedContent("");
      setNewCannedMedia([]);
      fetchCanned();
    } catch {}
  };

  const deleteCanned = async (id: number) => {
    try {
      await fetch(`/api/sequoia-chat/canned?id=${id}`, { method: "DELETE" });
      fetchCanned();
    } catch {}
  };

  const updateCanned = async (id: number) => {
    if (!editCannedCode.trim() || !editCannedContent.trim()) return;
    try {
      await fetch("/api/sequoia-chat/canned", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, short_code: editCannedCode, content: editCannedContent }),
      });
      fetchCanned();
      setEditingCanned(null);
    } catch (err) { console.error("Update canned error:", err); }
  };

  const saveIntegration = async (id: string) => {
    setSavingIntegration(true);
    try {
      await fetch("/api/sequoia-chat/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, config: integrationConfig, connected: true }),
      });
      setSaveMsg("Integracion guardada");
      setTimeout(() => setSaveMsg(""), 2000);
      setEditingIntegration(null);
      setIntegrationConfig({});
      fetchIntegrations();
    } catch { setSaveMsg("Error al guardar"); }
    setSavingIntegration(false);
  };

  const disconnectIntegration = async (id: string) => {
    try {
      await fetch(`/api/sequoia-chat/integrations?id=${id}`, { method: "DELETE" });
      setSaveMsg("Integracion desconectada");
      setTimeout(() => setSaveMsg(""), 2000);
      setEditingIntegration(null);
      fetchIntegrations();
    } catch {}
  };

  const openIntegrationConfig = (intg: Integration) => {
    if (editingIntegration === intg.id) {
      setEditingIntegration(null);
      return;
    }
    setEditingIntegration(intg.id);
    setIntegrationConfig(intg.config && typeof intg.config === "object" ? { ...intg.config } : {});
  };

  if (!settings) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuracion WhatsApp</h1>
          <p className="text-sm text-neutral-500 mt-1">Automatizacion, agentes y respuestas rapidas</p>
        </div>
        <Link href="/panel/whatsapp" className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition">
          ← Volver al chat
        </Link>
      </div>

      {saveMsg && (
        <div className="mb-4 px-4 py-2 bg-green-900/30 border border-green-700/40 rounded-lg text-sm text-green-400">{saveMsg}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-800/50 rounded-lg p-1 mb-6">
        {([
          { key: "general" as const, label: "General" },
          { key: "automation" as const, label: "Automatizacion" },
          { key: "agents" as const, label: "Agentes" },
          { key: "canned" as const, label: "Resp. rapidas" },
          { key: "integrations" as const, label: "Integraciones" },
          { key: "rules" as const, label: "Reglas IA" },
          { key: "knowledge" as const, label: "Base Conocimiento" },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              tab === t.key ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {tab === "general" && (
        <div className="space-y-6">
          {/* Business Hours */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-medium">Horario de atencion</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Respuesta automatica fuera de horario</p>
              </div>
              <button
                onClick={() => saveSetting("business_hours", { ...settings.business_hours, enabled: !settings.business_hours.enabled })}
                className={`w-12 h-6 rounded-full transition ${settings.business_hours.enabled ? "bg-green-600" : "bg-neutral-700"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.business_hours.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>

            {settings.business_hours.enabled && (
              <div className="space-y-3">
                {DAYS.map(day => {
                  const dayConfig = settings.business_hours.schedule[day] || { start: "08:00", end: "18:00", enabled: true };
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const newSchedule = { ...settings.business_hours.schedule, [day]: { ...dayConfig, enabled: !dayConfig.enabled } };
                          saveSetting("business_hours", { ...settings.business_hours, schedule: newSchedule });
                        }}
                        className={`w-24 text-left text-sm capitalize ${dayConfig.enabled ? "text-white" : "text-neutral-600 line-through"}`}
                      >
                        {day}
                      </button>
                      <input
                        type="time"
                        value={dayConfig.start}
                        onChange={e => {
                          const newSchedule = { ...settings.business_hours.schedule, [day]: { ...dayConfig, start: e.target.value } };
                          saveSetting("business_hours", { ...settings.business_hours, schedule: newSchedule });
                        }}
                        disabled={!dayConfig.enabled}
                        className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white disabled:opacity-30"
                      />
                      <span className="text-neutral-500 text-xs">a</span>
                      <input
                        type="time"
                        value={dayConfig.end}
                        onChange={e => {
                          const newSchedule = { ...settings.business_hours.schedule, [day]: { ...dayConfig, end: e.target.value } };
                          saveSetting("business_hours", { ...settings.business_hours, schedule: newSchedule });
                        }}
                        disabled={!dayConfig.enabled}
                        className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white disabled:opacity-30"
                      />
                    </div>
                  );
                })}

                <div className="mt-4">
                  <label className="text-xs text-neutral-500">Mensaje fuera de horario</label>
                  <textarea
                    value={settings.business_hours.out_of_hours_message}
                    onChange={e => saveSetting("business_hours", { ...settings.business_hours, out_of_hours_message: e.target.value })}
                    className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white resize-none"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Welcome Message */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-medium">Mensaje de bienvenida</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Para contactos nuevos</p>
              </div>
              <button
                onClick={() => saveSetting("welcome_message", { ...settings.welcome_message, enabled: !settings.welcome_message.enabled })}
                className={`w-12 h-6 rounded-full transition ${settings.welcome_message.enabled ? "bg-green-600" : "bg-neutral-700"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.welcome_message.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>

            {settings.welcome_message.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500">Mensaje</label>
                  <textarea
                    value={settings.welcome_message.message}
                    onChange={e => saveSetting("welcome_message", { ...settings.welcome_message, message: e.target.value })}
                    className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white resize-none"
                    rows={3}
                    placeholder="Hola {nombre}! Bienvenido a Sequoia Speed..."
                  />
                  <p className="text-[10px] text-neutral-600 mt-1">Variables: {"{nombre}"} {"{telefono}"} {"{ciudad}"}</p>
                </div>
              </div>
            )}
          </div>

          {/* CSAT */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-medium">Encuesta de satisfaccion (CSAT)</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Al resolver conversaciones</p>
              </div>
              <button
                onClick={() => saveSetting("csat", { ...settings.csat, enabled: !settings.csat.enabled })}
                className={`w-12 h-6 rounded-full transition ${settings.csat.enabled ? "bg-green-600" : "bg-neutral-700"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.csat.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>

            {settings.csat.enabled && (
              <textarea
                value={settings.csat.message}
                onChange={e => saveSetting("csat", { ...settings.csat, message: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white resize-none"
                rows={2}
                placeholder="Como calificarias nuestra atencion? Responde del 1 al 5..."
              />
            )}
          </div>
        </div>
      )}

      {/* Automation Tab */}
      {tab === "automation" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-400">{rules.length} reglas configuradas</p>
            <button
              onClick={() => setShowNewRule(true)}
              className="px-3 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition"
            >
              + Nueva regla
            </button>
          </div>

          {showNewRule && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-4">
              <h4 className="text-white font-medium mb-3">Nueva regla de automatizacion</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newRule.name}
                  onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="Nombre de la regla"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500"
                />
                <select
                  value={newRule.event}
                  onChange={e => setNewRule({ ...newRule, event: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {EVENT_TYPES.map(et => (
                    <option key={et.value} value={et.value}>{et.label}</option>
                  ))}
                </select>
                <textarea
                  value={newRule.description}
                  onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Descripcion (opcional)"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 resize-none"
                  rows={2}
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowNewRule(false)} className="px-3 py-1.5 bg-neutral-800 text-neutral-400 rounded-lg text-sm">Cancelar</button>
                  <button onClick={createRule} className="px-3 py-1.5 bg-green-700 text-white rounded-lg text-sm">Crear</button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {rules.map(rule => (
              <div key={rule.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
                <button
                  onClick={() => toggleRule(rule)}
                  className={`w-10 h-5 rounded-full transition shrink-0 ${rule.is_active ? "bg-green-600" : "bg-neutral-700"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${rule.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{rule.name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {EVENT_TYPES.find(e => e.value === rule.event)?.label || rule.event}
                    {rule.description && ` · ${rule.description}`}
                  </p>
                  <p className="text-[10px] text-neutral-600 mt-0.5">Ejecutada {rule.execution_count} veces</p>
                </div>
                <button onClick={() => deleteRule(rule.id)} className="text-neutral-600 hover:text-red-400 transition text-sm">🗑</button>
              </div>
            ))}
            {rules.length === 0 && (
              <div className="text-center py-10">
                <p className="text-neutral-600">No hay reglas de automatizacion</p>
                <p className="text-xs text-neutral-700 mt-1">Crea reglas para automatizar respuestas, asignaciones y mas</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agents Tab */}
      {tab === "agents" && (
        <div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-4">
            <h4 className="text-white font-medium mb-3">Nuevo agente</h4>
            <div className="flex gap-3">
              <input
                type="text"
                value={newAgentName}
                onChange={e => setNewAgentName(e.target.value)}
                placeholder="Nombre"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500"
              />
              <input
                type="email"
                value={newAgentEmail}
                onChange={e => setNewAgentEmail(e.target.value)}
                placeholder="Email"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500"
              />
              <button onClick={createAgent} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition shrink-0">
                Agregar
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {agents.map(a => (
              <div key={a.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                {editingAgent?.id === a.id ? (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={editingAgent.name}
                        onChange={e => setEditingAgent({ ...editingAgent, name: e.target.value })}
                        placeholder="Nombre"
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500"
                      />
                      <input
                        type="email"
                        value={editingAgent.email}
                        onChange={e => setEditingAgent({ ...editingAgent, email: e.target.value })}
                        placeholder="Email"
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500"
                      />
                    </div>
                    <div className="flex gap-3 items-center">
                      <select
                        value={editingAgent.role}
                        onChange={e => setEditingAgent({ ...editingAgent, role: e.target.value })}
                        className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
                      >
                        <option value="agent">Agente</option>
                        <option value="admin">Admin</option>
                        <option value="supervisor">Supervisor</option>
                      </select>
                      <div className="flex-1" />
                      <button onClick={() => setEditingAgent(null)} className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition">Cancelar</button>
                      <button onClick={updateAgent} className="px-4 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition">Guardar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-lg shrink-0">
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{a.name}</p>
                      <p className="text-xs text-neutral-500">{a.email} · {a.role}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.is_online ? "bg-green-900/50 text-green-400" : "bg-neutral-800 text-neutral-500"}`}>
                      {a.is_online ? "En linea" : "Desconectado"}
                    </span>
                    <button onClick={() => setEditingAgent({ ...a })} className="text-neutral-600 hover:text-blue-400 transition text-sm" title="Editar">✏️</button>
                    <button onClick={() => deleteAgent(a.id)} className="text-neutral-600 hover:text-red-400 transition text-sm" title="Eliminar">🗑</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Canned Responses Tab */}
      {tab === "canned" && (
        <div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-4">
            <h4 className="text-white font-medium mb-3">Nueva respuesta rapida</h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-32">
                  <label className="text-[10px] text-neutral-500">Codigo (sin /)</label>
                  <input
                    type="text"
                    value={newCannedCode}
                    onChange={e => setNewCannedCode(e.target.value.replace(/\s/g, ""))}
                    placeholder="saludo"
                    className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-neutral-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-neutral-500">Contenido</label>
                  <textarea
                    value={newCannedContent}
                    onChange={e => setNewCannedContent(e.target.value)}
                    placeholder="Hola {nombre}! Gracias por comunicarte..."
                    className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 resize-none"
                    rows={2}
                  />
                </div>
              </div>
              {/* Media preview */}
              {newCannedMedia.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newCannedMedia.map((m, i) => (
                    <div key={i} className="relative group">
                      {m.type === "image" ? (
                        <img src={m.url} alt={m.name} className="w-16 h-16 object-cover rounded-lg border border-neutral-700" />
                      ) : m.type === "video" ? (
                        <div className="w-16 h-16 rounded-lg border border-neutral-700 bg-neutral-800 flex items-center justify-center text-2xl">🎬</div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg border border-neutral-700 bg-neutral-800 flex items-center justify-center text-2xl">📄</div>
                      )}
                      <button
                        onClick={() => setNewCannedMedia(prev => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-700 rounded-full text-[10px] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <p className="text-[10px] text-neutral-600">Variables: {"{nombre}"} {"{telefono}"} {"{ciudad}"} {"{pais}"}</p>
                  <label className={`cursor-pointer text-xs px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${uploadingMedia ? "border-neutral-700 text-neutral-600" : "border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500"}`}>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                      className="hidden"
                      disabled={uploadingMedia}
                      onChange={e => { if (e.target.files?.length) uploadCannedMedia(e.target.files); e.target.value = ""; }}
                    />
                    {uploadingMedia ? "Subiendo..." : "📎 Adjuntar"}
                  </label>
                </div>
                <button onClick={createCanned} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition">
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {canned.map(cr => (
              <div key={cr.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                {editingCanned === cr.id ? (
                  /* Edit mode */
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-32">
                        <label className="text-[10px] text-neutral-500">Codigo</label>
                        <input
                          type="text"
                          value={editCannedCode}
                          onChange={e => setEditCannedCode(e.target.value.replace(/\s/g, ""))}
                          className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-neutral-500">Contenido</label>
                        <textarea
                          value={editCannedContent}
                          onChange={e => setEditCannedContent(e.target.value)}
                          className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingCanned(null)} className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition">Cancelar</button>
                      <button onClick={() => updateCanned(cr.id)} className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition">Guardar</button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <>
                    <div className="flex items-center gap-4">
                      <span className="text-green-400 text-sm font-mono shrink-0">/{cr.short_code}</span>
                      <p className="text-sm text-neutral-300 flex-1 truncate">{cr.content}</p>
                      <button onClick={() => { setEditingCanned(cr.id); setEditCannedCode(cr.short_code); setEditCannedContent(cr.content); }} className="text-neutral-600 hover:text-blue-400 transition text-sm" title="Editar">✏️</button>
                      <button onClick={() => deleteCanned(cr.id)} className="text-neutral-600 hover:text-red-400 transition text-sm" title="Eliminar">🗑</button>
                    </div>
                    {cr.media && cr.media.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {cr.media.map((m, i) => (
                          <div key={i}>
                            {m.type === "image" ? (
                              <img src={m.url} alt={m.name} className="w-12 h-12 object-cover rounded border border-neutral-700" />
                            ) : m.type === "video" ? (
                              <div className="w-12 h-12 rounded border border-neutral-700 bg-neutral-800 flex items-center justify-center text-lg">🎬</div>
                            ) : (
                              <div className="w-12 h-12 rounded border border-neutral-700 bg-neutral-800 flex items-center justify-center text-lg">📄</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            {canned.length === 0 && (
              <div className="text-center py-10">
                <p className="text-neutral-600">No hay respuestas rapidas</p>
                <p className="text-xs text-neutral-700 mt-1">Crea respuestas rapidas para usar con / en el chat</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {tab === "integrations" && (
        <div>
          <div className="mb-4">
            <p className="text-sm text-neutral-400">Conecta canales externos para recibir mensajes en tu inbox unificado</p>
          </div>

          <div className="space-y-3">
            {integrations.map(intg => {
              const meta = INTEGRATION_META[intg.id];
              if (!meta) return null;
              const isEditing = editingIntegration === intg.id;

              return (
                <div key={intg.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                  {/* Card header */}
                  <div className="p-5 flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: meta.color + "20", borderColor: meta.color + "40", borderWidth: 1 }}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium text-sm">{intg.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          intg.connected
                            ? "bg-green-900/50 text-green-400 border border-green-800/50"
                            : "bg-neutral-800 text-neutral-500 border border-neutral-700"
                        }`}>
                          {intg.connected ? "Conectado" : "No conectado"}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">{meta.description}</p>
                    </div>
                    <button
                      onClick={() => openIntegrationConfig(intg)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition shrink-0 ${
                        isEditing
                          ? "bg-neutral-700 text-neutral-300"
                          : intg.connected
                            ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                            : "bg-green-700 hover:bg-green-600 text-white"
                      }`}
                    >
                      {isEditing ? "Cerrar" : intg.connected ? "Configurar" : "Conectar"}
                    </button>
                  </div>

                  {/* Expandable config panel */}
                  {isEditing && (
                    <div className="border-t border-neutral-800 bg-neutral-950/50 p-5">
                      <div className="space-y-4">
                        {meta.fields.map(field => (
                          <div key={field.key}>
                            <label className="text-xs text-neutral-400 font-medium">{field.label}</label>
                            {field.type === "color" ? (
                              <div className="flex gap-2 mt-1.5 items-center">
                                <input
                                  type="color"
                                  value={integrationConfig[field.key] || "#22C55E"}
                                  onChange={e => setIntegrationConfig({ ...integrationConfig, [field.key]: e.target.value })}
                                  className="w-10 h-10 rounded border border-neutral-700 bg-transparent cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={integrationConfig[field.key] || "#22C55E"}
                                  onChange={e => setIntegrationConfig({ ...integrationConfig, [field.key]: e.target.value })}
                                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                                />
                              </div>
                            ) : (
                              <input
                                type={field.type || "text"}
                                value={integrationConfig[field.key] || ""}
                                onChange={e => setIntegrationConfig({ ...integrationConfig, [field.key]: e.target.value })}
                                placeholder={field.placeholder}
                                className="w-full mt-1.5 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600"
                              />
                            )}
                          </div>
                        ))}

                        {/* Webchat snippet */}
                        {intg.id === "webchat" && intg.connected && (
                          <div>
                            <label className="text-xs text-neutral-400 font-medium">Codigo para tu sitio web</label>
                            <div className="mt-1.5 bg-neutral-800 border border-neutral-700 rounded-lg p-3 font-mono text-xs text-green-400 select-all">
                              {`<script src="https://sequoiaspeed.com.co/widget/chat.js" data-widget-id="${intg.id}"></script>`}
                            </div>
                            <p className="text-[10px] text-neutral-600 mt-1">Copia y pega este codigo antes de {"</body>"} en tu sitio</p>
                          </div>
                        )}

                        <div className="flex gap-2 justify-between pt-2">
                          {intg.connected && (
                            <button
                              onClick={() => disconnectIntegration(intg.id)}
                              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-red-400 border border-neutral-800 rounded-lg text-sm transition"
                            >
                              Desconectar
                            </button>
                          )}
                          <div className="flex gap-2 ml-auto">
                            <button
                              onClick={() => setEditingIntegration(null)}
                              className="px-4 py-2 bg-neutral-800 text-neutral-400 rounded-lg text-sm hover:bg-neutral-700 transition"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => saveIntegration(intg.id)}
                              disabled={savingIntegration}
                              className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition disabled:opacity-50"
                            >
                              {savingIntegration ? "Guardando..." : "Guardar"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {integrations.length === 0 && (
              <div className="text-center py-10">
                <p className="text-neutral-600">Cargando integraciones...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {tab === "rules" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Reglas del Asistente IA</h3>
              <p className="text-sm text-neutral-400">Configura las reglas que la IA debe seguir al atender clientes</p>
            </div>
          </div>

          {/* Tone Preset Selector */}
          <div className="bg-neutral-800/60 border border-neutral-700 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-white mb-2">Tono de voz de la IA</h4>
            <div className="grid grid-cols-5 gap-2">
              {[
                { key: "amigable", label: "Amigable", desc: "Calido y cercano" },
                { key: "profesional", label: "Profesional", desc: "Equilibrado" },
                { key: "directo", label: "Directo", desc: "Al grano" },
                { key: "casual", label: "Casual", desc: "Relajado" },
                { key: "formal", label: "Formal", desc: "Corporativo" },
              ].map(t => (
                <button key={t.key} onClick={async () => {
                  setTonePreset(t.key);
                  await fetch("/api/sequoia-chat/settings", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({key: "tone_preset", value: t.key}) });
                }} className={`p-3 rounded-lg border text-center transition ${tonePreset === t.key ? "bg-green-900/30 border-green-600 text-green-400" : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500"}`}>
                  <p className="text-xs font-medium">{t.label}</p>
                  <p className="text-[9px] mt-0.5 opacity-60">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
            </div>
            <div className="flex gap-2">
            <button
              onClick={() => setShowNewAiRule(true)}
              className="px-4 py-2 bg-white text-neutral-900 hover:bg-neutral-100 rounded-lg text-sm transition"
            >
              + Nueva regla
            </button>
            <button
              onClick={async () => {
                setSavingRules(true);
                try {
                  const res = await fetch("/api/sequoia-chat/settings/rules", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rules: aiRules }),
                  });
                  if (res.ok) setSaveMsg("Reglas guardadas correctamente");
                  else setSaveMsg("Error al guardar reglas");
                } catch { setSaveMsg("Error de conexion"); }
                setSavingRules(false);
                setTimeout(() => setSaveMsg(""), 3000);
              }}
              disabled={savingRules}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition disabled:opacity-50"
            >
              {savingRules ? "Guardando..." : "Guardar cambios"}
            </button>
            </div>
          </div>

          {/* New Rule Form */}
          {showNewAiRule && (
            <div className="bg-neutral-800/80 border border-neutral-800 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-bold text-white mb-3">Nueva regla</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Categoría</label>
                  <select
                    value={newAiRule.category}
                    onChange={e => setNewAiRule(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-600"
                  >
                    <option value="Comercial">Comercial</option>
                    <option value="Técnica">Técnica</option>
                    <option value="Estilo">Estilo</option>
                    <option value="Ventas">Ventas</option>
                    <option value="Seguridad">Seguridad</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Título</label>
                  <input
                    value={newAiRule.title}
                    onChange={e => setNewAiRule(p => ({ ...p, title: e.target.value }))}
                    placeholder="Ej: Prohibido envío gratis"
                    className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Instrucción para la IA</label>
                  <textarea
                    value={newAiRule.content}
                    onChange={e => setNewAiRule(p => ({ ...p, content: e.target.value }))}
                    rows={3}
                    placeholder="Describe la regla que la IA debe seguir..."
                    className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-600 resize-y"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!newAiRule.title.trim() || !newAiRule.content.trim()) return;
                      const id = newAiRule.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
                      setAiRules(prev => [...prev, { id, category: newAiRule.category, title: newAiRule.title, content: newAiRule.content, enabled: true, editable: true }]);
                      setNewAiRule({ title: "", content: "", category: "Comercial" });
                      setShowNewAiRule(false);
                    }}
                    className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition"
                  >
                    Agregar
                  </button>
                  <button
                    onClick={() => { setShowNewAiRule(false); setNewAiRule({ title: "", content: "", category: "Comercial" }); }}
                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Group by category */}
          {Array.from(new Set(aiRules.map(r => r.category))).map(cat => (
            <div key={cat} className="mb-6">
              <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-3 px-1">{cat}</h4>
              <div className="space-y-2">
                {aiRules.filter(r => r.category === cat).map(rule => (
                  <div key={rule.id} className={`bg-neutral-800/60 border rounded-lg p-4 transition ${rule.enabled ? "border-neutral-700" : "border-neutral-800 opacity-50"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${rule.enabled ? "bg-green-500" : "bg-neutral-600"}`} />
                          <span className="text-sm font-medium text-white">{rule.title}</span>
                        </div>
                        {editingRule === rule.id ? (
                          <div className="mt-2">
                            <textarea
                              value={editRuleContent}
                              onChange={e => setEditRuleContent(e.target.value)}
                              rows={4}
                              className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-neutral-600 resize-y"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => {
                                  setAiRules(prev => prev.map(r => r.id === rule.id ? { ...r, content: editRuleContent } : r));
                                  setEditingRule(null);
                                }}
                                className="px-3 py-1 bg-white text-neutral-900 hover:bg-neutral-100 text-xs rounded-md"
                              >
                                Aplicar
                              </button>
                              <button
                                onClick={() => setEditingRule(null)}
                                className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-xs rounded-md"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-neutral-400 mt-1 leading-relaxed">{rule.content}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {rule.editable && editingRule !== rule.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                setTestingRule(rule.id);
                                setTestResult(null);
                                setTestLoading(true);
                                try {
                                  const res = await fetch("/api/sequoia-chat/settings/rules/test", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ ruleTitle: rule.title, ruleContent: rule.content }),
                                  });
                                  const data = await res.json();
                                  setTestResult({ question: data.question, answer: data.answer });
                                } catch { setTestResult({ question: "Error", answer: "No se pudo conectar con la IA" }); }
                                setTestLoading(false);
                              }}
                              className="text-neutral-500 hover:text-amber-400 transition text-xs"
                            >
                              Test
                            </button>
                            <button
                              onClick={() => { setEditingRule(rule.id); setEditRuleContent(rule.content); }}
                              className="text-neutral-500 hover:text-blue-400 transition text-xs"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => { if (confirm("Eliminar regla?")) setAiRules(prev => prev.filter(r => r.id !== rule.id)); }}
                              className="text-neutral-500 hover:text-red-400 transition text-xs"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => setAiRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))}
                          className={`w-10 h-5 rounded-full transition-colors relative ${rule.enabled ? "bg-green-600" : "bg-neutral-600"}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${rule.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {aiRules.length === 0 && (
            <div className="text-center py-10">
              <p className="text-neutral-600">Cargando reglas...</p>
            </div>
          )}

          {/* Test Rule Modal */}
          {testingRule && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => { setTestingRule(null); setTestResult(null); }}>
              <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">🧪 Test de regla</h3>
                  <button onClick={() => { setTestingRule(null); setTestResult(null); }} className="text-neutral-500 hover:text-white text-lg">✕</button>
                </div>
                <p className="text-xs text-neutral-500 mb-4">
                  {aiRules.find(r => r.id === testingRule)?.title}
                </p>

                {testLoading && (
                  <div className="flex items-center gap-3 py-8 justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-400 border-t-transparent" />
                    <span className="text-neutral-400 text-sm">Generando prueba...</span>
                  </div>
                )}

                {testResult && (
                  <div className="space-y-4">
                    <div className="bg-neutral-800 rounded-lg p-4">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Mensaje del cliente (simulado)</p>
                      <p className="text-sm text-white">{testResult.question}</p>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-neutral-600 text-lg">↓</span>
                    </div>
                    <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
                      <p className="text-[10px] uppercase tracking-wider text-green-500 mb-2">Respuesta de la IA</p>
                      <p className="text-sm text-green-200">{testResult.answer}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-5">
                  {testResult && (
                    <button
                      onClick={async () => {
                        const rule = aiRules.find(r => r.id === testingRule);
                        if (!rule) return;
                        setTestResult(null);
                        setTestLoading(true);
                        try {
                          const res = await fetch("/api/sequoia-chat/settings/rules/test", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ruleTitle: rule.title, ruleContent: rule.content }),
                          });
                          const data = await res.json();
                          setTestResult({ question: data.question, answer: data.answer });
                        } catch { setTestResult({ question: "Error", answer: "No se pudo conectar" }); }
                        setTestLoading(false);
                      }}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm transition"
                    >
                      🔄 Repetir test
                    </button>
                  )}
                  <button
                    onClick={() => { setTestingRule(null); setTestResult(null); }}
                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Knowledge Base Tab */}
      {tab === "knowledge" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Base de Conocimiento</h3>
              <p className="text-sm text-neutral-400">Fuentes de informacion que la IA usa para responder</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setKbAddMode(kbAddMode ? "" : "manual")}
                className="px-4 py-2 bg-white text-neutral-900 hover:bg-neutral-100 rounded-lg text-sm transition"
              >
                + Agregar conocimiento
              </button>
              {kbAddMode && (
                <div className="absolute right-0 top-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-50 min-w-[200px]">
                  <button onClick={() => setKbAddMode("manual")} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-neutral-700 flex items-center gap-2 rounded-t-lg">
                    <span>&#9998;</span> Escribir articulo
                  </button>
                  <button onClick={() => { setKbAddMode("file"); }} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-neutral-700 flex items-center gap-2 border-t border-neutral-700">
                    <span>&#128196;</span> Subir archivo (PDF, DOCX, TXT)
                  </button>
                  <button onClick={() => setKbAddMode("url")} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-neutral-700 flex items-center gap-2 border-t border-neutral-700 rounded-b-lg">
                    <span>&#127760;</span> Agregar URL
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add Manual Article */}
          {kbAddMode === "manual" && (
            <div className="bg-neutral-800/80 border border-neutral-800 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-bold text-white mb-3">Nuevo articulo</h4>
              <div className="space-y-3">
                <input value={kbNewManual.title} onChange={e => setKbNewManual(p => ({...p, title: e.target.value}))} placeholder="Titulo del articulo"
                  className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-600" />
                <select value={kbNewManual.category} onChange={e => setKbNewManual(p => ({...p, category: e.target.value}))}
                  className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="General">General</option><option value="Productos">Productos</option><option value="Politicas">Politicas</option>
                  <option value="Envios">Envios</option><option value="Pagos">Pagos</option><option value="FAQ">FAQ</option>
                </select>
                <textarea value={kbNewManual.content} onChange={e => setKbNewManual(p => ({...p, content: e.target.value}))} rows={6} placeholder="Contenido del articulo..."
                  className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-600 resize-y" />
                <div className="flex gap-2">
                  <button onClick={async () => {
                    if (!kbNewManual.title || !kbNewManual.content) return;
                    const res = await fetch("/api/sequoia-chat/knowledge", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(kbNewManual) });
                    if (res.ok) { setKbNewManual({title:"",content:"",category:"General"}); setKbAddMode(""); fetchKB(); }
                  }} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm">Guardar</button>
                  <button onClick={() => setKbAddMode("")} className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm">Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {/* Upload File */}
          {kbAddMode === "file" && (
            <div className="bg-neutral-800/80 border border-neutral-800 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-bold text-white mb-3">Subir archivo</h4>
              <p className="text-xs text-neutral-400 mb-3">Formatos: PDF, DOCX, TXT, CSV, MD</p>
              <input type="file" accept=".pdf,.docx,.txt,.csv,.md" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                setKbUploadStatus("Procesando " + file.name + "...");
                const fd = new FormData(); fd.append("file", file); fd.append("category", "General");
                try {
                  const res = await fetch("/api/sequoia-chat/knowledge/upload", { method: "POST", body: fd });
                  const data = await res.json();
                  if (res.ok) { setKbUploadStatus("Extraido: " + data.totalChars + " caracteres (~" + data.tokensEstimate + " tokens)"); fetchKB(); setTimeout(() => { setKbUploadStatus(""); setKbAddMode(""); }, 3000); }
                  else setKbUploadStatus("Error: " + data.error);
                } catch { setKbUploadStatus("Error de conexion"); }
              }} className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-white" />
              {kbUploadStatus && <p className="text-xs text-amber-400 mt-2">{kbUploadStatus}</p>}
              <button onClick={() => { setKbAddMode(""); setKbUploadStatus(""); }} className="mt-3 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm">Cancelar</button>
            </div>
          )}

          {/* Add URL */}
          {kbAddMode === "url" && (
            <div className="bg-neutral-800/80 border border-neutral-800 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-bold text-white mb-3">Agregar URL</h4>
              <div className="space-y-3">
                <input value={kbNewUrl.url} onChange={e => setKbNewUrl(p => ({...p, url: e.target.value}))} placeholder="https://ejemplo.com/pagina"
                  className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-600" />
                <select value={kbNewUrl.category} onChange={e => setKbNewUrl(p => ({...p, category: e.target.value}))}
                  className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="Web">Web</option><option value="Productos">Productos</option><option value="FAQ">FAQ</option><option value="General">General</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={async () => {
                    if (!kbNewUrl.url) return; setKbUploadStatus("Crawleando...");
                    try {
                      const res = await fetch("/api/sequoia-chat/knowledge/crawl", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(kbNewUrl) });
                      const data = await res.json();
                      if (res.ok) { setKbUploadStatus("Extraido: " + data.totalChars + " caracteres"); setKbNewUrl({url:"",category:"Web"}); fetchKB(); setTimeout(() => { setKbUploadStatus(""); setKbAddMode(""); }, 3000); }
                      else setKbUploadStatus("Error: " + data.error);
                    } catch { setKbUploadStatus("Error de conexion"); }
                  }} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm">Crawlear</button>
                  <button onClick={() => { setKbAddMode(""); setKbUploadStatus(""); }} className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm">Cancelar</button>
                </div>
                {kbUploadStatus && <p className="text-xs text-amber-400 mt-1">{kbUploadStatus}</p>}
              </div>
            </div>
          )}

          {/* Stats bar */}
          <div className="flex gap-4 mb-4 text-xs text-neutral-500">
            <span>{kbItems.length} fuentes</span>
            <span>{kbItems.filter(i => i.enabled).length} activas</span>
            <span>~{kbItems.filter(i => i.enabled).reduce((s, i) => s + i.tokens_estimate, 0).toLocaleString()} tokens en prompt</span>
          </div>

          {/* Knowledge items list */}
          {kbLoading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" /></div>
          ) : kbItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-neutral-600">No hay fuentes de conocimiento</p>
              <p className="text-xs text-neutral-700 mt-1">Agrega articulos, PDFs o URLs para entrenar la IA</p>
            </div>
          ) : (
            <div className="space-y-2">
              {kbItems.map(item => (
                <div key={item.id} className={`bg-neutral-800/60 border rounded-lg p-4 transition ${item.enabled ? "border-neutral-700" : "border-neutral-800 opacity-50"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                          item.source_type === "file" ? "bg-blue-900/50 text-blue-400" :
                          item.source_type === "url" ? "bg-purple-900/50 text-purple-400" :
                          "bg-green-900/50 text-green-400"
                        }`}>{item.source_type === "file" ? "PDF" : item.source_type === "url" ? "URL" : "Manual"}</span>
                        <span className="text-sm font-medium text-white truncate">{item.title}</span>
                        <span className="text-[9px] text-neutral-600">{item.category}</span>
                        <span className="text-[9px] text-neutral-600">~{item.tokens_estimate.toLocaleString()} tokens</span>
                      </div>
                      {kbEditId === item.id ? (
                        <div className="mt-2">
                          <textarea value={kbEditContent} onChange={e => setKbEditContent(e.target.value)} rows={6}
                            className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-neutral-600 resize-y" />
                          <div className="flex gap-2 mt-2">
                            <button onClick={async () => {
                              await fetch("/api/sequoia-chat/knowledge", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({id: item.id, content: kbEditContent}) });
                              setKbEditId(null); fetchKB();
                            }} className="px-3 py-1 bg-white text-neutral-900 hover:bg-neutral-100 text-xs rounded-md">Guardar</button>
                            <button onClick={() => setKbEditId(null)} className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-xs rounded-md">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{item.content.substring(0, 200)}{item.content.length > 200 ? "..." : ""}</p>
                      )}
                      {item.source_url && <p className="text-[10px] text-neutral-600 mt-1 truncate">{item.source_url}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {kbEditId !== item.id && (
                        <div className="flex gap-2">
                          <button onClick={() => { setKbEditId(item.id); setKbEditContent(item.content); }} className="text-neutral-500 hover:text-blue-400 transition text-xs">Editar</button>
                          <button onClick={async () => { if (confirm("Eliminar fuente?")) { await fetch("/api/sequoia-chat/knowledge?id=" + item.id, {method:"DELETE"}); fetchKB(); } }} className="text-neutral-500 hover:text-red-400 transition text-xs">Eliminar</button>
                        </div>
                      )}
                      <button onClick={async () => {
                        await fetch("/api/sequoia-chat/knowledge", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({id: item.id, enabled: !item.enabled}) });
                        fetchKB();
                      }} className={`w-10 h-5 rounded-full transition-colors relative ${item.enabled ? "bg-green-600" : "bg-neutral-600"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${item.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
