# Ouwibo Agent v2.0 - Web3 AI Platform

<div align="center">

![Ouwibo Agent](https://img.shields.io/badge/Ouwibo-Agent-amber?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white&style=flat-square)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?logo=Cloudflare&logoColor=white&style=flat-square)

**Advanced Web3 AI Platform with Chat, Crypto Trading, NFT Minting, and Farcaster Frames**

[🚀 Live Demo](https://agent.ouwibo.workers.dev) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing)

</div>

---

## ✨ Features

### 🤖 AI Chat
- **Multi-model support**: Qwen, GPT-4o, Claude
- **Chain-of-thought reasoning**
- **Function calling** for on-chain operations
- **Session memory** across conversations

### 💰 Crypto Trading
- **Multi-chain support**: Ethereum, Polygon, Base, Arbitrum, Optimism, BSC
- **Wallet connection**: MetaMask, WalletConnect, Rainbow, Privy
- **DEX integration**: 1inch, Uniswap, 0x API
- **Real-time prices** via CoinGecko

### 🎨 NFT Minting
- **AI-generated NFTs** from chat conversations
- **Smart contract**: ERC-721 with royalties
- **Cross-chain minting** on supported networks
- **Gallery view** for your collection

### 📱 Farcaster Frames
- **Chat Frame**: AI chat in Warpcast feed
- **Crypto Frame**: Prices and swaps in feed
- **NFT Frame**: Mint directly from frames
- **Social sharing** integration

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                 PRESENTATION                     │
│  🌐 Web (Next.js)  📱 Mobile  🎭 Farcaster Frames │
└─────────────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────────────┐
│                   API LAYER                       │
│  ☁️ Cloudflare Workers (Hono framework)          │
│  ├─ /api/chat          ├─ /api/wallet/connect    │
│  ├─ /api/crypto/balance ├─ /api/farcaster/frames │
│  └─ /api/crypto/swap    └─ /api/nft/mint         │
└─────────────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────────────┐
│                BLOCKCHAIN LAYER                   │
│  ⛓️ Smart Contracts (Solidity)                   │
│  ├─ OuwiboAgent.sol  (Treasury)                  │
│  ├─ OuwiboToken.sol  (Governance)                │
│  ├─ OuwiboNFT.sol     (NFT Collection)           │
│  └─ OuwiboVault.sol   (Escrow)                   │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Cloudflare account
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ouwibo/Agent.git
cd Agent

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Set environment variables
cp backend/.dev.vars.example backend/.dev.vars
# Edit .dev.vars with your API keys
```

### Local Development

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8787

### Deploy to Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Set secrets
cd backend
echo "your-dashscope-api-key" | wrangler secret put DASHSCOPE_API_KEY

# Deploy
npm run deploy
```

---

## 📖 API Reference

### Base URL
```
https://agent.ouwibo.workers.dev
```

### Endpoints

#### `POST /api/chat`
Send a message to the AI agent.

```json
// Request
{
  "message": "What is the price of ETH?",
  "model": "qwen3.5-plus"  // optional
}

// Response
{
  "ok": true,
  "model": "qwen3.5-plus",
  "answer": "ETH is currently trading at $3,245..."
}
```

#### `GET /api/crypto/balance`
Get wallet balance for a specific chain.

```
GET /api/crypto/balance?address=0x...&chain=eth

// Response
{
  "ok": true,
  "address": "0x...",
  "balance": "1.234567",
  "chain": "eth",
  "symbol": "ETH"
}
```

#### `POST /api/crypto/swap`
Get a swap quote and transaction data.

```json
// Request
{
  "fromToken": "ETH",
  "toToken": "USDC",
  "amount": "1.0",
  "fromAddress": "0x...",
  "slippage": 0.5
}
```

#### `POST /api/farcaster/frames/chat`
Handle Farcaster chat frame interaction.

---

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DASHSCOPE_API_KEY` | Qwen API key | ✅ |
| `ALCHEMY_API_KEY` | Alchemy RPC | Optional |
| `MORALIS_API_KEY` | Moralis API | Optional |
| `NEYNAR_API_KEY` | Farcaster API | For Frames |
| `PRIVY_APP_ID` | Privy auth | Optional |
| `PRIVY_API_SECRET` | Privy secret | Optional |

### Supported Chains

| Chain | ID | Symbol |
|-------|-----|--------|
| Ethereum | 1 | ETH |
| Polygon | 137 | MATIC |
| Base | 8453 | ETH |
| Arbitrum | 42161 | ETH |
| Optimism | 10 | ETH |
| BSC | 56 | BNB |

---

## 📁 Project Structure

```
ouwibo/Agent/
├── backend/                # Cloudflare Workers API
│   ├── src/
│   │   ├── handlers/       # API handlers
│   │   │   ├── chat.ts
│   │   │   ├── crypto.ts
│   │   │   ├── frames.ts
│   │   │   └── wallet.ts
│   │   ├── services/       # Business logic
│   │   │   ├── ai-service.ts
│   │   │   ├── web3-service.ts
│   │   │   ├── farcaster-service.ts
│   │   │   └── swap-service.ts
│   │   ├── smart-contracts/  # Solidity contracts
│   │   └── index.ts        # Main entry point
│   └── wrangler.toml
│
├── frontend/              # Next.js web app
│   ├── components/        # React components
│   ├── pages/             # Page routes
│   └── lib/               # Utilities
│
├── frames/                # Farcaster frames
│   ├── farcaster-chat-frame.ts
│   ├── farcaster-crypto-frame.ts
│   └── farcaster-nft-frame.ts
│
├── contracts/             # Smart contract deployment
│   ├── solidity/          # Contract sources
│   ├── deployment/        # Deploy scripts
│   └── tests/             # Contract tests
│
└── docs/                  # Documentation
    ├── api-reference.md
    ├── web3-integration.md
    ├── farcaster-frames.md
    └── deployment-guide.md
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Contract tests
cd contracts && npx hardhat test
```

---

## 🔐 Security

- **Rate limiting** on all API endpoints
- **Input validation** for all user data
- **CORS configuration** for cross-origin requests
- **Wallet signature verification** for protected routes
- **Smart contract audits** with Slither

---

## 📈 Roadmap

### Phase 1: Core Web3 Backend ✅
- [x] Multi-chain support
- [x] Wallet integration
- [x] DEX aggregator
- [x] Farcaster Frame validation

### Phase 2: Farcaster Frames 🚧
- [ ] Chat Frame complete
- [ ] Crypto Frame complete
- [ ] NFT Frame complete
- [ ] Publish to Frames.xyz

### Phase 3: Mobile App 📱
- [ ] React Native setup
- [ ] Mobile wallet integration
- [ ] Push notifications
- [ ] App Store deployment

### Phase 4: Onchain AI Agent 🤖
- [ ] Deploy smart contracts
- [ ] Treasury management
- [ ] DAO governance
- [ ] Analytics dashboard

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ by [Ouwibo](https://github.com/ouwibo)**

[🌐 Website](https://agent.ouwibo.workers.dev) • [🐦 Twitter](https://twitter.com/ouwibo) • [💬 Discord](https://discord.gg/ouwibo)

</div>
