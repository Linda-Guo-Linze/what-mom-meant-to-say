import { describe, expect, it } from "vitest";
import { classifyRisk } from "../../src/lib/safety";
import type { InterpretationInput } from "../../src/lib/schemas";

const routineInput: InterpretationInput = {
  patientWords: "You took my wallet.",
  context: "At home in the afternoon.",
  behavior: "Looking through drawers.",
  caregiverFeeling: "Hurt and tired.",
  relationship: "My mother, Ma",
  languageHabits: "",
  sharedMemory: "",
};

describe("deterministic safety routing", () => {
  it("keeps an accusation scenario routine", () => {
    expect(classifyRisk(routineInput)).toBe("routine");
  });

  it("routes self-harm language to emergency", () => {
    expect(
      classifyRisk({
        ...routineInput,
        patientWords: "I am going to hurt myself.",
      }),
    ).toBe("emergency");
  });

  it("routes breathing difficulty to emergency", () => {
    expect(
      classifyRisk({
        ...routineInput,
        behavior: "They have sudden breathing difficulty.",
      }),
    ).toBe("emergency");
  });

  it("routes wandering risk to urgent", () => {
    expect(
      classifyRisk({
        ...routineInput,
        behavior: "They walked through an unlocked door into traffic.",
      }),
    ).toBe("urgent");
  });
});
