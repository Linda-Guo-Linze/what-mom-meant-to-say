import cardsJson from "./knowledge-cards.json";
import sourcesJson from "./sources.json";
import {
  knowledgeCardSchema,
  knowledgeSourceSchema,
} from "../../lib/schemas";

export const knowledgeSources = knowledgeSourceSchema.array().parse(sourcesJson);
export const knowledgeCards = knowledgeCardSchema.array().parse(cardsJson);

const sourceIds = new Set(knowledgeSources.map((source) => source.sourceId));
for (const card of knowledgeCards) {
  if (card.sourceIds.some((sourceId) => !sourceIds.has(sourceId))) {
    throw new Error(`Knowledge card ${card.cardId} has an unknown source.`);
  }
}
