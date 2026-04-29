# Farcaster Frames - Ouwibo Agent

## Overview

Farcaster Frames are interactive mini-apps that run inside Warpcast. Ouwibo Agent provides 3 frames:

1. **Chat Frame** - AI chat in the feed
2. **Crypto Frame** - Prices and swaps
3. **NFT Frame** - Mint NFTs directly

---

## Frame Specifications

### Chat Frame

**Endpoint**: `POST /api/farcaster/frames/chat`

**Features**
- Send message to AI
- Receive response as image
- Reply in frame or open full app

**Frame HTML**
```html
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://agent.ouwibo.workers.dev/api/frame/image?text=Hello">
  <meta property="fc:frame:button:1" content="Reply">
  <meta property="fc:frame:input:text" content="Type your message...">
  <meta property="fc:frame:button:2" content="Open Full App">
  <meta property="fc:frame:button:2:action" content="link">
  <meta property="fc:frame:button:2:target" content="https://agent.ouwibo.workers.dev">
</head>
</html>
```

---

### Crypto Frame

**Endpoint**: `POST /api/farcaster/frames/crypto`

**Features**
- Live price buttons
- Quick swap links
- Chart redirects

**Frame HTML**
```html
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://agent.ouwibo.workers.dev/api/frame/crypto-image">
  <meta property="fc:frame:button:1" content="ETH: $3,245">
  <meta property="fc:frame:button:2" content="BTC: $67,000">
  <meta property="fc:frame:button:3" content="Swap Tokens 🔄">
  <meta property="fc:frame:button:3:action" content="link">
  <meta property="fc:frame:button:3:target" content="https://agent.ouwibo.workers.dev/#/swap">
</head>
</html>
```

---

### NFT Frame

**Endpoint**: `POST /api/farcaster/frames/nft`

**Features**
- Mint NFT with one click
- AI-generated art
- Transaction frame support

**Frame HTML**
```html
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://agent.ouwibo.workers.dev/api/frame/nft-image">
  <meta property="fc:frame:button:1" content="Mint NFT 🎨 (0.01 ETH)">
  <meta property="fc:frame:button:1:action" content="tx">
  <meta property="fc:frame:button:1:target" content="https://agent.ouwibo.workers.dev/api/farcaster/frames/nft/mint-tx">
  <meta property="fc:frame:button:2" content="View Collection">
  <meta property="fc:frame:button:2:action" content="link">
  <meta property="fc:frame:button:2:target" content="https://agent.ouwibo.workers.dev/#/nft">
  <meta property="fc:frame:input:text" content="Describe your NFT...">
</head>
</html>
```

---

## Frame Validation

### Using Neynar API

```typescript
const response = await fetch('https://api.neynar.com/v2/farcaster/frame/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': NEYNAR_API_KEY,
  },
  body: JSON.stringify({ frameData: trustedData }),
});

const { valid, user } = await response.json();
```

### Validation Response

```json
{
  "valid": true,
  "action": {
    "interacted": {
      "user": {
        "fid": 12345,
        "username": "ouwibo",
        "display_name": "Ouwibo",
        "pfp_url": "https://...",
        "follower_count": 1000,
        "following_count": 500
      }
    }
  }
}
```

---

## Transaction Frames

### Building a Mint Transaction

```typescript
// 1. Frame requests mint transaction
const frame = {
  "fc:frame:tx:to": NFT_CONTRACT_ADDRESS,
  "fc:frame:tx:value": "10000000000000000", // 0.01 ETH in wei
  "fc:frame:tx:data": "0x..." // Encoded mint function call
};

// 2. User signs transaction in Warpcast
// 3. Transaction submitted to network
// 4. Return success frame with tx hash
```

### Success Frame

```html
<meta property="fc:frame:image" content="https://.../api/frame/image?text=NFT%20Minted!">
<meta property="fc:frame:button:1" content="View on Etherscan 🔗">
<meta property="fc:frame:button:1:action" content="link">
<meta property="fc:frame:button:1:target" content="https://etherscan.io/tx/${txHash}">
```

---

## Frame Analytics

### Track Frame Interactions

```typescript
// Log frame interaction
await fetch('/api/analytics/frame', {
  method: 'POST',
  body: JSON.stringify({
    frameId: 'chat',
    fid: user.fid,
    action: 'button_click',
    timestamp: Date.now()
  })
});
```

### Metrics

- Total interactions
- Unique FIDs
- Button click distribution
- Conversion rate to full app

---

## Publishing Frames

### Frame Manifest

```json
{
  "name": "Ouwibo AI Agent",
  "icon": "🤖",
  "description": "Chat with AI, trade crypto, mint NFTs",
  "homeframe": "https://agent.ouwibo.workers.dev/api/farcaster/frames/chat",
  "buttons": [
    { "label": "Chat", "icon": "💬" },
    { "label": "Crypto", "icon": "💰" },
    { "label": "NFT", "icon": "🎨" }
  ]
}
```

### Submit to Frames.xyz

1. Go to https://frames.xyz
2. Connect Farcaster account
3. Submit frame manifest
4. Wait for approval

---

## Testing Frames

### Local Testing

```bash
# Use Frame debugger
npx frame-debugger https://localhost:8787/api/farcaster/frames/chat
```

### Warpcast Dev Hub

1. Open Warpcast
2. Go to Settings > Developer
3. Add frame URL
4. Test interactions

---

## Best Practices

1. **Optimize images** - Use SVG for dynamic content
2. **Fast response** - Keep under 3 seconds
3. **Error handling** - Show friendly error frames
4. **Rate limit** - Prevent spam
5. **Cache prices** - Don't hit API on every request

---

## Frame Limits

| Limit | Value |
|-------|-------|
| Max buttons | 4 |
| Image size | 500KB |
| Image ratio | 1.91:1 or 1:1 |
| Input text | 256 chars |
| Response time | 3 seconds |
