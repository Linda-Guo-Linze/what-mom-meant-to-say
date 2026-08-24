"use client";

import { useEffect, useRef, useState } from "react";
import type { KnowledgeCard, KnowledgeSource, LocalProfile, SceneFeedback, SupportResult } from "../lib/schemas";
import { Avatar } from "./app-ui";

type FeedbackDraft = Pick<SceneFeedback, "helpfulness" | "tensionBefore" | "tensionAfter" | "note">;
const fixedAudioCases = new Set(["case-missing-wallet", "case-bathing-refusal", "case-going-home", "case-medication-refusal"]);

export function ResultPanel({ result, cards, sources, profile, feedback, feedbackReady, onFeedback, onVoiceChange }: {
  result: SupportResult | null; cards: readonly KnowledgeCard[]; sources: readonly KnowledgeSource[]; profile?: LocalProfile;
  feedback?: SceneFeedback; feedbackReady: boolean; onFeedback: (draft: FeedbackDraft) => void; onVoiceChange: (voice: string, rate: number, pitch: number) => void;
}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [speechNotice, setSpeechNotice] = useState("");
  const [help, setHelp] = useState(result?.helpMessage ?? "");
  const [copied, setCopied] = useState(false);
  const [voiceName, setVoiceName] = useState(profile?.voiceName ?? "");
  const [rate, setRate] = useState(profile?.speechRate ?? 0.92);
  const [pitch, setPitch] = useState(profile?.speechPitch ?? 1);
  const [playbackSource, setPlaybackSource] = useState<"auto" | "device" | "fixed">("auto");
  const [helpfulness, setHelpfulness] = useState<FeedbackDraft["helpfulness"]>(feedback?.helpfulness ?? "helpful");
  const [tensionBefore, setTensionBefore] = useState(feedback?.tensionBefore ?? 4);
  const [tensionAfter, setTensionAfter] = useState(feedback?.tensionAfter ?? 3);
  const [feedbackNote, setFeedbackNote] = useState(feedback?.note ?? "");
  const [feedbackSaved, setFeedbackSaved] = useState(Boolean(feedback));
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const watchdogRef = useRef<number | null>(null);
  const speechRunRef = useRef(0);
  const fallbackAudio = result?.ttsAllowed && result.caseId && fixedAudioCases.has(result.caseId) ? `/audio/demo/${result.caseId}.mp3` : "";

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("en")));
    load();
    const firstRetry = window.setTimeout(load, 250);
    const secondRetry = window.setTimeout(load, 1_000);
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.clearTimeout(firstRetry); window.clearTimeout(secondRetry);
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      speechRunRef.current += 1; utteranceRef.current = null; window.speechSynthesis.cancel();
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      audioRef.current?.pause(); audioRef.current = null;
    };
  }, []);

  function clearWatchdog() { if (watchdogRef.current) { window.clearTimeout(watchdogRef.current); watchdogRef.current = null; } }
  function stopPlayback(clearMessage = true) {
    speechRunRef.current += 1; clearWatchdog(); utteranceRef.current = null;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; }
    setSpeaking(false); if (clearMessage) { setSpeechError(""); setSpeechNotice(""); }
  }
  async function playFixedAudio(reason = "") {
    if (!fallbackAudio) {
      setSpeaking(false); setSpeechError("No fixed demo audio exists for original text. Try an installed English device voice or use the visible transcript.");
      return;
    }
    const runId = speechRunRef.current + 1; speechRunRef.current = runId;
    const audio = new Audio(fallbackAudio); audio.preload = "auto"; audioRef.current = audio;
    audio.onplay = () => { if (speechRunRef.current === runId) setSpeaking(true); };
    audio.onended = () => { if (speechRunRef.current === runId) { setSpeaking(false); audioRef.current = null; } };
    audio.onerror = () => { if (speechRunRef.current === runId) { setSpeaking(false); setSpeechError("Both device speech and fixed demo audio were unavailable. The complete transcript remains visible."); } };
    try {
      setSpeechError(""); setSpeechNotice(reason || "Playing the pre-generated English demo audio. No API request is used.");
      await audio.play();
    } catch {
      setSpeaking(false); setSpeechError("The browser blocked audio playback. Tap Play again after allowing site sound, or use the transcript.");
    }
  }
  function handleDeviceSpeechFailure(reason: string) {
    if (fallbackAudio) {
      void playFixedAudio(reason);
      return;
    }
    setSpeaking(false);
    setSpeechNotice("");
    setSpeechError("The installed device voice could not play this response. Check site sound and the device's English text-to-speech settings, then try again. The complete transcript remains visible.");
  }
  function playDeviceSpeech() {
    if (!result?.simulatedWords || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      handleDeviceSpeechFailure("Device speech is unavailable, so the fixed English demo audio was selected.");
      return;
    }
    const synth = window.speechSynthesis;
    const runId = speechRunRef.current + 1; speechRunRef.current = runId;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(result.simulatedWords);
    utterance.voice = voices.find((voice) => voice.name === voiceName) ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en-us")) ?? voices[0] ?? null;
    utterance.lang = utterance.voice?.lang ?? "en-US"; utterance.rate = rate; utterance.pitch = pitch; utterance.volume = 1;
    utterance.onstart = () => { if (speechRunRef.current === runId) { clearWatchdog(); setSpeaking(true); setSpeechNotice("Playing an English voice provided by this device."); } };
    utterance.onend = () => { if (speechRunRef.current !== runId) return; clearWatchdog(); utteranceRef.current = null; setSpeaking(false); };
    utterance.onerror = (event) => {
      if (speechRunRef.current !== runId || event.error === "canceled" || event.error === "interrupted") return;
      clearWatchdog(); utteranceRef.current = null; setSpeaking(false); synth.cancel();
      handleDeviceSpeechFailure("The device voice failed, so the fixed English demo audio was selected.");
    };
    utteranceRef.current = utterance; setSpeechError(""); setSpeechNotice(""); setSpeaking(true);
    synth.resume(); synth.speak(utterance); if (synth.paused) synth.resume();
    if (fallbackAudio) {
      watchdogRef.current = window.setTimeout(() => {
        if (speechRunRef.current !== runId) return;
        speechRunRef.current += 1; utteranceRef.current = null; synth.cancel(); setSpeaking(false);
        void playFixedAudio("The device voice did not start within 2 seconds, so the fixed English demo audio was selected.");
      }, 2_000);
    }
    onVoiceChange(utterance.voice?.name ?? "", rate, pitch);
  }
  function play() {
    if (!result?.ttsAllowed || !result.simulatedWords) { setSpeechError("Speech is disabled for this safety route. Follow the visible real-world help steps."); return; }
    stopPlayback(false);
    const mobileDevice = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
    const useFixed = fallbackAudio && (playbackSource === "fixed" || (playbackSource === "auto" && (mobileDevice || voices.length === 0)));
    if (useFixed) void playFixedAudio(mobileDevice ? "Using reliable fixed English demo audio on this mobile device. No API request is used." : "");
    else playDeviceSpeech();
  }
  function stop() { stopPlayback(); }
  async function copy() { try { await navigator.clipboard.writeText(help); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); } }
  function saveCheckIn() { onFeedback({ helpfulness, tensionBefore, tensionAfter, note: feedbackNote }); setFeedbackSaved(true); }

  if (!result) return <aside className="result-panel empty"><div className="empty-orbit"><span>✦</span></div><p className="eyebrow">A possible way back</p><h2>Your supportive response will appear here.</h2><p>Choose a fictional case or describe your own moment. The result will stay clearly uncertain and safety checked.</p></aside>;

  const danger = result.riskLevel !== "routine";
  const evidence = result.evidenceIds.map((entry) => cards.find((card) => card.cardId === entry)).filter((card): card is KnowledgeCard => Boolean(card));
  return <aside className="result-panel" aria-live="polite"><div className="result-head"><div><p className="eyebrow">{danger ? "Safety comes first" : "One possible interpretation"}</p><h2>{danger ? "Pause and get real-world help." : "Listen for the need beneath the words."}</h2></div><span className="result-badge">{result.mode === "live" ? "Live AI · checked" : "Stable Demo"}</span></div>
  {danger ? <section className="urgent-card"><strong>{result.riskLevel === "emergency" ? "Immediate danger" : "Prompt support needed"}</strong><p>Do not rely on this app in an emergency. Follow the fixed steps below and use appropriate local services.</p></section> : <section className="response-card"><div className="voice-avatar"><Avatar name={profile?.displayName ?? "Loved one"} photo={profile?.photoDataUrl} speaking={speaking} /><span>A possible expression</span></div><blockquote>“{result.simulatedWords}”</blockquote><p className="uncertainty">{result.uncertaintyNote}</p><div className="speech-row"><button className="button dark" onClick={play}>{speaking ? "Speaking…" : "▶ Play response"}</button><button className="button ghost" onClick={stop}>Stop</button></div><details className="voice-options"><summary>Voice and transcript options</summary>{fallbackAudio && <label>Playback source<select value={playbackSource} onChange={(event) => setPlaybackSource(event.target.value as "auto" | "device" | "fixed")}><option value="auto">Automatic (fixed audio on mobile)</option><option value="device">Installed device voice</option><option value="fixed">Reliable fixed demo audio</option></select></label>}<label>Device English voice<select value={voiceName} onChange={(event) => setVoiceName(event.target.value)}><option value="">Automatic device voice</option>{voices.map((voice) => <option key={`${voice.name}-${voice.lang}`} value={voice.name}>{voice.name} · {voice.lang}</option>)}</select></label><div className="range-grid"><label>Speed<input type="range" min="0.7" max="1.2" step="0.05" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label><label>Pitch<input type="range" min="0.8" max="1.2" step="0.05" value={pitch} onChange={(event) => setPitch(Number(event.target.value))} /></label></div><p>{result.simulatedWords}</p><small>Fixed demo audio needs no runtime API. Device speech uses an installed system voice. Neither option clones a real person.</small></details>{speechNotice && <p className="speech-notice" role="status">{speechNotice}</p>}{speechError && <p className="form-error" role="alert">{speechError}</p>}</section>}
  <section className="meaning-card"><span>{danger ? "Why interpretation stops" : "Why this might fit"}</span><p>{result.explanation}</p></section>
  {result.sayNow.length > 0 && <section className="result-list"><span>What you could say now</span><ul>{result.sayNow.map((item) => <li key={item}>{item}</li>)}</ul></section>}
  <section className="result-list"><span>What you could do now</span><ul>{result.doNow.map((item) => <li key={item}>{item}</li>)}</ul></section>
  <section className="care-card"><b>✦</b><div><strong>Care for the caregiver, too</strong><ul>{result.caregiverCare.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
  <details className="safety-panel" open><summary>Safety & explainability</summary><div className="pipeline-grid"><span><b>1 · Input</b>Zod schema validated</span><span><b>2 · Risk route</b>{danger ? "Generation bypassed" : "Routine pathway"}</span><span><b>3 · Privacy</b>{result.mode === "live" ? "PII reduced before provider" : "No external model request"}</span><span><b>4 · Evidence</b>{evidence.length} approved cards attached</span><span><b>5 · Output</b>Schema and prohibited-content checked</span></div><small>{result.mode === "live" ? "One server-side OpenAI-compatible request produced this result." : "This result used the deterministic demo or local personalization path."}</small></details>
  <section className="evidence"><span>Source-checked guidance</span>{evidence.map((card) => <details key={card.cardId}><summary>{card.title}</summary><p>{card.summary}</p>{card.sourceIds.map((sourceId) => { const source = sources.find((item) => item.sourceId === sourceId); return source ? <a key={sourceId} href={source.url} target="_blank" rel="noreferrer">{source.organization} ↗</a> : null; })}</details>)}</section>
  {!danger && <section className="feedback-card"><span>DICE · evaluate after the moment</span><p>Did this response help you choose a calmer next step?</p><div className="helpfulness-buttons">{([["helpful", "Yes"], ["partly", "Partly"], ["not-yet", "Not yet"]] as const).map(([value, label]) => <button key={value} type="button" className={helpfulness === value ? "selected" : ""} onClick={() => { setHelpfulness(value); setFeedbackSaved(false); }}>{label}</button>)}</div><div className="feedback-ranges"><label>Tension before <b>{tensionBefore}/5</b><input type="range" min="1" max="5" value={tensionBefore} onChange={(event) => { setTensionBefore(Number(event.target.value)); setFeedbackSaved(false); }} /></label><label>Tension after <b>{tensionAfter}/5</b><input type="range" min="1" max="5" value={tensionAfter} onChange={(event) => { setTensionAfter(Number(event.target.value)); setFeedbackSaved(false); }} /></label></div><label>Private note <textarea maxLength={300} value={feedbackNote} placeholder="Optional: what changed?" onChange={(event) => { setFeedbackNote(event.target.value); setFeedbackSaved(false); }} /></label><button className="button light" disabled={!feedbackReady} onClick={saveCheckIn}>{feedbackSaved ? "✓ Check-in saved on this device" : "Save private check-in"}</button><small>This voluntary feedback stays in IndexedDB and is never sent to Live AI.</small></section>}
  <section className="help-card"><label htmlFor="help-message">A help message you can edit</label><textarea id="help-message" value={help} onChange={(event) => setHelp(event.target.value)} /><button className="button light" onClick={() => void copy()}>{copied ? "Copied" : "Copy message"}</button><small>The app never sends this message for you.</small></section></aside>;
}

