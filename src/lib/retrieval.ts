import { knowledgeCards } from "../data/knowledge";
import type {
  InterpretationInput,
  KnowledgeCard,
  RiskLevel,
} from "./schemas";

const synonyms: Record<string, string[]> = {
  wallet: ["money", "missing", "lost", "object", "accusation"],
  took: ["accusation", "suspicion", "lost"],
  shower: ["bathing", "personal-care", "privacy", "dignity"],
  bath: ["bathing", "personal-care", "privacy", "dignity"],
  home: ["sundowning", "exit-seeking", "familiar", "reassurance"],
  sunset: ["sundowning", "evening", "routine"],
  leave: ["exit-seeking", "wandering"],
  medication: ["control", "refusal", "investigate"],
  control: ["choice", "dignity", "refusal"],
  hurt: ["self-harm", "crisis", "immediate-danger"],
  knife: ["weapon", "immediate-danger", "emergency"],
  sharp: ["weapon", "immediate-danger", "emergency"],
  missing: ["missing-person", "wandering", "lost-object"],
};

function tokens(value: string): Set<string> {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
  const expanded = base.flatMap((token) => [token, ...(synonyms[token] ?? [])]);
  return new Set(expanded);
}

function scoreCard(query: Set<string>, card: KnowledgeCard, risk: RiskLevel) {
  const cardTokens = tokens(
    [card.title, card.summary, ...card.sceneTags].join(" "),
  );
  const overlap = [...query].filter((token) => cardTokens.has(token)).length;
  const normalizedOverlap = overlap / Math.max(1, Math.sqrt(query.size * cardTokens.size));
  const tagHits = card.sceneTags.filter((tag) => query.has(tag)).length;
  const tagScore = tagHits / Math.max(1, card.sceneTags.length);
  const riskScore = card.riskTags.includes(risk) ? 1 : 0;
  return normalizedOverlap * 0.6 + tagScore * 0.3 + riskScore * 0.1;
}

export function retrieveKnowledge(
  input: InterpretationInput,
  risk: RiskLevel,
  limit = 3,
): KnowledgeCard[] {
  const query = tokens(
    [
      input.patientWords,
      input.context,
      input.behavior,
      input.caregiverFeeling,
      input.relationship,
      input.languageHabits,
      input.sharedMemory,
      ...(input.sceneTags ?? []),
    ].join(" "),
  );

  return [...knowledgeCards]
    .map((card) => ({ card, score: scoreCard(query, card, risk) }))
    .filter(({ card }) => card.riskTags.includes(risk))
    .sort((a, b) => b.score - a.score || a.card.cardId.localeCompare(b.card.cardId))
    .slice(0, limit)
    .map(({ card }) => card);
}



