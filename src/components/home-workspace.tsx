"use client";

import type { FormEvent } from "react";
import type { InterpretationInput, KnowledgeCard, KnowledgeSource, LocalProfile, SceneFeedback, SupportResult } from "../lib/schemas";
import { Avatar, type DemoCase } from "./app-ui";
import { ResultPanel } from "./result-panel";

const tags = ["Mealtime", "Bathing", "Medication", "Leaving home", "Repeated questions", "Nighttime confusion", "Agitation", "Missing item"];

export function HomeWorkspace(props: {
  cases: readonly DemoCase[]; cards: readonly KnowledgeCard[]; sources: readonly KnowledgeSource[]; activeProfile?: LocalProfile;
  selectedCase: string; form: InterpretationInput; result: SupportResult | null; resultKey: string; mode: "demo" | "live"; status: "idle" | "loading" | "error";
  notice: string; error: string; tourTarget?: string; feedback?: SceneFeedback; feedbackReady: boolean; onChooseCase: (item: DemoCase) => void; onChooseMode: (mode: "demo" | "live") => void;
  onGuide: () => void;
  onUpdate: (field: keyof InterpretationInput, value: string | string[]) => void; onSubmit: (event: FormEvent) => void; onFeedback: (draft: Pick<SceneFeedback, "helpfulness" | "tensionBefore" | "tensionAfter" | "note">) => void; onVoiceChange: (voice: string, rate: number, pitch: number) => void;
}) {
  const { cases, cards, sources, activeProfile, selectedCase, form, result, mode, status, notice, error, tourTarget } = props;
  function toggleTag(tag: string) { const current = form.sceneTags ?? []; props.onUpdate("sceneTags", current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag].slice(0, 5)); }
  return <div className="home-page"><section className="home-intro"><div><p className="eyebrow">{activeProfile ? `A quiet space for ${activeProfile.preferredName}` : "Fictional demonstration workspace"}</p><h1>What happened<br />in this moment?</h1><p>Add context before drawing conclusions. This app offers a possible meaning, not certainty.</p></div><div className="mode-switch"><button className={mode === "demo" ? "active" : ""} onClick={() => props.onChooseMode("demo")}><strong>Stable Demo</strong><span>Private · no API needed</span></button><button className={mode === "live" ? "active" : ""} onClick={() => props.onChooseMode("live")}><strong>Live AI</strong><span>Server-secured · limited</span></button></div></section>
  <section className="project-summary" aria-label="About this project"><div><p className="eyebrow">What this project does</p><p><strong>What Mom Meant to Say</strong> helps dementia caregivers pause, consider one possible feeling beneath difficult words, and respond with warmth. It provides supportive language, practical care steps, source-checked guidance, and optional English speech—never a diagnosis or a claim to know someone&apos;s thoughts.</p></div><button type="button" className="button guide-button" onClick={props.onGuide}><span aria-hidden="true">✦</span> Start the guided tour</button></section>
  {notice && <div className="notice" role="status">{notice}</div>}
  <section className={`example-ribbon ${tourTarget === "examples" ? "tour-target" : ""}`} data-tour="examples"><div className="ribbon-title"><p className="eyebrow">Fictional examples</p><span>Choose one to fill the form</span></div><div className="case-scroller">{cases.map((item) => <button type="button" key={item.scene.caseId} className={selectedCase === item.scene.caseId ? "selected" : ""} onClick={() => props.onChooseCase(item)}><Avatar name={item.profile.displayName} /><span><strong>{item.profile.preferredName}</strong><small>{item.scene.title}</small></span></button>)}</div></section>
  <div className="work-grid"><form className={`moment-form ${tourTarget === "form" ? "tour-target" : ""}`} data-tour="form" onSubmit={props.onSubmit}><div className="form-heading"><span>01</span><div><p className="eyebrow">Describe the moment</p><h2>Give the words some context.</h2></div></div>
  <label>What did they say?<textarea required maxLength={500} value={form.patientWords} onChange={(event) => props.onUpdate("patientWords", event.target.value)} /></label>
  <div className="field-pair"><label>What was happening?<textarea required maxLength={500} value={form.context} onChange={(event) => props.onUpdate("context", event.target.value)} /></label><label>What did you notice?<textarea required maxLength={500} value={form.behavior} onChange={(event) => props.onUpdate("behavior", event.target.value)} /></label></div>
  <label>How did the moment feel for you?<textarea required maxLength={300} value={form.caregiverFeeling} onChange={(event) => props.onUpdate("caregiverFeeling", event.target.value)} /></label>
  <div className="tag-section"><span>Scene shortcuts <small>optional</small></span><div>{tags.map((tag) => <button type="button" key={tag} className={(form.sceneTags ?? []).includes(tag) ? "selected" : ""} onClick={() => toggleTag(tag)}>{tag}</button>)}</div></div>
  <details className="personal-context"><summary>Personal context <small>optional</small></summary><label>Relationship and preferred name<input required maxLength={120} value={form.relationship} onChange={(event) => props.onUpdate("relationship", event.target.value)} /></label><label>Language habits<textarea maxLength={300} value={form.languageHabits} onChange={(event) => props.onUpdate("languageHabits", event.target.value)} /></label><label>Shared memory<textarea maxLength={300} value={form.sharedMemory} onChange={(event) => props.onUpdate("sharedMemory", event.target.value)} /></label></details>
  <button data-tour="explore" className={`explore-button ${tourTarget === "explore" ? "tour-target" : ""}`} disabled={status === "loading"}>{status === "loading" ? "Following the safe pathway…" : mode === "live" ? "Explore with Live AI" : "Explore a possible meaning"}<span>→</span></button><p className="form-foot">Danger signals always bypass ordinary interpretation. Live text is PII-reduced before one server-side model request.</p>{error && <p className="form-error" role="alert">{error}</p>}</form>
  <ResultPanel key={`${props.resultKey}-${result?.caseId ?? "custom"}-${result?.mode ?? "empty"}-${result?.riskLevel ?? "none"}`} result={result} cards={cards} sources={sources} profile={activeProfile} feedback={props.feedback} feedbackReady={props.feedbackReady} onFeedback={props.onFeedback} onVoiceChange={props.onVoiceChange} /></div></div>;
}



