# Agent Memory

## Project identity
- Repo name: `agent`
- Product name shown to users: `Ouwibo Agent`
- Positioning: premium, professional AI assistant with clean branding and Cloudflare-ready deployment.

## Goals
- Keep the public brand polished and consistent.
- Support Qwen/DashScope via `DASHSCOPE_API_KEY` and an OpenAI-compatible base URL.
- Prefer simple, readable code over cleverness.
- Never hardcode secrets.

## Current direction
- Cloudflare Workers-first deployment.
- Manual model selection for chat routing.
- Keep the implementation independent from the older Ouwibo Agent repo.

## Working rules
- Preserve the `Ouwibo Agent` name in docs and UI.
- Keep the codebase professional and easy to extend.
- Favor small, explicit files for config, model routing, and API handlers.
