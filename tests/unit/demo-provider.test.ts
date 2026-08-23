import { describe, expect, it } from "vitest";
import { syntheticCases } from "../../src/data/synthetic";
import { DemoInterpretationProvider } from "../../src/lib/interpretation/demo-provider";
import type { InterpretationInput } from "../../src/lib/schemas";

function inputFor(index: number): InterpretationInput {
  const item = syntheticCases[index];
  return {
    scenarioId: item.scene.caseId,
    patientWords: item.scene.patientWords,
    context: item.scene.context,
    behavior: item.scene.behavior,
    caregiverFeeling: item.scene.caregiverFeeling,
    relationship:
      item.profile.preferredName + " — my " + item.profile.relationship,
    languageHabits: item.profile.languageHabits,
    sharedMemory: item.profile.sharedMemory,
  };
}

describe("DemoInterpretationProvider", () => {
  it("returns the same fixed routine result", async () => {
    const provider = new DemoInterpretationProvider();
    const first = await provider.interpret(inputFor(0));
    const second = await provider.interpret(inputFor(0));

    expect(first).toEqual(second);
    expect(first.caseId).toBe("case-missing-wallet");
    expect(first.ttsAllowed).toBe(true);
  });

  it("blocks speech and ordinary interpretation for danger", async () => {
    const provider = new DemoInterpretationProvider();
    const result = await provider.interpret(inputFor(4));

    expect(result.riskLevel).toBe("emergency");
    expect(result.ttsAllowed).toBe(false);
    expect(result.simulatedWords).toBe("");
    expect(result.sayNow).toEqual([]);
  });
});
