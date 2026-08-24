# What Mom Meant to Say

An English-first, installable PWA for dementia caregivers, built for Hack for Humanity Summer 2026. A caregiver describes a difficult moment; the app offers one clearly uncertain interpretation, a warmer first-person response, practical next steps, source-checked guidance, and optional English speech.

**Live app:** https://what-mom-meant-to-say.vercel.app/

## Product boundary

Every result is one possibility—not the person's verified thoughts. The app does not diagnose, prescribe, change medication or dosage, recommend restraint, or provide emergency treatment. Deterministic safety screening runs before interpretation. Elevated-risk inputs bypass Live AI and speech and use a fixed human-help route.

## App experience

- App-style welcome, desktop sidebar, and mobile bottom navigation
- Skippable four-step Spotlight introduction
- Three-step loved-one profile questionnaire
- Multiple device-local profiles with optional photos
- IndexedDB storage for profiles, voice preferences, and scene history
- Five approved fictional English cases and one-click form filling
- Editable free-text flow with scene shortcut tags
- No-API personalization engine for stable custom responses
- Stable Demo and protected Live AI modes
- 11 paraphrased knowledge cards from nine authoritative sources
- Dual-path English speech: device `speechSynthesis`, a two-second startup watchdog, and pre-generated MP3 fallback for the four speech-enabled fixed cases
- Visible safety and explainability pipeline for every result
- Device-local DICE outcome check-ins and a transparent release-evaluation dashboard
- Editable help message that is never sent automatically
- Installable PWA shell with 192/512/maskable icons, in-app install status, and offline cached fixed audio

## Stable Demo

Stable Demo is the default. It needs no model request and produces deterministic outputs for the five fictional cases. Edited or original routine input uses a local theme-and-context template engine. This provides a reliable judging and recording path while keeping uncertainty and safety rules fixed.

## Live AI

The server adapter uses an OpenAI-compatible `/chat/completions` endpoint. The default example configuration targets Groq with `openai/gpt-oss-120b`.

Before the single model call, the server:

1. validates input with Zod;
2. runs deterministic urgent/emergency routing;
3. redacts common phone, email, government ID, medical ID, and street-address patterns;
4. replaces profile names with neutral placeholders;
5. retrieves only relevant source-checked knowledge cards.

After generation, Zod and safety rules reject over-certain, diagnostic, dosage, restraint, unsupported-evidence, or unsafe-speech output. Provider failure, invalid output, timeout, or limits automatically return the Stable Demo result.

### Usage protection

- 3 Live AI attempts per browser per day
- 10 requests per IP per hour
- 100 Live requests per server instance per UTC day
- 2,000-character-class structured input limits through field validation
- 600 maximum output tokens
- one model call per submission and no automatic model retry
- provider free-tier quota as the final ceiling

Server-memory IP and site counters are intentionally lightweight for the competition deployment. A production multi-instance deployment should replace them with a shared rate-limit store.

## Privacy

- Model keys are server-only environment values and never enter the browser bundle.
- Photos remain in browser IndexedDB and are never added to Live AI requests.
- Local profiles and history do not require login or cloud sync.
- API responses use `Cache-Control: no-store`.
- Users can delete a history item, a profile, or all device-local data.
- PII redaction reduces risk but is not represented as perfect de-identification.

## Run locally

Requirements: Node.js 22.13+ and pnpm 10.

    pnpm install
    pnpm dev

Open `http://localhost:3000` and keep the terminal running.

## Configure Groq Live AI

Copy `.env.example` to `.env.local` and set:

    MODEL_API_URL=https://api.groq.com/openai/v1
    MODEL_API_KEY=gsk_your_server_only_key
    MODEL_NAME=openai/gpt-oss-120b

Never commit `.env.local` or use a `NEXT_PUBLIC_` credential. Restart the server after adding the key. `GET /api/status` reports readiness without revealing secret values.

## One-click recording mode

For the complete desktop capture, open `http://localhost:3000/?recording=1` (or add `?recording=1` to the deployed URL), start screen recording, then choose **Start full automatic walkthrough**. The path preserves every original step: welcome, Spotlight tour, three-step profile, fictional portrait, profile switching, five examples, tags, custom input, Stable Demo, one protected Live AI request with automatic fallback, speech, editable help message, fixed emergency routing, history, knowledge, and settings. It also demonstrates fixed mobile-safe audio, the five-stage safety/explainability panel, a saved DICE outcome check-in, the release-evaluation dashboard, and PWA install readiness.

For a separate phone clip without a real phone or emulator, open `/mobile-demo` (deployed: `https://what-mom-meant-to-say.vercel.app/mobile-demo`) in a 1920 × 1080 desktop window. The hidden studio renders the real app at a 393 × 852 responsive breakpoint as one centered, full-height portrait screen. Start the recorder, then choose **Start mobile walkthrough** once inside the portrait screen. The approximately 20-second route automatically shows a fictional input, Stable Demo result, fixed English MP3, safety explanation, and mobile Evaluation navigation.

Both recording entries are hidden from normal navigation and never start for ordinary home-page visitors. On-screen English captions explain each section. The competition video can combine both captures with the narration and subtitles in `docs/demo-video-script.md` and `docs/demo-video-subtitles.srt`.

## Deployment

The recommended production path is a public GitHub repository connected to Vercel. The owner signs in with GitHub, imports the repository, and adds `MODEL_API_URL`, `MODEL_API_KEY`, and `MODEL_NAME` as encrypted server environment values. The secret is never committed or exposed through a `NEXT_PUBLIC_` variable.

A standalone HTML export is intentionally not used: it would remove the protected server-side model adapter, server rate limits, secret storage, API status route, and reliable Next.js PWA behavior. Deployment preserves the complete product.
## Browser speech

Choose **Play response** after a routine result. On mobile, Automatic playback prefers the bundled fixed MP3 for the four approved speech-enabled cases; on desktop it prefers an installed English system voice. If device speech does not start within two seconds, the app stops it and attempts the fixed MP3. Original or Live AI text can still use an installed English voice and always keeps a visible transcript. No runtime speech API, audio upload, or voice cloning is used. The MP3 files were generated from Microsoft Zira on the development machine; `@breezystack/lamejs` is a development-only encoder and is not shipped to the browser.

## Validation

    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm build
    pnpm audit --prod

## Repository map

- `app`: PWA routes, styles, manifest, and server APIs
- `src/components`: welcome, navigation, onboarding, workspace, results, history, knowledge, and settings
- `src/data/synthetic`: five fictional profiles, scenes, and fixed results
- `src/data/knowledge`: paraphrased cards and source metadata
- `src/lib`: schemas, IndexedDB, template personalization, PII redaction, retrieval, safety, limits, and provider adapters
- `tests`: data, API, privacy, personalization, safety, retrieval, rate-limit, and adapter tests
- `docs`: architecture, safety, video script, Devpost draft, and mobile notes

## Publication status

The public release candidate is deployed at https://what-mom-meant-to-say.vercel.app/ and connected to the public GitHub `main` branch. The source Word references, `.env.local`, and `docs/reference-summary.md` are intentionally excluded from the public repository.



