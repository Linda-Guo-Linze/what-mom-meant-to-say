# Product specification

Status: Local PWA release candidate  
Date: 2026-08-23

## Promise

What Mom Meant to Say helps a caregiver pause after a hurtful or confusing dementia-care moment. It offers one possible meaning, a humane first-person response, words and actions to try, caregiver support, and source-checked context. It never claims to reveal the person's real thoughts.

## Core flow

1. Enter through the welcome screen and optional four-step tour.
2. Create a three-step device-local loved-one profile or use five fictional cases.
3. Describe words, setting, behavior, caregiver feeling, scene tags, language habits, and shared memory.
4. Run deterministic safety routing before interpretation.
5. Use Stable Demo by default or one protected Live AI model call.
6. Review uncertainty, possible meaning, response, actions, caregiver care, evidence, and an editable help message.
7. Play the verified routine response with an installed English system voice.
8. Reopen or delete device-local history and profiles.

## Modes

Stable Demo returns approved fixed cases and uses a deterministic personalized template for original routine text. Live AI uses an OpenAI-compatible server adapter, PII minimization, local knowledge retrieval, Zod validation, output safety checks, and automatic Stable Demo fallback.

## Acceptance criteria

- English-only competition interface
- 360 px, tablet, and desktop layouts
- Multiple IndexedDB profiles, local photos, history, and complete deletion
- No login, cloud sync, microphone, ASR, voice clone, or medication advice
- Three browser Live requests/day, ten/IP/hour, 100/site/day
- Elevated risk bypasses ordinary interpretation and speech
- Lint, typecheck, tests, build, and dependency audit pass
