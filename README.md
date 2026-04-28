# Agent

**Ouwibo Agent** is the public-facing name of this project.
The repository name is `agent`, but the product identity stays **Ouwibo Agent** for a clean, professional brand.

## What this repo is
A Cloudflare-ready AI agent starter with:
- a polished landing page
- a `/health` endpoint
- a `/api/chat` endpoint
- manual model selection
- Qwen / DashScope compatibility

## Model routing
- `qwen3.6-flash` — fast chat
- `qwen3.5-plus` — balanced default
- `qwen3-max` — heavier reasoning and analysis
- `qwq-plus` — experimental reasoning

## Environment variables
- `DASHSCOPE_API_KEY` — required
- `DASHSCOPE_BASE_URL` — optional, defaults to the DashScope Intl compatible-mode endpoint
- `DEFAULT_MODEL` — optional, overrides the default model

## Local workflow
```bash
npm install
npm run dev
```

## API
### `GET /health`
Returns service status.

### `POST /api/chat`
Body:
```json
{
  "message": "Halo",
  "model": "qwen3.5-plus"
}
```

Response includes the selected model, the answer, and usage metadata.

## Deployment target
This repo is designed to deploy cleanly on Cloudflare Workers later.