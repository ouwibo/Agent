/**
 * Farcaster Crypto Frame
 * Display prices and enable on-chain trading
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agent.ouwibo.workers.dev';

export async function createCryptoFrameHtml(baseUrl: string): Promise<string> {
  // Fetch live prices
  let prices = { ethereum: { usd: 0 }, bitcoin: { usd: 0 } };
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,usd-coin&vs_currencies=usd&include_24hr_change=true'
    );
    prices = await response.json();
  } catch (e) {
    console.error('Failed to fetch prices');
  }

  const ethPrice = prices.ethereum?.usd?.toLocaleString() || 'N/A';
  const btcPrice = prices.bitcoin?.usd?.toLocaleString() || 'N/A';

  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${baseUrl}/api/frame/crypto-image">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="ETH: $${ethPrice}">
  <meta property="fc:frame:button:1:action" content="post">
  <meta property="fc:frame:button:1:target" content="${baseUrl}/api/farcaster/frames/crypto/eth">
  <meta property="fc:frame:button:2" content="BTC: $${btcPrice}">
  <meta property="fc:frame:button:2:action" content="post">
  <meta property="fc:frame:button:2:target" content="${baseUrl}/api/farcaster/frames/crypto/btc">
  <meta property="fc:frame:button:3" content="Swap Tokens 🔄">
  <meta property="fc:frame:button:3:action" content="link">
  <meta property="fc:frame:button:3:target" content="${baseUrl}/#/swap">
</head>
<body>
  <h1>Crypto Prices</h1>
</body>
</html>`;
}

export function createSwapFrameHtml(baseUrl: string, token: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${baseUrl}/api/frame/image?text=Swap%20${token}%20Tokens">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="Swap to USDC">
  <meta property="fc:frame:button:1:action" content="link">
  <meta property="fc:frame:button:1:target" content="${baseUrl}/#/swap?from=${token}&to=USDC">
  <meta property="fc:frame:button:2" content="View Chart 📊">
  <meta property="fc:frame:button:2:action" content="link">
  <meta property="fc:frame:button:2:target" content="https://www.coingecko.com/en/coins/${token.toLowerCase()}">
  <meta property="fc:frame:button:3" content="Back to Menu">
  <meta property="fc:frame:button:3:action" content="post">
  <meta property="fc:frame:button:3:target" content="${baseUrl}/api/farcaster/frames/crypto">
</head>
<body>
  <h1>Swap ${token}</h1>
</body>
</html>`;
}

export const cryptoFrameMeta = {
  name: 'Ouwibo Crypto',
  icon: '💰',
  description: 'Check crypto prices and swap tokens',
  homeframe: '/api/farcaster/frames/crypto',
};
