import type { Context } from 'hono';

type Env = {
  NEYNAR_API_KEY?: string;
  FRAME_BASE_URL?: string;
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Farcaster Frame validation
export async function validateFrameData(c: Context<{ Bindings: Env }>, frameData: string): Promise<{ valid: boolean; fid?: number; username?: string }> {
  try {
    if (!c.env.NEYNAR_API_KEY) {
      return { valid: false };
    }
    
    const response = await fetch('https://api.neynar.com/v2/farcaster/frame/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': c.env.NEYNAR_API_KEY,
      },
      body: JSON.stringify({ frameData }),
    });
    
    const data = await response.json() as { valid?: boolean; user?: { fid: number; username: string } };
    return { valid: data.valid || false, fid: data.user?.fid, username: data.user?.username };
  } catch {
    return { valid: false };
  }
}

export async function handleChatFrame(c: Context<{ Bindings: Env }>) {
  const body = await c.req.formData().catch(() => new FormData());
  const message = body.get('message') as string || 'Hello!';
  const frameData = body.get('trustedData') as string;
  
  const baseUrl = c.env.FRAME_BASE_URL || 'https://agent.ouwibo.workers.dev';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${baseUrl}/api/frame/image?text=${encodeURIComponent(message)}">
  <meta property="fc:frame:button:1" content="Reply">
  <meta property="fc:frame:input:text" content="Type your message...">
  <meta property="fc:frame:button:2" content="Open App">
  <meta property="fc:frame:button:2:action" content="link">
  <meta property="fc:frame:button:2:target" content="${baseUrl}">
</head>
<body>
  <h1>Ouwibo AI Chat Frame</h1>
</body>
</html>`;

  return c.html(html);
}

export async function handleCryptoFrame(c: Context<{ Bindings: Env }>) {
  const body = await c.req.formData().catch(() => new FormData());
  const action = body.get('action') as string || 'prices';
  const baseUrl = c.env.FRAME_BASE_URL || 'https://agent.ouwibo.workers.dev';
  
  // Fetch prices
  const prices = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,usd-coin&vs_currencies=usd&include_24hr_change=true')
    .then(r => r.json())
    .catch(() => ({}));
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${baseUrl}/api/frame/crypto-image">
  <meta property="fc:frame:button:1" content="ETH: $${(prices as any).ethereum?.usd || 0}">
  <meta property="fc:frame:button:2" content="BTC: $${(prices as any).bitcoin?.usd || 0}">
  <meta property="fc:frame:button:3" content="Swap →">
  <meta property="fc:frame:button:3:action" content="post">
  <meta property="fc:frame:button:3:target" content="${baseUrl}/api/farcaster/frames/crypto/swap">
</head>
<body>
  <h1>Crypto Prices</h1>
</body>
</html>`;

  return c.html(html);
}

export async function handleNFTFrame(c: Context<{ Bindings: Env }>) {
  const body = await c.req.formData().catch(() => new FormData());
  const baseUrl = c.env.FRAME_BASE_URL || 'https://agent.ouwibo.workers.dev';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${baseUrl}/api/frame/nft-image">
  <meta property="fc:frame:button:1" content="Mint NFT 🎨">
  <meta property="fc:frame:button:1:action" content="post">
  <meta property="fc:frame:button:2" content="View Gallery">
  <meta property="fc:frame:button:2:action" content="link">
  <meta property="fc:frame:button:2:target" content="${baseUrl}/nft">
</head>
<body>
  <h1>Ouwibo NFT</h1>
</body>
</html>`;

  return c.html(html);
}

export function frameOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
