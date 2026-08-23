import { retrieveKnowledge } from "../retrieval";
import { classifyRisk } from "../safety";
import { sanitizeInterpretationInput } from "../privacy";
import { supportResultSchema, type InterpretationInput, type SupportResult } from "../schemas";
import { z } from "zod";
import { validateSupportResult } from "./validate-result";
import { DemoInterpretationProvider } from "./demo-provider";
import type { InterpretationProvider } from "./provider";

type ChatCompletion = { choices?: Array<{ message?: { content?: string } }> };
const outputSchema = z.toJSONSchema(supportResultSchema);

function providerConfig() {
  const baseUrl = process.env.MODEL_API_URL?.trim(); const apiKey = process.env.MODEL_API_KEY?.trim(); const model = process.env.MODEL_NAME?.trim();
  if (!baseUrl || !apiKey || !model) throw new Error("Live AI server configuration is incomplete.");
  const endpoint = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  return { endpoint, apiKey, model };
}

export class ModelInterpretationProvider implements InterpretationProvider {
  async interpret(input: InterpretationInput): Promise<SupportResult> {
    const risk = classifyRisk(input);
    if (risk !== "routine") return new DemoInterpretationProvider().interpret(input);

    const safeInput = sanitizeInterpretationInput(input);
    const evidence = retrieveKnowledge(safeInput, risk);
    const { endpoint, apiKey, model } = providerConfig();
    const response = await fetch(endpoint, {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model, temperature: 0.2, max_tokens: 700, reasoning_effort: "low",
        response_format: { type: "json_schema", json_schema: { name: "caregiver_support_result", strict: true, schema: outputSchema } },
        messages: [
          { role: "system", content: "You support dementia caregivers without mind-reading. Return compact valid JSON only. Offer one uncertain interpretation. simulatedWords must sound as if the person living with dementia is directly expressing their own inner feeling or need to the caregiver, using I, me, or my in one to three warm English sentences. Never write I sense you, describe the person from outside, copy patientWords, or give caregiver instructions inside simulatedWords. Never diagnose, give medication instructions or doses, recommend restraint, or provide emergency treatment. Use only supplied evidence IDs. Required keys: caseId, riskLevel, simulatedWords, explanation, sayNow, doNow, caregiverCare, helpMessage, evidenceIds, uncertaintyNote, ttsAllowed, reviewStatus, mode." },
          { role: "user", content: JSON.stringify({ input: safeInput, required: { caseId: null, riskLevel: "routine", ttsAllowed: true, reviewStatus: "automated-safety-checked", mode: "live" }, evidence: evidence.map(({ cardId, title, summary }) => ({ cardId, title, summary })) }) },
        ],
      }), cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`Live provider returned ${response.status}.`);
    const payload = (await response.json()) as ChatCompletion;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("Live provider returned no JSON content.");
    const candidate = JSON.parse(content) as Record<string, unknown>;
    if (typeof candidate.simulatedWords !== "string" || !candidate.simulatedWords.trim()) candidate.simulatedWords = "I may be trying to express that something does not feel safe or familiar. Please stay close and help me feel settled.";
    candidate.uncertaintyNote = "This is one possible interpretation, not a verified thought.";
    const approvedEvidence = new Set(evidence.map((card) => card.cardId));
    const citedEvidence = Array.isArray(candidate.evidenceIds) ? candidate.evidenceIds.filter((id): id is string => typeof id === "string" && approvedEvidence.has(id)) : [];
    candidate.evidenceIds = citedEvidence.length > 0 ? citedEvidence : evidence.slice(0, 2).map((card) => card.cardId);
    Object.assign(candidate, { caseId: null, riskLevel: "routine", ttsAllowed: true, reviewStatus: "automated-safety-checked", mode: "live" });
    return validateSupportResult(candidate);
  }
}




