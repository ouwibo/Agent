/**
 * Farcaster NFT Frame
 * Mint AI-generated NFTs directly in Farcaster
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agent.ouwibo.workers.dev';

export function createNFTFrameHtml(baseUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${baseUrl}/api/frame/nft-image">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="Mint NFT 🎨 (0.01 ETH)">
  <meta property="fc:frame:button:1:action" content="tx">
  <meta property="fc:frame:button:1:target" content="${baseUrl}/api/farcaster/frames/nft/mint-tx">
  <meta property="fc:frame:button:2" content="View Collection">
  <meta property="fc:frame:button:2:action" content="link">
  <meta property="fc:frame:button:2:target" content="${baseUrl}/#/nft">
  <meta property="fc:frame:button:3" content="Generate AI Art ✨">
  <meta property="fc:frame:button:3:action" content="post">
  <meta property="fc:frame:button:3:target" content="${baseUrl}/api/farcaster/frames/nft/generate">
  <meta property="fc:frame:input:text" content="Describe your NFT...">
</head>
<body>
  <h1>Ouwibo NFT</h1>
</body>
</html>`;
}

export function createMintTxFrameHtml(baseUrl: string, nftData: {
  price: string;
  contract: string;
  tokenId: number;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${baseUrl}/api/frame/nft-image">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="Confirm Mint ✅">
  <meta property="fc:frame:button:1:action" content="tx">
  <meta property="fc:frame:button:1:target" content="${baseUrl}/api/farcaster/frames/nft/mint-confirm">
  <meta property="fc:frame:button:2" content="Cancel">
  <meta property="fc:frame:button:2:action" content="post">
  <meta property="fc:frame:button:2:target" content="${baseUrl}/api/farcaster/frames/nft">
  <meta property="fc:frame:tx:to" content="${nftData.contract}">
  <meta property="fc:frame:tx:value" content="${nftData.price}">
  <meta property="fc:frame:tx:data" content="0x">
</head>
<body>
  <h1>Confirm NFT Mint</h1>
</body>
</html>`;
}

export function createSuccessFrameHtml(baseUrl: string, txHash: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${baseUrl}/api/frame/image?text=NFT%20Minted%20Successfully!">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="View on Etherscan 🔗">
  <meta property="fc:frame:button:1:action" content="link">
  <meta property="fc:frame:button:1:target" content="https://etherscan.io/tx/${txHash}">
  <meta property="fc:frame:button:2" content="Mint Another">
  <meta property="fc:frame:button:2:action" content="post">
  <meta property="fc:frame:button:2:target" content="${baseUrl}/api/farcaster/frames/nft">
  <meta property="fc:frame:button:3" content="Share 🎉">
  <meta property="fc:frame:button:3:action" content="link">
  <meta property="fc:frame:button:3:target" content="https://warpcast.com/~/compose?text=Just%20minted%20an%20NFT%20with%20Ouwibo%20Agent!">
</head>
<body>
  <h1>NFT Minted!</h1>
</body>
</html>`;
}

export const nftFrameMeta = {
  name: 'Ouwibo NFT',
  icon: '🎨',
  description: 'Mint AI-generated NFTs in Farcaster',
  homeframe: '/api/farcaster/frames/nft',
  contractAddress: '0x...', // Will be set after deployment
  price: '0.01 ETH',
  maxSupply: 10000,
};
