# Changelog

## 2026-04-29

### Replaced Claude (Anthropic) API with Gemini API

#### Motivation
Switched the meal photo scanning feature from Anthropic's Claude API to Google's Gemini API for cost/access reasons.

---

### `app/src/lib/vision.ts`
- Removed `import Anthropic from '@anthropic-ai/sdk'`
- Replaced Anthropic client instantiation and `client.messages.create(...)` call with a direct `fetch` call to the Gemini REST API endpoint:
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- Request body now uses Gemini's `contents[].parts[]` format with `inline_data` for the base64 image and `systemInstruction` for the system prompt
- Added response parsing for Gemini's `candidates[0].content.parts[0].text` path
- Added stripping of markdown code fences (` ```json ... ``` `) from the response, since Gemini sometimes wraps JSON output in them
- Throws a descriptive error on non-2xx HTTP responses

### `app/app/scan.tsx`
- Changed `Constants.expoConfig?.extra?.anthropicApiKey` → `Constants.expoConfig?.extra?.geminiApiKey`
- Updated API input label from `"Enter your Anthropic API key..."` → `"Enter your Gemini API key..."`
- Updated placeholder text from `"sk-ant-..."` → `"AIza..."`

### `app/app.json`
- Added `geminiApiKey` to the `extra` block so the key is baked in at build time and the manual key input UI is bypassed automatically

### `app/package.json`
- Removed `@anthropic-ai/sdk` dependency (no longer needed; Gemini is called via native `fetch`)

### `npm`
- Ran `npm uninstall @anthropic-ai/sdk` — removed 3 packages, no replacement package installed
