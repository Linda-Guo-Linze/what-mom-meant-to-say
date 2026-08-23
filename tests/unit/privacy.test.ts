import { describe, expect, it } from "vitest";
import { redactPii, sanitizeInterpretationInput } from "../../src/lib/privacy";

describe("PII minimization", () => {
  it("redacts common contact, identifier, and address patterns", () => {
    const redacted = redactPii("Call 415-555-0199, email mia@example.com, MRN AB-12345, at 18 Oak Street.");
    expect(redacted).toContain("[PHONE]"); expect(redacted).toContain("[EMAIL]"); expect(redacted).toContain("[MEDICAL_ID]"); expect(redacted).toContain("[ADDRESS]");
    expect(redacted).not.toContain("mia@example.com");
  });
  it("replaces profile names before a Live AI request", () => {
    const safe = sanitizeInterpretationInput({ patientWords: "Call me at 415-555-0199.", context: "At home.", behavior: "Pacing.", caregiverFeeling: "Worried.", relationship: "My mother Eleanor", languageHabits: "", sharedMemory: "", profileContext: { displayName: "Eleanor Carter", preferredName: "Mom", relationship: "Mother" } });
    expect(safe.patientWords).toContain("[PHONE]"); expect(safe.profileContext?.displayName).toBe("[RELATIVE]"); expect(safe.profileContext?.preferredName).toBe("[PREFERRED_NAME]");
  });
});
