# Local software impact

## What was added

Project dependencies are installed only inside this repository through pnpm. They include the Next.js application runtime, React, Zod, Tailwind CSS tooling, TypeScript, ESLint, and Vitest. The dependency folders currently represent about 1.7 GB of logical file content across `node_modules` and the project-local pnpm store; pnpm linking means physical disk use may be lower.

## What was not changed

- No Windows system setting, registry key, startup item, driver, browser extension, scheduled task, or background service was added.
- No global npm or pnpm package was installed.
- The app does not request microphone, camera, location, contacts, or notification permission.
- Browser speech uses the operating system's already-installed voice through `speechSynthesis`; it adds no software or voice model.
- Git is initialized only in the project directory.

## Network and data behavior

Package downloads and a read-only package vulnerability audit contact the official npm registry during development. Stable Demo makes no model request and saves no form data. Live AI sends form content only when a deployment operator configures the server and the user explicitly selects Live AI-ready. The credential stays server-side.

## Security status

The runtime was upgraded to Next.js 16.2.11. Patched Sharp and PostCSS versions are enforced through pnpm workspace overrides. The final production dependency audit reported no known vulnerabilities. Lint, typecheck, tests, and production build are release gates.

## Removal and recovery

Deleting `node_modules` and `.pnpm-store` removes the local dependency installation without affecting Windows; they can be recreated from `pnpm-lock.yaml`. Deleting `.next` removes build output. These folders are ignored by Git. Do not delete them while the local server is running.
