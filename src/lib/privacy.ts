import type { InterpretationInput } from "./schemas";

const replacements: Array<[RegExp, string]> = [
  [/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi, "[EMAIL]"],
  [/\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g, "[PHONE]"],
  [/\b\d{3}-\d{2}-\d{4}\b/g, "[GOVERNMENT_ID]"],
  [/\b(?:MRN|medical record(?: number)?|patient ID)\s*[:#-]?\s*[A-Z0-9-]{5,}\b/gi, "[MEDICAL_ID]"],
  [/\b\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\s+(?:Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b\.?/g, "[ADDRESS]"],
];
export function redactPii(value: string): string { return replacements.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), value); }
export function sanitizeInterpretationInput(input: InterpretationInput): InterpretationInput {
  return { ...input, patientWords: redactPii(input.patientWords), context: redactPii(input.context), behavior: redactPii(input.behavior), caregiverFeeling: redactPii(input.caregiverFeeling), relationship: redactPii(input.relationship), languageHabits: redactPii(input.languageHabits), sharedMemory: redactPii(input.sharedMemory), profileContext: input.profileContext ? { ...input.profileContext, displayName: "[RELATIVE]", preferredName: "[PREFERRED_NAME]" } : undefined };
}
