import { retrieveKnowledge } from "./retrieval";
import type { InterpretationInput, SupportResult } from "./schemas";

const themes = [
  { keys: ["bath", "shower", "personal-care", "bathing"], expression: "I may be trying to protect my dignity and feel less exposed. Please slow down and give me a simple choice.", explanation: "One possibility is that personal care feels rushed, unfamiliar, cold, or exposing. Resistance can communicate a need for privacy, control, or comfort.", say: ["You deserve privacy. We can pause.", "Would you prefer to try again later or wash at the sink?"], doNow: ["Pause and create physical space.", "Offer two concrete choices.", "Check privacy, temperature, pain, and sensory discomfort."] },
  { keys: ["home", "leave", "door", "sundowning", "exit-seeking"], expression: "I may be looking for the feeling of home—safety, familiarity, and someone who knows me. Please stay close and help me settle.", explanation: "One possibility is that “home” represents safety or an earlier familiar time. Tiredness, changing light, noise, or a disrupted routine may add to the distress.", say: ["You want to feel at home. I am here with you.", "Let us do something familiar together."], doNow: ["Acknowledge the feeling instead of arguing about the address.", "Reduce noise and harsh evening light.", "Offer one familiar activity or object."] },
  { keys: ["wallet", "money", "lost", "missing", "accusation"], expression: "Something important feels lost, and that may be frightening. Please take my worry seriously and help me look without arguing.", explanation: "One possibility is that losing track of an important object created fear and a loss of control. An accusation can be an attempt to explain that distress.", say: ["I can see this matters and feels upsetting.", "Let us look together, one place at a time."], doNow: ["Answer simply without entering a long argument.", "Join the search in one familiar place.", "Reduce distractions while you look."] },
  { keys: ["medication", "control", "refusal", "pill"], expression: "I may feel controlled or unsure about what is being asked. I need time, respect, and help from someone I trust.", explanation: "One possibility is that the care task feels like a loss of control. This tool cannot determine the cause or advise on medication decisions.", say: ["I hear that you want a say. We can pause.", "We can ask your clinician or pharmacist about this."], doNow: ["Do not force, hide, crush, or change medication based on this tool.", "Contact the prescribing clinician or pharmacist.", "Write down what happened and when."] },
  { keys: ["repeat", "question", "anxious", "confusion"], expression: "I may not be holding onto the answer, but the need for reassurance is still here. Please answer gently and help me feel anchored.", explanation: "One possibility is that the repeated question carries anxiety or a need for orientation even when the factual answer does not remain available.", say: ["You are safe, and I am here with you.", "Here is what happens next, one step at a time."], doNow: ["Use the same short answer and calm tone.", "Add a visible note or familiar cue.", "Check whether fatigue, hunger, pain, or noise is increasing distress."] },
];

function detectTheme(input: InterpretationInput) {
  const patientWords = input.patientWords.toLowerCase();
  const sceneTags = (input.sceneTags ?? []).join(" ").toLowerCase();
  const surroundingContext = [input.context, input.behavior].join(" ").toLowerCase();
  return themes
    .map((theme, index) => ({ theme, index, score: theme.keys.reduce((total, key) => total + (patientWords.includes(key) ? 3 : 0) + (sceneTags.includes(key) ? 2 : 0) + (surroundingContext.includes(key) ? 1 : 0), 0) }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.theme;
}

export function createPersonalizedResult(input: InterpretationInput): SupportResult {
  const theme = detectTheme(input);
  const name = input.profileContext?.preferredName || input.relationship.split(/[—,]/)[0]?.trim() || "your relative";
  const memory = input.sharedMemory.trim();
  const evidenceIds = retrieveKnowledge(input, "routine").map((card) => card.cardId);
  const expression = theme?.expression ?? "I may be trying to express a need for reassurance, comfort, control, rest, or connection. Please slow down and stay with the feeling before solving the facts.";
  const explanation = theme?.explanation ?? "A difficult phrase can be shaped by distress, confusion, discomfort, fatigue, or an unmet need. The exact meaning cannot be known from this form.";
  const sayNow = theme?.say ?? ["I hear that this matters to you. I am here with you.", "Can we slow down and take one step together?"];
  const doNow = [...(theme?.doNow ?? ["Name the feeling you can observe without claiming to know its cause.", "Use one short sentence at a time.", "Offer no more than two simple choices."])];
  if (memory) doNow.splice(1, 0, `If it feels welcome, reconnect through this familiar memory: ${memory}`);
  return {
    caseId: null, riskLevel: "routine", simulatedWords: expression, explanation, sayNow: sayNow.map((line) => line.replace("You deserve", `${name}, you deserve`)), doNow: doNow.slice(0, 4),
    caregiverCare: ["Acknowledge your own reaction without blaming yourself.", "Ask a trusted person for one specific form of help or a short break."],
    helpMessage: `I had a difficult care moment with ${name} today and I am feeling ${input.caregiverFeeling.toLowerCase()}. Could you call me and help with one specific care task?`,
    evidenceIds, uncertaintyNote: `This is one possible interpretation based on the context provided, not ${name}'s verified thoughts, a diagnosis, or medical advice.`, ttsAllowed: true, reviewStatus: "approved", mode: "demo",
  };
}


