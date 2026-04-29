# API Reference - Ouwibo Agent v2.0

## Base URL

```
Production: https://agent.ouwibo.workers.dev
Development: http://localhost:8787
```

## Authentication

Most endpoints are public. Protected endpoints require wallet signature verification.

```
Authorization: Bearer <wallet-signature>
```

---

## Chat API

### POST /api/chat

Send a message to the AI agent.

**Request**
```json
{
  "message": "What is the price of ETH?",
  "model": "qwen3.5-plus"
}
```

**Parameters**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | ✅ | User message (max 10,000 chars) |
| model | string | ❌ | Model ID (default: qwen3.5-plus) |

**Response**
```json
{
  "ok": true,
  "model": "qwen3.5-plus",
  "answer": "ETH is currently trading at $3,245...",
  "timestamp": 1700000000000
}
```

**Available Models**
- `qwen3.5-turbo` - Fast responses
- `qwen3.5-plus` - Balanced (default)
- `qwen3.5-max` - Best quality

---

## Crypto API

### GET /api/crypto/balance

Get wallet balance for a specific chain.

**Parameters**
| Query | Type | Required | Description |
|-------|------|----------|-------------|
| address | string | ✅ | Ethereum address (0x...) |
| chain | string | ❌ | Chain ID (default: eth) |

**Supported Chains**: `eth`, `polygon`, `base`, `arbitrum`, `optimism`, `bsc`

**Response**
```json
{
  "ok": true,
  "address": "0x...",
  "chain": "eth",
  "chainId": "0x1",
  "balance": "1.234567",
  "symbol": "ETH"
}
```

### POST /api/crypto/swap

Get a swap quote and transaction data.

**Request**
```json
{
  "fromToken": "ETH",
  "toToken": "USDC",
  "amount": "1.0",
  "fromAddress": "0x...",
  "slippage": 0.5
}
```

**Response**
```json
{
  "ok": true,
  "quote": {
    "fromToken": "ETH",
    "toToken": "USDC",
    "fromAmount": "1.0",
    "toAmount": "3200.50",
    "estimatedGas": "150000",
    "route": "Uniswap V3",
    "priceImpact": 0.1
  }
}
```

### GET /api/crypto/prices

Get current token prices.

**Parameters**
| Query | Type | Required | Description |
|-------|------|----------|-------------|
| tokens | string | ❌ | Comma-separated CoinGecko IDs |

**Response**
```json
{
  "ok": true,
  "prices": {
    "ethereum": { "usd": 3245.00, "usd_24h_change": 2.5 },
    "bitcoin": { "usd": 67000.00, "usd_24h_change": 1.8 }
  },
  "timestamp": 1700000000000
}
```

### GET /api/crypto/chains

Get supported chains configuration.

**Response**
```json
{
  "ok": true,
  "chains": [
    { "id": "eth", "name": "Ethereum Mainnet", "symbol": "ETH", ... }
  ]
}
```

---

## Wallet API

### POST /api/wallet/connect

Connect and verify wallet.

**Request**
```json
{
  "address": "0x...",
  "signature": "0x...",
  "message": "Sign this message to connect...",
  "walletType": "metamask"
}
```

**Response**
```json
{
  "ok": true,
  "address": "0x...",
  "walletType": "metamask",
  "connected": true,
  "timestamp": 1700000000000
}
```

### GET /api/wallet/status

Check wallet connection status.

**Parameters**
| Query | Type | Required | Description |
|-------|------|----------|-------------|
| address | string | ✅ | Ethereum address |

### POST /api/wallet/disconnect

Disconnect wallet.

---

## Farcaster Frames API

### POST /api/farcaster/frames/chat

Handle chat frame interaction.

**Request**: FormData with `trustedData` and `message`

**Response**: HTML with Farcaster Frame metadata

### POST /api/farcaster/frames/crypto

Handle crypto frame interaction.

**Response**: HTML with price buttons

### POST /api/farcaster/frames/nft

Handle NFT minting frame.

**Response**: HTML with mint button

---

## Frame Image API

### GET /api/frame/image

Generate frame image.

**Parameters**
| Query | Type | Description |
|-------|------|-------------|
| text | string | Text to display |

**Response**: SVG image

### GET /api/frame/crypto-image

Generate crypto prices image.

**Response**: SVG with current prices

### GET /api/frame/nft-image

Generate NFT preview image.

**Response**: SVG with NFT art

---

## System API

### GET /health

Health check endpoint.

**Response**
```json
{
  "status": "ok",
  "agent": "Ouwibo Agent",
  "version": "2.0.0",
  "model": "qwen3.5-plus",
  "features": ["chat", "crypto", "wallet", "frames", "nft"]
}
```

### GET /api/models

Get available AI models.

**Response**
```json
{
  "models": [
    { "id": "qwen3.5-turbo", "name": "Qwen 3.5 Turbo", "description": "Fast responses" },
    { "id": "qwen3.5-plus", "name": "Qwen 3.5 Plus", "description": "Balanced performance" }
  ],
  "default": "qwen3.5-plus"
}
```

### GET /api/docs

Get API documentation.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": { ... }  // Optional additional info
}
```

**Common Error Codes**
| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid signature |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| /api/chat | 100 | 1 hour |
| /api/crypto/* | 1000 | 1 hour |
| /api/wallet/* | 50 | 1 hour |
| /api/farcaster/* | 500 | 1 hour |

---

## CORS

All endpoints support CORS with the following configuration:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Webhooks (Coming Soon)

Subscribe to events:

```json
{
  "event": "transaction.confirmed",
  "data": { ... }
}
```
