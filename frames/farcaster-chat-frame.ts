/**
 * Farcaster Chat Frame
 * Interactive AI chat within Warpcast feed
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agent.ouwibo.workers.dev';

export function createChatFrameHtml(baseUrl: string, config: {
  message?: string;
  response?: string;
}): string {
  const imageUrl = `${baseUrl}/api/frame/image?text=${encodeURIComponent(config.response || 'Hello!')}`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="Reply">
  <meta property="fc:frame:input:text" content="Type your message...">
  <meta property="fc:frame:button:2" content="Open Full App">
  <meta property="fc:frame:button:2:action" content="link">
  <meta property="fc:frame:button:2:target" content="${baseUrl}">
</head>
<body>
  <h1>Ouwibo AI Chat</h1>
</body>
</html>`;
}

export function createWelcomeFrameHtml(baseUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${baseUrl}/api/frame/image?text=Welcome%20to%20Ouwibo%20Agent!">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="Start Chat 💬">
  <meta property="fc:frame:button:1:action" content="post">
  <meta property="fc:frame:button:1:target" content="${baseUrl}/api/farcaster/frames/chat">
  <meta property="fc:frame:button:2" content="Crypto Prices 📊">
  <meta property="fc:frame:button:2:action" content="post">
  <meta property="fc:frame:button:2:target" content="${baseUrl}/api/farcaster/frames/crypto">
  <meta property="fc:frame:button:3" content="Mint NFT 🎨">
  <meta property="fc:frame:button:3:action" content="post">
  <meta property="fc:frame:button:3:target" content="${baseUrl}/api/farcaster/frames/nft">
</head>
<body>
  <h1>Ouwibo Agent Menu</h1>
</body>
</html>`;
}

// Frame metadata for Warpcast
export const chatFrameMeta = {
  name: 'Ouwibo AI Chat',
  icon: '🤖',
  description: 'Chat with AI directly in Farcaster',
  homeframe: '/api/farcaster/frames/chat',
};
