# AI Agent Website

## Project Overview

An autonomous AI agent website that can perform complex automated tasks — web search, code writing, URL browsing, and task planning — powered by OpenAI GPT-4o-mini with tool calling.

## Architecture

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS, running on port 5000
- **Backend**: Node.js + Express server, running on port 3001
- **AI**: OpenAI GPT-4o-mini with tool calling (streaming SSE)

## Pages

- `/` — Landing page showcasing agent capabilities
- `/agent` — Main AI agent chat interface with tool use visualization

## Agent Tools

- `search_web` — Searches the internet for real-time information
- `write_code` — Writes, debugs, and explains code in any language
- `browse_url` — Visits URLs and extracts relevant information
- `create_plan` — Breaks down complex goals into actionable steps

## Local Development

- Frontend: `cd frontend && npm run dev` (port 5000)
- Backend: `cd server && node index.js` (port 3001)

## User Preferences

- Use TypeScript throughout
- Follow existing project structure and conventions
- Dark cyberpunk aesthetic with green (#00ff41) accent color
- OpenAI API key stored in browser localStorage
