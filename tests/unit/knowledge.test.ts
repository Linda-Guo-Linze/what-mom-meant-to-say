import { describe, expect, it } from "vitest";
import { knowledgeCards, knowledgeSources } from "../../src/data/knowledge";
import { syntheticCases } from "../../src/data/synthetic";
import { retrieveKnowledge } from "../../src/lib/retrieval";

describe("source-checked knowledge library", () => {
  it("links every card to a checked authoritative source", () => {
    const sourceIds = new Set(knowledgeSources.map((source) => source.sourceId));
    expect(knowledgeCards.length).toBeGreaterThanOrEqual(10);
    for (const card of knowledgeCards) {
      expect(card.reviewStatus).toBe("source-checked");
      expect(card.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    }
  });

  it("retrieves lost-object guidance for the wallet case", () => {
    const item = syntheticCases[0];
    const cards = retrieveKnowledge(
      {
        scenarioId: item.scene.caseId,
        patientWords: item.scene.patientWords,
        context: item.scene.context,
        behavior: item.scene.behavior,
        caregiverFeeling: item.scene.caregiverFeeling,
        relationship: item.profile.relationship,
        languageHabits: item.profile.languageHabits,
        sharedMemory: item.profile.sharedMemory,
      },
      "routine",
    );
    expect(cards.map((card) => card.cardId)).toContain("card-lost-object");
  });
});
