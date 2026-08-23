import { CareApp } from "../src/components/care-app";
import { syntheticCases } from "../src/data/synthetic";
import { knowledgeCards, knowledgeSources } from "../src/data/knowledge";

export default function Home() {
  return <CareApp cases={syntheticCases} cards={knowledgeCards} sources={knowledgeSources} />;
}
