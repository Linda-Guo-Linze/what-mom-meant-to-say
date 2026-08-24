# Architecture

## Shape

Next.js App Router, React, TypeScript, Tailwind CSS, and Zod form a minimal full stack. The browser contains the PWA UI and device-local IndexedDB. The server contains input validation, risk routing, PII minimization, retrieval, rate limiting, provider selection, and output validation.

## Request flow

```text
Structured form
  → Zod validation
  → deterministic risk route
  → Stable Demo template/fixed case
       or
    PII minimization → local knowledge retrieval → one OpenAI-compatible call
  → output schema and safety validation
  → automatic Stable Demo fallback on failure
  → optional browser speech for routine verified text
```

## Local data

IndexedDB stores profiles, optional compressed-size-limited photo data, voice preferences, and scene history. No local record is included in Git. Photos never enter the API request. Users can delete individual history entries, profiles and associated history, or all local records.

## Live adapter

Default configuration: Groq OpenAI-compatible base URL and `openai/gpt-oss-120b`. Credentials remain server-only. Limits are 30/browser/UTC day, ten/IP/hour, and 100/server-instance/day. In-memory server counters are suitable for the competition candidate; a scaled multi-instance production deployment should use a shared rate-limit store.

## PWA

The manifest, standalone metadata, production service worker, responsive sidebar/bottom navigation, and previously loaded shell fallback support installation on modern browsers. Runtime API requests are never cached by the service worker.
