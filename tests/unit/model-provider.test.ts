import { afterEach, describe, expect, it, vi } from "vitest";
import { ModelInterpretationProvider } from "../../src/lib/interpretation/model-provider";
import type { InterpretationInput } from "../../src/lib/schemas";

const input: InterpretationInput = {
  requestedMode: "live",
  patientWords: "You took my wallet.",
  context: "At home after an appointment.",
  behavior: "Looking through drawers.",
  caregiverFeeling: "Hurt and tired.",
  relationship: "My mother, Ma",
  languageHabits: "Uses short phrases when tired.",
  sharedMemory: "We make dumplings together.",
};

describe("OpenAI-compatible server adapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.MODEL_API_URL;
    delete process.env.MODEL_API_KEY;
    delete process.env.MODEL_NAME;
  });

  it("sends a server-only authenticated request and validates the result", async () => {
    process.env.MODEL_API_URL = "https://provider.test/v1";
    process.env.MODEL_API_KEY = "server-secret";
    process.env.MODEL_NAME = "compatible-model";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({
          caseId: null,
          riskLevel: "routine",
          simulatedWords: "I may be frightened because I cannot find something important.",
          explanation: "One possible meaning is a need for reassurance and help searching.",
          sayNow: ["I can see this is upsetting. Let us look together."],
          doNow: ["Use a calm tone and search one familiar place."],
          caregiverCare: ["Take a short break when it is safe."],
          helpMessage: "Could you call me after a hard care moment?",
          evidenceIds: ["card-lost-object"],
          uncertaintyNote: "This is one possible interpretation, not a verified thought.",
          ttsAllowed: true,
          reviewStatus: "automated-safety-checked",
          mode: "live"
        }) } }]
      }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new ModelInterpretationProvider().interpret(input);
    expect(result.mode).toBe("live");
    expect(result.reviewStatus).toBe("automated-safety-checked");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://provider.test/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer server-secret" }),
      }),
    );
  });

  it("bypasses the model for emergency input", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await new ModelInterpretationProvider().interpret({
      ...input,
      patientWords: "I am going to hurt myself.",
      behavior: "Holding a sharp object.",
    });
    expect(result.riskLevel).toBe("emergency");
    expect(result.ttsAllowed).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
