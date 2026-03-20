"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ─── Themes ───
const THEMES = {
  dark: {
    name: "Oscuro",
    icon: "🌙",
    bg: "bg-neutral-950",
    sidebar: "bg-neutral-900",
    sidebarBorder: "border-neutral-800",
    chatBg: "bg-neutral-950",
    inputBg: "bg-neutral-800",
    inputBorder: "border-neutral-700",
    headerBg: "bg-neutral-900",
    bubbleOut: "bg-green-900/60",
    bubbleIn: "bg-neutral-800",
    bubbleNote: "bg-amber-900/40 border border-amber-700/40",
    text: "text-white",
    textMuted: "text-neutral-400",
    textMuted2: "text-neutral-500",
    hover: "hover:bg-neutral-800",
    selected: "bg-neutral-800",
    accent: "text-green-500",
    accentBg: "bg-green-600",
    contactActive: "bg-neutral-800/80",
    scrollTrack: "[&::-webkit-scrollbar-track]:bg-neutral-900",
    scrollThumb: "[&::-webkit-scrollbar-thumb]:bg-neutral-700",
  },
  light: {
    name: "Claro",
    icon: "☀️",
    bg: "bg-gray-100",
    sidebar: "bg-white",
    sidebarBorder: "border-gray-200",
    chatBg: "bg-[#efeae2]",
    inputBg: "bg-white",
    inputBorder: "border-gray-300",
    headerBg: "bg-white",
    bubbleOut: "bg-[#d9fdd3]",
    bubbleIn: "bg-white",
    bubbleNote: "bg-amber-50 border border-amber-200",
    text: "text-gray-900",
    textMuted: "text-gray-600",
    textMuted2: "text-gray-400",
    hover: "hover:bg-gray-100",
    selected: "bg-green-50",
    accent: "text-green-600",
    accentBg: "bg-green-600",
    contactActive: "bg-green-50",
    scrollTrack: "[&::-webkit-scrollbar-track]:bg-gray-100",
    scrollThumb: "[&::-webkit-scrollbar-thumb]:bg-gray-300",
  },
  whatsapp: {
    name: "WhatsApp",
    icon: "💬",
    bg: "bg-[#111b21]",
    sidebar: "bg-[#111b21]",
    sidebarBorder: "border-[#2a3942]",
    chatBg: "bg-[#0b141a]",
    inputBg: "bg-[#2a3942]",
    inputBorder: "border-[#2a3942]",
    headerBg: "bg-[#202c33]",
    bubbleOut: "bg-[#005c4b]",
    bubbleIn: "bg-[#202c33]",
    bubbleNote: "bg-amber-900/30 border border-amber-700/30",
    text: "text-[#e9edef]",
    textMuted: "text-[#8696a0]",
    textMuted2: "text-[#667781]",
    hover: "hover:bg-[#2a3942]",
    selected: "bg-[#2a3942]",
    accent: "text-[#00a884]",
    accentBg: "bg-[#00a884]",
    contactActive: "bg-[#2a3942]",
    scrollTrack: "[&::-webkit-scrollbar-track]:bg-[#111b21]",
    scrollThumb: "[&::-webkit-scrollbar-thumb]:bg-[#374045]",
  },
  midnight: {
    name: "Medianoche",
    icon: "🌌",
    bg: "bg-[#0a0e1a]",
    sidebar: "bg-[#0f1525]",
    sidebarBorder: "border-[#1a2540]",
    chatBg: "bg-[#070b14]",
    inputBg: "bg-[#151d30]",
    inputBorder: "border-[#1a2540]",
    headerBg: "bg-[#0f1525]",
    bubbleOut: "bg-indigo-900/50",
    bubbleIn: "bg-[#151d30]",
    bubbleNote: "bg-amber-900/30 border border-amber-700/30",
    text: "text-blue-100",
    textMuted: "text-blue-300/60",
    textMuted2: "text-blue-400/40",
    hover: "hover:bg-[#151d30]",
    selected: "bg-[#1a2540]",
    accent: "text-indigo-400",
    accentBg: "bg-indigo-600",
    contactActive: "bg-indigo-900/30",
    scrollTrack: "[&::-webkit-scrollbar-track]:bg-[#0a0e1a]",
    scrollThumb: "[&::-webkit-scrollbar-thumb]:bg-[#1a2540]",
  },
  forest: {
    name: "Bosque",
    icon: "🌿",
    bg: "bg-[#0a1a0f]",
    sidebar: "bg-[#0f2016]",
    sidebarBorder: "border-[#1a3525]",
    chatBg: "bg-[#070f0a]",
    inputBg: "bg-[#152a1c]",
    inputBorder: "border-[#1a3525]",
    headerBg: "bg-[#0f2016]",
    bubbleOut: "bg-emerald-900/50",
    bubbleIn: "bg-[#152a1c]",
    bubbleNote: "bg-amber-900/30 border border-amber-700/30",
    text: "text-emerald-100",
    textMuted: "text-emerald-300/60",
    textMuted2: "text-emerald-400/40",
    hover: "hover:bg-[#152a1c]",
    selected: "bg-[#1a3525]",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-600",
    contactActive: "bg-emerald-900/30",
    scrollTrack: "[&::-webkit-scrollbar-track]:bg-[#0a1a0f]",
    scrollThumb: "[&::-webkit-scrollbar-thumb]:bg-[#1a3525]",
  },
} as const;

type ThemeKey = keyof typeof THEMES;

// ─── Types ───
interface Contact {
  id: number;
  session_id: string;
  nombre: string;
  telefono: string;
  email: string;
  ciudad: string;
  pais: string;
  dispositivo: string;
  fecha_creacion: string;
  fecha_ultimo_mensaje: string;
  total_messages: number;
  ultimo_mensaje: string;
  ultimo_es_bot: boolean;
  ultimo_mensaje_cliente: string | null;
  contact_type: number;
  conversation_status: number;
  assigned_agent_id: number | null;
  agent_name: string | null;
  starred?: boolean;
  has_unread?: boolean;
  cliente_desinteresado?: boolean;
  ai_auto?: boolean;
  blocked?: boolean;
  keepalive_count?: number;
  followup_next_at?: string | null;
  followup_product?: string | null;
  labels?: Label[];
}

interface Agent {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface StatusCounts {
  all: number;
  open: number;
  pending: number;
  resolved: number;
  snoozed: number;
}

interface Message {
  id: number;
  mensaje_id: string;
  session_id: string;
  mensaje: string;
  is_bot: boolean;
  nombre_agente: string;
  tipo_archivo: string;
  ruta_archivo: string;
  nota_interna: boolean;
  mensaje_eliminado: boolean;
  fecha_creacion: string;
  status: number;
  private: boolean;
}

interface MediaItem {
  url: string;
  type: string;
  name: string;
}

interface CannedResponse {
  id: number;
  short_code: string;
  content: string;
  media?: MediaItem[];
}

interface Label {
  id: number;
  title: string;
  color: string;
}

// ─── Helpers ───
function formatDate(d: string | null) {
  if (!d) return "";
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Ayer";
  if (days < 7) return date.toLocaleDateString("es-CO", { weekday: "short" });
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "2-digit" });
}

function formatFullDate(d: string) {
  return new Date(d).toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function isWithin24Hours(messages: Message[]): boolean {
  const inbound = messages.filter((m) => !m.is_bot && !m.private);
  if (inbound.length === 0) return false;
  const last = inbound[inbound.length - 1];
  const hours = (Date.now() - new Date(last.fecha_creacion).getTime()) / 3600000;
  return hours < 24;
}

function getStatusIcon(status: number, isBot: boolean) {
  if (!isBot) return null;
  switch (status) {
    case 0: return <span className="text-neutral-500 text-[10px]">●</span>; // pending
    case 1: return <span className="text-neutral-400 text-[10px]">✓</span>; // sent
    case 2: return <span className="text-neutral-400 text-[10px]">✓✓</span>; // delivered
    case 3: return <span className="text-blue-400 text-[10px]">✓✓</span>; // read
    case 4: return <span className="text-red-500 text-[10px]">✕</span>; // failed
    default: return null;
  }
}

function interpolateVars(text: string, contact: Contact | null) {
  if (!contact) return text;
  return text
    .replace(/\{nombre\}/g, contact.nombre || "cliente")
    .replace(/\{telefono\}/g, contact.session_id || "")
    .replace(/\{ciudad\}/g, contact.ciudad || "")
    .replace(/\{pais\}/g, contact.pais || "");
}

// ─── Agent Colors ───
const AGENT_COLORS: Record<string, { bg: string; text: string }> = {
  "Sequoia Speed": { bg: "bg-red-900/30", text: "text-red-400" },
  "Daniel Avendaño": { bg: "bg-blue-900/30", text: "text-blue-400" },
  "Jorge Cardozo": { bg: "bg-orange-900/30", text: "text-orange-400" },
};
const DEFAULT_AGENT_COLORS = [
  { bg: "bg-purple-900/30", text: "text-purple-400" },
  { bg: "bg-teal-900/30", text: "text-teal-400" },
  { bg: "bg-pink-900/30", text: "text-pink-400" },
  { bg: "bg-cyan-900/30", text: "text-cyan-400" },
  { bg: "bg-lime-900/30", text: "text-lime-400" },
  { bg: "bg-amber-900/30", text: "text-amber-400" },
];
function getAgentColor(name: string) {
  if (AGENT_COLORS[name]) return AGENT_COLORS[name];
  // Deterministic color for unknown agents based on name hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return DEFAULT_AGENT_COLORS[Math.abs(hash) % DEFAULT_AGENT_COLORS.length];
}

// ─── Main Component ───
export default function WhatsAppPage() {
  // State - Contacts
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterLabel, setFilterLabel] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterAgent, setFilterAgent] = useState<string>("");
  const [filterStarred, setFilterStarred] = useState<boolean>(false);
  const [aiEnabled, setAiEnabled] = useState<boolean>(() => { if (typeof window !== "undefined") { const saved = localStorage.getItem("wa-ai-enabled"); return saved !== null ? saved === "true" : true; } return true; });
  const [aiUnknownChats, setAiUnknownChats] = useState<Set<string>>(new Set());
  const [aiUnknownQuestions, setAiUnknownQuestions] = useState<Record<string, string>>({});
  const aiEnabledRef = useRef<boolean>(true);
  const aiDebounceRef = useRef<any>(null);
  useEffect(() => { aiEnabledRef.current = aiEnabled; localStorage.setItem("wa-ai-enabled", String(aiEnabled)); }, [aiEnabled]);
  const [aiSuggesting, setAiSuggesting] = useState<boolean>(false);
  const [aiThinking, setAiThinking] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<string>("");
  const [aiSource, setAiSource] = useState<string>("");
  const [showAiModal, setShowAiModal] = useState(false)
  const [contactCity, setContactCity] = useState<string>("");
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [aiLastSuggestion, setAiLastSuggestion] = useState<string>("");
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({ all: 0, open: 0, pending: 0, resolved: 0, snoozed: 0 });
  const [agents, setAgents] = useState<Agent[]>([]);

  // State - Mobile view
  const [mobileView, setMobileView] = useState<"contacts" | "chat" | "info">("contacts");

  // State - Messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgPage, setMsgPage] = useState(1);
  const [msgTotalPages, setMsgTotalPages] = useState(1);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // State - Send
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [canSendRegular, setCanSendRegular] = useState(false);

  // State - UI
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showCanned, setShowCanned] = useState(false);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [cannedFilter, setCannedFilter] = useState("");
  const [pendingMedia, setPendingMedia] = useState<MediaItem[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [contactLabels, setContactLabels] = useState<Label[]>([]);
  const [msgSearch, setMsgSearch] = useState("");
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showFollowupPicker, setShowFollowupPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [followupDateTime, setFollowupDateTime] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [showProductCatalog, setShowProductCatalog] = useState(false);
  const [catalogData, setCatalogData] = useState<any[]>([]);
  const [catalogCategory, setCatalogCategory] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [linkPreview, setLinkPreview] = useState<{ url: string; title: string; description: string; image: string; domain: string; favicon: string } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const linkPreviewTimeoutRef = useRef<NodeJS.Timeout>(undefined);
  const [msgPreviews, setMsgPreviews] = useState<Record<string, { url: string; title: string; description: string; image: string; domain: string; favicon: string } | null>>({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<{ id: number | string; name: string; template_id: string; components: any; category?: string; language?: string; status?: string }[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<ThemeKey>("dark");
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showLabelChips, setShowLabelChips] = useState(false);

  // State - Multi-select
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [lastClickedIdx, setLastClickedIdx] = useState<number>(-1);

  // State - Context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; contact: Contact } | null>(null);

  // State - Bulk send
  const [showBulkSend, setShowBulkSend] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ sent: 0, failed: 0, total: 0 });
  const [bulkMode, setBulkMode] = useState<"text" | "template">("text");
  const [bulkResults, setBulkResults] = useState<{ session_id: string; nombre: string; ok: boolean; error?: string }[]>([]);

  // State - Date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [datePresetLabel, setDatePresetLabel] = useState("");
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [pickingStart, setPickingStart] = useState(true);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>(undefined);
  const msgInputRef = useRef<HTMLTextAreaElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout>(undefined);
  const contactPollRef = useRef<NodeJS.Timeout>(undefined);
  const prevMsgCountRef = useRef<number>(0);
  const prevLastMsgIdRef = useRef<string>("");
  const isInitialLoadRef = useRef<boolean>(true);
  const shouldScrollToBottomRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);


  // ─── Fetch functions ───
  const fetchContacts = useCallback(async (p: number, s: string, status?: string, labelId?: number | null, dFrom?: string, dTo?: string, agId?: string, starFilter?: boolean) => {
    setLoading(true);
    try {
      let url = `/api/sequoia-chat?page=${p}&limit=50&search=${encodeURIComponent(s)}`;
      if (status !== undefined && status !== "") url += `&status=${status}`;
      if (labelId) url += `&labelId=${labelId}`;
      if (dFrom) url += `&dateFrom=${dFrom}`;
      if (dTo) url += `&dateTo=${dTo}`;
      if (agId) url += `&agentId=${agId}`;
      if (starFilter) url += `&starred=true`;
      const res = await fetch(url);
      const data = await res.json();
      setContacts(data.contacts || []);
      setTotalPages(data.totalPages || 1);
      setTotalContacts(data.total || 0);
      if (data.statusCounts) setStatusCounts(data.statusCounts);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);


  const toggleStar = async (contactId: number, currentStarred: boolean) => {
    try {
      await fetch("/api/sequoia-chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, starred: !currentStarred }),
      });
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, starred: !currentStarred } : c));
      if (selectedContact?.id === contactId) setSelectedContact(prev => prev ? { ...prev, starred: !currentStarred } : prev);
    } catch (e) { console.error(e); }
  };

  // Notification sound using Web Audio API
  const playNotificationSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1047, ctx.currentTime + 0.08);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.25);
    } catch {}
  }, []);

  const fetchMessages = useCallback(async (sessionId: string, p: number, isPolling = false) => {
    if (!isPolling) setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/sequoia-chat/messages?sessionId=${sessionId}&page=${p}&limit=200`);
      const data = await res.json();
      const newMessages: Message[] = data.messages || [];
      const newLastId = newMessages.length > 0 ? newMessages[newMessages.length - 1].mensaje_id : "";
      const newCount = newMessages.length;
      if (newLastId !== prevLastMsgIdRef.current || newCount !== prevMsgCountRef.current) {
        // Detect if a new inbound message arrived (for notification sound)
        if (isPolling && prevLastMsgIdRef.current && newLastId !== prevLastMsgIdRef.current) {
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && !lastMsg.is_bot && soundEnabled) {
            playNotificationSound();
          }
          // Auto-suggest AI response when new client message arrives
          if (lastMsg && !lastMsg.is_bot && aiEnabledRef.current) {
            // Cancel previous debounce timer if client sends another message
            if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
            setAiThinking(sessionId);
            setAiStatus("Esperando más mensajes...");
            aiDebounceRef.current = setTimeout(() => {
              aiDebounceRef.current = null;
              setAiStatus("Cargando conversación...");
              fetch("/api/whatsapp/ai-suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
              }).then(async (res) => {
                const reader = res.body?.getReader();
                const decoder = new TextDecoder();
                let buffer = "";
                if (!reader) return;
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split("\n");
                  buffer = lines.pop() || "";
                  let eventType = "";
                  for (const line of lines) {
                    if (line.startsWith("event: ")) eventType = line.slice(7);
                    else if (line.startsWith("data: ") && eventType) {
                      try {
                        const payload = JSON.parse(line.slice(6));
                        if (eventType === "status") {
                          setAiStatus(payload.step);
                        } else if (eventType === "suggestion") {
                          setAiThinking("");
                          setAiStatus("");
                          if (payload.sources && payload.sources.length > 0) {
                            setAiSource(payload.sources.join(" + "));
                            if (payload.ciudad) setContactCity(payload.ciudad);
                            if (payload.hasPurchased) setHasPurchased(true);
                          } else {
                            
                          }
                          const text = payload.text || "";
                          const clean = text.replace("__NO_SE__", "").trim();
                          if (text.includes("__NO_SE__") && !clean) {
                            setNewMessage("Permítame consultar un momento");
                            setAiUnknownChats(prev => new Set(prev).add(sessionId));
                            setAiUnknownQuestions(prev => ({ ...prev, [sessionId]: lastMsg.mensaje }));
                          } else if (clean || text) {
                            setNewMessage(clean || text);
                            setAiLastSuggestion(clean || text);
                            setAiUnknownChats(prev => { const n = new Set(prev); n.delete(sessionId); return n; });
                          }
                        } else if (eventType === "error") {
                          setAiThinking("");
                          setAiStatus("");
                        }
                      } catch {}
                      eventType = "";
                    }
                  }
                }
                setAiThinking("");
                setAiStatus("");
              }).catch(() => { setAiThinking(""); setAiStatus(""); });
            }, 3000);
          }
        }
        setMessages(newMessages);
        prevLastMsgIdRef.current = newLastId;
        prevMsgCountRef.current = newCount;
      }
      setMsgTotalPages(data.totalPages || 1);
    } catch (e) { console.error(e); }
    if (!isPolling) setLoadingMsgs(false);
  }, [soundEnabled, playNotificationSound]);

  const fetchLabels = useCallback(async () => {
    try {
      const res = await fetch("/api/sequoia-chat/labels");
      setLabels(await res.json());
    } catch {}
  }, []);

  const fetchContactLabels = useCallback(async (contactId: number) => {
    try {
      const res = await fetch("/api/sequoia-chat/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get", contactId }),
      });
      // If get doesn't work, labels come back empty
    } catch {}
  }, []);

  const fetchCanned = useCallback(async (filter: string) => {
    try {
      const res = await fetch(`/api/sequoia-chat/canned?search=${encodeURIComponent(filter)}`);
      setCannedResponses(await res.json());
    } catch {}
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/sequoia-chat/agents");
      setAgents(await res.json());
    } catch {}
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/sequoia-chat/templates");
      if (res.ok) setTemplates(await res.json());
    } catch {}
  }, []);

  const sendTemplate = async (tmpl: any) => {
    if (!selectedContact) return;
    setSending(true);
    setSendError("");
    try {
      const components: any[] = [];
      const header = tmpl.components?.find((c: any) => c.type === "HEADER");

      // IMAGE/VIDEO headers always require media to be sent
      if (header && (header.format === "IMAGE" || header.format === "VIDEO")) {
        // Use permanently hosted image on our server, fallback to Meta's CDN handle
        const BASE = "https://sequoiaspeed.com.co";
        const localImage = `/uploads/templates/${tmpl.name}-header.${header.format === "IMAGE" ? "png" : "mp4"}`;
        const handleUrl = header.example?.header_handle?.[0];
        const mediaLink = `${BASE}${localImage}`;

        components.push({
          type: "header",
          parameters: [{
            type: header.format.toLowerCase(),
            [header.format.toLowerCase()]: { link: mediaLink },
          }],
        });
      }

      // Check body for dynamic variables like {{1}}, {{2}}
      const body = tmpl.components?.find((c: any) => c.type === "BODY");
      const bodyVarCount = (body?.text?.match(/\{\{\d+\}\}/g) || []).length;
      if (bodyVarCount > 0 && body?.example?.body_text?.[0]) {
        const params = body.example.body_text[0].map((p: string) => {
          if (selectedContact.nombre && p.toLowerCase().includes("name")) return selectedContact.nombre;
          return p;
        });
        components.push({
          type: "body",
          parameters: params.map((p: string) => ({ type: "text", text: p })),
        });
      }

      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedContact.session_id,
          template: tmpl.name,
          templateLang: tmpl.language || "es",
          templateComponents: components.length > 0 ? components : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setSendError(d.error || "Error al enviar template"); return; }
      setShowTemplateModal(false);
      shouldScrollToBottomRef.current = true;
      await fetchMessages(selectedContact.session_id, msgPage, true);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e: any) {
      setSendError(e.message || "Error de conexion");
    } finally {
      setSending(false);
    }
  };

  // ─── Status / Agent handlers ───
  const updateContactStatus = async (status: number) => {
    if (!selectedContact) return;
    try {
      const res = await fetch("/api/sequoia-chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: selectedContact.id, conversation_status: status }),
      });
      const updated = await res.json();
      setSelectedContact({ ...selectedContact, conversation_status: status });
      fetchContacts(page, search, filterStatus, filterLabel, dateFrom, dateTo, filterAgent, filterStarred);
    } catch {}
  };

  const assignAgent = async (agentId: number | null) => {
    if (!selectedContact) return;
    try {
      await fetch("/api/sequoia-chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: selectedContact.id, assigned_agent_id: agentId }),
      });
      const agentName = agentId ? agents.find(a => a.id === agentId)?.name || null : null;
      setSelectedContact({ ...selectedContact, assigned_agent_id: agentId, agent_name: agentName });
      fetchContacts(page, search, filterStatus, filterLabel, dateFrom, dateTo, filterAgent, filterStarred);
    } catch {}
  };

  // ─── Keyboard Shortcuts ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      // Alt+N = new note mode
      if (e.altKey && e.key === "n") { e.preventDefault(); setIsNoteMode(true); msgInputRef.current?.focus(); }
      // Alt+M = message mode
      if (e.altKey && e.key === "m") { e.preventDefault(); setIsNoteMode(false); msgInputRef.current?.focus(); }
      // Alt+R = resolve conversation
      if (e.altKey && e.key === "r" && selectedContact) { e.preventDefault(); updateContactStatus(selectedContact.conversation_status === 2 ? 0 : 2); }
      // Alt+I = toggle contact info
      if (e.altKey && e.key === "i") { e.preventDefault(); setShowContactInfo(p => !p); }
      // Alt+F = search in messages
      if (e.altKey && e.key === "f") { e.preventDefault(); setShowMsgSearch(p => !p); }
      // Escape = close menus/panels
      if (e.key === "Escape") {
        if (contextMenu) { setContextMenu(null); }
        else if (showDatePicker) { setShowDatePicker(false); }
        else if (showBulkSend) { if (!bulkSending) setShowBulkSend(false); }
        else if (showEmojiPicker) { setShowEmojiPicker(false); }
        else if (showFollowupPicker) { setShowFollowupPicker(false); }
        else if (showMsgSearch) { setShowMsgSearch(false); setMsgSearch(""); }
        else if (showContactInfo) { setShowContactInfo(false); }
        else if (showCanned) { setShowCanned(false); }
        else if (selectedContacts.size > 0) { clearMultiSelect(); }
      }
      // Arrow Up/Down to navigate contacts (only when not in input)
      if (!isInput && contacts.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const idx = selectedContact ? contacts.findIndex(c => c.session_id === selectedContact.session_id) : -1;
          const next = idx < contacts.length - 1 ? idx + 1 : 0;
          selectContact(contacts[next]);
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          const idx = selectedContact ? contacts.findIndex(c => c.session_id === selectedContact.session_id) : 0;
          const prev = idx > 0 ? idx - 1 : contacts.length - 1;
          selectContact(contacts[prev]);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedContact, contacts, showMsgSearch, showContactInfo, showCanned]);

  // ─── Effects ───
  // Load theme from localStorage + listen for sidebar "Temas" button
  useEffect(() => {
    const saved = localStorage.getItem("wa-theme") as ThemeKey | null;
    if (saved && THEMES[saved]) setTheme(saved);
    const openThemes = () => setShowThemePanel(true);
    const openAiMode = () => setShowAiModal(true);
    window.addEventListener("openThemes", openThemes);
    window.addEventListener("openAiMode", openAiMode);
    return () => { window.removeEventListener("openThemes", openThemes); window.removeEventListener("openAiMode", openAiMode); };
  }, []);

  const changeTheme = (t: ThemeKey) => {
    setTheme(t);
    localStorage.setItem("wa-theme", t);
  };

  const t = THEMES[theme];

  useEffect(() => { fetchContacts(1, "", "", null, dateFrom, dateTo, "unassigned", false); fetchLabels(); fetchAgents(); fetchTemplates(); }, [fetchContacts, fetchLabels, fetchAgents, fetchTemplates]); // eslint-disable-line

  // Contact list polling - refresh every 15 seconds to show new messages in list
  useEffect(() => {
    const pollContacts = () => {
      fetchContacts(page, search, filterStatus, filterLabel, dateFrom, dateTo, filterAgent, filterStarred);
    };
    contactPollRef.current = setInterval(pollContacts, 15000);
    return () => { if (contactPollRef.current) clearInterval(contactPollRef.current); };
  }, [page, search, filterStatus, filterLabel, dateFrom, dateTo, filterAgent, filterStarred, fetchContacts]);

  // Fetch link previews for messages containing URLs
  useEffect(() => {
    if (messages.length === 0) return;
    const urlRegex = /(https?:\/\/[^\s]+)/i;
    const toFetch: { id: string; url: string }[] = [];
    for (const msg of messages) {
      if (!msg.mensaje) continue;
      const match = msg.mensaje.match(urlRegex);
      if (match && !msgPreviews[msg.mensaje_id] && msgPreviews[msg.mensaje_id] !== null) {
        toFetch.push({ id: msg.mensaje_id, url: match[1] });
      }
    }
    if (toFetch.length === 0) return;
    // Fetch max 5 at a time to avoid overload
    toFetch.slice(0, 5).forEach(async ({ id, url }) => {
      setMsgPreviews(prev => ({ ...prev, [id]: null })); // mark as loading
      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.title || data.description) {
            setMsgPreviews(prev => ({ ...prev, [id]: data }));
            return;
          }
        }
      } catch {}
      setMsgPreviews(prev => ({ ...prev, [id]: null }));
    });
  }, [messages]); // eslint-disable-line

  useEffect(() => {
    setCanSendRegular(isWithin24Hours(messages));
  }, [messages]);

  // Polling - pause when tab hidden (inspired by WhatsApp Cloud Inbox)
  useEffect(() => {
    if (!selectedContact) return;
    let interval: NodeJS.Timeout;

    const startPolling = () => {
      interval = setInterval(() => {
        fetchMessages(selectedContact.session_id, msgPage, true);
      }, 5000);
      pollIntervalRef.current = interval;
    };

    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        startPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [selectedContact, msgPage, fetchMessages]);

  useEffect(() => {
    if (!chatEndRef.current || messages.length === 0) return;
    if (isInitialLoadRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "instant" });
      isInitialLoadRef.current = false;
    } else if (shouldScrollToBottomRef.current) {
      // Explicit scroll request (after sending message)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      shouldScrollToBottomRef.current = false;
    } else {
      // New message arrived via polling - smooth scroll only if already near bottom
      const chatContainer = chatEndRef.current.parentElement;
      if (chatContainer) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainer;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
        if (isNearBottom) {
          chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [messages]);

  // ─── Handlers ───
  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchContacts(1, value, filterStatus, filterLabel, dateFrom, dateTo, filterAgent, filterStarred);
    }, 400);
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    setPage(1);
    fetchContacts(1, search, status, filterLabel, dateFrom, dateTo, filterAgent, filterStarred);
  };

  // ─── Multi-select handlers ───
  const toggleSelectContact = (sessionId: string, idx: number, e?: React.MouseEvent) => {
    setSelectedContacts(prev => {
      const next = new Set(prev);
      if (e?.shiftKey && lastClickedIdx >= 0) {
        const start = Math.min(lastClickedIdx, idx);
        const end = Math.max(lastClickedIdx, idx);
        for (let i = start; i <= end; i++) {
          next.add(contacts[i].session_id);
        }
      } else if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
    setLastClickedIdx(idx);
  };

  const clearMultiSelect = () => {
    setSelectedContacts(new Set());
    setLastClickedIdx(-1);
  };

  const selectAllVisible = () => {
    setSelectedContacts(new Set(contacts.map(c => c.session_id)));
  };

  // ─── Bulk send ───
  const startBulkSend = async () => {
    if (!bulkMessage.trim() || bulkSending) return;
    const recipients = contacts.filter(c => selectedContacts.has(c.session_id));
    if (recipients.length === 0) return;

    setBulkSending(true);
    setBulkProgress({ sent: 0, failed: 0, total: recipients.length });
    setBulkResults([]);

    for (let i = 0; i < recipients.length; i++) {
      const c = recipients[i];
      try {
        const body: any = { to: c.session_id };
        if (bulkMode === "template") {
          body.template = bulkMessage.trim();
        } else {
          body.message = bulkMessage.trim();
        }
        const res = await fetch("/api/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const d = await res.json();
        if (res.ok) {
          setBulkProgress(p => ({ ...p, sent: p.sent + 1 }));
          setBulkResults(prev => [...prev, { session_id: c.session_id, nombre: c.nombre, ok: true }]);
        } else {
          setBulkProgress(p => ({ ...p, failed: p.failed + 1 }));
          setBulkResults(prev => [...prev, { session_id: c.session_id, nombre: c.nombre, ok: false, error: d.error }]);
        }
      } catch (err: any) {
        setBulkProgress(p => ({ ...p, failed: p.failed + 1 }));
        setBulkResults(prev => [...prev, { session_id: c.session_id, nombre: c.nombre, ok: false, error: err.message }]);
      }
      // Rate limiting delay
      if (i < recipients.length - 1) await new Promise(r => setTimeout(r, 500));
    }
    setBulkSending(false);
  };

  // ─── Date picker helpers ───
  const applyDatePreset = (preset: string) => {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    let from = "", to = "";

    switch (preset) {
      case "today":
        from = to = fmt(today);
        setDatePresetLabel("Hoy");
        break;
      case "yesterday": {
        const y = new Date(today); y.setDate(y.getDate() - 1);
        from = to = fmt(y);
        setDatePresetLabel("Ayer");
        break;
      }
      case "last7": {
        const d = new Date(today); d.setDate(d.getDate() - 6);
        from = fmt(d); to = fmt(today);
        setDatePresetLabel("Últimos 7 días");
        break;
      }
      case "last30": {
        const d = new Date(today); d.setDate(d.getDate() - 29);
        from = fmt(d); to = fmt(today);
        setDatePresetLabel("Últimos 30 días");
        break;
      }
      case "thisMonth":
        from = fmt(new Date(today.getFullYear(), today.getMonth(), 1));
        to = fmt(today);
        setDatePresetLabel("Este mes");
        break;
      case "lastMonth": {
        const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const last = new Date(today.getFullYear(), today.getMonth(), 0);
        from = fmt(first); to = fmt(last);
        setDatePresetLabel("Mes pasado");
        break;
      }
    }
    setDateFrom(from);
    setDateTo(to);
    setPickingStart(true);
  };

  const applyDateFilter = () => {
    setShowDatePicker(false);
    setPage(1);
    fetchContacts(1, search, filterStatus, filterLabel, dateFrom, dateTo, filterAgent, filterStarred);
  };

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setDatePresetLabel("");
    setShowDatePicker(false);
    setPage(1);
    fetchContacts(1, search, filterStatus, filterLabel, dateFrom, dateTo, filterAgent, filterStarred);
  };

  const handleCalendarDayClick = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const fmt = (dt: Date) => dt.toISOString().split("T")[0];
    if (pickingStart) {
      setDateFrom(fmt(d));
      setDateTo(fmt(d));
      setPickingStart(false);
      setDatePresetLabel("Personalizado");
    } else {
      const fromDate = new Date(dateFrom);
      if (d < fromDate) {
        setDateFrom(fmt(d));
        setDateTo(fmt(fromDate));
      } else {
        setDateTo(fmt(d));
      }
      setPickingStart(true);
      setDatePresetLabel("Personalizado");
    }
  };

  const getCalendarDays = () => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start
    const days: (number | null)[] = Array(offset).fill(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const isDayInRange = (day: number) => {
    if (!dateFrom || !dateTo || !day) return false;
    const d = new Date(calYear, calMonth, day).toISOString().split("T")[0];
    return d >= dateFrom && d <= dateTo;
  };

  const isDayStart = (day: number) => {
    if (!dateFrom || !day) return false;
    return new Date(calYear, calMonth, day).toISOString().split("T")[0] === dateFrom;
  };

  const isDayEnd = (day: number) => {
    if (!dateTo || !day) return false;
    return new Date(calYear, calMonth, day).toISOString().split("T")[0] === dateTo;
  };

  const selectContact = (contact: Contact, e?: React.MouseEvent) => {
    // Ctrl/Cmd+click = multi-select
    if (e && (e.ctrlKey || e.metaKey)) {
      const idx = contacts.findIndex(c => c.session_id === contact.session_id);
      toggleSelectContact(contact.session_id, idx, e);
      return;
    }
    // Shift+click = range select
    if (e && e.shiftKey && selectedContacts.size > 0) {
      const idx = contacts.findIndex(c => c.session_id === contact.session_id);
      toggleSelectContact(contact.session_id, idx, e);
      return;
    }
    // Normal click = single select
    setSelectedContact(contact);
    setMsgPage(1);
    setShowContactInfo(false);
    setNewMessage("");
    setSendError("");
    setIsNoteMode(false);
    setShowCanned(false);
    setMobileView("chat");
    isInitialLoadRef.current = true;
    prevLastMsgIdRef.current = "";
    prevMsgCountRef.current = 0;
    fetchMessages(contact.session_id, 1);
    // Mark as read immediately in UI
    if (contact.has_unread) {
      setContacts(prev => prev.map(cc => cc.session_id === contact.session_id ? { ...cc, has_unread: false } : cc));
    }
    setContactCity(contact.ciudad || "");
    setHasPurchased(false);
    setTimeout(() => msgInputRef.current?.focus(), 200);
    // Auto-suggest if last message was from client
    if (aiEnabledRef.current && !contact.ultimo_es_bot) {
      setAiSuggesting(true);
      setAiThinking(contact.session_id);
      setAiStatus("Cargando conversación...");
      setTimeout(() => {
        fetch("/api/whatsapp/ai-suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: contact.session_id }),
        }).then(async (res) => {
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          if (!reader) return;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            let eventType = "";
            for (const line of lines) {
              if (line.startsWith("event: ")) eventType = line.slice(7);
              else if (line.startsWith("data: ") && eventType) {
                try {
                  const payload = JSON.parse(line.slice(6));
                  if (eventType === "status") setAiStatus(payload.step);
                  else if (eventType === "suggestion") {
                    setAiThinking("");
                    setAiStatus("");
                    if (payload.sources && payload.sources.length > 0) setAiSource(payload.sources.join(" + "));
                    if (payload.ciudad) setContactCity(payload.ciudad);
                    const text = payload.text || "";
                    if (payload.hasPurchased) setHasPurchased(true);
                    const clean = text.replace("__NO_SE__", "").trim();
                    if (text.includes("__NO_SE__") && !clean) {
                      setNewMessage("Permítame consultar un momento"); setAiUnknownChats(prev => new Set(prev).add(contact.session_id));
                    } else if (clean || text) {
                      setNewMessage(clean || text);
                      setAiLastSuggestion(clean || text);
                    }
                  }
                } catch {}
                eventType = "";
              }
            }
          }
          setAiThinking("");
          setAiStatus("");
        }).catch(() => { setAiThinking(""); setAiStatus(""); }).finally(() => { setAiSuggesting(false); });
      }, 300);
    }
  };

  const sendMessage = async () => {
    if (!selectedContact || sending) return;
    if (!newMessage.trim() && pendingMedia.length === 0) return;
    setSending(true);
    setSendError("");

    try {
      if (isNoteMode) {
        // Send private note
        const res = await fetch("/api/sequoia-chat/note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: selectedContact.session_id, note: newMessage.trim() }),
        });
        if (!res.ok) {
          const d = await res.json();
          setSendError(d.error || "Error al guardar nota");
          return;
        }
      } else {
        // Send WhatsApp message (only if there's text)
        if (newMessage.trim()) {
          const res = await fetch("/api/whatsapp/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to: selectedContact.session_id, message: newMessage.trim() }),
          });
          const d = await res.json();
          if (!res.ok) {
            setSendError(d.error || "Error al enviar");
            return;
          }
          // Preserve link preview for the sent message bubble
          if (d.messageId && linkPreview) {
            setMsgPreviews(prev => ({ ...prev, [d.messageId]: linkPreview }));
          }
        }
      }
      // Send pending media items (from canned responses) sequentially
      if (pendingMedia.length > 0 && !isNoteMode) {
        for (const media of pendingMedia) {
          await new Promise(r => setTimeout(r, 300));
          try {
            await fetch("/api/whatsapp/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ to: selectedContact.session_id, mediaUrl: media.url, mediaType: media.type }),
            });
          } catch {}
        }
      }
      // If AI didn't know and human is answering, save as learned knowledge
      const unknownQ = aiUnknownQuestions[selectedContact.session_id];
      if (unknownQ && newMessage.trim() && !isNoteMode) {
        fetch("/api/whatsapp/ai-learn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: selectedContact.session_id,
            aiSuggestion: "__NO_SE__",
            finalMessage: newMessage.trim(),
            correctionType: "learned",
            customerQuestion: unknownQ,
          }),
        }).catch(() => {});
        setAiUnknownQuestions(prev => { const n = { ...prev }; delete n[selectedContact.session_id]; return n; });
      }
      // Clear AI unknown flag for this chat
      setAiUnknownChats(prev => { const n = new Set(prev); n.delete(selectedContact.session_id); return n; });
      // Track AI learning if suggestion was used (normal corrections)
      if (aiLastSuggestion && !unknownQ && newMessage.trim() && !isNoteMode) {
        const corrType = newMessage.trim() === aiLastSuggestion ? "accepted" : "modified";
        fetch("/api/whatsapp/ai-learn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: selectedContact.session_id,
            aiSuggestion: aiLastSuggestion,
            finalMessage: newMessage.trim(),
            correctionType: corrType,
          }),
        }).catch(() => {});
        setAiLastSuggestion("");
      }
      setNewMessage("");
      setAiSource("");
      setPendingMedia([]);
      setLinkPreview(null);
      setIsNoteMode(false);
      shouldScrollToBottomRef.current = true;
      await fetchMessages(selectedContact.session_id, msgPage, true);
      // Force scroll to bottom after sending
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      msgInputRef.current?.focus();
    } catch (e: any) {
      setSendError(e.message || "Error de conexion");
    } finally {
      setSending(false);
    }
  };


  const aiSuggest = async () => {
    if (!selectedContact || aiSuggesting) return;
    setAiSuggesting(true);
    setAiThinking(selectedContact.session_id);
    setAiStatus("Cargando conversación...");
    try {
      const res = await fetch("/api/whatsapp/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedContact.session_id }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          let eventType = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7);
            else if (line.startsWith("data: ") && eventType) {
              try {
                const payload = JSON.parse(line.slice(6));
                if (eventType === "status") {
                  setAiStatus(payload.step);
                } else if (eventType === "suggestion") {
                  if (payload.sources && payload.sources.length > 0) {
                    setAiSource(payload.sources.join(" + "));
                  } else {
                    
                  }
                  const text = payload.text || "";
                  if (payload.ciudad) setContactCity(payload.ciudad);
                  const clean = text.replace("__NO_SE__", "").trim();
                  if (payload.hasPurchased) setHasPurchased(true);
                  if (text.includes("__NO_SE__") && !clean) {
                    setNewMessage("Permítame consultar un momento");
                    setAiUnknownChats(prev => new Set(prev).add(selectedContact!.session_id));
                    const lastClientMsg = messages.filter(m => !m.is_bot).pop();
                    if (lastClientMsg) setAiUnknownQuestions(prev => ({ ...prev, [selectedContact!.session_id]: lastClientMsg.mensaje }));
                  } else if (clean || text) {
                    setNewMessage(clean || text);
                    setAiLastSuggestion(clean || text);
                    setAiUnknownChats(prev => { const n = new Set(prev); n.delete(selectedContact!.session_id); return n; });
                    msgInputRef.current?.focus();
                    setTimeout(() => {
                      if (msgInputRef.current) {
                        msgInputRef.current.style.height = "auto";
                        msgInputRef.current.style.height = Math.min(msgInputRef.current.scrollHeight, 256) + "px";
                      }
                    }, 50);
                  }
                }
              } catch {}
              eventType = "";
            }
          }
        }
      }
    } catch (e: any) {
      console.error("AI suggest error:", e);
    } finally {
      setAiSuggesting(false);
      setAiThinking("");
      setAiStatus("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === "a" && e.altKey) {
      e.preventDefault();
      setAiEnabled(prev => !prev);
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    // Detect /shortcode for canned responses
    if (value.startsWith("/") && value.length > 1) {
      const code = value.slice(1);
      setShowCanned(true);
      setCannedFilter(code);
      fetchCanned(code);
    } else {
      setShowCanned(false);
    }
    // Detect URLs for link preview
    if (linkPreviewTimeoutRef.current) clearTimeout(linkPreviewTimeoutRef.current);
    const urlMatch = value.match(/(https?:\/\/[^\s]+)/i);
    if (urlMatch && urlMatch[1] !== linkPreview?.url) {
      linkPreviewTimeoutRef.current = setTimeout(async () => {
        setLoadingPreview(true);
        try {
          const res = await fetch(`/api/link-preview?url=${encodeURIComponent(urlMatch[1])}`);
          if (res.ok) {
            const data = await res.json();
            if (data.title || data.description) setLinkPreview(data);
          }
        } catch {}
        setLoadingPreview(false);
      }, 600);
    } else if (!urlMatch) {
      setLinkPreview(null);
    }
  };

  const applyCanned = (cr: CannedResponse) => {
    const interpolated = interpolateVars(cr.content, selectedContact);
    setNewMessage(interpolated);
    setPendingMedia(cr.media || []);
    setShowCanned(false);
    msgInputRef.current?.focus();
  };

  const deleteChat = async () => {    if (!selectedContact) return;    try {      const res = await fetch("/api/sequoia-chat/contacts/delete", {        method: "DELETE",        headers: { "Content-Type": "application/json" },        body: JSON.stringify({ sessionId: selectedContact.session_id }),      });      if (res.ok) {        setContacts(prev => prev.filter(c => c.session_id !== selectedContact.session_id));        setSelectedContact(null);        setMessages([]);        setShowDeleteConfirm(false);      }    } catch (err) {      console.error("Error deleting chat:", err);    }  };
  const toggleLabel = async (labelId: number) => {
    if (!selectedContact) return;
    const hasLabel = contactLabels.some((l) => l.id === labelId);
    try {
      const res = await fetch("/api/sequoia-chat/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: hasLabel ? "remove" : "add",
          contactId: selectedContact.id,
          labelId,
        }),
      });
      setContactLabels(await res.json());
    } catch {}
  };

  // Group messages by date
  const filteredMessages = msgSearch
    ? messages.filter((m) => m.mensaje?.toLowerCase().includes(msgSearch.toLowerCase()))
    : messages;

  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  let currentDate = "";
  filteredMessages.forEach((msg) => {
    const d = new Date(msg.fecha_creacion).toLocaleDateString("es-CO", {
      day: "2-digit", month: "long", year: "numeric",
    });
    if (d !== currentDate) {
      currentDate = d;
      groupedMessages.push({ date: d, msgs: [] });
    }
    groupedMessages[groupedMessages.length - 1].msgs.push(msg);
  });

  // ─── Render ───

  // ── Emoji Data ──
  const EMOJI_CATS = [
    { icon: "😀", name: "Caras", emojis: ["😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😎","😍","🥰","😘","😗","😙","😚","🙂","🤗","🤩","🤔","🤨","😐","😑","😶","🙄","😏","😣","😥","😮","🤐","😯","😪","😫","🥱","😴","😌","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤥","😬","😒","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"] },
    { icon: "❤️", name: "Amor", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","♥️","💋","💌","💐","🌹","🥀","🌺","🌸","🌼","🌻"] },
    { icon: "👋", name: "Manos", emojis: ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💪","🦾"] },
    { icon: "🐶", name: "Animales", emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜"] },
    { icon: "🍔", name: "Comida", emojis: ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🌶️","🌽","🥕","🧄","🧅","🥔","🍔","🍟","🍕","🌭","🥪","🌮","🌯","🫔","🥙","🧆","🥚","🍳","🥘","🍲","🥣","🥗","🍿","🧈","🧀","🥩","🍖","🍗"] },
    { icon: "⚽", name: "Deporte", emojis: ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🥅","⛳","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛷","⛸️","🥌","🎿","🏂","🪂","🏋️","🤸","⛹️","🤾","🚴","🧗","🤺"] },
    { icon: "🚗", name: "Viaje", emojis: ["🚗","🚕","🚙","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍️","🛵","🚲","🛴","🚨","🚔","🚍","🚘","🚖","🚡","🚠","🚟","🚃","🚋","🚞","🚝","🚄","🚅","🚈","🚂","🚆","🚇","🚊","🚉","✈️","🛫","🛬","🛩️","💺","🛰️","🚀","🛸","🚁","🛶","⛵","🚤","🛥️","🛳️","⛴️","🚢"] },
  ];

  // ── Voice Recording ──
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) return; // too short
        const formData = new FormData();
        formData.append("files", blob, `voice_${Date.now()}.webm`);
        try {
          const res = await fetch("/api/sequoia-chat/canned/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (data.files?.[0]) {
            setPendingMedia(prev => [...prev, { url: data.files[0].url, type: "audio", name: "Nota de voz" }]);
            // Auto-send voice note
            setTimeout(() => document.getElementById("send-msg-btn")?.click(), 100);
          }
        } catch (err) { console.error("Audio upload error:", err); }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (err) {
      console.error("Mic access denied:", err);
      alert("No se pudo acceder al micrófono. Verifica los permisos del navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatRecTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <div className={`h-screen flex ${t.bg} ${t.text} transition-colors duration-300`}>
              {/* ─── AI Mode Modal ─── */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAiModal(false)}>
          <div className={`${t.sidebar} border ${t.sidebarBorder} rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-bold ${t.text}`}>Modo IA</h3>
              <button onClick={() => setShowAiModal(false)} className={`${t.textMuted2} hover:${t.text} text-xl leading-none`}>&times;</button>
            </div>

            <div className="space-y-2">
              {/* Modo IA 100% */}
              <button
                onClick={() => { setAiEnabled(true); setShowAiModal(false); localStorage.setItem("wa-ai-mode", "ia"); }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  aiEnabled && localStorage.getItem("wa-ai-mode") !== "hybrid"
                    ? "border-purple-500 bg-purple-500/10"
                    : `border-transparent ${t.inputBg} hover:border-purple-500/30`
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{"\u{1F916}"}</span>
                  <div>
                    <p className={`text-sm font-semibold ${t.text}`}>Modo IA 100%</p>
                    <p className={`text-xs ${t.textMuted2}`}>La IA sugiere y envia automaticamente</p>
                  </div>
                </div>
              </button>

              {/* Modo Hibrido */}
              <button
                onClick={() => { setAiEnabled(true); setShowAiModal(false); localStorage.setItem("wa-ai-mode", "hybrid"); }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  aiEnabled && localStorage.getItem("wa-ai-mode") === "hybrid"
                    ? "border-blue-500 bg-blue-500/10"
                    : `border-transparent ${t.inputBg} hover:border-blue-500/30`
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{"\u{1F91D}"}</span>
                  <div>
                    <p className={`text-sm font-semibold ${t.text}`}>Modo Hibrido</p>
                    <p className={`text-xs ${t.textMuted2}`}>La IA sugiere la respuesta, tu presionas enviar</p>
                  </div>
                </div>
              </button>

              {/* Modo Humano 100% */}
              <button
                onClick={() => { setAiEnabled(false); setShowAiModal(false); localStorage.setItem("wa-ai-mode", "human"); }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  !aiEnabled
                    ? "border-green-500 bg-green-500/10"
                    : `border-transparent ${t.inputBg} hover:border-green-500/30`
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{"\u{1F464}"}</span>
                  <div>
                    <p className={`text-sm font-semibold ${t.text}`}>Modo Humano 100%</p>
                    <p className={`text-xs ${t.textMuted2}`}>La IA ni siquiera sugiere respuestas</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Theme Picker Panel ─── */}
      {showThemePanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]" onClick={() => setShowThemePanel(false)}>
          <div className={`${t.sidebar} border ${t.sidebarBorder} rounded-2xl p-6 w-full max-w-96 mx-4 shadow-2xl animate-[zoom-in_0.3s_cubic-bezier(0.22,1,0.36,1)]`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-bold ${t.text}`}>🎨 Temas</h3>
              <button onClick={() => setShowThemePanel(false)} className={`${t.textMuted} hover:${t.text} text-xl`}>✕</button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, th]) => (
                <button
                  key={key}
                  onClick={() => changeTheme(key)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${
                    theme === key
                      ? `${th.selected} border-green-500 ring-1 ring-green-500/50`
                      : `${th.sidebar} ${th.sidebarBorder} hover:border-green-500/30`
                  }`}
                >
                  <span className="text-2xl">{th.icon}</span>
                  <div className="flex-1 text-left">
                    <span className={`font-medium ${th.text}`}>{th.name}</span>
                  </div>
                  {/* Color preview dots */}
                  <div className="flex gap-1">
                    <span className={`w-4 h-4 rounded-full ${th.bubbleOut}`} />
                    <span className={`w-4 h-4 rounded-full ${th.bubbleIn}`} />
                    <span className={`w-4 h-4 rounded-full ${th.accentBg}`} />
                  </div>
                  {theme === key && <span className="text-green-500 text-lg">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── LEFT: Contact List ─── */}
      <div className={`${mobileView === "contacts" ? "flex" : "hidden"} md:flex w-full md:w-72 ${t.sidebar} border-r ${t.sidebarBorder} flex-col shrink-0 transition-colors duration-300`}>
        <div className={`p-3 border-b ${t.sidebarBorder}`}>
          <h2 className={`text-lg font-bold ${t.text} flex items-center gap-2`}>
            <svg className="w-7 h-7 text-[#25d366] ml-5 md:ml-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> WhatsApp
            <span className={`text-xs ${t.textMuted2} font-normal ml-auto flex items-center gap-2`}>
              {totalContacts.toLocaleString()} chats
              <Link href="/panel/whatsapp/campaigns" className={`${t.textMuted2} hover:${t.text} transition-all duration-200 hover:scale-125`} title="Campanas">📢</Link>
              <Link href="/panel/whatsapp/analytics" className={`${t.textMuted2} hover:${t.text} transition-all duration-200 hover:scale-125`} title="Analytics">📊</Link>
              <button onClick={() => setShowThemePanel(true)} className={`${t.textMuted2} hover:${t.text} transition-all duration-200 hover:scale-125`} title="Temas">🎨</button>
              <Link href="/panel/whatsapp/settings" className={`${t.textMuted2} hover:${t.text} transition-all duration-200 hover:scale-125`} title="Configuracion">⚙</Link>
              <button onClick={() => setAiEnabled(!aiEnabled)} className={`${aiEnabled ? "text-purple-400" : `${t.textMuted2}`} hover:text-purple-400 transition-all duration-200 hover:scale-125 ${aiSuggesting ? "animate-pulse" : ""}`} title={aiEnabled ? "IA activa (click para apagar)" : "IA apagada (click para activar)"}>
                {aiSuggesting ? "⏳" : aiEnabled ? "✨" : "🚫"}
              </button>
            </span>
          </h2>
          <div className="mt-2 flex gap-1.5">
            <div className="flex-1 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar contacto..."
                className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-lg px-3 py-2 text-sm ${t.text} placeholder:${t.textMuted2} outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 focus:shadow-[0_0_12px_rgba(34,197,94,0.15)] transition-all duration-200`}
              />
              {search && (
                <button onClick={() => { setSearch(""); fetchContacts(1, "", filterStatus, filterLabel, dateFrom, dateTo, filterAgent, filterStarred); setPage(1); }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 ${t.textMuted2} hover:${t.text} text-xs`}>✕</button>
              )}
            </div>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`px-2.5 py-2 rounded-lg text-sm transition shrink-0 ${
                dateFrom ? `${t.accentBg} text-white` : `${t.inputBg} border ${t.inputBorder} ${t.textMuted2} hover:${t.text}`
              }`}
              title="Filtrar por fecha"
            >📅</button>
            <button
              onClick={() => { const nv = !filterStarred; setFilterStarred(nv); setPage(1); fetchContacts(1, search, filterStatus, filterLabel, dateFrom, dateTo, filterAgent, nv); }}
              className={`px-2 py-1.5 text-sm rounded-lg transition-all duration-200 shrink-0 ${
                filterStarred ? "bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/40" : `${t.inputBg} border ${t.inputBorder} ${t.textMuted2} hover:text-yellow-400`
              }`}
              title="Filtrar favoritos"
            >★</button>
            <select
              value={filterAgent}
              onChange={(e) => { setFilterAgent(e.target.value); setPage(1); fetchContacts(1, search, filterStatus, filterLabel, dateFrom, dateTo, e.target.value, filterStarred); }}
              className={`px-2 py-2 rounded-lg text-xs transition shrink-0 max-w-[100px] ${
                filterAgent ? `${t.accentBg} text-white` : `${t.inputBg} border ${t.inputBorder} ${t.textMuted2}`
              } outline-none`}
              title="Filtrar por agente"
            >
              <option value="">👤 Agente</option>
              <option value="unassigned">Sin asignar</option>
              {agents.map(a => (
                <option key={a.id} value={String(a.id)}>{a.name}</option>
              ))}
            </select>
          </div>
          {/* Active filter chips */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {dateFrom && (
              <div className={`flex items-center gap-1 text-[10px] ${t.accent}`}>
                <span>📅 {datePresetLabel || "Personalizado"}: {dateFrom === dateTo ? dateFrom : `${dateFrom} — ${dateTo}`}</span>
                <button onClick={clearDateFilter} className="hover:text-red-400 ml-1">✕</button>
              </div>
            )}
            {filterAgent && (
              <div className={`flex items-center gap-1 text-[10px] ${t.accent}`}>
                <span>👤 {filterAgent === "unassigned" ? "Sin asignar" : agents.find(a => a.id === parseInt(filterAgent))?.name || filterAgent}</span>
                <button onClick={() => { setFilterAgent(""); setPage(1); fetchContacts(1, search, filterStatus, filterLabel, dateFrom, dateTo, "", filterStarred); }} className="hover:text-red-400 ml-1">✕</button>
              </div>
            )}
          </div>
          {/* Status tabs */}
          <div className={`flex gap-0.5 mt-2 ${t.inputBg} rounded-lg p-0.5`}>
            {([
              { key: "", label: "Todos", count: statusCounts.all },
              { key: "0", label: "Abiertos", count: statusCounts.open },
              { key: "1", label: "Pendientes", count: statusCounts.pending },
              { key: "2", label: "Resueltos", count: statusCounts.resolved },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleStatusFilter(tab.key)}
                className={`flex-1 text-[10px] py-1.5 rounded-md transition-all duration-200 font-medium ${
                  filterStatus === tab.key
                    ? `${t.selected} ${t.text} shadow-sm`
                    : `${t.textMuted2} hover:${t.textMuted}`
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1 text-[9px] ${filterStatus === tab.key ? t.accent : t.textMuted2}`}>
                    {tab.count > 999 ? Math.floor(tab.count/1000) + "k" : tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Label filter chips - collapsed by default, toggle on click */}
          <div className="hidden md:block mt-2">
            <button
              onClick={() => setShowLabelChips(prev => !prev)}
              className={`text-[10px] ${t.textMuted2} hover:${t.text} transition-all duration-200 flex items-center gap-1`}
            >
              <span>{showLabelChips ? "▾" : "▸"}</span>
              <span>Etiquetas</span>
              {filterLabel && <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-1" />}
            </button>
            {showLabelChips && (
              <div className="flex flex-wrap gap-1 mt-1">
                {labels.slice(0, 6).map((l) => (
                  <button
                    key={l.id}
                    onClick={() => { setFilterLabel(filterLabel === l.id ? null : l.id); setPage(1); fetchContacts(1, search, filterStatus, filterLabel === l.id ? null : l.id, dateFrom, dateTo, filterAgent); }}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-all duration-200 hover:scale-105 ${
                      filterLabel === l.id
                        ? `border-white/30 ${t.text}`
                        : `${t.sidebarBorder} ${t.textMuted2} hover:${t.textMuted}`
                    }`}
                    style={filterLabel === l.id ? { backgroundColor: l.color + "30", borderColor: l.color } : {}}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: l.color }} />
                    {l.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Multi-select action bar */}
        {selectedContacts.size > 0 && (
          <div className={`p-2 border-b ${t.sidebarBorder} ${t.accentBg}/10 flex items-center gap-2`}>
            <span className={`text-xs ${t.accent} font-medium flex-1`}>
              ☑ {selectedContacts.size} seleccionado{selectedContacts.size > 1 ? "s" : ""}
            </span>
            <button onClick={() => { setShowBulkSend(true); setBulkResults([]); setBulkProgress({ sent: 0, failed: 0, total: 0 }); }}
              className="text-[10px] px-2 py-1 bg-green-700 text-white rounded hover:bg-green-600 hover:shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all duration-200">📢 Masivo</button>
            <button onClick={selectAllVisible}
              className={`text-[10px] px-2 py-1 ${t.inputBg} ${t.textMuted} rounded hover:${t.text} transition`}>☑ Todos</button>
            <button onClick={clearMultiSelect}
              className={`text-[10px] px-1.5 py-1 ${t.textMuted2} hover:text-red-400 transition`}>✕</button>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto ${t.scrollTrack} ${t.scrollThumb} [&::-webkit-scrollbar]:w-1.5`}>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            </div>
          ) : contacts.length === 0 ? (
            <p className={`${t.textMuted2} text-sm text-center py-10`}>No hay contactos</p>
          ) : (
            contacts.map((c, idx) => {
              const isMultiSelected = selectedContacts.has(c.session_id);
              return (
                <button
                  key={c.session_id}
                  onClick={(e) => selectContact(c, e)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, contact: c });
                  }}
                  className={`group w-full text-left px-3 py-3 border-b ${t.sidebarBorder}/50 ${t.hover} transition-all duration-200 hover:scale-[1.01] ${
                    selectedContact?.session_id === c.session_id ? `${t.contactActive} border-l-2 border-l-green-500` : ""
                  } ${isMultiSelected ? `${t.contactActive} ring-1 ring-green-500/40` : ""} ${c.cliente_desinteresado ? "opacity-50" : aiUnknownChats.has(c.session_id) ? "bg-red-900/40 border-l-2 border-l-red-500" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {/* Checkbox for multi-select */}
                    {selectedContacts.size > 0 && (
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleSelectContact(c.session_id, idx); }}
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 hover:scale-125 ${
                          isMultiSelected
                            ? `${t.accentBg} border-green-500 text-white`
                            : `${t.inputBorder} ${t.inputBg}`
                        }`}
                      >
                        {isMultiSelected && <span className="text-[10px]">✓</span>}
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-full ${aiUnknownChats.has(c.session_id) ? "bg-red-600/30 ring-2 ring-red-500/50" : t.inputBg} flex items-center justify-center text-lg shrink-0 transition-transform duration-300 hover:scale-110`}>
                      {c.followup_next_at ? (
                        <span className="text-base" title={`Follow-up: ${c.followup_product || "programado"}`}>🔄</span>
                      ) : (
                        <span>{c.nombre ? c.nombre.charAt(0).toUpperCase() : "?"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleStar(c.id, !!c.starred); }}
                          className={`shrink-0 text-sm transition-all duration-200 hover:scale-125 mr-0.5 ${c.starred ? "text-yellow-400" : `${t.textMuted2} opacity-0 group-hover:opacity-100`}`}
                          title={c.starred ? "Quitar favorito" : "Marcar favorito"}
                        >
                          {c.starred ? "★" : "☆"}
                        </button>
                        <p className={`text-sm ${c.has_unread ? "font-bold" : "font-medium"} ${t.text} truncate flex items-center gap-1.5`}>
                          {c.has_unread && <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full shrink-0 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]" />}
                          {c.blocked ? "🚫 " : c.ai_auto ? "✨ " : ""}{c.nombre || c.session_id}
                        </p>
                        <span className={`text-[10px] ${t.textMuted2} shrink-0 ml-2`}>{formatDate(c.fecha_ultimo_mensaje)}</span>
                      </div>
                      <p className={`text-xs ${c.has_unread ? `${t.text} font-semibold` : t.textMuted2} truncate mt-0.5`}>{c.ultimo_mensaje || "Sin mensajes"}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] ${t.textMuted2} hidden md:inline`}>{c.session_id}</span>
                        {c.total_messages > 0 && (
                          <span className={`text-[10px] ${t.inputBg} ${t.textMuted} px-1.5 rounded`}>{c.total_messages}</span>
                        )}
                        {c.has_unread ? (
                          <span className="text-[9px] text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded font-semibold">● sin leer</span>
                        ) : c.conversation_status === 0 ? (() => {
                          const lastClientMsg = c.ultimo_mensaje_cliente ? new Date(c.ultimo_mensaje_cliente) : null;
                          const expired = lastClientMsg ? (Date.now() - lastClientMsg.getTime()) > 24 * 60 * 60 * 1000 : true;
                          return expired
                            ? <span className="text-[9px] text-orange-400 bg-orange-900/30 px-1.5 py-0.5 rounded">⏳ Ventana 24H</span>
                            : <span className="text-[9px] text-green-500">● abierto</span>;
                        })() : c.conversation_status === 1 ? (
                          <span className="text-[9px] text-yellow-500">● pendiente</span>
                        ) : c.conversation_status === 2 ? (
                          <span className={`text-[9px] ${t.textMuted2}`}>✓ resuelto</span>
                        ) : null}
                        {c.agent_name && (
                          <span className={`text-[9px] ${getAgentColor(c.agent_name).bg} ${getAgentColor(c.agent_name).text} px-1.5 py-0.5 rounded ml-auto`}>{c.agent_name.split(" ")[0]}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className={`p-2 border-t ${t.sidebarBorder} flex items-center justify-between`}>
            <button onClick={() => { setPage(page - 1); fetchContacts(page - 1, search, filterStatus, filterLabel, dateFrom, dateTo, filterAgent); }} disabled={page <= 1}
              className={`px-2 py-1 text-xs ${t.inputBg} rounded ${t.textMuted} hover:${t.text} disabled:opacity-30`}>◀</button>
            <span className={`text-xs ${t.textMuted2}`}>{page}/{totalPages}</span>
            <button onClick={() => { setPage(page + 1); fetchContacts(page + 1, search, filterStatus, filterLabel, dateFrom, dateTo, filterAgent); }} disabled={page >= totalPages}
              className={`px-2 py-1 text-xs ${t.inputBg} rounded ${t.textMuted} hover:${t.text} disabled:opacity-30`}>▶</button>
          </div>
        )}
      </div>

      {/* ─── RIGHT: Chat Area ─── */}
      <div className={`${mobileView === "chat" || mobileView === "info" ? "flex" : "hidden"} md:flex flex-1 flex-col ${t.chatBg} transition-colors duration-300 w-full`}>
        {!selectedContact ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-20">💬</div>
              <p className={`${t.textMuted2} text-lg`}>Selecciona un chat</p>
              <p className={`${t.textMuted2} text-sm mt-2`}>{totalContacts.toLocaleString()} conversaciones</p>
              <div className={`mt-6 text-left inline-block ${t.sidebar} border ${t.sidebarBorder} rounded-xl p-4`}>
                <p className={`${t.textMuted2} text-xs font-medium mb-3`}>Atajos de teclado</p>
                <div className="space-y-1.5 text-[11px]">
                  {[
                    ["↑ ↓", "Navegar contactos"],
                    ["Alt+R", "Resolver / Reabrir"],
                    ["Alt+N", "Modo nota interna"],
                    ["Alt+M", "Modo mensaje"],
                    ["Alt+I", "Info del contacto"],
                    ["Alt+F", "Buscar en mensajes"],
                    ["/", "Respuestas rapidas"],
                    ["Esc", "Cerrar paneles"],
                  ].map(([key, desc]) => (
                    <div key={key} className="flex items-center gap-3">
                      <kbd className={`${t.inputBg} ${t.textMuted} px-1.5 py-0.5 rounded text-[10px] font-mono min-w-[50px] text-center`}>{key}</kbd>
                      <span className={t.textMuted2}>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className={`px-2 md:px-4 py-3 ${t.headerBg} border-b ${t.sidebarBorder} flex items-center gap-2 md:gap-3 transition-colors duration-300`}>
              {/* Back button (mobile only) */}
              <button
                className={`md:hidden p-1.5 rounded-lg ${t.textMuted} active:bg-white/10`}
                onClick={() => { setMobileView("contacts"); setSelectedContact(null); }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
              </button>
              <div className={`w-10 h-10 rounded-full ${t.inputBg} flex items-center justify-center text-lg shrink-0 transition-transform duration-300 hover:scale-110`}>
                {selectedContact.nombre ? selectedContact.nombre.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`${t.text} font-medium truncate`}>{selectedContact.blocked ? "🚫 " : ""}{selectedContact.nombre || "Sin nombre"}</h3>
                <p className={`text-xs ${t.textMuted2}`}>{selectedContact.session_id}{selectedContact.ciudad ? ` · ${selectedContact.ciudad}` : ""}{selectedContact.blocked ? " · BLOQUEADO" : ""}</p>
              </div>
              <div className="flex gap-1 md:gap-2 shrink-0 items-center">
                {/* Status actions */}
                {selectedContact.conversation_status !== 2 ? (
                  <button
                    onClick={() => updateContactStatus(2)}
                    className="px-2 md:px-3 py-1.5 rounded-lg text-xs bg-green-700/80 text-white hover:bg-green-600 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-green-600/20 active:scale-95 flex items-center gap-1"
                  ><span className="hidden md:inline">✓ </span>Resolver</button>
                ) : (
                  <button
                    onClick={() => updateContactStatus(0)}
                    className={`px-2 md:px-3 py-1.5 rounded-lg text-xs ${t.inputBg} text-yellow-400 ${t.hover} transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1`}
                  >↻<span className="hidden md:inline"> Reabrir</span></button>
                )}

                {/* Pending button - desktop only */}
                {selectedContact.conversation_status === 0 && (
                  <button
                    onClick={() => updateContactStatus(1)}
                    className={`hidden md:block px-2.5 py-1.5 rounded-lg text-xs ${t.inputBg} text-yellow-400 ${t.hover} transition`}
                    title="Marcar como pendiente"
                  >⏳</button>
                )}

                {/* Agent assignment - desktop only */}
                <select
                  value={selectedContact.assigned_agent_id || ""}
                  onChange={(e) => assignAgent(e.target.value ? Number(e.target.value) : null)}
                  className={`hidden md:block ${t.inputBg} border ${t.inputBorder} text-xs ${t.textMuted} rounded-lg px-2 py-1.5 outline-none focus:border-green-600 max-w-[120px]`}
                >
                  <option value="">Sin asignar</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>

                <div className={`hidden md:block w-px h-5 ${t.inputBorder}`} />

                <button
                  onClick={() => setShowMsgSearch(!showMsgSearch)}
                  className={`hidden md:block px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 hover:scale-110 active:scale-95 ${showMsgSearch ? `${t.accentBg} text-white` : `${t.inputBg} ${t.textMuted} hover:${t.text}`}`}
                >🔍</button>
                <a href={`https://wa.me/${selectedContact.session_id}`} target="_blank" rel="noopener"
                  className="hidden md:block px-2.5 py-1.5 rounded-lg text-xs bg-green-700 text-white hover:bg-green-600 transition-all duration-200 hover:scale-110 active:scale-95">WA</a>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-2 md:px-2.5 py-1.5 rounded-lg text-xs transition ${soundEnabled ? `${t.inputBg} ${t.textMuted} hover:${t.text}` : `bg-red-900/50 text-red-400`}`}
                  title={soundEnabled ? "Silenciar notificaciones" : "Activar sonido"}
                >{soundEnabled ? "🔔" : "🔕"}</button>

                <button                  onClick={() => setShowDeleteConfirm(true)}                  className={`px-2 md:px-2.5 py-1.5 rounded-lg text-xs transition ${t.inputBg} ${t.textMuted} hover:text-red-400 hover:bg-red-900/30`}                  title="Eliminar chat"                >                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>                </button>
                <button
                  onClick={() => { setShowContactInfo(!showContactInfo); if (!showContactInfo) setMobileView("info"); else setMobileView("chat"); }}
                  className={`px-2 md:px-2.5 py-1.5 rounded-lg text-xs transition ${showContactInfo ? `${t.accentBg} text-white` : `${t.inputBg} ${t.textMuted} hover:${t.text}`}`}
                >ℹ</button>
              </div>
            </div>

            {/* Msg search bar */}
            {showMsgSearch && (
              <div className={`px-4 py-2 ${t.headerBg}/50 border-b ${t.sidebarBorder}`}>
                <input
                  type="text"
                  value={msgSearch}
                  onChange={(e) => setMsgSearch(e.target.value)}
                  placeholder="Buscar en mensajes..."
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-lg px-3 py-1.5 text-sm ${t.text} placeholder:${t.textMuted2} outline-none focus:border-green-600`}
                  autoFocus
                />
                {msgSearch && <p className={`text-[10px] ${t.textMuted2} mt-1`}>{filteredMessages.length} resultados</p>}
              </div>
            )}

            <div className="flex-1 flex overflow-hidden relative">
            {/* Delete confirmation modal */}            {showDeleteConfirm && selectedContact && (              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowDeleteConfirm(false)}>                <div className={`${t.sidebar} border ${t.sidebarBorder} rounded-xl p-6 max-w-sm mx-4 shadow-2xl`} onClick={e => e.stopPropagation()}>                  <p className={`${t.text} text-sm font-medium mb-2`}>Eliminar chat</p>                  <p className={`${t.textMuted} text-xs mb-4`}>Se eliminara todo el historial de mensajes con <strong className={`${t.text}`}>{selectedContact.nombre || selectedContact.session_id}</strong>. Esta accion no se puede deshacer.</p>                  <div className="flex gap-2 justify-end">                    <button onClick={() => setShowDeleteConfirm(false)} className={`px-3 py-1.5 rounded-lg text-xs ${t.inputBg} ${t.textMuted} hover:${t.text}`}>Cancelar</button>                    <button onClick={deleteChat} className="px-3 py-1.5 rounded-lg text-xs bg-red-600 text-white hover:bg-red-500">Eliminar</button>                  </div>                </div>              </div>            )}
              {/* Messages */}
              <div className="flex-1 flex flex-col">
                <div className={`flex-1 overflow-y-auto px-4 py-4 ${t.scrollTrack} ${t.scrollThumb} [&::-webkit-scrollbar]:w-1.5`} style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(34,197,94,0.02) 0%, transparent 50%)" }}>
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
                    </div>
                  ) : (
                    <div className="min-h-full flex flex-col justify-end">
                      {msgTotalPages > 1 && (
                        <div className="flex justify-center mb-4 gap-2">
                          <button onClick={() => { setMsgPage(msgPage + 1); fetchMessages(selectedContact.session_id, msgPage + 1); }} disabled={msgPage >= msgTotalPages}
                            className={`px-3 py-1 text-xs ${t.inputBg} rounded ${t.textMuted} hover:${t.text} disabled:opacity-30`}>◀ Más antiguo</button>
                          <span className={`text-xs ${t.textMuted2} py-1`}>{msgPage}/{msgTotalPages}</span>
                          <button onClick={() => { setMsgPage(msgPage - 1); fetchMessages(selectedContact.session_id, msgPage - 1); }} disabled={msgPage <= 1}
                            className={`px-3 py-1 text-xs ${t.inputBg} rounded ${t.textMuted} hover:${t.text} disabled:opacity-30`}>Más reciente ▶</button>
                        </div>
                      )}

                      {groupedMessages.map((group) => (
                        <div key={group.date}>
                          <div className="flex justify-center my-4">
                            <span className={`${t.inputBg} ${t.textMuted} text-[11px] px-3 py-1 rounded-full animate-[fade-in_0.4s_ease-out] shadow-sm`}>{group.date}</span>
                          </div>
                          {group.msgs.map((msg) => (
                            <div key={msg.id} className={`flex mb-2 ${msg.is_bot ? "justify-end" : "justify-start"} animate-[${msg.is_bot ? "slide-msg-right" : "slide-msg-left"}_0.25s_ease-out]`}>
                              <div className={`max-w-[75%] rounded-xl px-3 py-2 shadow-sm ${
                                msg.private
                                  ? t.bubbleNote
                                  : msg.is_bot
                                    ? t.bubbleOut
                                    : t.bubbleIn
                              } ${msg.mensaje_eliminado ? "opacity-40 line-through" : ""}`}>
                                {msg.private && <p className="text-[10px] text-yellow-500 font-medium mb-1">📌 Nota interna</p>}
                                {msg.is_bot && msg.nombre_agente && !msg.private && (
                                  <p className={`text-[10px] ${getAgentColor(msg.nombre_agente).text} font-medium mb-1`}>{msg.nombre_agente}</p>
                                )}
                                {msg.tipo_archivo && msg.ruta_archivo && (() => {
                                  // Resolve media URL: if it's a numeric Meta media ID, use proxy; otherwise use direct URL
                                  const isMediaId = /^\d+$/.test(msg.ruta_archivo);
                                  const mediaUrl = isMediaId ? `/api/whatsapp/media?id=${msg.ruta_archivo}` : msg.ruta_archivo;
                                  const isImage = msg.tipo_archivo === "image" || msg.tipo_archivo === "image/jpeg" || msg.tipo_archivo === "image/png" || msg.ruta_archivo.match(/\.(jpg|jpeg|png|gif|webp)/i);
                                  const isAudio = msg.tipo_archivo === "audio" || msg.ruta_archivo.match(/\.(ogg|mp3|wav|opus)/i);
                                  const isVideo = msg.tipo_archivo === "video" || msg.ruta_archivo.match(/\.(mp4|webm)/i);
                                  const isSticker = msg.tipo_archivo === "sticker";
                                  return (
                                    <div className="mb-1">
                                      {(isImage || isSticker) ? (
                                        <img src={mediaUrl} alt="" className={`max-w-full rounded-lg ${isSticker ? "max-h-64" : "max-h-60"}`} loading="lazy" />
                                      ) : isAudio ? (
                                        <audio controls src={mediaUrl} className="max-w-full" />
                                      ) : isVideo ? (
                                        <video controls src={mediaUrl} className="max-w-full rounded-lg max-h-60" />
                                      ) : (
                                        <a href={mediaUrl} target="_blank" rel="noopener" className={`${t.accent} text-xs underline`}>📎 {msg.tipo_archivo || "Archivo"}</a>
                                      )}
                                    </div>
                                  );
                                })()}
                                {(() => {
                                  // Render [Template: xxx] as a rich card
                                  const templateMatch = msg.mensaje?.match(/^\[Template:\s*(.+?)\]$/);
                                  if (templateMatch) {
                                    const tmplName = templateMatch[1];
                                    const tmpl = templates.find((tt: any) => tt.name === tmplName);
                                    if (tmpl) {
                                      const hdr = tmpl.components?.find((c: any) => c.type === "HEADER");
                                      const bod = tmpl.components?.find((c: any) => c.type === "BODY");
                                      const btns = tmpl.components?.find((c: any) => c.type === "BUTTONS");
                                      const ftr = tmpl.components?.find((c: any) => c.type === "FOOTER");
                                      return (
                                        <div className={`rounded-lg overflow-hidden border ${t.inputBorder} ${t.inputBg}`}>
                                          {hdr?.format === "IMAGE" && hdr.example?.header_handle?.[0] && (
                                            <img src={hdr.example.header_handle[0]} alt="" className="w-full max-h-40 object-cover" loading="lazy" />
                                          )}
                                          {hdr?.format === "TEXT" && <p className={`px-3 pt-2 text-sm font-bold ${t.text}`}>{hdr.text}</p>}
                                          <div className="px-3 py-2">
                                            {bod?.text && <p className={`text-sm ${t.text} whitespace-pre-wrap`}>{bod.text}</p>}
                                            {ftr?.text && <p className={`text-[10px] ${t.textMuted2} mt-1`}>{ftr.text}</p>}
                                          </div>
                                          {btns?.buttons && btns.buttons.length > 0 && (
                                            <div className={`border-t ${t.inputBorder}`}>
                                              {btns.buttons.map((btn: any, bi: number) => (
                                                <div key={bi} className={`text-center py-2 text-xs ${t.accent} ${bi > 0 ? `border-t ${t.inputBorder}` : ""}`}>
                                                  {btn.type === "URL" ? (
                                                    <a href={btn.url} target="_blank" rel="noopener" className="flex items-center justify-center gap-1">🔗 {btn.text}</a>
                                                  ) : (
                                                    <span>{btn.text}</span>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                    // Fallback if template not found in cache
                                    return <p className={`text-sm ${t.text} italic`}>📋 Template: {tmplName}</p>;
                                  }
                                  // Parse [Imagen: /path] or [Video: /path] in message text
                                  const mediaMatch = msg.mensaje?.match(/^\[(Imagen|Video|Doc):\s*(.+?)\]$/);
                                  if (mediaMatch && !msg.tipo_archivo) {
                                    const mType = mediaMatch[1];
                                    const mUrl = mediaMatch[2];
                                    if (mType === "Imagen") return <img src={mUrl} alt="" className="max-w-full rounded-lg max-h-60 mb-1" loading="lazy" />;
                                    if (mType === "Video") return <video controls src={mUrl} className="max-w-full rounded-lg max-h-60 mb-1" />;
                                    return <a href={mUrl} target="_blank" rel="noopener" className={`${t.accent} text-xs underline`}>📎 Archivo</a>;
                                  }
                                  // Don't show redundant [Imagen] text if we already rendered the media above
                                  const cleanMsg = msg.tipo_archivo && msg.ruta_archivo ? msg.mensaje?.replace(/^\[(Imagen|Video|Audio|Doc|Sticker)(:\s*.+?)?\]$/, "").trim() : msg.mensaje;
                                  if (!cleanMsg) return null;
                                  // Render URLs as clickable links
                                  const urlSplitRegex = /(https?:\/\/[^\s]+)/gi;
                                  const parts = cleanMsg.split(urlSplitRegex);
                                  return (
                                    <p className={`text-sm ${t.text} whitespace-pre-wrap break-words`}>
                                      {parts.map((part: string, i: number) =>
                                        /^https?:\/\//i.test(part)
                                          ? <a key={i} href={part} target="_blank" rel="noopener" className={`${t.accent} underline break-all`}>{part}</a>
                                          : part
                                      )}
                                    </p>
                                  );
                                })()}
                                {/* Link preview in bubble */}
                                {msgPreviews[msg.mensaje_id] && msgPreviews[msg.mensaje_id]!.title && (
                                  <a href={msgPreviews[msg.mensaje_id]!.url} target="_blank" rel="noopener" className={`block mt-1.5 rounded-lg overflow-hidden border ${t.inputBorder} ${t.inputBg} hover:opacity-80 transition`}>
                                    {msgPreviews[msg.mensaje_id]!.image && (
                                      <img src={msgPreviews[msg.mensaje_id]!.image} alt="" className="w-full max-h-64 object-cover" loading="lazy" />
                                    )}
                                    <div className="px-2.5 py-2">
                                      <p className={`text-[11px] font-medium ${t.text} line-clamp-1`}>{msgPreviews[msg.mensaje_id]!.title}</p>
                                      <p className={`text-[10px] ${t.textMuted2} line-clamp-2 mt-0.5`}>{msgPreviews[msg.mensaje_id]!.description}</p>
                                      <p className={`text-[9px] ${t.textMuted2} mt-1 flex items-center gap-1`}>
                                        {msgPreviews[msg.mensaje_id]!.favicon && <img src={msgPreviews[msg.mensaje_id]!.favicon} alt="" className="w-3 h-3" />}
                                        {msgPreviews[msg.mensaje_id]!.domain}
                                      </p>
                                    </div>
                                  </a>
                                )}
                                <div className="flex items-center justify-end gap-1.5 mt-1">
                                  <span className={`text-[10px] ${t.textMuted2}`}>
                                    {new Date(msg.fecha_creacion).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  {getStatusIcon(msg.status, msg.is_bot)}
                                </div>
                                {msg.is_bot && msg.status === 4 && (
                                  <p className="text-[10px] text-red-400 mt-0.5">No entregado</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}

                      {filteredMessages.length === 0 && !loadingMsgs && (
                        <div className="text-center py-10">
                          <p className={`${t.textMuted2} animate-[fade-in_0.5s_ease-out]`}>{msgSearch ? "Sin resultados" : "No hay mensajes"}</p>
                        </div>
                      )}
                      {/* AI Thinking Indicator */}
                      {aiThinking && aiThinking === selectedContact?.session_id && (
                        <div className="flex mb-2 justify-end animate-[slide-msg-right_0.25s_ease-out]">
                          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-purple-900/30 border border-purple-700/30">
                            <span className="text-purple-400 text-sm">✨</span>
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span className="text-purple-400/60 text-xs ml-1">{aiStatus || "IA pensando..."}</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>

                {/* ─── Input Area ─── */}
                <div className={`px-4 py-3 ${t.headerBg} border-t ${t.sidebarBorder} relative transition-colors duration-300`}>
                  {/* Canned responses dropdown */}
                  {showCanned && cannedResponses.length > 0 && (
                    <div className={`absolute bottom-full left-4 right-4 mb-1 ${t.inputBg} border ${t.inputBorder} rounded-xl shadow-2xl max-h-48 overflow-y-auto animate-[slide-up-fade_0.2s_ease-out]`}>
                      {cannedResponses.map((cr) => (
                        <button key={cr.id} onClick={() => applyCanned(cr)}
                          className={`w-full text-left px-3 py-2 ${t.hover} border-b ${t.inputBorder}/50 last:border-0 transition`}>
                          <div className="flex items-center gap-2">
                            <span className={`${t.accent} text-xs font-mono`}>/{cr.short_code}</span>
                            {cr.media && cr.media.length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/40 text-blue-400 rounded-full">
                                {cr.media.filter(m => m.type === "image").length > 0 && `${cr.media.filter(m => m.type === "image").length} img`}
                                {cr.media.filter(m => m.type === "image").length > 0 && cr.media.filter(m => m.type === "video").length > 0 && " + "}
                                {cr.media.filter(m => m.type === "video").length > 0 && `${cr.media.filter(m => m.type === "video").length} vid`}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${t.textMuted} mt-0.5 truncate`}>{cr.content}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Link preview */}
                  {(linkPreview || loadingPreview) && (
                    <div className={`mb-2 ${t.inputBg} border ${t.inputBorder} rounded-lg overflow-hidden animate-[slide-up-fade_0.3s_ease-out]`}>
                      {loadingPreview && !linkPreview ? (
                        <div className="flex items-center gap-2 p-2.5">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" />
                          <span className={`text-xs ${t.textMuted2}`}>Cargando preview...</span>
                        </div>
                      ) : linkPreview && (
                        <div className="flex">
                          {linkPreview.image && (
                            <img src={linkPreview.image} alt="" className="w-20 h-20 object-cover shrink-0" />
                          )}
                          <div className="flex-1 p-2.5 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <div className="min-w-0">
                                <p className={`text-xs font-medium ${t.text} truncate`}>{linkPreview.title}</p>
                                <p className={`text-[10px] ${t.textMuted2} line-clamp-2 mt-0.5`}>{linkPreview.description}</p>
                                <p className={`text-[10px] ${t.accent} mt-1 flex items-center gap-1`}>
                                  {linkPreview.favicon && <img src={linkPreview.favicon} alt="" className="w-3 h-3" />}
                                  {linkPreview.domain}
                                </p>
                              </div>
                              <button onClick={() => setLinkPreview(null)} className={`text-xs ${t.textMuted2} hover:text-red-400 shrink-0`}>✕</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pending media preview */}
                  {pendingMedia.length > 0 && (
                    <div className={`mb-2 p-2 ${t.inputBg} border ${t.inputBorder} rounded-lg animate-[slide-up-fade_0.2s_ease-out]`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] ${t.textMuted2}`}>Archivos adjuntos ({pendingMedia.length})</span>
                        <button onClick={() => setPendingMedia([])} className="text-[10px] text-red-400 hover:text-red-300">Quitar todos</button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {pendingMedia.map((m, idx) => (
                          <div key={idx} className="relative group">
                            {m.type === "image" ? (
                              <img src={m.url} alt={m.name} className="w-14 h-14 object-cover rounded border border-neutral-600" />
                            ) : (
                              <div className="w-14 h-14 bg-neutral-700 rounded border border-neutral-600 flex flex-col items-center justify-center">
                                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                            )}
                            <button
                              onClick={() => setPendingMedia(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-0 transition-all duration-200"
                            >x</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sendError && (
                    <div className="mb-2 px-3 py-2 bg-red-900/30 border border-red-800/50 rounded-lg text-xs text-red-400 flex items-center justify-between animate-[shake_0.5s_ease-out]">
                      <span>{sendError}</span>
                      <button onClick={() => setSendError("")} className="text-red-500 hover:text-red-300 ml-2">✕</button>
                    </div>
                  )}

                  {/* 24h warning (inspired by WhatsApp Cloud Inbox) */}
                  {!canSendRegular && !isNoteMode && messages.length > 0 && (
                    <div className="mb-2 px-3 py-2 bg-amber-900/30 border border-amber-700/40 rounded-lg animate-[fade-in_0.3s_ease-out] hover:border-amber-600/60 transition-colors duration-300">
                      <p className="text-xs text-amber-400">
                        ⚠ Ventana de 24h expirada. Solo puedes enviar mensajes tipo Template o notas internas.
                      </p>
                      <div className="flex gap-2 mt-1.5">
                        <button onClick={() => setIsNoteMode(true)}
                          className="text-[10px] px-2 py-1 bg-yellow-800/50 text-yellow-300 rounded hover:bg-yellow-800/70">
                          📌 Escribir nota
                        </button>
                        <button onClick={() => { fetchTemplates(); setShowTemplateModal(true); }}
                          className="text-[10px] px-2 py-1 bg-green-800/50 text-green-300 rounded hover:bg-green-800/70">
                          📋 Enviar Template
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode toggle */}
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setIsNoteMode(false)}
                      className={`text-[10px] px-2.5 py-1 rounded-full transition-all duration-300 ${!isNoteMode ? "bg-green-700 text-white shadow-lg shadow-green-700/30 scale-105" : `${t.inputBg} ${t.textMuted2} hover:${t.text} hover:scale-105`}`}
                    >💬 Mensaje</button>
                    <button
                      onClick={() => setIsNoteMode(true)}
                      className={`text-[10px] px-2.5 py-1 rounded-full transition-all duration-300 ${isNoteMode ? "bg-yellow-700 text-white shadow-lg shadow-yellow-700/30 scale-105" : `${t.inputBg} ${t.textMuted2} hover:${t.text} hover:scale-105`}`}
                    >📌 Nota interna</button>
                    <span className={`text-[10px] ${t.textMuted2} ml-auto`}>
                      Escribe / para respuestas rapidas
                    </span>
                  </div>

                  {contactCity && (
                    <div className="flex items-center gap-1.5 mb-1 animate-[fade-in_0.3s_ease-out]">
                      <span className="text-[10px] text-blue-400/80">📍 <span className="font-medium text-blue-300">{contactCity}</span></span>
                    </div>
                  )}
                  {hasPurchased && (
                    <div className="flex items-center gap-1.5 mb-1 animate-[fade-in_0.3s_ease-out]">
                      <span className="text-[10px] text-yellow-400/80">🛒 <span className="font-medium text-yellow-300">Cliente que ha Comprado!</span></span>
                    </div>
                  )}
                  {aiSource && (
                    <div className="flex items-center gap-1.5 mb-1.5 animate-[fade-in_0.3s_ease-out]">
                      <span className="text-[10px] text-purple-400/80">✨ Respuesta basada en: <span className="font-medium text-purple-300">{aiSource}</span></span>
                      <button onClick={() => setAiSource("")} className="text-purple-400/40 hover:text-purple-400 text-[10px]">✕</button>
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    {/* Hidden file inputs */}
                    <input
                      type="file"
                      id="chat-photo-input"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        const formData = new FormData();
                        Array.from(files).forEach(f => formData.append("files", f));
                        try {
                          const res = await fetch("/api/sequoia-chat/canned/upload", { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.files && data.files.length > 0) {
                            setPendingMedia(prev => [...prev, ...data.files.map((f: any) => ({ url: f.url, type: f.type, name: f.name }))]);
                          }
                        } catch (err) { console.error("Upload error:", err); }
                        e.target.value = "";
                      }}
                    />
                    <input
                      type="file"
                      id="chat-doc-input"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        const formData = new FormData();
                        Array.from(files).forEach(f => formData.append("files", f));
                        try {
                          const res = await fetch("/api/sequoia-chat/canned/upload", { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.files && data.files.length > 0) {
                            setPendingMedia(prev => [...prev, ...data.files.map((f: any) => ({ url: f.url, type: f.type || "document", name: f.name }))]);
                          }
                        } catch (err) { console.error("Upload error:", err); }
                        e.target.value = "";
                      }}
                    />
                    {/* + Attach menu button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                        disabled={!canSendRegular && !isNoteMode && messages.length > 0}
                        className={`px-2.5 py-2.5 rounded-xl text-lg transition shrink-0 disabled:opacity-40 ${t.inputBg} border ${t.inputBorder} ${t.textMuted} hover:${t.text}`}
                        title="Adjuntar"
                      >+</button>
                      {showAttachMenu && (
                        <div className={`absolute bottom-full left-0 mb-2 ${t.sidebar} border ${t.sidebarBorder} rounded-xl shadow-2xl overflow-hidden z-50 min-w-[160px]`}>
                          <button
                            onClick={() => { document.getElementById("chat-photo-input")?.click(); setShowAttachMenu(false); }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm ${t.text} hover:${t.inputBg} transition text-left`}
                          >
                            <span className="text-lg">🖼️</span> Foto / Video
                          </button>
                          <button
                            onClick={() => { document.getElementById("chat-doc-input")?.click(); setShowAttachMenu(false); }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm ${t.text} hover:${t.inputBg} transition text-left border-t ${t.sidebarBorder}`}
                          >
                            <span className="text-lg">📄</span> Documento
                          </button>
                          <button
                            onClick={async () => {
                              setShowAttachMenu(false);
                              setShowProductCatalog(true);
                              setCatalogCategory(null);
                              if (catalogData.length === 0) {
                                setCatalogLoading(true);
                                try {
                                  const res = await fetch("/api/panel/products/catalog");
                                  const data = await res.json();
                                  setCatalogData(data.categories || []);
                                } catch (err) { console.error("Catalog error:", err); }
                                setCatalogLoading(false);
                              }
                            }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm ${t.text} hover:${t.inputBg} transition text-left border-t ${t.sidebarBorder}`}
                          >
                            <span className="text-lg">📷</span> Enviar fotos
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Recording UI */}
                    {isRecording ? (
                      <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-red-900/20 border border-red-700/40 rounded-xl">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-400 font-mono text-sm">{formatRecTime(recordingTime)}</span>
                        <span className={`text-sm ${t.textMuted}`}>Grabando audio...</span>
                        <div className="flex-1" />
                        <button onClick={cancelRecording} className="text-red-400 hover:text-red-300 text-sm px-2">✕ Cancelar</button>
                        <button onClick={stopRecording} className="bg-green-600 hover:bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">➤</button>
                      </div>
                    ) : (
                    <>
                    {/* Emoji picker */}
                    <div className="relative">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`px-2 py-2.5 text-lg transition shrink-0 ${showEmojiPicker ? "text-green-400" : `${t.textMuted} hover:${t.text}`}`}
                        title="Emojis"
                      >😊</button>
                      {showEmojiPicker && (
                        <div className={`absolute bottom-full left-0 mb-2 ${t.sidebar} border ${t.sidebarBorder} rounded-xl shadow-2xl z-50 w-[320px]`}
                          onClick={(e) => e.stopPropagation()}>
                          {/* Category tabs */}
                          <div className={`flex gap-1 p-2 border-b ${t.sidebarBorder}`}>
                            {EMOJI_CATS.map((cat, i) => (
                              <button key={i} onClick={() => setEmojiCategory(i)}
                                className={`flex-1 text-center py-1 rounded text-sm transition ${emojiCategory === i ? `${t.inputBg} ${t.text}` : `${t.textMuted} hover:${t.text}`}`}
                                title={cat.name}>{cat.icon}</button>
                            ))}
                          </div>
                          {/* Emoji grid */}
                          <div className="grid grid-cols-8 gap-0.5 p-2 max-h-[200px] overflow-y-auto">
                            {EMOJI_CATS[emojiCategory].emojis.map((emoji, i) => (
                              <button key={i}
                                onClick={() => {
                                  const ta = msgInputRef.current;
                                  if (ta) {
                                    const start = ta.selectionStart;
                                    const end = ta.selectionEnd;
                                    const val = ta.value;
                                    const newVal = val.substring(0, start) + emoji + val.substring(end);
                                    handleInputChange(newVal);
                                    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + emoji.length; ta.focus(); }, 0);
                                  } else {
                                    handleInputChange(newMessage + emoji);
                                  }
                                }}
                                className={`text-xl p-1 rounded hover:${t.inputBg} transition cursor-pointer text-center`}
                              >{emoji}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <textarea
                      ref={msgInputRef}
                      value={newMessage}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => { if (aiEnabledRef.current && selectedContact && !newMessage.trim() && !aiThinking) aiSuggest(); }}
                      placeholder={isNoteMode ? "Escribe una nota interna..." : "Escribe un mensaje..."}
                      rows={3}
                      disabled={!canSendRegular && !isNoteMode && messages.length > 0}
                      className={`flex-1 border rounded-xl px-4 py-2.5 text-sm ${t.text} placeholder:${t.textMuted2} outline-none resize-none max-h-64 disabled:opacity-40 ${
                        isNoteMode
                          ? "bg-yellow-900/20 border-yellow-700/40 focus:border-yellow-600"
                          : `${t.inputBg} ${t.inputBorder} focus:border-green-600`
                      }`}
                      style={{ height: "auto", minHeight: "72px", overflow: "hidden" }}
                      onInput={(e) => {
                        const el = e.target as HTMLTextAreaElement;
                        el.style.height = "auto";
                        el.style.height = Math.min(el.scrollHeight, 256) + "px";
                      }}
                    />
                    {/* Camera button */}
                    <button
                      onClick={() => document.getElementById("chat-camera-input")?.click()}
                      disabled={!canSendRegular && !isNoteMode && messages.length > 0}
                      className={`px-2 py-2.5 text-lg transition shrink-0 disabled:opacity-40 ${t.textMuted} hover:${t.text}`}
                      title="Tomar foto"
                    >📷</button>
                    <input id="chat-camera-input" type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        const formData = new FormData();
                        Array.from(files).forEach(f => formData.append("files", f));
                        try {
                          const res = await fetch("/api/sequoia-chat/canned/upload", { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.files?.length > 0) {
                            setPendingMedia(prev => [...prev, ...data.files.map((f: any) => ({ url: f.url, type: "image", name: f.name }))]);
                          }
                        } catch (err) { console.error("Camera upload error:", err); }
                        e.target.value = "";
                      }}
                    />
                    {/* Mic or Send button */}
                    {newMessage.trim() || pendingMedia.length > 0 ? (
                      <button
                        id="send-msg-btn"
                        onClick={sendMessage}
                        disabled={(!newMessage.trim() && pendingMedia.length === 0) || sending || (!canSendRegular && !isNoteMode && messages.length > 0)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition shrink-0 disabled:opacity-40 ${
                          isNoteMode ? "bg-yellow-600 hover:bg-yellow-500 text-white" : `${t.accentBg} hover:opacity-90 text-white`
                        }`}
                      >
                        {sending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : isNoteMode ? "📌" : "➤"}
                      </button>
                    ) : (
                      <button
                        onClick={startRecording}
                        disabled={!canSendRegular && !isNoteMode && messages.length > 0}
                        className={`px-2.5 py-2.5 text-lg transition shrink-0 disabled:opacity-40 ${t.textMuted} hover:text-green-400`}
                        title="Grabar nota de voz"
                      >🎙️</button>
                    )}
                    </>
                    )}
                  </div>
                  <p className={`text-[10px] ${t.textMuted2} mt-1 hidden md:block`}>Enter enviar · Shift+Enter nueva linea · Alt+A IA on/off · Alt+N nota · Alt+R resolver</p>

                  {/* Product Catalog Modal */}
                  {showProductCatalog && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowProductCatalog(false)}>
                      <div className={`${t.sidebar} border ${t.sidebarBorder} rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden`} onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className={`flex items-center justify-between px-4 py-3 border-b ${t.sidebarBorder}`}>
                          <div className="flex items-center gap-2">
                            {catalogCategory && (
                              <button onClick={() => setCatalogCategory(null)} className={`${t.textMuted} hover:${t.text} transition`}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                              </button>
                            )}
                            <h3 className={`font-semibold ${t.text}`}>{catalogCategory ? catalogData.find(c => c.id === catalogCategory)?.name || "Productos" : "Enviar fotos de producto"}</h3>
                          </div>
                          <button onClick={() => setShowProductCatalog(false)} className={`${t.textMuted} hover:${t.text} text-xl transition`}>✕</button>
                        </div>

                        {/* Content */}
                        <div className={`overflow-y-auto max-h-[65vh] ${t.scrollTrack} ${t.scrollThumb} [&::-webkit-scrollbar]:w-1.5`}>
                          {catalogLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
                            </div>
                          ) : !catalogCategory ? (
                            /* Categories list */
                            <div className="p-2">
                              {catalogData.map(cat => (
                                <button
                                  key={cat.id}
                                  onClick={() => setCatalogCategory(cat.id)}
                                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl ${t.hover} transition mb-1`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">🧥</span>
                                    <div className="text-left">
                                      <p className={`font-medium ${t.text}`}>{cat.name}</p>
                                      <p className={`text-xs ${t.textMuted2}`}>{cat.productCount} productos</p>
                                    </div>
                                  </div>
                                  <svg className={`w-5 h-5 ${t.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                              ))}
                            </div>
                          ) : (
                            /* Products in category */
                            <div className="p-2">
                              {catalogData.find(c => c.id === catalogCategory)?.products.map((prod: any) => (
                                <button
                                  key={prod.id}
                                  onClick={() => {
                                    const newMedia = prod.images.map((img: any) => ({
                                      url: img.url,
                                      type: "image",
                                      name: prod.name,
                                    }));
                                    setPendingMedia(prev => [...prev, ...newMedia]);
                                    setShowProductCatalog(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${t.hover} transition mb-1`}
                                >
                                  {prod.cover ? (
                                    <img src={prod.cover} alt={prod.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                                  ) : (
                                    <div className={`w-14 h-14 rounded-lg ${t.inputBg} flex items-center justify-center shrink-0`}>
                                      <span className="text-2xl">📷</span>
                                    </div>
                                  )}
                                  <div className="text-left flex-1 min-w-0">
                                    <p className={`font-medium ${t.text} text-sm truncate`}>{prod.name}</p>
                                    <p className={`text-xs ${t.textMuted2}`}>{prod.images.length} fotos</p>
                                    <p className={`text-xs ${t.accent} font-medium`}>{Number(prod.price).toLocaleString("es-CO")} COP</p>
                                  </div>
                                  <span className={`text-xs ${t.textMuted2} shrink-0`}>Enviar</span>
                                </button>
                              )) || <p className={`text-center py-8 ${t.textMuted2}`}>No hay productos</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Seguimiento toggle + Calendar */}
                  {selectedContact && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <div
                          className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${!selectedContact.cliente_desinteresado ? "bg-green-500" : `${t.inputBg} border ${t.inputBorder}`}`}
                          onClick={async () => {
                            const newDesinteresado = !selectedContact.cliente_desinteresado;
                            setContacts(prev => prev.map(c => c.session_id === selectedContact.session_id ? { ...c, cliente_desinteresado: newDesinteresado } : c));
                            setSelectedContact(prev => prev ? { ...prev, cliente_desinteresado: newDesinteresado } : prev);
                            await fetch("/api/sequoia-chat/contacts/desinteresado", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ sessionId: selectedContact.session_id, desinteresado: newDesinteresado }),
                            });
                          }}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${!selectedContact.cliente_desinteresado ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                        <span className={`text-[10px] ${!selectedContact.cliente_desinteresado ? "text-green-400" : t.textMuted2}`}>
                          Seguimiento
                        </span>
                      </label>
                      {/* Calendar button */}
                      <button
                        title={selectedContact.cliente_desinteresado ? "Activa el seguimiento para programar" : (selectedContact.followup_next_at ? new Date(selectedContact.followup_next_at).toLocaleString("es-CO", {day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "Programar seguimiento")}
                        disabled={!!selectedContact.cliente_desinteresado}
                        onClick={() => {
                          if (selectedContact.cliente_desinteresado) return;
                          setFollowupDateTime(selectedContact.followup_next_at ? new Date(selectedContact.followup_next_at).toISOString().slice(0,16) : "");
                          setShowFollowupPicker(v => !v);
                        }}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] transition-colors ${selectedContact.cliente_desinteresado ? "opacity-30 cursor-not-allowed " + t.textMuted2 : selectedContact.followup_next_at ? "text-amber-400 hover:bg-amber-500/10" : t.textMuted2 + " hover:bg-neutral-700/30"}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {selectedContact.followup_next_at && !selectedContact.cliente_desinteresado ? <span className="text-[9px]">{new Date(selectedContact.followup_next_at).toLocaleString("es-CO", {day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</span> : null}
                      </button>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <div
                          className={`relative w-7 h-4 rounded-full transition-colors duration-200 cursor-pointer ${selectedContact.ai_auto ? "bg-green-500" : "bg-gray-600"}`}
                          onClick={async () => {
                            const newVal = !selectedContact.ai_auto;
                            setSelectedContact({ ...selectedContact, ai_auto: newVal });
                            setContacts(prev => prev.map(c => c.session_id === selectedContact.session_id ? { ...c, ai_auto: newVal } : c));
                            await fetch("/api/sequoia-chat/contacts/ai-auto", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ sessionId: selectedContact.session_id, aiAuto: newVal }),
                            });
                          }}
                        >
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${selectedContact.ai_auto ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                        <span className={`text-[10px] ${selectedContact.ai_auto ? "text-green-400 font-medium" : t.textMuted2}`}>
                          ✨ AutoPilot
                        </span>
                      </label>
                    </div>
                  )}
                  {/* Followup date picker */}
                  {showFollowupPicker && selectedContact && !selectedContact.cliente_desinteresado && (
                    <div className={`mt-1 p-2 rounded-lg ${t.inputBg} border ${t.inputBorder}`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="datetime-local"
                          value={followupDateTime}
                          onChange={e => setFollowupDateTime(e.target.value)}
                          className={`flex-1 px-2 py-1 rounded text-xs ${t.inputBg} border ${t.inputBorder} ${t.text} focus:outline-none`}
                        />
                        <button
                          onClick={async () => {
                            if (!followupDateTime) return;
                            const dt = new Date(followupDateTime).toISOString();
                            setSelectedContact(prev => prev ? { ...prev, followup_next_at: dt } : prev);
                            setContacts(prev => prev.map(c => c.session_id === selectedContact.session_id ? { ...c, followup_next_at: dt } : c));
                            setShowFollowupPicker(false);
                            await fetch("/api/sequoia-chat/contacts/followup-schedule", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ sessionId: selectedContact.session_id, followupAt: dt }),
                            });
                          }}
                          className="px-2 py-1 rounded text-[10px] bg-green-600 text-white hover:bg-green-500 transition"
                        >OK</button>
                        {selectedContact.followup_next_at && (
                          <button
                            onClick={async () => {
                              setSelectedContact(prev => prev ? { ...prev, followup_next_at: null } : prev);
                              setContacts(prev => prev.map(c => c.session_id === selectedContact.session_id ? { ...c, followup_next_at: null } : c));
                              setShowFollowupPicker(false);
                              await fetch("/api/sequoia-chat/contacts/followup-schedule", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ sessionId: selectedContact.session_id, clear: true }),
                              });
                            }}
                            className="px-2 py-1 rounded text-[10px] text-red-400 hover:bg-red-500/10 transition"
                          >Quitar</button>
                        )}
                        <button onClick={() => setShowFollowupPicker(false)} className={`px-2 py-1.5 rounded text-[11px] ${t.textMuted2} transition hover:opacity-70`}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            {/* ─── Contact Info Sidebar ─── */}
              {showContactInfo && (
                <div className={`absolute inset-0 z-40 md:relative md:inset-auto md:z-auto w-full md:w-72 ${t.sidebar} border-l ${t.sidebarBorder} overflow-y-auto p-4 shrink-0 transition-colors duration-300 ${t.scrollTrack} ${t.scrollThumb} [&::-webkit-scrollbar]:w-1.5`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`${t.text} font-medium`}>Contacto</h4>
                    <button onClick={() => { setShowContactInfo(false); setMobileView("chat"); }} className={`${t.textMuted2} hover:${t.text} text-xs`}>✕</button>
                  </div>

                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-4">
                    <div className={`w-16 h-16 rounded-full ${t.inputBg} flex items-center justify-center text-2xl mb-2`}>
                      {selectedContact.nombre ? selectedContact.nombre.charAt(0).toUpperCase() : "?"}
                    </div>
                    <p className={`${t.text} font-medium`}>{selectedContact.nombre || "Sin nombre"}</p>
                    <p className={`text-xs ${t.textMuted2}`}>{selectedContact.session_id}</p>
                  </div>

                  {/* Labels */}
                  <div className="mb-4">
                    <p className={`text-[10px] ${t.textMuted2} uppercase mb-2`}>Etiquetas</p>
                    <div className="flex flex-wrap gap-1">
                      {labels.map((l) => {
                        const has = contactLabels.some((cl) => cl.id === l.id);
                        return (
                          <button
                            key={l.id}
                            onClick={() => toggleLabel(l.id)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all duration-200 hover:scale-105 ${
                              has ? t.text : `${t.textMuted2} ${t.sidebarBorder} hover:${t.textMuted}`
                            }`}
                            style={has ? { backgroundColor: l.color + "30", borderColor: l.color, color: l.color } : {}}
                          >
                            {l.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status & Agent */}
                  <div className={`mb-4 p-3 ${t.inputBg}/50 rounded-lg space-y-2`}>
                    <div>
                      <p className={`text-[10px] ${t.textMuted2} uppercase`}>Estado</p>
                      <div className="flex gap-1 mt-1">
                        {[
                          { s: 0, label: "Abierto", color: "green" },
                          { s: 1, label: "Pendiente", color: "yellow" },
                          { s: 2, label: "Resuelto", color: "neutral" },
                        ].map(({ s, label, color }) => (
                          <button
                            key={s}
                            onClick={() => updateContactStatus(s)}
                            className={`text-[10px] px-2 py-1 rounded-md transition ${
                              selectedContact.conversation_status === s
                                ? `bg-${color}-700/50 text-${color}-300 border border-${color}-600/50`
                                : `${t.inputBg} ${t.textMuted2} hover:${t.textMuted}`
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className={`text-[10px] ${t.textMuted2} uppercase`}>Agente</p>
                      <select
                        value={selectedContact.assigned_agent_id || ""}
                        onChange={(e) => assignAgent(e.target.value ? Number(e.target.value) : null)}
                        className={`w-full mt-1 ${t.inputBg} border ${t.inputBorder} text-xs ${t.textMuted} rounded-lg px-2 py-1.5 outline-none focus:border-green-600`}
                      >
                        <option value="">Sin asignar</option>
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Info fields */}
                  <div className="space-y-3">
                    {[
                      ["Email", selectedContact.email],
                      ["Ciudad", selectedContact.ciudad],
                      ["Pais", selectedContact.pais],
                      ["Dispositivo", selectedContact.dispositivo],
                      ["Primer contacto", selectedContact.fecha_creacion ? formatFullDate(selectedContact.fecha_creacion) : null],
                      ["Ultimo mensaje", selectedContact.fecha_ultimo_mensaje ? formatFullDate(selectedContact.fecha_ultimo_mensaje) : null],
                      ["Total mensajes", selectedContact.total_messages?.toString()],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <p className={`text-[10px] ${t.textMuted2} uppercase`}>{label}</p>
                        <p className={`text-sm ${t.text}`}>{value || "-"}</p>
                      </div>
                    ))}
                  </div>

                  <div className={`mt-6 pt-4 border-t ${t.sidebarBorder}`}>
                    <a href={`https://wa.me/${selectedContact.session_id}`} target="_blank" rel="noopener"
                      className="block w-full text-center px-3 py-2 bg-green-700 text-white rounded-lg text-xs hover:bg-green-600 transition">
                      Abrir en WhatsApp Web
                    </a>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowTemplateModal(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative w-full max-w-md mx-4 ${t.sidebar} border ${t.sidebarBorder} rounded-xl shadow-2xl p-4`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${t.text} font-medium`}>Enviar Template</h3>
              <button onClick={() => setShowTemplateModal(false)} className={`${t.textMuted2} hover:${t.text}`}>✕</button>
            </div>
            {templates.length === 0 ? (
              <p className={`${t.textMuted2} text-sm text-center py-6`}>No hay templates aprobados. Crea templates en Meta Business.</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {templates.map(tmpl => {
                  const header = tmpl.components?.find((c: any) => c.type === "HEADER");
                  const body = tmpl.components?.find((c: any) => c.type === "BODY");
                  const buttons = tmpl.components?.find((c: any) => c.type === "BUTTONS");
                  return (
                    <div key={tmpl.id} className={`p-3 ${t.inputBg} rounded-lg border ${t.inputBorder}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className={`text-sm ${t.text} font-medium`}>{tmpl.name}</p>
                          <p className={`text-[10px] ${t.textMuted2}`}>{tmpl.category} · {tmpl.language}</p>
                        </div>
                        <button
                          onClick={() => sendTemplate(tmpl)}
                          disabled={sending}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${t.accentBg} text-white hover:opacity-90 transition disabled:opacity-40`}
                        >{sending ? "Enviando..." : "Enviar ➤"}</button>
                      </div>
                      {header?.format === "IMAGE" && header.example?.header_handle?.[0] && (
                        <img src={header.example.header_handle[0]} alt="" className="w-full max-h-64 object-cover rounded-lg mb-2" />
                      )}
                      {body?.text && (
                        <p className={`text-xs ${t.textMuted} bg-black/20 rounded-lg p-2`}>{body.text}</p>
                      )}
                      {buttons?.buttons && (
                        <div className="flex gap-1 mt-2">
                          {buttons.buttons.map((b: any, i: number) => (
                            <span key={i} className={`text-[10px] ${t.accent} ${t.inputBg} px-2 py-0.5 rounded`}>🔗 {b.text}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Context Menu ─── */}
      {contextMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)}>
          <div
            className={`absolute ${t.sidebar} border ${t.sidebarBorder} rounded-xl shadow-2xl py-1 min-w-[200px]`}
            style={{ left: Math.min(contextMenu.x, window.innerWidth - 220), top: Math.min(contextMenu.y, window.innerHeight - 300) }}
            onClick={e => e.stopPropagation()}
          >
            <div className={`px-3 py-2 border-b ${t.sidebarBorder}`}>
              <p className={`text-xs font-medium ${t.text} truncate`}>{contextMenu.contact.nombre || contextMenu.contact.session_id}</p>
              <p className={`text-[10px] ${t.textMuted2}`}>{contextMenu.contact.session_id}</p>
            </div>
            <button onClick={() => { selectContact(contextMenu.contact); setContextMenu(null); }}
              className={`w-full text-left px-3 py-2 text-xs ${t.text} ${t.hover} transition flex items-center gap-2`}>
              📩 Abrir chat
            </button>
            <button onClick={() => {
              toggleSelectContact(contextMenu.contact.session_id, contacts.findIndex(c => c.session_id === contextMenu.contact.session_id));
              setContextMenu(null);
            }}
              className={`w-full text-left px-3 py-2 text-xs ${t.text} ${t.hover} transition flex items-center gap-2`}>
              {selectedContacts.has(contextMenu.contact.session_id) ? "☑ Deseleccionar" : "☐ Seleccionar"}
            </button>
            <button onClick={() => { selectAllVisible(); setContextMenu(null); }}
              className={`w-full text-left px-3 py-2 text-xs ${t.text} ${t.hover} transition flex items-center gap-2`}>
              ☑ Seleccionar todos ({contacts.length})
            </button>
            {selectedContacts.size > 0 && (
              <button onClick={() => {
                setShowBulkSend(true); setBulkResults([]); setBulkProgress({ sent: 0, failed: 0, total: 0 });
                setContextMenu(null);
              }}
                className={`w-full text-left px-3 py-2 text-xs text-green-400 ${t.hover} transition flex items-center gap-2`}>
                📢 Enviar masivo ({selectedContacts.size})
              </button>
            )}
            <div className={`border-t ${t.sidebarBorder} my-1`} />
            <button onClick={() => {
              updateContactStatus(contextMenu.contact.conversation_status === 2 ? 0 : 2);
              setContextMenu(null);
            }}
              className={`w-full text-left px-3 py-2 text-xs ${t.text} ${t.hover} transition flex items-center gap-2`}>
              {contextMenu.contact.conversation_status === 2 ? "↻ Reabrir" : "✓ Resolver"}
            </button>
            <button onClick={() => {
              updateContactStatus(1);
              setContextMenu(null);
            }}
              className={`w-full text-left px-3 py-2 text-xs text-yellow-400 ${t.hover} transition flex items-center gap-2`}>
              ⏳ Pendiente
            </button>
            <button onClick={async () => {
              const c = contextMenu.contact;
              const newBlocked = !c.blocked;
              setContacts(prev => prev.map(ct => ct.session_id === c.session_id ? { ...ct, blocked: newBlocked } : ct));
              if (selectedContact?.session_id === c.session_id) setSelectedContact((prev: any) => prev ? { ...prev, blocked: newBlocked } : prev);
              await fetch("/api/sequoia-chat/contacts/block", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: c.session_id, blocked: newBlocked }),
              });
              setContextMenu(null);
            }}
              className={`w-full text-left px-3 py-2 text-xs ${contextMenu.contact.blocked ? "text-green-400" : "text-red-400"} ${t.hover} transition flex items-center gap-2`}>
              {contextMenu.contact.blocked ? "🔓 Desbloquear" : "🚫 Bloquear contacto"}
            </button>
            <a href={`https://wa.me/${contextMenu.contact.session_id}`} target="_blank" rel="noopener"
              onClick={() => setContextMenu(null)}
              className={`block w-full text-left px-3 py-2 text-xs ${t.text} ${t.hover} transition`}>
              🔗 Abrir en WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* ─── Date Picker Modal ─── */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDatePicker(false)}>
          <div className={`${t.sidebar} border ${t.sidebarBorder} rounded-2xl shadow-2xl w-full max-w-[480px] mx-4 overflow-hidden max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${t.sidebarBorder}`}>
              <h3 className={`${t.text} font-medium`}>📅 Filtrar por fecha</h3>
              <button onClick={() => setShowDatePicker(false)} className={`${t.textMuted2} hover:${t.text} text-lg`}>✕</button>
            </div>
            <div className="flex flex-col md:flex-row">
              {/* Presets sidebar */}
              <div className={`md:w-[160px] border-b md:border-b-0 md:border-r ${t.sidebarBorder} flex flex-col`}>
                <div className="p-2 space-y-0.5 flex-1">
                  {[
                    { key: "today", label: "Hoy" },
                    { key: "yesterday", label: "Ayer" },
                    { key: "last7", label: "Últimos 7 días" },
                    { key: "last30", label: "Últimos 30 días" },
                    { key: "thisMonth", label: "Este mes" },
                    { key: "lastMonth", label: "Mes pasado" },
                  ].map(preset => (
                    <button
                      key={preset.key}
                      onClick={() => applyDatePreset(preset.key)}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition ${
                        datePresetLabel === preset.label
                          ? `${t.accentBg} text-white`
                          : `${t.text} ${t.hover}`
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {/* Desde / Hasta inputs */}
                <div className={`p-2 border-t ${t.sidebarBorder} space-y-2`}>
                  <div>
                    <label className={`text-[10px] ${t.textMuted2} uppercase font-medium`}>Desde</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => { setDateFrom(e.target.value); if (!dateTo || e.target.value > dateTo) setDateTo(e.target.value); setDatePresetLabel("Personalizado"); }}
                      className={`w-full mt-0.5 ${t.inputBg} border ${t.inputBorder} rounded-md px-2 py-1.5 text-[11px] ${t.text} outline-none focus:border-green-600 [color-scheme:dark]`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] ${t.textMuted2} uppercase font-medium`}>Hasta</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => { setDateTo(e.target.value); if (!dateFrom || e.target.value < dateFrom) setDateFrom(e.target.value); setDatePresetLabel("Personalizado"); }}
                      className={`w-full mt-0.5 ${t.inputBg} border ${t.inputBorder} rounded-md px-2 py-1.5 text-[11px] ${t.text} outline-none focus:border-green-600 [color-scheme:dark]`}
                    />
                  </div>
                </div>
              </div>
              {/* Calendar */}
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => {
                    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                    else setCalMonth(calMonth - 1);
                  }} className={`${t.textMuted} hover:${t.text} text-sm px-2 py-1 rounded ${t.hover} transition`}>◀</button>
                  <span className={`${t.text} text-sm font-medium`}>
                    {new Date(calYear, calMonth).toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
                  </span>
                  <button onClick={() => {
                    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                    else setCalMonth(calMonth + 1);
                  }} className={`${t.textMuted} hover:${t.text} text-sm px-2 py-1 rounded ${t.hover} transition`}>▶</button>
                </div>
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map(d => (
                    <div key={d} className={`text-center text-[10px] ${t.textMuted2} py-1 font-medium`}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {getCalendarDays().map((day, i) => (
                    <button
                      key={i}
                      onClick={() => day && handleCalendarDayClick(day)}
                      disabled={!day}
                      className={`h-8 text-xs rounded-md transition ${
                        !day
                          ? ""
                          : isDayStart(day) || isDayEnd(day)
                            ? `${t.accentBg} text-white font-bold`
                            : isDayInRange(day)
                              ? `${t.accentBg}/30 ${t.accent}`
                              : `${t.text} ${t.hover}`
                      }`}
                    >
                      {day || ""}
                    </button>
                  ))}
                </div>
                {/* Selected range display */}
                {dateFrom && (
                  <div className={`mt-3 text-center text-xs ${t.textMuted}`}>
                    {dateFrom === dateTo
                      ? new Date(dateFrom + "T12:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
                      : `${new Date(dateFrom + "T12:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" })} — ${new Date(dateTo + "T12:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}`
                    }
                  </div>
                )}
              </div>
            </div>
            <div className={`flex justify-between px-4 py-3 border-t ${t.sidebarBorder}`}>
              <button onClick={clearDateFilter}
                className={`px-4 py-2 text-xs ${t.inputBg} ${t.textMuted} rounded-lg ${t.hover} transition`}>
                Limpiar
              </button>
              <button onClick={applyDateFilter}
                className={`px-6 py-2 text-xs ${t.accentBg} text-white rounded-lg hover:opacity-90 transition font-medium`}>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Bulk Send Modal ─── */}
      {showBulkSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]" onClick={() => { if (!bulkSending) setShowBulkSend(false); }}>
          <div className={`${t.sidebar} border ${t.sidebarBorder} rounded-2xl shadow-2xl w-full max-w-[480px] mx-4 max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${t.sidebarBorder}`}>
              <h3 className={`${t.text} font-bold text-lg`}>📢 Envío masivo</h3>
              {!bulkSending && (
                <button onClick={() => setShowBulkSend(false)} className={`${t.textMuted2} hover:${t.text} text-xl`}>✕</button>
              )}
            </div>
            <div className="p-5 space-y-4">
              {/* Recipients */}
              <div>
                <p className={`text-xs ${t.textMuted} mb-2`}>Destinatarios: <span className={`${t.accent} font-bold`}>{selectedContacts.size} contactos</span></p>
                <div className={`${t.inputBg} rounded-lg p-2 max-h-20 overflow-y-auto`}>
                  <p className={`text-[10px] ${t.textMuted2} leading-relaxed`}>
                    {contacts.filter(c => selectedContacts.has(c.session_id)).map(c => c.nombre || c.session_id).join(" · ")}
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="px-3 py-2 bg-amber-900/20 border border-amber-700/30 rounded-lg">
                <p className="text-[11px] text-amber-400">
                  ⚠ Solo se enviará texto libre a contactos con ventana de 24h activa. Fuera de ventana, usa Templates.
                </p>
              </div>

              {/* Mode toggle */}
              <div className="flex gap-2">
                <button onClick={() => setBulkMode("text")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                    bulkMode === "text" ? `${t.accentBg} text-white` : `${t.inputBg} ${t.textMuted}`
                  }`}>
                  💬 Texto libre
                </button>
                <button onClick={() => setBulkMode("template")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                    bulkMode === "template" ? `${t.accentBg} text-white` : `${t.inputBg} ${t.textMuted}`
                  }`}>
                  📋 Template
                </button>
              </div>

              {/* Message input */}
              <textarea
                value={bulkMessage}
                onChange={e => setBulkMessage(e.target.value)}
                placeholder={bulkMode === "template" ? "Nombre del template (ej: hello_world)" : "Escribe el mensaje para todos los contactos..."}
                rows={4}
                disabled={bulkSending}
                className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-sm ${t.text} placeholder:${t.textMuted2} outline-none focus:border-green-600 resize-none disabled:opacity-50`}
              />

              {/* Send button */}
              {!bulkSending && bulkResults.length === 0 && (
                <button
                  onClick={startBulkSend}
                  disabled={!bulkMessage.trim()}
                  className={`w-full py-3 rounded-xl text-sm font-bold ${t.accentBg} text-white hover:opacity-90 transition disabled:opacity-40`}
                >
                  ENVIAR A {selectedContacts.size} CONTACTOS
                </button>
              )}

              {/* Progress */}
              {(bulkSending || bulkResults.length > 0) && (
                <div className="space-y-3">
                  {/* Progress bar */}
                  <div className={`w-full h-2 ${t.inputBg} rounded-full overflow-hidden`}>
                    <div
                      className={`h-full ${t.accentBg} transition-all duration-300`}
                      style={{ width: `${bulkProgress.total > 0 ? ((bulkProgress.sent + bulkProgress.failed) / bulkProgress.total) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400">✓ Enviados: {bulkProgress.sent}</span>
                    <span className="text-red-400">✕ Fallidos: {bulkProgress.failed}</span>
                    <span className={t.textMuted2}>Restantes: {bulkProgress.total - bulkProgress.sent - bulkProgress.failed}</span>
                  </div>

                  {/* Results list */}
                  {bulkResults.length > 0 && (
                    <div className={`${t.inputBg} rounded-lg max-h-64 overflow-y-auto`}>
                      {bulkResults.map((r, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-1.5 text-[11px] border-b ${t.sidebarBorder}/30 last:border-0`}>
                          <span>{r.ok ? "✅" : "❌"}</span>
                          <span className={`${t.text} flex-1 truncate`}>{r.nombre || r.session_id}</span>
                          {r.error && <span className="text-red-400 text-[10px] truncate max-w-[150px]">{r.error}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Done */}
                  {!bulkSending && bulkResults.length > 0 && (
                    <div className="flex gap-2">
                      <button onClick={() => { setShowBulkSend(false); clearMultiSelect(); }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-medium ${t.accentBg} text-white hover:opacity-90 transition`}>
                        ✓ Listo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
