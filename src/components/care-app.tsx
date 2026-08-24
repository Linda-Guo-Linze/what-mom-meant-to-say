"use client";

import { useEffect, useState, type FormEvent } from "react";
import { clearAllLocalData, deleteFeedbackForHistory, deleteHistory, deleteProfile, listFeedback, listHistory, listProfiles, saveFeedback, saveHistory, saveProfile, supportsLocalDatabase } from "../lib/local-db";
import type { HistoryEntry, InterpretationInput, KnowledgeCard, KnowledgeSource, LocalProfile, SceneFeedback, SupportResult } from "../lib/schemas";
import { Avatar, makeId, type DemoCase } from "./app-ui";
import { EvaluationPage, HistoryPage, KnowledgePage, SettingsPage } from "./app-pages";
import { HomeWorkspace } from "./home-workspace";
import { ProfileWizard } from "./profile-wizard";
import { Welcome } from "./welcome";

type AppPage = "home" | "history" | "knowledge" | "evaluation" | "settings";
type Mode = "demo" | "live";
const tourSteps = [
  { target: "profile", title: "Make it personal", text: "Create or switch a loved one profile. Profiles and photos stay in this browser." },
  { target: "examples", title: "Start with a safe example", text: "Load any fictional case to see how context changes a possible interpretation." },
  { target: "form", title: "Describe the moment", text: "Add words, situation, behavior, and your own feelings. Optional context can make the response warmer." },
  { target: "explore", title: "Explore, then listen", text: "Generate one possible meaning, review the transcript, and choose an installed English voice." },
];
function inputFromCase(item: DemoCase, mode: Mode, profile?: LocalProfile): InterpretationInput {
  return { requestedMode: mode, scenarioId: item.scene.caseId, patientWords: item.scene.patientWords, context: item.scene.context, behavior: item.scene.behavior, caregiverFeeling: item.scene.caregiverFeeling, relationship: profile ? `${profile.preferredName} — my ${profile.relationship}` : `${item.profile.preferredName} — my ${item.profile.relationship}`, languageHabits: profile?.languageHabits ?? item.profile.languageHabits, sharedMemory: profile?.sharedMemory ?? item.profile.sharedMemory, sceneTags: item.scene.expectedSceneTags, profileContext: profile ? { displayName: profile.displayName, preferredName: profile.preferredName, relationship: profile.relationship } : { displayName: item.profile.displayName, preferredName: item.profile.preferredName, relationship: item.profile.relationship } };
}
const wait = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

function canUseBrowserLive() {
  const key = `wm-live-${new Date().toISOString().slice(0, 10)}`; const used = Number(localStorage.getItem(key) ?? "0");
  if (used >= 3) return false; localStorage.setItem(key, String(used + 1)); return true;
}

export function CareApp({ cases, cards, sources }: { cases: readonly DemoCase[]; cards: readonly KnowledgeCard[]; sources: readonly KnowledgeSource[] }) {
  const [hydrated, setHydrated] = useState(false); const [entered, setEntered] = useState(false); const [page, setPage] = useState<AppPage>("home");
  const [profiles, setProfiles] = useState<LocalProfile[]>([]); const [history, setHistory] = useState<HistoryEntry[]>([]); const [feedback, setFeedback] = useState<SceneFeedback[]>([]); const [activeId, setActiveId] = useState(""); const [currentHistoryId, setCurrentHistoryId] = useState("");
  const [wizard, setWizard] = useState(false); const [intro, setIntro] = useState(false); const [tour, setTour] = useState(-1); const [mode, setMode] = useState<Mode>("demo"); const [selectedCase, setSelectedCase] = useState(cases[0].scene.caseId);
  const [form, setForm] = useState<InterpretationInput>(() => inputFromCase(cases[0], "demo")); const [result, setResult] = useState<SupportResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle"); const [notice, setNotice] = useState(""); const [error, setError] = useState("");
  const [recordingTools, setRecordingTools] = useState(false); const [recordingActive, setRecordingActive] = useState(false); const [recordingCaption, setRecordingCaption] = useState("");
  const activeProfile = profiles.find((profile) => profile.profileId === activeId);

  useEffect(() => {
    const savedEntry = localStorage.getItem("wm-entered") === "yes"; const needsIntro = localStorage.getItem("wm-tour-v2-complete") !== "yes"; const wantsRecordingTools = new URLSearchParams(window.location.search).get("recording") === "1"; queueMicrotask(() => { setEntered(savedEntry); setIntro(savedEntry && needsIntro && !wantsRecordingTools); setRecordingTools(wantsRecordingTools); setHydrated(true); });
    if (supportsLocalDatabase()) void Promise.all([listProfiles(), listHistory(), listFeedback()]).then(([savedProfiles, savedHistory, savedFeedback]) => { setProfiles(savedProfiles); setHistory(savedHistory); setFeedback(savedFeedback); setActiveId(savedProfiles[0]?.profileId ?? ""); }).catch(() => setNotice("Local storage is unavailable; the fictional demo still works."));
  }, []);
  function enterApp() { localStorage.setItem("wm-entered", "yes"); setEntered(true); setIntro(true); }
  function chooseCase(item: DemoCase) { setSelectedCase(item.scene.caseId); setForm(inputFromCase(item, mode, activeProfile)); setResult(null); setCurrentHistoryId(""); setError(""); setPage("home"); }
  function chooseProfile(profileId: string) { setActiveId(profileId); const profile = profiles.find((item) => item.profileId === profileId); const item = cases.find((entry) => entry.scene.caseId === selectedCase) ?? cases[0]; setForm(inputFromCase(item, mode, profile)); setResult(null); setCurrentHistoryId(""); }
  function update(field: keyof InterpretationInput, value: string | string[]) { setSelectedCase(""); setCurrentHistoryId(""); setForm((current) => ({ ...current, scenarioId: undefined, [field]: value })); }
  function chooseMode(next: Mode) { setMode(next); setForm((current) => ({ ...current, requestedMode: next })); setResult(null); setCurrentHistoryId(""); setNotice(next === "live" ? "Live AI allows 3 requests per browser per day. If unavailable, Stable Demo answers automatically." : ""); }

  async function run(input: InterpretationInput) {
    setStatus("loading"); setError(""); setNotice(""); setResult(null); let requestInput = input;
    if (input.requestedMode === "live" && !canUseBrowserLive()) { requestInput = { ...input, requestedMode: "demo" }; setNotice("Your 3 daily Live AI previews are used. Stable Demo answered instead."); }
    try {
      const response = await fetch("/api/interpret", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestInput) });
      const data = (await response.json()) as SupportResult | { error?: string };
      if (!response.ok || !("riskLevel" in data)) throw new Error("error" in data ? data.error || "Please try again." : "Please try again.");
      const fallback = response.headers.get("X-Live-Fallback");
      if (fallback) setNotice(fallback === "rate-limit" ? "The protected Live AI limit was reached. Stable Demo answered instead." : "Live AI was unavailable. Stable Demo answered safely instead.");
      setResult(data); setStatus("idle");
      const entry: HistoryEntry = { historyId: makeId("history"), profileId: activeProfile?.profileId ?? cases.find((item) => item.scene.caseId === input.scenarioId)?.profile.profileId ?? "fictional-demo", createdAt: new Date().toISOString(), input: requestInput, result: data };
      setCurrentHistoryId(entry.historyId);
      await saveHistory(entry).then(() => setHistory((current) => [entry, ...current])).catch(() => undefined);
      setTimeout(() => document.querySelector(".result-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (requestError) { setStatus("error"); setError(requestError instanceof Error ? requestError.message : "The response could not load."); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void run({ ...form, requestedMode: mode, profileContext: activeProfile ? { displayName: activeProfile.displayName, preferredName: activeProfile.preferredName, relationship: activeProfile.relationship } : form.profileContext }); }
  async function saveSceneCheckIn(draft: Pick<SceneFeedback, "helpfulness" | "tensionBefore" | "tensionAfter" | "note">) {
    if (!currentHistoryId) return;
    const existing = feedback.find((item) => item.historyId === currentHistoryId);
    const entry: SceneFeedback = { ...draft, feedbackId: existing?.feedbackId ?? makeId("feedback"), historyId: currentHistoryId, createdAt: new Date().toISOString() };
    await saveFeedback(entry); setFeedback((current) => [entry, ...current.filter((item) => item.historyId !== currentHistoryId)]);
  }
  function saveNewProfile(profile: LocalProfile) { setProfiles((current) => [profile, ...current.filter((item) => item.profileId !== profile.profileId)]); setActiveId(profile.profileId); setWizard(false); setTour(recordingActive ? -1 : 0); const item = cases.find((entry) => entry.scene.caseId === selectedCase) ?? cases[0]; setForm(inputFromCase(item, mode, profile)); }
  async function updateVoice(voiceName: string, speechRate: number, speechPitch: number) { if (!activeProfile) return; const updated = { ...activeProfile, voiceName, speechRate, speechPitch, updatedAt: new Date().toISOString() }; await saveProfile(updated); setProfiles((current) => current.map((profile) => profile.profileId === updated.profileId ? updated : profile)); }
  async function removeProfile(profile: LocalProfile) { if (!confirm(`Delete ${profile.displayName}'s local profile?`)) return; await deleteProfile(profile.profileId); const related = history.filter((entry) => entry.profileId === profile.profileId); await Promise.all(related.flatMap((entry) => [deleteHistory(entry.historyId), deleteFeedbackForHistory(entry.historyId)])); const relatedIds = new Set(related.map((entry) => entry.historyId)); const next = profiles.filter((item) => item.profileId !== profile.profileId); setProfiles(next); setHistory((current) => current.filter((entry) => entry.profileId !== profile.profileId)); setFeedback((current) => current.filter((entry) => !relatedIds.has(entry.historyId))); setActiveId(next[0]?.profileId ?? ""); }
  async function clearEverything() { if (!confirm("Delete every local profile, photo, history entry, feedback check-in, and preference from this browser?")) return; await clearAllLocalData(); localStorage.removeItem("wm-tour-complete"); setProfiles([]); setHistory([]); setFeedback([]); setActiveId(""); setCurrentHistoryId(""); setResult(null); setNotice("All local app data was deleted from this browser."); }
  function openHistory(entry: HistoryEntry) { setForm(entry.input); setResult(entry.result); setCurrentHistoryId(entry.historyId); setMode(entry.input.requestedMode ?? "demo"); setPage("home"); }
  function startTour() { setIntro(false); setWizard(false); setPage("home"); setTour(0); }
  function finishTour() { setTour(-1); localStorage.setItem("wm-tour-v2-complete", "yes"); }
  function advanceTour() { if (tour >= tourSteps.length - 1) finishTour(); else setTour((current) => current + 1); }
  async function runRecordingWalkthrough() {
    if (recordingActive) return;
    const walletCase = cases.find((item) => item.scene.caseId === "case-missing-wallet") ?? cases[0];
    const homeCase = cases.find((item) => item.scene.caseId === "case-going-home") ?? cases[0];
    const emergencyCase = cases.find((item) => item.scene.caseId === "case-immediate-danger") ?? cases[cases.length - 1];
    setRecordingActive(true); setNotice(""); setError(""); setResult(null); setTour(-1); setWizard(false); setIntro(false); setPage("home");
    localStorage.setItem("wm-entered", "yes");

    setEntered(false); setRecordingCaption("Welcome: a gentle pause between difficult words and a caregiver's response."); await wait(4_500);
    setEntered(true); setIntro(true); setRecordingCaption(""); await wait(5_500);
    setIntro(false); setPage("home"); window.scrollTo({ top: 0, behavior: "smooth" });
    for (let index = 0; index < tourSteps.length; index += 1) { setTour(index); setRecordingCaption(""); await wait(3_200); }
    finishTour(); setRecordingCaption("Next, create a private three-step loved-one profile."); await wait(2_000);

    setWizard(true); await wait(3_800);
    document.querySelector<HTMLButtonElement>(".profile-modal .wizard-actions .button.primary")?.click(); await wait(3_800);
    document.querySelector<HTMLButtonElement>(".profile-modal .wizard-actions .button.primary")?.click(); await wait(3_800);
    setRecordingCaption("A fictional portrait demonstrates local photo storage without opening a personal file picker.");
    document.querySelector<HTMLButtonElement>(".demo-photo-button")?.click(); await wait(3_000);
    document.querySelector<HTMLButtonElement>(".profile-modal .wizard-actions .button.primary")?.click(); await wait(3_500);
    setWizard(false); setTour(-1);

    const savedProfiles = await listProfiles();
    const recordingProfile = savedProfiles.find((profile) => profile.profileId === "recording-eleanor") ?? savedProfiles[0];
    if (recordingProfile) {
      setProfiles([recordingProfile, ...savedProfiles.filter((profile) => profile.profileId !== recordingProfile.profileId)]);
      setActiveId(recordingProfile.profileId);
      setRecordingCaption("The fictional profile, portrait, memories, and voice preference are stored only in this browser.");
      await wait(4_000);
      setActiveId(""); await wait(2_000); setActiveId(recordingProfile.profileId); await wait(2_000);
    }

    const homeInput = inputFromCase(homeCase, "demo", recordingProfile);
    setMode("demo"); setSelectedCase(homeCase.scene.caseId); setForm(homeInput); setResult(null);
    setRecordingCaption("Five English fictional cases can fill every field with reproducible data.");
    document.querySelector(".example-ribbon")?.scrollIntoView({ behavior: "smooth", block: "center" }); await wait(4_500);

    const walletInput = inputFromCase(walletCase, "demo", recordingProfile);
    setSelectedCase(walletCase.scene.caseId); setForm(walletInput); setResult(null);
    document.querySelector(".tag-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setRecordingCaption("Scene shortcuts and personal context help describe the moment without claiming certainty."); await wait(4_500);
    setRecordingCaption("Stable Demo produces a safe, reviewable interpretation without any model dependency.");
    await run(walletInput); await wait(6_500);

    const voiceOptions = document.querySelector<HTMLDetailsElement>(".voice-options"); if (voiceOptions) voiceOptions.open = true;
    setRecordingCaption("An installed English browser voice reads the transcript—never a clone or recording.");
    document.querySelector<HTMLButtonElement>(".speech-row .button.dark")?.click(); await wait(6_000);
    document.querySelector<HTMLButtonElement>(".speech-row .button.ghost")?.click(); await wait(2_000);
    document.querySelector(".safety-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setRecordingCaption("A visible five-stage panel explains validation, risk routing, privacy, evidence retrieval, and output checks."); await wait(4_500);
    document.querySelector(".feedback-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setRecordingCaption("The DICE loop closes with a private after-use check-in that measures whether the response helped."); await wait(3_500);
    document.querySelector<HTMLButtonElement>(".feedback-card .helpfulness-buttons button:first-child")?.click();
    document.querySelector<HTMLButtonElement>(".feedback-card .button.light")?.click(); await wait(3_000);
    document.querySelector(".evidence")?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelector<HTMLDetailsElement>(".evidence details")?.setAttribute("open", "");
    setRecordingCaption("Approved knowledge supports practical care steps, and the help message remains editable."); await wait(4_500);
    document.querySelector(".help-card")?.scrollIntoView({ behavior: "smooth", block: "center" }); await wait(4_000);

    const customInput: InterpretationInput = {
      ...inputFromCase(homeCase, "demo", recordingProfile), scenarioId: undefined,
      patientWords: "Why did you leave me here? I need to get home before dark.",
      context: "We were in the living room after dinner, and the daylight was fading.",
      behavior: "She held her bag, paced near the door, and repeated the question.",
      caregiverFeeling: "I felt worried and wanted to reassure her without arguing.",
      sceneTags: ["Leaving home", "Repeated questions", "Agitation"],
    };
    setPage("home"); setMode("demo"); setSelectedCase(""); setForm(customInput); setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" }); setRecordingCaption("Original caregiver text also works with the no-API personalization engine."); await wait(4_500);
    await run(customInput); await wait(6_000);

    const liveInput: InterpretationInput = { ...customInput, requestedMode: "live", patientWords: "I cannot find my sister. She was just here." };
    document.querySelector<HTMLButtonElement>(".mode-switch button:last-child")?.click(); setMode("live"); setForm(liveInput); setResult(null); window.scrollTo({ top: 0, behavior: "smooth" });
    setRecordingCaption("Live AI is now visibly selected for one fictional request."); await wait(3_500);
    setRecordingCaption("The server applies strict limits, PII reduction, safety checks, and automatic Stable Demo fallback.");
    await run(liveInput); await wait(7_000);

    const emergencyInput = inputFromCase(emergencyCase, "demo", recordingProfile);
    setMode("demo"); setSelectedCase(emergencyCase.scene.caseId); setForm(emergencyInput); setResult(null);
    setRecordingCaption("Danger signals bypass generation and follow a fixed real-world help route."); await run(emergencyInput); await wait(7_000);

    const recordedHistory = await listHistory();
    setHistory(recordedHistory); setPage("history"); window.scrollTo({ top: 0, behavior: "smooth" });
    setRecordingCaption("Every completed scene appears in private, device-local history with open and delete controls."); await wait(5_500);
    if (recordedHistory[0]) { openHistory(recordedHistory[0]); await wait(4_000); }

    setPage("knowledge"); window.scrollTo({ top: 0, behavior: "smooth" });
    setRecordingCaption("Source-checked knowledge cards link to NIA, Alzheimer's Association, DICE, and crisis guidance."); await wait(6_000);
    setPage("evaluation"); window.scrollTo({ top: 0, behavior: "smooth" });
    setRecordingCaption("The release dashboard makes fixture safety checks, source coverage, and local outcome feedback visible to judges."); await wait(6_000);
    setPage("settings"); window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector('[data-recording="install"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
    setRecordingCaption("Settings now reports PWA install readiness alongside profile, tour, and complete local-data controls."); await wait(6_000);
    setPage("home"); setMode("demo"); setSelectedCase(walletCase.scene.caseId); setForm(walletInput); setResult(null); window.scrollTo({ top: 0, behavior: "smooth" });
    setRecordingCaption("Walkthrough complete: every original feature plus reliable audio, explainability, DICE evaluation, and PWA readiness."); await wait(4_500);
    setRecordingCaption(""); setRecordingActive(false);
  }
  const activeTour = tour >= 0 ? tourSteps[tour] : null;

  useEffect(() => {
    if (!activeTour || page !== "home") return;
    const timer = window.setTimeout(() => document.querySelector(`[data-tour="${activeTour.target}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
    return () => window.clearTimeout(timer);
  }, [activeTour, page]);

  if (!hydrated) return <main className="app-loading">Preparing your private workspace…</main>;
  if (!entered) return <><Welcome onEnter={enterApp} />{recordingActive && recordingCaption && <div className="recording-caption" role="status">{recordingCaption}</div>}</>;
  const pages: AppPage[] = ["home", "history", "knowledge", "evaluation", "settings"];
  return <main className="app-shell"><aside className="side-nav"><button className="brand-button" onClick={() => setPage("home")} aria-label="Home"><b>wm</b><span>What Mom<br />Meant to Say</span></button><nav aria-label="Main navigation">{pages.map((item) => <button key={item} className={page === item ? "active" : ""} onClick={() => setPage(item)}><span aria-hidden="true">{item === "home" ? "⌂" : item === "history" ? "◷" : item === "knowledge" ? "◇" : item === "evaluation" ? "✓" : "⚙"}</span>{item[0].toUpperCase() + item.slice(1)}</button>)}</nav><div className="side-boundary"><b>One possibility</b><span>Not a diagnosis or verified thought.</span></div></aside>
  <section className="app-main"><header className="app-header"><div data-tour="profile" className={`profile-switcher ${activeTour?.target === "profile" ? "tour-target" : ""}`}><Avatar name={activeProfile?.displayName ?? "Fictional demo"} photo={activeProfile?.photoDataUrl} /><label><span>Current loved one</span><select value={activeId} onChange={(event) => chooseProfile(event.target.value)}><option value="">Fictional demo profiles</option>{profiles.map((profile) => <option key={profile.profileId} value={profile.profileId}>{profile.displayName} · {profile.relationship}</option>)}</select></label><button className="add-profile" onClick={() => setWizard(true)} aria-label="Create a profile">＋</button></div><div className="header-tools"><span className="privacy-pill">● Stored on this device</span><button className="icon-button guide-icon" onClick={() => setIntro(true)} aria-label="Open project introduction and guided tour">?</button></div></header>
  {page === "home" && <HomeWorkspace cases={cases} cards={cards} sources={sources} activeProfile={activeProfile} selectedCase={selectedCase} form={form} result={result} resultKey={currentHistoryId} mode={mode} status={status} notice={notice} error={error} tourTarget={activeTour?.target} feedback={feedback.find((item) => item.historyId === currentHistoryId)} feedbackReady={Boolean(currentHistoryId)} onGuide={() => setIntro(true)} onChooseCase={chooseCase} onChooseMode={chooseMode} onUpdate={update} onSubmit={submit} onFeedback={(draft) => void saveSceneCheckIn(draft)} onVoiceChange={(voice, rate, pitch) => void updateVoice(voice, rate, pitch)} />}
  {page === "history" && <HistoryPage entries={history} onOpen={openHistory} onDelete={(historyId) => void Promise.all([deleteHistory(historyId), deleteFeedbackForHistory(historyId)]).then(() => { setHistory((current) => current.filter((item) => item.historyId !== historyId)); setFeedback((current) => current.filter((item) => item.historyId !== historyId)); })} />}
  {page === "knowledge" && <KnowledgePage cards={cards} sources={sources} />}
  {page === "evaluation" && <EvaluationPage cases={cases} cards={cards} sources={sources} feedback={feedback} />}
  {page === "settings" && <SettingsPage profiles={profiles} onCreate={() => setWizard(true)} onDelete={(profile) => void removeProfile(profile)} onTour={() => { setPage("home"); setIntro(true); }} onWelcome={() => { localStorage.removeItem("wm-entered"); setEntered(false); }} onClear={() => void clearEverything()} />}
  </section><nav className="bottom-nav" aria-label="Mobile navigation">{pages.map((item) => <button key={item} className={page === item ? "active" : ""} onClick={() => setPage(item)}><span>{item === "home" ? "⌂" : item === "history" ? "◷" : item === "knowledge" ? "◇" : item === "evaluation" ? "✓" : "⚙"}</span>{item}</button>)}</nav>
  {wizard && <ProfileWizard onClose={() => setWizard(false)} onSaved={saveNewProfile} recordingMode={recordingActive} />}
  {intro && <div className="modal-backdrop intro-backdrop"><section className="intro-modal" role="dialog" aria-modal="true" aria-labelledby="intro-title"><button className="icon-button intro-close" onClick={() => { setIntro(false); localStorage.setItem("wm-tour-v2-complete", "yes"); }} aria-label="Close introduction">×</button><p className="eyebrow">Welcome to the project</p><h2 id="intro-title">A gentler pause between difficult words and your response.</h2><p className="intro-copy">Describe what a person living with dementia said and what was happening. The app offers one possible human-centered meaning, a comforting first-person response, practical next steps, source-checked guidance, and optional English speech.</p><div className="intro-boundaries"><div><strong>Possible, never certain</strong><span>Not mind-reading or verified thoughts</span></div><div><strong>Safety first</strong><span>No diagnosis, dosage, or emergency treatment</span></div><div><strong>Private by design</strong><span>Profiles and photos stay on this device</span></div></div><div className="intro-actions"><button className="button primary" onClick={startTour}>Start the 4-step tour <span>→</span></button><button className="button secondary" onClick={() => { setIntro(false); setWizard(true); }}>Create a profile</button><button className="text-button" onClick={() => { setIntro(false); localStorage.setItem("wm-tour-v2-complete", "yes"); }}>Explore on my own</button></div></section></div>}
  {recordingTools && !recordingActive && <aside className="recording-console"><p className="eyebrow">Recording mode</p><strong>Full one-click product walkthrough</strong><span>Start your screen recorder first. This expanded path preserves every original step and adds reliable audio, explainability, DICE feedback, release evaluation, and PWA install readiness.</span><button className="button primary" onClick={() => void runRecordingWalkthrough()}>Start full automatic walkthrough</button></aside>}
  {recordingActive && recordingCaption && <div className="recording-caption" role="status">{recordingCaption}</div>}
  {activeTour && <div className="tour-layer"><div key={tour} className={`tour-popover ${tour >= 2 ? "placement-top" : "placement-bottom"}`} aria-live="polite"><div className="tour-progress"><strong>Step {tour + 1} of {tourSteps.length}</strong><span>{tourSteps.map((_, index) => <i key={index} className={index <= tour ? "active" : ""} />)}</span></div><h2>{activeTour.title}</h2><p>{activeTour.text}</p><div className="tour-actions"><button className="text-button" onClick={finishTour}>Skip tour</button><i />{tour > 0 && <button className="button secondary" onClick={() => setTour((current) => current - 1)}>Back</button>}<button className="button primary" onClick={advanceTour}>{tour === tourSteps.length - 1 ? "Finish" : "Next"}</button></div></div></div>}</main>;
}



