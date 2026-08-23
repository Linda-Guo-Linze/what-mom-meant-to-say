import type { InterpretationInput, RiskLevel } from "./schemas";

const emergencySignals = [
  "hurt myself",
  "kill myself",
  "suicide",
  "sharp object",
  "knife",
  "gun",
  "weapon",
  "cannot wake",
  "can't wake",
  "not breathing",
  "breathing difficulty",
  "伤害自己",
  "自杀",
  "刀",
  "武器",
  "无法唤醒",
  "呼吸困难",
];

const urgentSignals = [
  "wandered",
  "missing person",
  "unlocked door",
  "into traffic",
  "sudden severe change",
  "suddenly confused",
  "hurt someone",
  "走失",
  "突然严重变化",
  "伤害别人",
];

export function classifyRisk(input: InterpretationInput): RiskLevel {
  const text = [
    input.patientWords,
    input.context,
    input.behavior,
    input.caregiverFeeling,
  ]
    .join(" ")
    .toLocaleLowerCase();

  if (emergencySignals.some((signal) => text.includes(signal))) {
    return "emergency";
  }

  if (urgentSignals.some((signal) => text.includes(signal))) {
    return "urgent";
  }

  return "routine";
}
