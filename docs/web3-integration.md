# Web3 Integration - Ouwibo Agent

## Overview

Ouwibo Agent provides comprehensive Web3 integration for:
- Multi-chain wallet connections
- Token swaps via DEX aggregators
- NFT minting and management
- Smart contract interactions

---

## Supported Networks

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| Ethereum | 1 | eth.llamarpc.com | etherscan.io |
| Polygon | 137 | polygon-rpc.com | polygonscan.com |
| Base | 8453 | mainnet.base.org | basescan.org |
| Arbitrum | 42161 | arb1.arbitrum.io/rpc | arbiscan.io |
| Optimism | 10 | mainnet.optimism.io | optimisim.etherscan.io |
| BSC | 56 | bsctest-dataseed.bnbchain.org | bscscan.com |

---

## Wallet Integration

### Supported Wallets

**Desktop**
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow
- Trust Wallet

**Mobile**
- Rainbow
- Trust Wallet
- Coinbase Wallet
- Argent

**Social Login**
- Privy (Email, Google, Twitter, Discord)
- Magic Link

### Connection Flow

```typescript
// 1. Request connection
const accounts = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
});

// 2. Get chain
const chainId = await window.ethereum.request({ 
  method: 'eth_chainId' 
});

// 3. Sign message for verification
const message = `Sign this message to connect to Ouwibo Agent.\n\nNonce: ${nonce}`;
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [message, accounts[0]]
});

// 4. Send to API
const response = await fetch('/api/wallet/connect', {
  method: 'POST',
  body: JSON.stringify({ address, signature, message })
});
```

---

## Token Swaps

### Using the Swap API

```typescript
// 1. Get quote
const quote = await fetch('/api/crypto/swap', {
  method: 'POST',
  body: JSON.stringify({
    fromToken: 'ETH',
    toToken: 'USDC',
    amount: '1.0',
    fromAddress: '0x...',
    slippage: 0.5
  })
}).then(r => r.json());

// 2. Execute swap (via wallet)
const tx = await wallet.sendTransaction({
  to: quote.tx.to,
  data: quote.tx.data,
  value: quote.tx.value,
  gasLimit: quote.tx.gas
});

// 3. Wait for confirmation
const receipt = await tx.wait();
```

### Supported Tokens

**Native**
- ETH (all EVM chains)
- MATIC (Polygon)
- BNB (BSC)

**Stablecoins**
- USDC
- USDT
- DAI

**Major Tokens**
- WETH
- WBTC
- LINK
- UNI

---

## NFT Minting

### Minting Flow

```typescript
// 1. Generate NFT metadata via AI
const metadata = await fetch('/api/nft/generate', {
  method: 'POST',
  body: JSON.stringify({ prompt: 'A sunset over mountains' })
}).then(r => r.json());

// 2. Mint NFT
const tx = await contract.mint(address, metadata.uri, {
  value: ethers.parseEther('0.01')
});

// 3. Get token ID from event
const receipt = await tx.wait();
const tokenId = contract.interface.parseLog(receipt.logs[0]).args.tokenId;
```

### Contract Details

**OuwiboNFT.sol**
- Type: ERC-721
- Price: 0.01 ETH
- Max Supply: 10,000
- Royalties: 5%

---

## Smart Contracts

### OuwiboAgent.sol

Main treasury contract for AI operations.

**Features**
- Receive tips and payments
- Manage treasury funds
- Distribute rewards
- Withdraw ERC20/ERC721

**Functions**
```solidity
// Tip the AI
function chatAndTip(string message) external payable

// Deposit to treasury
function deposit() external payable

// Withdraw (owner only)
function withdraw(address to, uint256 amount) external onlyOwner
```

### OuwiboToken.sol

Governance token for DAO.

**Supply**
- Total: 1 billion
- Team: 10%
- Community: 40%
- Treasury: 30%
- Liquidity: 20%

**Features**
- Vesting schedules
- Governance voting
- Staking rewards

### OuwiboVault.sol

Escrow contract for secure transactions.

**Features**
- Create escrow
- Release funds
- Refund after deadline

---

## Events

### Contract Events

```solidity
// OuwiboAgent
event TipReceived(address from, uint256 amount, string message);
event TreasuryDeposit(address from, uint256 amount);
event RewardDistributed(address to, uint256 amount);

// OuwiboNFT
event NFTMinted(address to, uint256 tokenId, string uri);

// OuwiboVault
event EscrowCreated(uint256 id, address buyer, address seller, uint256 amount);
```

### Indexing with The Graph

```graphql
{
  tipReceiveds(first: 10) {
    id
    from
    amount
    message
    blockNumber
  }
  
  nftMinteds(first: 10) {
    id
    to
    tokenId
    uri
  }
}
```

---

## Security

### Best Practices

1. **Always verify signatures** on backend
2. **Use checksummed addresses**
3. **Validate chain IDs**
4. **Check token allowances**
5. **Set appropriate gas limits**

### Signature Verification

```typescript
import { verifyMessage } from 'ethers';

const recovered = verifyMessage(message, signature);
if (recovered.toLowerCase() !== address.toLowerCase()) {
  throw new Error('Invalid signature');
}
```

---

## Gas Optimization

### Tips for Low Gas

1. Use L2s (Base, Arbitrum, Optimism)
2. Batch transactions
3. Set optimal slippage
4. Use permit2 for approvals

### Gas Estimates

| Operation | ETH | L2 |
|-----------|-----|-----|
| Transfer | 21,000 | ~1,000 |
| Swap | 150,000 | ~10,000 |
| NFT Mint | 100,000 | ~5,000 |

---

## Testing

### Forked Mainnet

```bash
# Start forked mainnet
npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# Run tests
npx hardhat test --network localhost
```

### Testnet Deployment

```bash
# Deploy to Base Sepolia
npx hardhat run scripts/deploy.ts --network base-sepolia
```
