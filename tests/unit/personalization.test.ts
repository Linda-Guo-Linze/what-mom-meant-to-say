import { describe, expect, it } from "vitest";
import { createPersonalizedResult } from "../../src/lib/personalization";

describe("no-API personalization", () => {
  it("uses a selected scene theme and shared memory", () => {
    const result = createPersonalizedResult({ patientWords: "I want to go home.", context: "Near sunset.", behavior: "Waiting at the door.", caregiverFeeling: "Sad and worried", relationship: "Mom — my mother", languageHabits: "Likes short sentences", sharedMemory: "We water the roses together.", sceneTags: ["Leaving home"], profileContext: { displayName: "Eleanor", preferredName: "Mom", relationship: "Mother" } });
    expect(result.riskLevel).toBe("routine"); expect(result.simulatedWords.toLowerCase()).toContain("home"); expect(result.doNow.join(" ")).toContain("water the roses"); expect(result.uncertaintyNote).toContain("not Mom's verified thoughts");
  });
});
