<div align="center">
  <img src="frontend/public/favicon.svg" alt="Ouwibo Agent Logo" width="80" height="80">
  
  <h1>Ouwibo Agent</h1>
  
  <p><strong>Your Intelligent, Extensible AI Assistant built for the Modern Web & Web3.</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#api-documentation">API</a> •
    <a href="#deployment">Deployment</a> •
    <a href="https://github.com/ouwibo/Agent">GitHub</a>
  </p>

  [![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-F38020?logo=Cloudflare&logoColor=white)](https://workers.cloudflare.com/)
</div>

---

## ✨ Features

### 🧠 Intelligent Conversational Agent
- **Powered by LLMs:** Dynamic step-by-step reasoning via Qwen/Groq/OpenAI
- **Session Memory:** Remembers conversations across reloads
- **Multilingual UI:** Natively supports multiple languages

### 🛠️ Built-in Tools & Web3 Capabilities
- **Wallet Scan:** Check multi-chain balances and resolve `.eth` names
- **Crypto Market Data:** Live token prices, tops, and trends
- **Global Search & Web Reading:** DuckDuckGo/Google integration
- **Utility Tools:** Currency conversion, date/time, weather, translation

### 🔌 Extensible Skills Architecture
Drop a new `SKILL.md` into the skills folder, and the agent instantly learns new capabilities.

### 🌐 Enterprise Ready
- Rate limiting & API key management
- Proper error handling & CORS configuration
- Edge deployment on Cloudflare Workers

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Cloudflare account (for deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/ouwibo/Agent.git
cd Agent

# Install dependencies
npm install

# Start backend (Cloudflare Worker)
cd backend
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8787

---

## 📁 Project Structure

```
ouwibo/Agent/
├── backend/              # Cloudflare Workers API
│   ├── src/
│   │   ├── index.ts     # Main worker entry
│   │   └── models.ts    # Model configuration
│   └── wrangler.toml    # Cloudflare config
│
├── frontend/            # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/       # Landing, Dashboard, Docs
│   │   ├── components/  # Reusable UI components
│   │   └── styles.css   # TailwindCSS styles
│   └── vite.config.ts
│
├── docs/                # API documentation
└── examples/            # Starter templates
```

---

## 📖 API Documentation

### Base URL
```
https://ouwibo-agent.your-subdomain.workers.dev
```

### Endpoints

#### `GET /api/health`
Check API health and configuration status.

**Response:**
```json
{
  "ok": true,
  "configured": true,
  "ready": true,
  "channel": "managed",
  "model": "qwen3.5-plus"
}
```

#### `POST /api/chat`
Send a message to the AI agent.

**Request:**
```json
{
  "message": "What is the price of ETH?",
  "conversationId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "reply": "ETH is currently trading at $3,245...",
  "conversationId": "conv_abc123",
  "configured": true,
  "channel": "managed"
}
```

#### `GET /api/crypto-snapshot`
Get cryptocurrency market snapshot.

**Response:**
```json
{
  "bitcoin": { "price": 67000, "change_24h": 2.5 },
  "ethereum": { "price": 3245, "change_24h": 1.8 }
}
```

---

## 🚢 Deployment

### Cloudflare Workers (Backend)

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Set environment variables:
```bash
wrangler secret put DASHSCOPE_API_KEY
```

4. Deploy:
```bash
cd backend
npm run deploy
```

### Frontend (Vercel/Netlify)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `dist/` folder to Vercel/Netlify

3. Set environment variables:
- `VITE_API_URL` = Your Cloudflare Worker URL

---

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DASHSCOPE_API_KEY` | Qwen API key | Yes |
| `DASHSCOPE_BASE_URL` | API base URL | No (default provided) |
| `DEFAULT_MODEL` | Default model ID | No |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes (production) |

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/ouwibo">Ouwibo</a></p>
</div>
