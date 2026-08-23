import { knowledgeCards } from "../../data/knowledge";
import { supportResultSchema, type SupportResult } from "../schemas";

const forbiddenPatterns = [
  /definitely (means|wants|thinks)/i,
  /the (real|true) meaning is/i,
  /diagnos(e|is|ed)/i,
  /\b\d+(\.\d+)?\s?(mg|mcg|ml)\b/i,
  /hide (the )?medication/i,
  /crush (the )?medication/i,
  /restrain/i,
];

const uncertaintyPatterns = [
  /one possible/i,
  /may be/i,
  /might/i,
  /cannot be known/i,
  /not .*verified/i,
];

export function validateSupportResult(candidate: unknown): SupportResult {
  const result = supportResultSchema.parse(candidate);
  const text = [
    result.simulatedWords,
    result.explanation,
    result.uncertaintyNote,
    ...result.sayNow,
    ...result.doNow,
  ].join(" ");

  if (forbiddenPatterns.some((pattern) => pattern.test(text))) {
    throw new Error("Generated output crossed a safety boundary.");
  }

  if (!uncertaintyPatterns.some((pattern) => pattern.test(text))) {
    throw new Error("Generated output did not preserve uncertainty.");
  }

  const approvedIds = new Set(knowledgeCards.map((card) => card.cardId));
  if (result.evidenceIds.some((id) => !approvedIds.has(id))) {
    throw new Error("Generated output cited unapproved evidence.");
  }

  if (result.riskLevel !== "routine" && result.ttsAllowed) {
    throw new Error("Speech must be disabled for elevated risk.");
  }

  return result;
}
