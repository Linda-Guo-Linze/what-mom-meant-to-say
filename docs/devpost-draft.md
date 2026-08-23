# Devpost draft

## What Mom Meant to Say

**Tagline:** Hear the feeling beneath the words.

### Inspiration

A confusing or hurtful phrase from a person living with dementia can leave a family caregiver reacting to the words while missing the fear, discomfort, loss of control, or need for connection underneath. We wanted to create a respectful pause—not a mind reader.

### What it does

The caregiver creates an optional device-local profile, then describes what the person said, the setting, observed behavior, and their own feelings. The app returns one explicitly uncertain interpretation, a first-person comforting response, words and actions to try, caregiver support, an editable help request, and linked source-checked knowledge. Verified routine responses can be read by an installed English system voice.

Five fictional cases make the experience fully reproducible. Original text works in Stable Demo through a deterministic personalization engine. Protected Live AI uses one OpenAI-compatible server call and automatically falls back if it is unavailable.

### How we built it

- Next.js, React, TypeScript, Tailwind CSS, and Zod
- Installable responsive PWA with app-style navigation and guided onboarding
- IndexedDB for profiles, local photos, preferences, and history
- Deterministic routine/urgent/emergency routing
- PII minimization and local knowledge retrieval before Live AI
- OpenAI-compatible server adapter with strict structured-output validation
- Browser, IP, and site request limits
- Browser `speechSynthesis`, visible transcript, stop control, and no voice cloning
- 11 paraphrased cards linked to NIA, Alzheimer’s Association, DICE Approach, 988, and 911 sources

### Safety and privacy by design

The app never presents output as the person's real thoughts. It does not diagnose, alter medication, recommend restraint, or replace emergency services. Elevated-risk scenes bypass model generation and speech. Photos never leave the browser. Model credentials stay server-side. Live input is PII-reduced, responses are no-store, and provider or validation failure returns a safe deterministic result.

### Challenges

The central challenge was balancing warmth with epistemic humility. We designed uncertainty as a visible product feature, not a disclaimer hidden at the bottom. We also separated deterministic safety controls from generative output so a provider cannot weaken the emergency route.

### Accomplishments

- A complete recording-ready path with no external dependency
- Personalized device-local profiles without accounts or cloud storage
- A real replaceable Live AI architecture that remains bounded and fail-safe
- Evidence-linked suggestions and automated tests for safety, privacy, limits, and provider behavior
- One interface across desktop, tablet, and mobile

### What is next

Future work could include caregiver and clinical usability evaluation, additional languages, a shared production-grade limit store, and broader red-team phrasing—without adding voice cloning or turning a supportive interpretation into a clinical claim.
