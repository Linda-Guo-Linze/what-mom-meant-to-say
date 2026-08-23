"use client";

import { useEffect, useState } from "react";
import type { InterpretationInput, KnowledgeCard, KnowledgeSource, Profile, Scene, SupportResult } from "../lib/schemas";

type DemoCase = { profile: Profile; scene: Scene; result: SupportResult };
type SpeechState = "idle" | "playing" | "error";
type RequestState = "idle" | "loading" | "error";

function inputFromCase(item: DemoCase, requestedMode: "demo" | "live" = "demo"): InterpretationInput {
  return {
    requestedMode,
    scenarioId: item.scene.caseId,
    patientWords: item.scene.patientWords,
    context: item.scene.context,
    behavior: item.scene.behavior,
    caregiverFeeling: item.scene.caregiverFeeling,
    relationship: `${item.profile.preferredName} — my ${item.profile.relationship}`,
    languageHabits: item.profile.languageHabits,
    sharedMemory: item.profile.sharedMemory,
  };
}

function ResultPanel({ result, cards, sources }: {
  result: SupportResult | null;
  cards: readonly KnowledgeCard[];
  sources: readonly KnowledgeSource[];
}) {
  const [speechState, setSpeechState] = useState<SpeechState>("idle");
  const [helpMessage, setHelpMessage] = useState(result?.helpMessage ?? "");
  const [copied, setCopied] = useState(false);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function play() {
    if (!result?.ttsAllowed || !result.simulatedWords || !("speechSynthesis" in window)) {
      setSpeechState("error");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result.simulatedWords);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => voice.lang.toLowerCase().startsWith("en-us")) ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ?? null;
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.onend = () => setSpeechState("idle");
    utterance.onerror = () => setSpeechState("error");
    setSpeechState("playing");
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    window.speechSynthesis?.cancel();
    setSpeechState("idle");
  }

  async function copyHelpMessage() {
    try {
      await navigator.clipboard.writeText(helpMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (!result) {
    return (
      <aside className="result-panel result-empty" aria-live="polite">
        <span className="result-number">3</span>
        <p className="eyebrow">A possible way back</p>
        <h2>Your supportive response will appear here.</h2>
        <p>Run the guided demo for a complete, stable result, or edit any field and explore it yourself.</p>
      </aside>
    );
  }

  const isDanger = result.riskLevel !== "routine";
  const evidence = result.evidenceIds
    .map((id) => cards.find((card) => card.cardId === id))
    .filter((card): card is KnowledgeCard => Boolean(card));

  return (
    <aside className="result-panel" aria-live="polite" aria-atomic="true">
      <div className="result-heading">
        <div>
          <p className="eyebrow">{isDanger ? "Safety comes first" : "One possible interpretation"}</p>
          <h2>{isDanger ? "Pause and get real-world help." : "Listen for the need beneath the words."}</h2>
        </div>
        <span className="reviewed-badge">{result.mode === "demo" ? "Approved fixed demo" : "Live · safety checked"}</span>
      </div>

      {isDanger && (
        <section className="urgent-card" aria-label="Urgent safety guidance">
          <strong>{result.riskLevel === "emergency" ? "Immediate danger" : "Prompt support needed"}</strong>
          <p>Do not rely on this tool in an emergency. Follow the fixed steps below and use appropriate local services.</p>
        </section>
      )}

      {!isDanger && (
        <section className="response-card">
          <span>A possible expression</span>
          <blockquote>“{result.simulatedWords}”</blockquote>
          <p className="uncertainty-note">{result.uncertaintyNote}</p>
          <div className="speech-controls">
            <button type="button" className="speech-button" onClick={play}><span aria-hidden="true">▶</span> {speechState === "playing" ? "Playing…" : "Play English reading"}</button>
            <button type="button" className="speech-button secondary" onClick={stop}>Stop</button>
          </div>
          {speechState === "error" && <p className="speech-error" role="alert">Audio is unavailable in this browser. The complete transcript remains below.</p>}
          <details>
            <summary>View transcript and voice notice</summary>
            <p>{result.simulatedWords}</p>
            <p>This is free browser speech from an installed system voice—not a recording, voice clone, or verified thought.</p>
          </details>
        </section>
      )}

      <section className="meaning-card">
        <span>{isDanger ? "Why ordinary interpretation stops" : "Why this might fit"}</span>
        <p>{result.explanation}</p>
        {isDanger && <p className="uncertainty-note">{result.uncertaintyNote}</p>}
      </section>

      {result.sayNow.length > 0 && <section className="action-card"><span>What you could say now</span><ul>{result.sayNow.map((item) => <li key={item}>{item}</li>)}</ul></section>}
      <section className="action-card"><span>What you could do now</span><ul>{result.doNow.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="care-tip"><span aria-hidden="true">✦</span><div><strong>Care for the caregiver, too</strong><ul>{result.caregiverCare.map((item) => <li key={item}>{item}</li>)}</ul></div></section>

      <section className="evidence-section" aria-label="Source-checked evidence">
        <span>Why these suggestions</span>
        {evidence.map((card) => (
          <details key={card.cardId}>
            <summary>{card.title}</summary>
            <p>{card.summary}</p>
            <div className="source-links">
              {card.sourceIds.map((sourceId) => {
                const source = sources.find((item) => item.sourceId === sourceId);
                return source ? <a key={sourceId} href={source.url} target="_blank" rel="noreferrer">{source.organization} ↗</a> : null;
              })}
            </div>
          </details>
        ))}
      </section>

      <section className="help-card">
        <label htmlFor="help-message">A help message you can edit</label>
        <textarea id="help-message" value={helpMessage} onChange={(event) => setHelpMessage(event.target.value)} />
        <button type="button" className="speech-button" onClick={copyHelpMessage}>{copied ? "Copied" : "Copy message"}</button>
        <p>The app never sends or posts this message for you.</p>
      </section>
    </aside>
  );
}

export function DemoWorkspace({ cases, cards, sources }: {
  cases: readonly DemoCase[];
  cards: readonly KnowledgeCard[];
  sources: readonly KnowledgeSource[];
}) {
  const [selectedId, setSelectedId] = useState(cases[0].scene.caseId);
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [form, setForm] = useState<InterpretationInput>(inputFromCase(cases[0]));
  const [result, setResult] = useState<SupportResult | null>(null);
  const [status, setStatus] = useState<RequestState>("idle");
  const [error, setError] = useState("");

  function selectCase(item: DemoCase) {
    setSelectedId(item.scene.caseId);
    setForm(inputFromCase(item, mode));
    setResult(null);
    setStatus("idle");
    setError("");
  }

  function updateField(field: keyof InterpretationInput, value: string) {
    setSelectedId("");
    setForm((current) => ({ ...current, scenarioId: undefined, [field]: value }));
  }

  function chooseMode(nextMode: "demo" | "live") {
    setMode(nextMode);
    setForm((current) => ({ ...current, requestedMode: nextMode }));
    setResult(null);
    setError("");
  }

  async function run(input: InterpretationInput) {
    setStatus("loading");
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await response.json()) as SupportResult | { error?: string };
      if (!response.ok || !("riskLevel" in data)) {
        throw new Error("error" in data ? data.error || "Please try again." : "Please try again.");
      }
      setResult(data);
      setStatus("idle");
      window.setTimeout(() => document.querySelector(".result-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (requestError) {
      setStatus("error");
      setError(requestError instanceof Error ? requestError.message : "The response could not load. Please try again.");
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run({ ...form, requestedMode: mode });
  }

  function runGuidedDemo() {
    const featured = cases[0];
    const input = inputFromCase(featured, "demo");
    setMode("demo");
    setSelectedId(featured.scene.caseId);
    setForm(input);
    void run(input);
  }

  return (
    <section className="workspace" id="try-demo" aria-labelledby="demo-title">
      <div className="guided-demo">
        <div><p className="eyebrow">Recording-ready path</p><h2>See the full experience in one click.</h2><p>Loads an approved fictional case, runs the fixed server flow, retrieves source-checked guidance, and prepares the English speech button.</p></div>
        <button type="button" className="launch-button" onClick={runGuidedDemo} disabled={status === "loading"}>{status === "loading" ? "Running the safe flow…" : "Run the full demo"}<span aria-hidden="true">→</span></button>
      </div>

      <div className="mode-switch" aria-label="Interpretation mode">
        <button type="button" className={mode === "demo" ? "active" : ""} onClick={() => chooseMode("demo")}><strong>Stable Demo</strong><span>No key · fixed results</span></button>
        <button type="button" className={mode === "live" ? "active" : ""} onClick={() => chooseMode("live")}><strong>Live AI-ready</strong><span>Secure server adapter</span></button>
      </div>
      {mode === "live" && <p className="mode-note">Live AI uses an OpenAI-compatible server endpoint. Credentials stay server-side and never enter the browser bundle.</p>}

      <div className="scenario-section">
        <div className="section-heading"><span className="section-number">1</span><div><p className="eyebrow">Start with a fictional moment</p><h2 id="demo-title">Choose a demo family.</h2></div></div>
        <div className="case-list" role="list">
          {cases.map((item) => <button type="button" className={`case-card${selectedId === item.scene.caseId ? " selected" : ""}`} key={item.scene.caseId} onClick={() => selectCase(item)} aria-pressed={selectedId === item.scene.caseId}><span className="avatar" aria-hidden="true">{item.profile.initials}</span><span><strong>{item.profile.displayName}</strong><small>{item.scene.title}</small></span><span className="case-arrow" aria-hidden="true">→</span></button>)}
        </div>
        <p className="synthetic-note">All names, people, situations, and fixed responses are fictional and approved for this demonstration.</p>
      </div>

      <div className="main-grid">
        <form className="moment-form" onSubmit={submit}>
          <div className="section-heading compact"><span className="section-number">2</span><div><p className="eyebrow">Describe what happened</p><h2>Give the words some context.</h2></div></div>
          <label>What did they say?<textarea required maxLength={500} value={form.patientWords} onChange={(event) => updateField("patientWords", event.target.value)} /></label>
          <label>What was happening at the time?<textarea required maxLength={500} value={form.context} onChange={(event) => updateField("context", event.target.value)} /></label>
          <label>What did you notice them doing?<textarea required maxLength={500} value={form.behavior} onChange={(event) => updateField("behavior", event.target.value)} /></label>
          <label>How did the moment feel for you?<textarea required maxLength={300} value={form.caregiverFeeling} onChange={(event) => updateField("caregiverFeeling", event.target.value)} /></label>
          <label>Your relationship and what you call them<input required maxLength={120} value={form.relationship} onChange={(event) => updateField("relationship", event.target.value)} /></label>
          <details className="optional-fields" open><summary>Personal context <span>optional</span></summary><label>Language habits<textarea maxLength={300} value={form.languageHabits} onChange={(event) => updateField("languageHabits", event.target.value)} /></label><label>A shared memory<textarea maxLength={300} value={form.sharedMemory} onChange={(event) => updateField("sharedMemory", event.target.value)} /></label></details>
          <button className="primary-button" type="submit" disabled={status === "loading"}>{status === "loading" ? "Following the safe pathway…" : mode === "demo" ? "Explore a possible meaning" : "Ask the live AI adapter"}<span aria-hidden="true">→</span></button>
          <p className="privacy-note">{mode === "demo" ? "Stable Demo uses fixed approved cases. Nothing is saved." : "Live requests use the server adapter and no-store responses. The API key never reaches this browser."}</p>
          {status === "error" && <p className="form-error" role="alert">{error}</p>}
        </form>
        <ResultPanel key={`${result?.caseId ?? "custom"}-${result?.mode ?? "empty"}-${result?.riskLevel ?? "none"}`} result={result} cards={cards} sources={sources} />
      </div>
    </section>
  );
}
