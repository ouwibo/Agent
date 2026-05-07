# OUWIBO Agent

Autonomous AI agent website with web search, code writing, URL browsing, and task planning. Built with React + Vite (frontend) and Node.js Express (backend).

## Stack

| Layer    | Tech                              | Port |
|----------|-----------------------------------|------|
| Frontend | React 19 · Vite · TypeScript · Tailwind | 5000 |
| Backend  | Node.js · Express · SSE streaming  | 3001 |
| AI       | OpenAI / Groq / Gemini (tool calling) | — |

## Pages

- `/` — Landing page
- `/dashboard` — System dashboard with stats & agent monitor
- `/agent` — Main AI agent chat interface

## Agent Tools

| Tool | Description |
|------|-------------|
| `search_web` | Search the internet in real-time |
| `write_code` | Write/debug code in any language |
| `browse_url` | Visit a URL and extract content |
| `create_plan` | Break down goals into actionable steps |

## AI Providers

| Provider | Free? | Key Variable | Get Key |
|----------|-------|--------------|---------|
| OpenAI GPT-4o-mini | No | `OPENAI_API_KEY` | platform.openai.com |
| Groq Llama 3 70B | **Yes** | `GROQ_API_KEY` | console.groq.com |
| Google Gemini Flash | **Yes** | `GEMINI_API_KEY` | aistudio.google.com |

## Development

```bash
# Frontend (port 5000)
cd frontend && npm run dev

# Backend (port 3001)
cd server && node index.js
```

## Production Setup

Set at least one API key as a Replit Secret so users don't need their own:

```
GROQ_API_KEY=gsk_...        # Recommended (free tier available)
OPENAI_API_KEY=sk-...       # Or OpenAI
GEMINI_API_KEY=AIza...      # Or Gemini
```

## Structure

```
ouwibo-agent/
├── frontend/          React + Vite app
│   ├── src/
│   │   ├── pages/     home · dashboard · agent · not-found
│   │   ├── components/
│   │   │   ├── matrix-background.tsx
│   │   │   └── ui/card.tsx
│   │   └── main.tsx
│   └── vite.config.ts
├── server/            Express backend
│   ├── index.js       Agent API with SSE streaming
│   └── .env.example   Environment variable template
└── replit.md
```

## User Preferences

- TypeScript throughout the frontend
- Dark cyberpunk aesthetic with green (#00ff41) accent
- Follow existing project structure
