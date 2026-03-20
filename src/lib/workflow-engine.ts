import pool from "@/lib/sequoia-chat-db";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface WorkflowStep {
  id: string;
  type: "trigger" | "condition" | "check_response" | "ai_respond" | "action" | "handoff" | "delay";
  config: Record<string, any>;
  nextSteps: string[];
  branches?: { yes: string[]; no: string[] };
}

interface WorkflowExecution {
  id: number;
  workflow_id: number;
  session_id: string;
  current_step_id: string | null;
  status: string;
  context: Record<string, any>;
  waiting_until: string | null;
  waiting_for: string | null;
}

// ──────────────────────────────────────────────
// Helper: send WhatsApp message (reuse webhook's logic)
// ──────────────────────────────────────────────
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function sendWA(to: string, text: string) {
  if (!ACCESS_TOKEN || ACCESS_TOKEN === "PENDIENTE_CONFIGURAR") return;
  try {
    await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
    });
  } catch (e) {
    console.error("[WF-Engine] sendWA error:", e);
  }
}

// ──────────────────────────────────────────────
// Helper: get AI response for a session with optional extra prompt
// ──────────────────────────────────────────────
async function getAIResponse(sessionId: string, extraPrompt?: string): Promise<string> {
  try {
    const res = await fetch("http://localhost:3001/api/whatsapp/ai-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, extraPrompt }),
    });
    if (!res.ok) return "";
    const fullText = await res.text();
    const sseLines = fullText.split("\n");
    let suggestion = "";
    let eventType = "";
    for (const line of sseLines) {
      if (line.startsWith("event: ")) eventType = line.slice(7);
      else if (line.startsWith("data: ") && eventType === "suggestion") {
        try {
          const payload = JSON.parse(line.slice(6));
          suggestion = payload.text || "";
        } catch {}
      }
    }
    if (suggestion === "__NO_SE__") return "Permítame consultar un momento";
    return suggestion.replace(/\n\n/g, "\n").trim();
  } catch (e) {
    console.error("[WF-Engine] AI error:", e);
    return "";
  }
}

// ──────────────────────────────────────────────
// triggerWorkflows — Called when an event occurs
// ──────────────────────────────────────────────
export async function triggerWorkflows(
  event: string,
  sessionId: string,
  messageText: string,
  contact: any
) {
  try {
    // Find enabled workflows matching this trigger event
    const wfResult = await pool.query(
      "SELECT * FROM workflows WHERE trigger_event = $1 AND enabled = true",
      [event]
    );

    for (const wf of wfResult.rows) {
      // Don't start duplicate executions for same workflow + session
      const existing = await pool.query(
        "SELECT id FROM workflow_executions WHERE workflow_id = $1 AND session_id = $2 AND status IN ('active', 'waiting')",
        [wf.id, sessionId]
      );
      if (existing.rows.length > 0) {
        console.log(`[WF-Engine] Workflow ${wf.id} already running for ${sessionId}, skipping`);
        continue;
      }

      const steps: WorkflowStep[] = typeof wf.steps === "string" ? JSON.parse(wf.steps) : wf.steps;
      if (!steps || steps.length === 0) continue;

      // Create execution
      const execResult = await pool.query(
        `INSERT INTO workflow_executions (workflow_id, session_id, current_step_id, status, context)
         VALUES ($1, $2, $3, 'active', $4) RETURNING *`,
        [wf.id, sessionId, steps[0].id, JSON.stringify({
          lastMessage: messageText,
          contactName: contact?.nombre || "",
          contactId: contact?.id,
        })]
      );
      const execution = execResult.rows[0];

      console.log(`[WF-Engine] Started workflow "${wf.name}" (id=${wf.id}) for ${sessionId}`);

      // Execute from the trigger step
      await advanceWorkflow(execution.id);

      // Increment execution count
      await pool.query("UPDATE workflows SET execution_count = COALESCE(execution_count, 0) + 1 WHERE id = $1", [wf.id]);
    }
  } catch (e) {
    console.error("[WF-Engine] triggerWorkflows error:", e);
  }
}

// ──────────────────────────────────────────────
// advanceWorkflow — Advance execution to next step(s)
// ──────────────────────────────────────────────
export async function advanceWorkflow(executionId: number) {
  try {
    const execResult = await pool.query("SELECT * FROM workflow_executions WHERE id = $1", [executionId]);
    if (execResult.rows.length === 0) return;
    const execution: WorkflowExecution = execResult.rows[0];

    if (execution.status !== "active") return;

    const wfResult = await pool.query("SELECT * FROM workflows WHERE id = $1", [execution.workflow_id]);
    if (wfResult.rows.length === 0) return;
    const wf = wfResult.rows[0];
    const steps: WorkflowStep[] = typeof wf.steps === "string" ? JSON.parse(wf.steps) : wf.steps;

    const currentStep = steps.find(s => s.id === execution.current_step_id);
    if (!currentStep) {
      await completeExecution(executionId);
      return;
    }

    // Execute the current step
    const result = await executeStep(execution, currentStep, steps);

    if (result.wait) {
      // Step requires waiting (delay or check_response)
      await pool.query(
        `UPDATE workflow_executions SET status = 'waiting', waiting_for = $1, waiting_until = $2, updated_at = NOW() WHERE id = $3`,
        [result.waitFor, result.waitUntil, executionId]
      );
      return;
    }

    // Determine next step
    const nextStepId = result.nextStepId;
    if (!nextStepId) {
      await completeExecution(executionId);
      return;
    }

    // Move to next step
    const ctx = { ...execution.context, ...result.contextUpdates };
    await pool.query(
      `UPDATE workflow_executions SET current_step_id = $1, context = $2, updated_at = NOW() WHERE id = $3`,
      [nextStepId, JSON.stringify(ctx), executionId]
    );

    // Update in-memory execution for recursion
    execution.current_step_id = nextStepId;
    execution.context = ctx;

    // Continue advancing (recursive, but limited by step count)
    await advanceWorkflow(executionId);
  } catch (e) {
    console.error("[WF-Engine] advanceWorkflow error:", e);
  }
}

// ──────────────────────────────────────────────
// executeStep — Execute a single step
// ──────────────────────────────────────────────
async function executeStep(
  execution: WorkflowExecution,
  step: WorkflowStep,
  allSteps: WorkflowStep[]
): Promise<{
  nextStepId?: string;
  wait?: boolean;
  waitFor?: string;
  waitUntil?: string;
  contextUpdates?: Record<string, any>;
}> {
  const ctx = execution.context || {};
  const sessionId = execution.session_id;

  switch (step.type) {
    case "trigger": {
      // Trigger step just passes through to next
      return { nextStepId: getNextStep(step, allSteps) };
    }

    case "condition": {
      // Evaluate keyword match against lastMessage
      const keyword = (step.config.keyword || "").toLowerCase();
      const msg = (ctx.lastMessage || "").toLowerCase();
      const keywords = keyword.split("|").map((k: string) => k.trim()).filter(Boolean);
      const matched = keywords.length === 0 || keywords.some((k: string) => msg.includes(k));

      // Branch: yes (index 0) or no (index 1)
      if (step.branches) {
        const branchSteps = matched ? step.branches.yes : step.branches.no;
        return { nextStepId: branchSteps?.[0], contextUpdates: { conditionMatched: matched } };
      }
      // Fallback: nextSteps array
      const nextId = matched ? step.nextSteps?.[0] : step.nextSteps?.[1];
      return { nextStepId: nextId || getNextStep(step, allSteps), contextUpdates: { conditionMatched: matched } };
    }

    case "check_response": {
      // Wait for client response with timeout
      const timeoutMinutes = step.config.timeout || 1;
      const waitUntil = new Date(Date.now() + timeoutMinutes * 60000).toISOString();
      return {
        wait: true,
        waitFor: "message",
        waitUntil,
      };
    }

    case "ai_respond": {
      // Get AI response and send it
      const extraPrompt = step.config.message || step.config.prompt || "";
      const response = await getAIResponse(sessionId, extraPrompt);
      if (response) {
        await sendWA(sessionId, response);
        // Save to DB
        const msgId = `wf_ai_${Date.now()}`;
        await pool.query(
          `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, status, nombre_agente)
           VALUES ($1, $2, $3, true, NOW(), 1, 'Workflow AI')`,
          [msgId, sessionId, response]
        );
      }
      return { nextStepId: getNextStep(step, allSteps) };
    }

    case "action": {
      const action = step.config.action;
      const contactId = ctx.contactId;

      if (action === "add_label" && step.config.labelId && contactId) {
        await pool.query(
          "INSERT INTO contact_labels (contact_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [contactId, step.config.labelId]
        );
      } else if (action === "add_label" && step.config.labelName) {
        // Find or create label by name, then add
        let labelResult = await pool.query("SELECT id FROM labels WHERE name = $1", [step.config.labelName]);
        if (labelResult.rows.length === 0) {
          labelResult = await pool.query("INSERT INTO labels (name, color) VALUES ($1, '#3b82f6') RETURNING id", [step.config.labelName]);
        }
        if (contactId && labelResult.rows[0]) {
          await pool.query(
            "INSERT INTO contact_labels (contact_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [contactId, labelResult.rows[0].id]
          );
        }
      }

      if (action === "assign_agent" && step.config.agentId && contactId) {
        await pool.query("UPDATE contacts SET assigned_agent_id = $1 WHERE id = $2", [step.config.agentId, contactId]);
      }

      if (action === "set_status" && step.config.status !== undefined && contactId) {
        await pool.query("UPDATE contacts SET conversation_status = $1 WHERE id = $2", [step.config.status, contactId]);
      }

      return { nextStepId: getNextStep(step, allSteps) };
    }

    case "handoff": {
      // Disable AI auto for this contact + internal note
      await pool.query("UPDATE contacts SET ai_auto = false WHERE session_id = $1", [sessionId]);
      const noteMsg = step.config.message || "Workflow: transferido a agente humano";
      await pool.query(
        `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, status, nota_interna, private)
         VALUES ($1, $2, $3, true, NOW(), 3, true, true)`,
        [`wf_handoff_${Date.now()}`, sessionId, `👤 ${noteMsg}`]
      );
      return { nextStepId: getNextStep(step, allSteps) };
    }

    case "delay": {
      const minutes = step.config.minutes || 5;
      const waitUntil = new Date(Date.now() + minutes * 60000).toISOString();
      return {
        wait: true,
        waitFor: "timeout",
        waitUntil,
      };
    }

    default:
      return { nextStepId: getNextStep(step, allSteps) };
  }
}

// ──────────────────────────────────────────────
// Helper: get next sequential step
// ──────────────────────────────────────────────
function getNextStep(step: WorkflowStep, allSteps: WorkflowStep[]): string | undefined {
  // If step has explicit nextSteps, use first one
  if (step.nextSteps && step.nextSteps.length > 0) {
    return step.nextSteps[0];
  }

  // Check if this step belongs to a branch of another step.
  // If so, follow the branch's step list — never fall through to sibling branches.
  for (const s of allSteps) {
    if (s.branches) {
      for (const branchKey of ["yes", "no"] as const) {
        const branchStepIds = s.branches[branchKey];
        if (!branchStepIds) continue;
        const idx = branchStepIds.indexOf(step.id);
        if (idx >= 0) {
          if (idx < branchStepIds.length - 1) {
            // Next step inside the same branch
            return branchStepIds[idx + 1];
          }
          // Last step in branch — branch ends, no fallthrough
          return undefined;
        }
      }
    }
  }

  // Not inside any branch — find next step in array order
  const idx = allSteps.findIndex(s => s.id === step.id);
  if (idx >= 0 && idx < allSteps.length - 1) {
    return allSteps[idx + 1].id;
  }
  return undefined;
}

// ──────────────────────────────────────────────
// completeExecution — Mark workflow as completed
// ──────────────────────────────────────────────
async function completeExecution(executionId: number) {
  await pool.query(
    "UPDATE workflow_executions SET status = 'completed', updated_at = NOW() WHERE id = $1",
    [executionId]
  );
  console.log(`[WF-Engine] Execution ${executionId} completed`);
}

// ──────────────────────────────────────────────
// resumeWaitingExecutions — Called when a message arrives from a contact
// Resumes any workflow waiting for their response
// ──────────────────────────────────────────────
export async function resumeWaitingExecutions(sessionId: string, messageText: string) {
  try {
    const result = await pool.query(
      "SELECT * FROM workflow_executions WHERE session_id = $1 AND status = 'waiting' AND waiting_for = 'message'",
      [sessionId]
    );

    for (const execution of result.rows) {
      console.log(`[WF-Engine] Resuming execution ${execution.id} for ${sessionId} (got response)`);

      const wfResult = await pool.query("SELECT * FROM workflows WHERE id = $1", [execution.workflow_id]);
      if (wfResult.rows.length === 0) continue;
      const wf = wfResult.rows[0];
      const steps: WorkflowStep[] = typeof wf.steps === "string" ? JSON.parse(wf.steps) : wf.steps;

      const currentStep = steps.find(s => s.id === execution.current_step_id);
      if (!currentStep || currentStep.type !== "check_response") continue;

      // Client responded → take YES branch
      const yesBranch = currentStep.branches?.yes?.[0] || currentStep.nextSteps?.[0];
      const ctx = { ...execution.context, lastMessage: messageText, respondedToCheck: true };

      await pool.query(
        `UPDATE workflow_executions SET status = 'active', current_step_id = $1, context = $2,
         waiting_for = NULL, waiting_until = NULL, updated_at = NOW() WHERE id = $3`,
        [yesBranch, JSON.stringify(ctx), execution.id]
      );

      if (yesBranch) {
        await advanceWorkflow(execution.id);
      } else {
        await completeExecution(execution.id);
      }
    }
  } catch (e) {
    console.error("[WF-Engine] resumeWaitingExecutions error:", e);
  }
}

// ──────────────────────────────────────────────
// resumeTimedOutExecutions — Called by cron
// Handles delays and check_response timeouts
// ──────────────────────────────────────────────
export async function resumeTimedOutExecutions() {
  try {
    const result = await pool.query(
      "SELECT * FROM workflow_executions WHERE status = 'waiting' AND waiting_until < NOW()"
    );

    for (const execution of result.rows) {
      const wfResult = await pool.query("SELECT * FROM workflows WHERE id = $1", [execution.workflow_id]);
      if (wfResult.rows.length === 0) continue;
      const wf = wfResult.rows[0];
      const steps: WorkflowStep[] = typeof wf.steps === "string" ? JSON.parse(wf.steps) : wf.steps;
      const currentStep = steps.find(s => s.id === execution.current_step_id);

      if (!currentStep) {
        await completeExecution(execution.id);
        continue;
      }

      let nextStepId: string | undefined;
      const ctx = { ...execution.context };

      if (execution.waiting_for === "message" && currentStep.type === "check_response") {
        // Timeout expired → client did NOT respond → take NO branch
        console.log(`[WF-Engine] Check_response timeout for execution ${execution.id}`);
        nextStepId = currentStep.branches?.no?.[0] || currentStep.nextSteps?.[1];
        ctx.respondedToCheck = false;
      } else if (execution.waiting_for === "timeout") {
        // Delay expired → continue to next step
        console.log(`[WF-Engine] Delay expired for execution ${execution.id}`);
        nextStepId = getNextStep(currentStep, steps);
      }

      await pool.query(
        `UPDATE workflow_executions SET status = 'active', current_step_id = $1, context = $2,
         waiting_for = NULL, waiting_until = NULL, updated_at = NOW() WHERE id = $3`,
        [nextStepId || null, JSON.stringify(ctx), execution.id]
      );

      if (nextStepId) {
        await advanceWorkflow(execution.id);
      } else {
        await completeExecution(execution.id);
      }
    }
  } catch (e) {
    console.error("[WF-Engine] resumeTimedOutExecutions error:", e);
  }
}
