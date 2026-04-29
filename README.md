<div align="center">
  <img src="frontend/public/favicon.svg" alt="Ouwibo Agent" width="80" height="80">
  
  <h1>Ouwibo Agent</h1>
  
  <p><strong>Professional AI Agent with Premium Dark UI</strong></p>
  
  <p>
    <a href="https://ouwibo-agent.ouwibo.workers.dev">Live API</a> •
    <a href="https://github.com/ouwibo/Agent">GitHub</a> •
    <a href="#-api-documentation">API Docs</a>
  </p>

  [![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?logo=Cloudflare&logoColor=white)](https://pages.cloudflare.com/)
  [![Next.js](https://img.shields.io/badge/Next.js_15-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
</div>

---

## ✨ Features

### 🎨 Premium Dark UI
- **Next.js 15** + React 19 + TypeScript
- **Tailwind CSS** with custom dark theme
- **7 reusable components** - Chat, Message, Model Selector, etc.
- **Responsive** - Mobile-first design
- **Real-time chat** with 4 AI models

### 🧠 AI Models
| Model | Description |
|-------|-------------|
| `qwen3.6-flash` | Fast responses |
| `qwen3.5-plus` | Balanced (default) |
| `qwen3-max` | Advanced reasoning |
| `qwq-plus` | Deep thinking |

### 🚀 Edge Deployment
- **Backend**: Cloudflare Workers (serverless)
- **Frontend**: Cloudflare Pages (global CDN)
- **Zero cold starts**

---

## 📁 Project Structure

```
ouwibo/Agent/
├── backend/              # Cloudflare Workers API
│   ├── src/index.ts     # Main worker entry
│   ├── src/models.ts    # Model configuration
│   └── wrangler.toml    # Worker config
│
├── frontend/            # Next.js 15 App
│   ├── components/      # 7 UI components
│   ├── pages/           # Landing + Chat
│   ├── lib/             # API client + Store
│   ├── types/           # TypeScript types
│   └── styles/          # Tailwind CSS
│
├── docs/                # Documentation
└── examples/            # Example templates
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account

### 1. Clone & Install

```bash
git clone https://github.com/ouwibo/Agent.git
cd Agent

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Local Development

```bash
# Terminal 1: Backend
cd backend
npm run dev
# → http://localhost:8787

# Terminal 2: Frontend
cd frontend
npm run dev
# → http://localhost:3000
```

---

## 📖 API Documentation

### Base URL
```
https://ouwibo-agent.ouwibo.workers.dev
```

### Endpoints

#### `GET /api/health`
Health check

```json
{
  "ok": true,
  "ready": true,
  "model": "qwen3.5-plus"
}
```

#### `GET /api/models`
List available models

```json
{
  "models": [
    {"id": "qwen3.6-flash", "name": "Qwen 3.6 Flash"},
    {"id": "qwen3.5-plus", "name": "Qwen 3.5 Plus"},
    {"id": "qwen3-max", "name": "Qwen 3 Max"},
    {"id": "qwq-plus", "name": "QwQ Plus"}
  ],
  "default": "qwen3.5-plus"
}
```

#### `POST /api/chat`
Send message to AI

**Request:**
```json
{
  "message": "Hello!",
  "model": "qwen3.5-plus"
}
```

**Response:**
```json
{
  "ok": true,
  "answer": "Hi! How can I help?",
  "model": "qwen3.5-plus",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

---

## 🚢 Deployment

### Backend (Cloudflare Workers)

```bash
cd backend

# Login
wrangler login

# Set API key
echo "your-dashscope-key" | wrangler secret put DASHSCOPE_API_KEY

# Deploy
npm run deploy
```

### Frontend (Cloudflare Pages)

```bash
cd frontend

# Build
npm run build

# Deploy
npx wrangler pages deploy ./out
```

Or connect GitHub repo to Cloudflare Pages dashboard for auto-deploy.

---

## 🔧 Configuration

### Backend (.dev.vars)
```
DASHSCOPE_API_KEY=sk-your-key
DEFAULT_MODEL=qwen3.5-plus
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://ouwibo-agent.ouwibo.workers.dev
```

---

## 🧪 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| HTTP | Axios |
| Backend | Hono, Cloudflare Workers |
| AI | Qwen (DashScope API) |
| Linting | ESLint, Prettier |

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/ouwibo">Ouwibo</a></p>
</div>
