import { describe, expect, it } from "vitest";
import { POST } from "../../app/api/interpret/route";
import { syntheticCases } from "../../src/data/synthetic";

describe("POST /api/interpret", () => {
  it("rejects an incomplete request", async () => {
    const response = await POST(
      new Request("http://localhost/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientWords: "" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns a no-store fixed Demo Mode result", async () => {
    const item = syntheticCases[0];
    const response = await POST(
      new Request("http://localhost/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: item.scene.caseId,
          patientWords: item.scene.patientWords,
          context: item.scene.context,
          behavior: item.scene.behavior,
          caregiverFeeling: item.scene.caregiverFeeling,
          relationship: item.profile.relationship,
          languageHabits: item.profile.languageHabits,
          sharedMemory: item.profile.sharedMemory,
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.mode).toBe("demo");
    expect(body.caseId).toBe(item.scene.caseId);
  });
});
