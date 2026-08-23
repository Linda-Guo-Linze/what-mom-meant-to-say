"use client";

import type { LocalProfile, Profile, Scene, SupportResult } from "../lib/schemas";

export type DemoCase = { profile: Profile; scene: Scene; result: SupportResult };
export type DraftProfile = Pick<LocalProfile, "displayName" | "preferredName" | "relationship" | "languageHabits" | "sharedMemory" | "photoDataUrl">;
export const emptyDraft: DraftProfile = { displayName: "Eleanor Carter", preferredName: "Mom", relationship: "Mother", languageHabits: "Prefers short, gentle sentences when tired.", sharedMemory: "We make pancakes together every Sunday.", photoDataUrl: "" };
export function makeId(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
export function Avatar({ name, photo, speaking = false, size = "normal" }: { name: string; photo?: string; speaking?: boolean; size?: "normal" | "large" }) {
  const letters = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
  return <span className={`app-avatar ${size === "large" ? "large" : ""} ${speaking ? "speaking" : ""}`} aria-hidden="true">{photo ? <span className="avatar-photo" style={{ backgroundImage: `url(${photo})` }} /> : letters}{speaking && <i />}</span>;
}


