import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const publicContentFiles = [
  "app/layout.tsx", "app/page.tsx", "app/api/interpret/route.ts",
  "src/components/demo-workspace.tsx", "src/components/care-app.tsx", "src/components/home-workspace.tsx",
  "src/components/result-panel.tsx", "src/components/profile-wizard.tsx", "src/components/app-pages.tsx", "src/components/welcome.tsx",
  "src/data/synthetic/profiles.json", "src/data/synthetic/scenes.json", "src/data/synthetic/fixed-results.json",
  "src/data/knowledge/sources.json", "src/data/knowledge/knowledge-cards.json", "README.md", "docs/product-spec.md",
  "docs/architecture.md", "docs/safety-and-ethics.md", "docs/demo-video-script.md", "docs/devpost-draft.md",
  "docs/mobile-and-apk.md", "docs/software-impact.md",
];

describe("competition-facing language", () => {
  it("keeps public product content in English", async () => {
    const contents = await Promise.all(publicContentFiles.map((file) => readFile(resolve(process.cwd(), file), "utf8")));
    for (const content of contents) expect(content).not.toMatch(/\p{Script=Han}/u);
  });
});
