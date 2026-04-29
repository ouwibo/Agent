# Deployment Guide - Ouwibo Agent

## Overview

This guide covers deploying Ouwibo Agent to:
- Cloudflare Workers (API)
- Vercel/Netlify (Frontend)
- Ethereum/Polygon/Base (Smart Contracts)

---

## Prerequisites

### Required Accounts
- [Cloudflare](https://dash.cloudflare.com) - Workers
- [Alchemy](https://alchemy.com) - RPC provider (optional)
- [CoinGecko](https://coingecko.com) - Price data (free tier)
- [Neynar](https://neynar.com) - Farcaster API (for Frames)
- [Privy](https://privy.io) - Social login (optional)

### Required Tools
- Node.js 18+
- Bun or npm
- Wrangler CLI
- Git

---

## Cloudflare Workers Setup

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Login

```bash
wrangler login
```

This opens a browser for OAuth login.

### 3. Create Worker

```bash
cd backend
wrangler init
```

### 4. Configure wrangler.toml

```toml
name = "agent"
main = "src/index.ts"
compatibility_date = "2024-01-01"
account_id = "YOUR_ACCOUNT_ID"

[vars]
DEFAULT_MODEL = "qwen3.5-plus"
FRAME_BASE_URL = "https://agent.ouwibo.workers.dev"

[observability]
enabled = true
```

### 5. Set Secrets

```bash
# DashScope API Key
echo "sk-xxxx" | wrangler secret put DASHSCOPE_API_KEY

# Neynar API Key (for Frames)
echo "xxxx" | wrangler secret put NEYNAR_API_KEY

# Alchemy API Key (optional)
echo "xxxx" | wrangler secret put ALCHEMY_API_KEY
```

### 6. Deploy

```bash
cd backend
npm run deploy
```

Output:
```
✨ Successfully published!
   https://agent.ouwibo.workers.dev
```

---

## Frontend Deployment

### Vercel (Recommended)

1. **Connect GitHub**
   - Go to https://vercel.com/new
   - Import `ouwibo/Agent` repo
   - Set root directory to `frontend`

2. **Configure Environment**
   ```
   NEXT_PUBLIC_API_URL=https://agent.ouwibo.workers.dev
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=xxx
   ```

3. **Deploy**
   - Click Deploy
   - Get URL: `https://ouwibo-agent.vercel.app`

### Netlify

```bash
cd frontend
npm run build
netlify deploy --prod --dir=out
```

### Cloudflare Pages

```bash
cd frontend
npm run build
wrangler pages deploy out
```

---

## Smart Contract Deployment

### Prerequisites
- Hardhat or Foundry
- Testnet ETH (get from faucet)
- Deployer wallet with private key

### Setup

```bash
cd contracts
npm install

# Create .env
echo "PRIVATE_KEY=your_key" > .env
echo "ALCHEMY_API_KEY=xxx" >> .env
echo "ETHERSCAN_API_KEY=xxx" >> .env
```

### Configure hardhat.config.ts

```typescript
export default {
  solidity: "0.8.20",
  networks: {
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY!]
    },
    'base-sepolia': {
      url: 'https://sepolia.base.org',
      accounts: [process.env.PRIVATE_KEY!]
    }
  }
};
```

### Deploy to Testnet

```bash
npx hardhat run scripts/deploy.ts --network base-sepolia
```

Output:
```
OuwiboAgent deployed to: 0x123...
OuwiboToken deployed to: 0x456...
OuwiboNFT deployed to: 0x789...
```

### Verify Contracts

```bash
npx hardhat verify --network base-sepolia 0x123... "constructor" "args"
```

### Deploy to Mainnet

```bash
# Double-check everything!
npx hardhat run scripts/deploy.ts --network base
```

---

## Environment Variables

### Backend (.dev.vars)

```env
# Required
DASHSCOPE_API_KEY=sk-xxx

# Optional - Web3
ALCHEMY_API_KEY=xxx
MORALIS_API_KEY=xxx

# Optional - Farcaster
NEYNAR_API_KEY=xxx

# Optional - Auth
PRIVY_APP_ID=xxx
PRIVY_API_SECRET=xxx
JWT_SECRET=xxx
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://agent.ouwibo.workers.dev
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=xxx
NEXT_PUBLIC_NFT_CONTRACT=0x...
NEXT_PUBLIC_TOKEN_CONTRACT=0x...
```

---

## CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd backend && npm install
      - run: cd backend && npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Monitoring

### Cloudflare Analytics

- Built into Workers
- View in dashboard
- Set up alerts

### Sentry

```typescript
import * as Sentry from '@sentry/cloudflare';

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  tracesSampleRate: 0.1,
});
```

### Custom Analytics

```typescript
// Track events
await fetch('/api/analytics', {
  method: 'POST',
  body: JSON.stringify({
    event: 'chat_message',
    model: 'qwen3.5-plus',
    userId: 'xxx'
  })
});
```

---

## Scaling

### Workers Limits

| Plan | Requests/day | CPU time |
|------|--------------|----------|
| Free | 100,000 | 10ms |
| Paid | Unlimited | 30s |

### Optimization

1. **Cache responses** - Use Workers KV
2. **Stream large responses** - Use streaming
3. **Offload to D1** - Use SQLite for persistence
4. **Use Durable Objects** - For stateful sessions

---

## Troubleshooting

### Common Issues

**"API key invalid"**
- Check DASHSCOPE_API_KEY is set correctly
- Verify key format starts with `sk-`

**"Rate limited"**
- Wait and retry
- Implement exponential backoff

**"CORS error"**
- Verify CORS headers in response
- Check origin allowed

**"Frame not working"**
- Validate HTML format
- Check image URL accessible
- Verify Neynar API key

### Debug Mode

```bash
# Local development with logging
wrangler dev --log-level debug

# View logs
wrangler tail
```

---

## Security Checklist

- [ ] API keys stored as secrets (not in code)
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Wallet signature verification
- [ ] Contract audits completed
- [ ] Error messages don't leak info
- [ ] HTTPS enforced
- [ ] Dependencies updated
