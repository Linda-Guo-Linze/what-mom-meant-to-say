# Devpost draft

## What Mom Meant to Say

**Tagline:** Hear the feeling beneath the words.

### Inspiration

A confusing or hurtful phrase from a person living with dementia can leave a family caregiver reacting to the words while missing the fear, discomfort, loss of control, or need for connection underneath. We wanted to create a respectful pause—not a mind reader—and help a caregiver move from “What did those words do to me?” toward “What might this person need right now?”

### What it does

The caregiver can create an optional loved-one profile with a preferred name, relationship, language habits, shared memories, voice preferences, and a photo. Profiles, photos, scene history, and outcome check-ins stay in the browser’s device-local database.

For each moment, the caregiver enters:

- what the person said;
- the setting and immediate context;
- observed behavior;
- the caregiver’s feelings;
- relationship or preferred form of address;
- optional language habits, shared memories, and scene tags.

The app returns one explicitly uncertain possible meaning, a first-person comforting response, words and actions to try, caregiver support, an editable help request, and source-linked knowledge. It never claims to reveal the person’s true thoughts.

Five fictional English cases make the complete experience reproducible. Stable Demo is the default: approved cases return fixed reviewed outputs, while edited or original routine text uses a deterministic no-API personalization engine. Protected Live AI can use one OpenAI-compatible server request and automatically falls back to Stable Demo when the provider, quota, schema, or safety checks are unavailable.

Routine fictional responses can be heard through two zero-cost paths: an installed English browser voice or one of four bundled fixed English MP3 files. The user can play, stop, change installed voice preferences, and always read the transcript. The app does not record a microphone, clone a voice, or upload audio.

After use, a private DICE-inspired outcome check-in records whether the suggestion helped and compares tension before and after. A visible Evaluation page reports fictional-fixture safety, evidence coverage, speech eligibility, and aggregate device-local feedback without presenting these as clinical validation.

### How we built it

- Next.js 16, React 19, TypeScript, Tailwind CSS, and Zod
- Responsive installable PWA with app-style navigation, a welcome page, and a skippable Spotlight tour
- IndexedDB v2 for multiple profiles, local photos, preferences, scene history, and DICE-inspired feedback
- Five fictional cases, a deterministic local personalization engine, and four bundled MP3 fallbacks
- Deterministic routine, urgent, and emergency routing before any model call
- PII reduction and approved local knowledge retrieval before Live AI
- OpenAI-compatible server adapter with a structured prompt, strict Zod output validation, no-store responses, timeouts, and safe fallback
- Browser, IP, and site-level request limits to bound cost and misuse
- Eleven concise, paraphrased knowledge cards linked to NIA, Alzheimer’s Association, DICE Approach, 988, and 911 sources
- A visible five-stage safety/explainability panel and a release Evaluation dashboard
- Automated linting, type checking, production build, dependency audit, and 23 tests across safety, privacy, rate limits, provider behavior, local data, audio fixtures, and evaluation features

### Safety and privacy by design

The app never presents an output as the person’s real thought. It does not diagnose dementia, change medication or dosage, recommend restraint, or replace emergency services.

Safety is enforced in stages:

1. **Validate:** Zod checks structured input and output boundaries.
2. **Route risk:** deterministic danger rules run before generation.
3. **Minimize:** likely identifiers are reduced before Live AI.
4. **Ground:** approved, source-linked knowledge is retrieved locally.
5. **Verify:** structured output is revalidated, and failure returns a deterministic safe result.

Elevated-risk scenes bypass model generation and speech and show a fixed real-world help route. Photos remain on the device. Model credentials remain server-side in encrypted deployment environment variables and are never exposed through a public browser variable. Provider responses are not stored by the server.

### Challenges

The central design challenge was balancing warmth with epistemic humility. A comforting first-person response can feel human, but it must not become a false claim about another person’s inner state. We made uncertainty a visible product feature instead of hiding it in a footer.

A second challenge was making the demo reliable across desktop and mobile speech implementations. The dual path preserves flexible browser speech for original text while fixed MP3 files keep approved fictional responses reproducible without a paid runtime speech service.

A third challenge was keeping Live AI useful without giving it control over high-risk routing. Safety, evidence selection, request limits, and output validation remain deterministic and outside the model.

### Accomplishments

- A complete, reproducible care flow with no external dependency
- Personalized multi-profile support without accounts, cloud photos, or a complex database
- A replaceable Live AI architecture with bounded cost and automatic fail-safe fallback
- Fixed emergency routing that cannot be weakened by a provider response
- Source-linked practical guidance and visible explanation of the safety pipeline
- A DICE-inspired local outcome loop and transparent release Evaluation page
- Reliable English audio on supported devices through browser speech and four fixed MP3 files
- One polished interface across desktop, tablet, mobile browser, and installed PWA
- Twenty-three passing automated tests plus clean lint, typecheck, build, and production dependency audit

### What we learned

Supportive AI for dementia communication should not optimize for confident interpretation. It should optimize for a safer next interaction: slower pace, validation, concrete environmental checks, caregiver regulation, and escalation when danger is present. Reliability also matters as much as novelty in a judged demo, so deterministic safeguards and fixed reviewed cases are first-class features.

### What is next

The next step is not a larger feature list. It is evidence: structured usability sessions with caregivers and dementia-care professionals, followed by wording, accessibility, and workflow revisions. A future production version could add multilingual reviewed content, a shared production-grade rate-limit store, and broader red-team evaluation while preserving local-first privacy, deterministic danger routing, and the prohibition on voice cloning.

### Links to enter in Devpost

- **Try it:** https://what-mom-meant-to-say.vercel.app/
- **Source:** https://github.com/Linda-Guo-Linze/what-mom-meant-to-say
