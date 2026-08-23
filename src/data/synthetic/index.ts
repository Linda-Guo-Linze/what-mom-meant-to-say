import profilesJson from "./profiles.json";
import resultsJson from "./fixed-results.json";
import scenesJson from "./scenes.json";
import {
  profileSchema,
  sceneSchema,
  supportResultSchema,
} from "../../lib/schemas";

export const syntheticProfiles = profileSchema.array().parse(profilesJson);
export const syntheticScenes = sceneSchema.array().parse(scenesJson);
export const fixedResults = supportResultSchema.array().parse(resultsJson);

export const syntheticCases = syntheticScenes.map((scene) => {
  const profile = syntheticProfiles.find(
    (candidate) => candidate.profileId === scene.profileId,
  );
  const result = fixedResults.find(
    (candidate) => candidate.caseId === scene.caseId,
  );

  if (!profile || !result) {
    throw new Error("Synthetic data contains a broken profile or result link.");
  }

  return { profile, scene, result };
});
