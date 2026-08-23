import { fixedResults } from "../../data/synthetic";
import { retrieveKnowledge } from "../retrieval";
import { classifyRisk } from "../safety";
import { createPersonalizedResult } from "../personalization";
import type { InterpretationInput, SupportResult } from "../schemas";
import type { InterpretationProvider } from "./provider";

function getEmergencyResult(): SupportResult {
  const result = fixedResults.find((candidate) => candidate.riskLevel === "emergency");
  if (!result) throw new Error("Synthetic data must include an emergency fallback.");
  return result;
}
const emergencyResult = getEmergencyResult();
const urgentResult: SupportResult = {
  caseId: null, riskLevel: "urgent", simulatedWords: "", explanation: "This situation may need prompt real-world support. The app will not offer an ordinary interpretation or spoken response.", sayNow: [],
  doNow: ["Stay with the person if you can do so safely.", "Contact a trusted person and an appropriate local health professional now.", "If danger becomes immediate, call 911 in the United States or the appropriate local emergency number."],
  caregiverCare: ["Do not handle a rapidly changing or unsafe situation alone."], helpMessage: "I need prompt help with a sudden safety concern. Please call me now and help me contact an appropriate local professional.",
  evidenceIds: ["card-check-discomfort", "card-calm-communication"], uncertaintyNote: "This fixed route does not interpret the person's thoughts. It prioritizes timely human help.", ttsAllowed: false, reviewStatus: "approved", mode: "demo",
};

export class DemoInterpretationProvider implements InterpretationProvider {
  async interpret(input: InterpretationInput): Promise<SupportResult> {
    const risk = classifyRisk(input);
    if (risk === "emergency") return emergencyResult;
    if (risk === "urgent") return { ...urgentResult, evidenceIds: retrieveKnowledge(input, "urgent").map((card) => card.cardId) };
    const selectedResult = fixedResults.find((result) => result.caseId === input.scenarioId);
    return selectedResult ?? createPersonalizedResult(input);
  }
}
