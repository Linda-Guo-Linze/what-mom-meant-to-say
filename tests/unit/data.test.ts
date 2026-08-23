import { describe, expect, it } from "vitest";
import {
  fixedResults,
  syntheticCases,
  syntheticProfiles,
  syntheticScenes,
} from "../../src/data/synthetic";

describe("synthetic demo data", () => {
  it("contains five linked fictional cases", () => {
    expect(syntheticProfiles).toHaveLength(5);
    expect(syntheticScenes).toHaveLength(5);
    expect(fixedResults).toHaveLength(5);
    expect(syntheticCases).toHaveLength(5);
    expect(syntheticProfiles.every((profile) => profile.fictional)).toBe(true);
  });

  it("contains a fixed emergency case with speech disabled", () => {
    const emergency = fixedResults.find(
      (result) => result.riskLevel === "emergency",
    );

    expect(emergency).toBeDefined();
    expect(emergency?.ttsAllowed).toBe(false);
    expect(emergency?.simulatedWords).toBe("");
    expect(emergency?.doNow.join(" ")).toContain("call 911");
    expect(emergency?.doNow.join(" ")).toContain("988");
  });

  it("keeps prohibited topics in every scene evaluation constraint", () => {
    for (const scene of syntheticScenes) {
      expect(scene.mustNotInclude.length).toBeGreaterThan(0);
    }
  });
});
