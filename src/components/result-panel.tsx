"use client";

import { useEffect, useRef, useState } from "react";
import type { KnowledgeCard, KnowledgeSource, LocalProfile, SupportResult } from "../lib/schemas";
import { Avatar } from "./app-ui";

export function ResultPanel({ result, cards, sources, profile, onVoiceChange }: { result: SupportResult | null; cards: readonly KnowledgeCard[]; sources: readonly KnowledgeSource[]; profile?: LocalProfile; onVoiceChange: (voice: string, rate: number, pitch: number) => void }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [help, setHelp] = useState(result?.helpMessage ?? "");
  const [copied, setCopied] = useState(false);
  const [voiceName, setVoiceName] = useState(profile?.voiceName ?? "");
  const [rate, setRate] = useState(profile?.speechRate ?? 0.92);
  const [pitch, setPitch] = useState(profile?.speechPitch ?? 1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechRunRef = useRef(0);
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
    };
  }, []);

  function play() {
    if (!result?.ttsAllowed || !result.simulatedWords || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) { setSpeechError("This browser does not provide speech playback. The complete transcript remains visible."); return; }
    const synth = window.speechSynthesis;
    const runId = speechRunRef.current + 1; speechRunRef.current = runId;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(result.simulatedWords);
    utterance.voice = voices.find((voice) => voice.name === voiceName) ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en-us")) ?? voices[0] ?? null;
    utterance.lang = utterance.voice?.lang ?? "en-US"; utterance.rate = rate; utterance.pitch = pitch; utterance.volume = 1;
    utterance.onstart = () => { if (speechRunRef.current === runId) setSpeaking(true); };
    utterance.onend = () => { if (speechRunRef.current !== runId) return; utteranceRef.current = null; setSpeaking(false); };
    utterance.onerror = (event) => {
      if (speechRunRef.current !== runId || event.error === "canceled" || event.error === "interrupted") return;
      utteranceRef.current = null; setSpeaking(false);
      setSpeechError("The device speech engine could not start. Check media volume, then try Automatic device voice.");
    };
    utteranceRef.current = utterance; setSpeechError(""); setSpeaking(true);
    synth.resume(); synth.speak(utterance); if (synth.paused) synth.resume();
    onVoiceChange(utterance.voice?.name ?? "", rate, pitch);
  }
  function stop() {
    speechRunRef.current += 1; utteranceRef.current = null;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false); setSpeechError("");
  }
  async function copy() { try { await navigator.clipboard.writeText(help); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); } }

  if (!result) return <aside className="result-panel empty"><div className="empty-orbit"><span>✦</span></div><p className="eyebrow">A possible way back</p><h2>Your supportive response will appear here.</h2><p>Choose a fictional case or describe your own moment. The result will stay clearly uncertain and safety checked.</p></aside>;

  const danger = result.riskLevel !== "routine";
  const evidence = result.evidenceIds.map((entry) => cards.find((card) => card.cardId === entry)).filter((card): card is KnowledgeCard => Boolean(card));
  return <aside className="result-panel" aria-live="polite"><div className="result-head"><div><p className="eyebrow">{danger ? "Safety comes first" : "One possible interpretation"}</p><h2>{danger ? "Pause and get real-world help." : "Listen for the need beneath the words."}</h2></div><span className="result-badge">{result.mode === "live" ? "Live AI · checked" : "Stable Demo"}</span></div>
  {danger ? <section className="urgent-card"><strong>{result.riskLevel === "emergency" ? "Immediate danger" : "Prompt support needed"}</strong><p>Do not rely on this app in an emergency. Follow the fixed steps below and use appropriate local services.</p></section> : <section className="response-card"><div className="voice-avatar"><Avatar name={profile?.displayName ?? "Loved one"} photo={profile?.photoDataUrl} speaking={speaking} /><span>A possible expression</span></div><blockquote>“{result.simulatedWords}”</blockquote><p className="uncertainty">{result.uncertaintyNote}</p><div className="speech-row"><button className="button dark" onClick={play}>{speaking ? "Speaking…" : "▶ Play response"}</button><button className="button ghost" onClick={stop}>Stop</button></div><details className="voice-options"><summary>Voice and transcript options</summary><label>Device English voice<select value={voiceName} onChange={(event) => setVoiceName(event.target.value)}><option value="">Automatic device voice</option>{voices.map((voice) => <option key={`${voice.name}-${voice.lang}`} value={voice.name}>{voice.name} · {voice.lang}</option>)}</select></label><div className="range-grid"><label>Speed<input type="range" min="0.7" max="1.2" step="0.05" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label><label>Pitch<input type="range" min="0.8" max="1.2" step="0.05" value={pitch} onChange={(event) => setPitch(Number(event.target.value))} /></label></div><p>{result.simulatedWords}</p><small>Uses the phone or computer speech engine. This app downloads no TTS package and never clones a voice.</small></details>{speechError && <p className="form-error" role="alert">{speechError}</p>}</section>}
  <section className="meaning-card"><span>{danger ? "Why interpretation stops" : "Why this might fit"}</span><p>{result.explanation}</p></section>
  {result.sayNow.length > 0 && <section className="result-list"><span>What you could say now</span><ul>{result.sayNow.map((item) => <li key={item}>{item}</li>)}</ul></section>}
  <section className="result-list"><span>What you could do now</span><ul>{result.doNow.map((item) => <li key={item}>{item}</li>)}</ul></section>
  <section className="care-card"><b>✦</b><div><strong>Care for the caregiver, too</strong><ul>{result.caregiverCare.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
  <section className="evidence"><span>Source-checked guidance</span>{evidence.map((card) => <details key={card.cardId}><summary>{card.title}</summary><p>{card.summary}</p>{card.sourceIds.map((sourceId) => { const source = sources.find((item) => item.sourceId === sourceId); return source ? <a key={sourceId} href={source.url} target="_blank" rel="noreferrer">{source.organization} ↗</a> : null; })}</details>)}</section>
  <section className="help-card"><label htmlFor="help-message">A help message you can edit</label><textarea id="help-message" value={help} onChange={(event) => setHelp(event.target.value)} /><button className="button light" onClick={() => void copy()}>{copied ? "Copied" : "Copy message"}</button><small>The app never sends this message for you.</small></section></aside>;
}


