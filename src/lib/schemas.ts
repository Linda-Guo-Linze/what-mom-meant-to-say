import { z } from "zod";

export const riskLevelSchema = z.enum(["routine", "urgent", "emergency"]);

export const profileSchema = z.object({
  profileId: z.string().min(1), displayName: z.string().min(1), initials: z.string().min(1).max(3), relationship: z.string().min(1), preferredName: z.string().min(1), languageHabits: z.string().min(1), sharedMemory: z.string().min(1), fictional: z.literal(true), reviewStatus: z.enum(["ready-for-human-review", "approved", "rejected"]),
});

export const sceneSchema = z.object({
  caseId: z.string().min(1), profileId: z.string().min(1), title: z.string().min(1), patientWords: z.string().min(1).max(500), context: z.string().min(1).max(500), behavior: z.string().min(1).max(500), caregiverFeeling: z.string().min(1).max(300), expectedRisk: riskLevelSchema, expectedSceneTags: z.array(z.string()).min(1), mustInclude: z.array(z.string()), mustNotInclude: z.array(z.string()), reviewStatus: z.enum(["ready-for-human-review", "approved", "rejected"]),
});

export const supportResultSchema = z.object({
  caseId: z.string().nullable(), riskLevel: riskLevelSchema, simulatedWords: z.string(), explanation: z.string(), sayNow: z.array(z.string()).max(3), doNow: z.array(z.string()).max(4), caregiverCare: z.array(z.string()).max(3), helpMessage: z.string(), evidenceIds: z.array(z.string()), uncertaintyNote: z.string(), ttsAllowed: z.boolean(), reviewStatus: z.enum(["ready-for-human-review", "approved", "automated-safety-checked"]), mode: z.enum(["demo", "live"]),
});

export const knowledgeSourceSchema = z.object({
  sourceId: z.string().min(1), organization: z.string().min(1), title: z.string().min(1), url: z.url(), topicTags: z.array(z.string()).min(1), accessedAt: z.iso.date(), reviewStatus: z.literal("source-checked"),
});

export const knowledgeCardSchema = z.object({
  cardId: z.string().min(1), title: z.string().min(1), summary: z.string().min(1).max(420), sceneTags: z.array(z.string()).min(1), riskTags: z.array(riskLevelSchema).min(1), sourceIds: z.array(z.string()).min(1), reviewStatus: z.literal("source-checked"), reviewedAt: z.iso.date(),
});

export const interpretationInputSchema = z.object({
  requestedMode: z.enum(["demo", "live"]).optional(),
  scenarioId: z.string().trim().max(80).optional(),
  patientWords: z.string().trim().min(1, "Please enter what your relative said.").max(500),
  context: z.string().trim().min(1, "Please describe the situation.").max(500),
  behavior: z.string().trim().min(1, "Please describe what you noticed.").max(500),
  caregiverFeeling: z.string().trim().min(1, "Please name how the moment felt for you.").max(300),
  relationship: z.string().trim().min(1, "Please enter your relationship or preferred name.").max(120),
  languageHabits: z.string().trim().max(300).optional().default(""),
  sharedMemory: z.string().trim().max(300).optional().default(""),
  sceneTags: z.array(z.string().trim().min(1).max(40)).max(5).optional(),
  profileContext: z.object({ displayName: z.string().trim().min(1).max(80), preferredName: z.string().trim().min(1).max(80), relationship: z.string().trim().min(1).max(80) }).optional(),
});

export const localProfileSchema = z.object({
  profileId: z.string().min(1).max(100), displayName: z.string().trim().min(1).max(80), preferredName: z.string().trim().min(1).max(80), relationship: z.string().trim().min(1).max(80), languageHabits: z.string().trim().max(300).default(""), sharedMemory: z.string().trim().max(300).default(""), photoDataUrl: z.string().max(4_500_000).optional().default(""), voiceName: z.string().max(160).optional().default(""), speechRate: z.number().min(0.7).max(1.2).default(0.92), speechPitch: z.number().min(0.8).max(1.2).default(1), createdAt: z.string(), updatedAt: z.string(),
});

export const historyEntrySchema = z.object({ historyId: z.string().min(1), profileId: z.string().min(1), createdAt: z.string(), input: interpretationInputSchema, result: supportResultSchema });

export type Profile = z.infer<typeof profileSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type SupportResult = z.infer<typeof supportResultSchema>;
export type InterpretationInput = z.infer<typeof interpretationInputSchema>;
export type RiskLevel = z.infer<typeof riskLevelSchema>;
export type KnowledgeSource = z.infer<typeof knowledgeSourceSchema>;
export type KnowledgeCard = z.infer<typeof knowledgeCardSchema>;
export type LocalProfile = z.infer<typeof localProfileSchema>;
export type HistoryEntry = z.infer<typeof historyEntrySchema>;

