# Demo video plan — release candidate

Maximum length: 4:00. Target final length: 3:50.

## Capture order

1. Open the deployed desktop route: `https://what-mom-meant-to-say.vercel.app/?recording=1` in a clean 1920 × 1080 Chrome or Edge window.
2. Start the screen recorder, then choose **Start full automatic walkthrough** once.
3. Do not interact while the desktop automated path is running.
4. Open the hidden mobile studio: `https://what-mom-meant-to-say.vercel.app/mobile-demo` in the same 1920 × 1080 window.
5. Start a second recording, then click **Start mobile walkthrough** once inside the centered portrait screen. No emulator, DevTools, real phone, or PWA installation is required.
6. Provide both raw recordings for subtitle timing, narration timing, trimming, and final assembly.

Neither recording route appears in normal navigation. Ordinary visitors opening the home page will not see or start a recording walkthrough.

The desktop walkthrough preserves every original feature and adds:

- reliable fixed English demo audio;
- visible five-stage safety and explainability;
- a saved device-local DICE outcome check-in;
- the safety and evaluation dashboard;
- PWA install readiness in Settings.

The mobile walkthrough is approximately 20 seconds and shows:

- the real 393 × 852 responsive breakpoint as a centered full-height portrait screen;
- a prefilled fictional case and deterministic Stable Demo result;
- bundled fixed English MP3 playback;
- uncertainty and safety explanation;
- mobile navigation to Evaluation.

## Final 3:50 timeline

### 0:00–0:36 — Emotional problem introduction

**Visual:** Black background, warm fictional 3D-styled mother and daughter, then a cooler disease-altered moment. Calm white phrases give way to angled red fragments such as “Who are you?”, “You took it”, and “I need to go home.” Green bubbles absorb the fragments and reveal “fear”, “confusion”, “dignity”, and “need for safety”.

**Narration:** “Dementia can change communication. Words that sound angry or rejecting may leave a caregiver hurt and unsure what to do next. The hurt is real—but the words may also carry fear, confusion, or a need for safety.”

**Transition:** Green bubbles form the product mark and the line: “One possible meaning. One gentler response.” The final bubble expands into the desktop app.

### 0:36–3:18 — Expanded one-click desktop walkthrough

Use the `?recording=1` automatic path. Keep the strongest views from welcome, Spotlight tour, profile and portrait, examples, custom text, Stable Demo, one protected Live AI attempt and fallback, speech, evidence, help message, emergency route, history, knowledge, Settings, explainability, DICE feedback, and Evaluation. Trim waiting pauses and repeated scrolling, not unique feature evidence.

### 3:18–3:38 — portrait mobile walkthrough

Use the hidden `/mobile-demo` route. Record the whole window so the centered, full-height portrait screen remains visible. Click the start button inside the portrait screen once.

**Narration:** “The same private, responsive PWA works at a true mobile breakpoint. Approved fictional responses include a zero-cost fixed audio fallback when device speech is unreliable.”

### 3:38–3:50 — Close

**Visual:** Product mark, public URL, GitHub, and four short labels: “Local-first profiles”, “Deterministic danger routing”, “Source-checked guidance”, “Schema-checked AI”.

**Narration:** “What Mom Meant to Say does not claim to read a mind. It helps caregivers answer uncertainty with dignity, safety, and care.”

### 3:50–4:00 — Safety buffer

Leave up to ten seconds for title-card timing, transitions, or Devpost re-encoding differences.

## Audio and subtitle route

- Use soft instrumental music under the introduction at low volume.
- Prefer free system English TTS for narration; export narration as a separate track.
- Keep product speech distinct from narration.
- Burn in concise English subtitles and also export an SRT file.
- Use fictional visuals and data only.
