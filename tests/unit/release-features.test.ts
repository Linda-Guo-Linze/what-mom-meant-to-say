import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { knowledgeCards } from "../../src/data/knowledge";
import { syntheticCases } from "../../src/data/synthetic";
import { sceneFeedbackSchema } from "../../src/lib/schemas";

describe("release evaluation features", () => {
  it("validates bounded device-local DICE feedback", () => {
    const feedback = sceneFeedbackSchema.parse({
      feedbackId: "feedback-1", historyId: "history-1", createdAt: "2026-08-24T00:00:00.000Z",
      helpfulness: "helpful", tensionBefore: 4, tensionAfter: 2, note: "A calmer second try.",
    });
    expect(feedback.tensionBefore - feedback.tensionAfter).toBe(2);
    expect(() => sceneFeedbackSchema.parse({ ...feedback, tensionAfter: 0 })).toThrow();
  });

  it("keeps every fixed fixture explainable and safety guarded", () => {
    const evidence = new Set(knowledgeCards.map((card) => card.cardId));
    for (const item of syntheticCases) {
      expect(item.result.riskLevel).toBe(item.scene.expectedRisk);
      expect(item.result.evidenceIds.every((id) => evidence.has(id))).toBe(true);
      expect(item.result.uncertaintyNote.length).toBeGreaterThan(0);
      if (item.result.riskLevel !== "routine") expect(item.result.ttsAllowed).toBe(false);
    }
  });

  it("ships fixed MP3 fallback for every speech-enabled fixture", () => {
    for (const item of syntheticCases.filter((entry) => entry.result.ttsAllowed)) {
      const file = path.join(process.cwd(), "public", "audio", "demo", `${item.scene.caseId}.mp3`);
      const audio = fs.readFileSync(file);
      expect(audio.length).toBeGreaterThan(20_000);
      expect(audio[0] === 0xff || audio.subarray(0, 3).toString("ascii") === "ID3").toBe(true);
    }
  });

  it("keeps original and Live AI text on device speech instead of requiring fixed demo audio", () => {
    const player = fs.readFileSync(path.join(process.cwd(), "src", "components", "result-panel.tsx"), "utf8");
    expect(player).toMatch(/if \(fallbackAudio\) \{\s+watchdogRef\.current = window\.setTimeout/);
    expect(player).toContain("The installed device voice could not play this response.");
  });

});

