"use client";

import { useState } from "react";
import { saveProfile } from "../lib/local-db";
import type { LocalProfile } from "../lib/schemas";
import { Avatar, emptyDraft, makeId, type DraftProfile } from "./app-ui";

export function ProfileWizard({ onClose, onSaved, recordingMode = false }: { onClose: () => void; onSaved: (profile: LocalProfile) => void; recordingMode?: boolean }) {
  const [step, setStep] = useState(1); const [draft, setDraft] = useState<DraftProfile>(emptyDraft); const [error, setError] = useState("");
  function update(field: keyof DraftProfile, value: string) { setDraft((current) => ({ ...current, [field]: value })); }
  async function photo(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 3_000_000) { setError("Choose a JPG, PNG, or WebP image smaller than 3 MB."); return; }
    const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); });
    update("photoDataUrl", dataUrl); setError("");
  }
  async function loadDemoPortrait() {
    try {
      const response = await fetch("/demo-eleanor-avatar.png");
      if (!response.ok) throw new Error("portrait unavailable");
      const blob = await response.blob();
      await photo(new File([blob], "demo-eleanor-avatar.png", { type: blob.type || "image/png" }));
    } catch { setError("The fictional demo portrait could not be loaded. You can still choose a local photo."); }
  }
  async function finish() {
    const now = new Date().toISOString();
    const profile: LocalProfile = { ...draft, profileId: recordingMode ? "recording-eleanor" : makeId("profile"), voiceName: "", speechRate: 0.92, speechPitch: 1, createdAt: now, updatedAt: now };
    try { await saveProfile(profile); onSaved(profile); } catch { setError("This browser could not save the profile. You can still use the fictional demo."); }
  }
  return <div className="modal-backdrop" role="presentation"><section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title"><div className="modal-top"><span>Profile setup · {step} of 3</span><button className="icon-button" onClick={onClose} aria-label="Close profile setup">×</button></div><div className="progress-track"><i style={{ width: `${step * 33.33}%` }} /></div>
  {step === 1 && <div className="wizard-step"><p className="eyebrow">Start with how you know them</p><h2 id="profile-title">Who are you caring for?</h2><label>Their name<input value={draft.displayName} onChange={(event) => update("displayName", event.target.value)} placeholder="Eleanor Carter" /></label><label>What you call them<input value={draft.preferredName} onChange={(event) => update("preferredName", event.target.value)} placeholder="Mom" /></label><label>Your relationship<input value={draft.relationship} onChange={(event) => update("relationship", event.target.value)} placeholder="Mother" /></label><p className="wizard-hint">Fictional example values are prefilled for the demo. Edit them to create a different local profile.</p></div>}
  {step === 2 && <div className="wizard-step"><p className="eyebrow">Small details, warmer context</p><h2>What feels familiar?</h2><label>Language habits <span>optional</span><textarea value={draft.languageHabits} onChange={(event) => update("languageHabits", event.target.value)} placeholder="Uses short phrases when tired; likes gentle, direct wording." /></label><label>A shared memory <span>optional</span><textarea value={draft.sharedMemory} onChange={(event) => update("sharedMemory", event.target.value)} placeholder="We made pancakes together every Sunday." /></label></div>}
  {step === 3 && <div className="wizard-step"><p className="eyebrow">Kept on this device</p><h2>Add a familiar photo.</h2><div className="photo-editor"><Avatar name={draft.displayName || "Loved one"} photo={draft.photoDataUrl} size="large" /><div><label className="button secondary file-button">Choose photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void photo(event.target.files?.[0])} /></label>{recordingMode && <button className="button demo-photo-button" type="button" onClick={() => void loadDemoPortrait()}>Use fictional demo portrait</button>}{draft.photoDataUrl && <button className="text-button danger" onClick={() => update("photoDataUrl", "")}>Remove photo</button>}<p>Automatically centered and stored only in this browser. Maximum 3 MB.</p>{recordingMode && <p className="wizard-hint">Recording mode uses a fictional built-in portrait so the browser never needs permission to select a personal file.</p>}</div></div></div>}
  {error && <p className="form-error" role="alert">{error}</p>}<div className="wizard-actions">{step > 1 ? <button className="button secondary" onClick={() => setStep(step - 1)}>Back</button> : <span />}{step < 3 ? <button className="button primary" disabled={step === 1 && (!draft.displayName || !draft.preferredName || !draft.relationship)} onClick={() => setStep(step + 1)}>Continue</button> : <button className="button primary" disabled={!draft.displayName || !draft.preferredName || !draft.relationship} onClick={() => void finish()}>Save profile</button>}</div></section></div>;
}

