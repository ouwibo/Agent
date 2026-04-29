// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title OuwiboAgent
 * @dev Autonomous AI Agent Treasury Contract
 * @notice Manages AI funds, tips, treasury, and can interact with other protocols
 */
contract OuwiboAgent is Ownable, ReentrancyGuard, IERC721Receiver {
    
    // Events
    event TipReceived(address indexed from, uint256 amount, string message);
    event TreasuryDeposit(address indexed from, uint256 amount);
    event TreasuryWithdrawal(address indexed to, uint256 amount);
    event RewardDistributed(address indexed to, uint256 amount);
    event ChatAndTip(address indexed from, string message, uint256 tip);
    
    // State
    mapping(address => uint256) public balances;
    uint256 public totalTreasury;
    uint256 public totalTipsReceived;
    
    // Fee configuration
    uint256 public tipFeePercent = 5; // 5% fee on tips
    address public feeRecipient;
    
    // Stats
    uint256 public totalUsers;
    mapping(address => bool) public hasInteracted;
    
    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @notice Send a message + tip to the AI
     * @param message The message for the AI
     */
    function chatAndTip(string calldata message) external payable nonReentrant {
        require(msg.value > 0, "No tip provided");
        
        uint256 fee = (msg.value * tipFeePercent) / 100;
        uint256 tipAmount = msg.value - fee;
        
        // Add to treasury
        totalTreasury += tipAmount;
        totalTipsReceived += msg.value;
        
        // Track user
        if (!hasInteracted[msg.sender]) {
            hasInteracted[msg.sender] = true;
            totalUsers++;
        }
        
        // Emit events
        emit TipReceived(msg.sender, msg.value, message);
        emit ChatAndTip(msg.sender, message, tipAmount);
        emit TreasuryDeposit(msg.sender, tipAmount);
        
        // Send fee
        if (fee > 0) {
            (bool sent, ) = feeRecipient.call{value: fee}("");
            require(sent, "Fee transfer failed");
        }
    }
    
    /**
     * @notice Deposit to treasury
     */
    function deposit() external payable {
        totalTreasury += msg.value;
        emit TreasuryDeposit(msg.sender, msg.value);
    }
    
    /**
     * @notice Withdraw from treasury (owner only)
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function withdraw(address to, uint256 amount) external onlyOwner nonReentrant {
        require(amount <= totalTreasury, "Insufficient treasury");
        
        totalTreasury -= amount;
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Transfer failed");
        
        emit TreasuryWithdrawal(to, amount);
    }
    
    /**
     * @notice Distribute rewards to users
     * @param recipients Array of addresses
     * @param amounts Array of amounts
     */
    function distributeRewards(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner nonReentrant {
        require(recipients.length == amounts.length, "Array mismatch");
        
        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        
        require(total <= totalTreasury, "Insufficient treasury");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            (bool sent, ) = recipients[i].call{value: amounts[i]}("");
            require(sent, "Transfer failed");
            emit RewardDistributed(recipients[i], amounts[i]);
        }
        
        totalTreasury -= total;
    }
    
    /**
     * @notice Withdraw ERC20 tokens
     * @param token Token address
     * @param to Recipient
     * @param amount Amount
     */
    function withdrawERC20(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }
    
    /**
     * @notice Withdraw ERC721 NFTs
     * @param nft NFT contract address
     * @param tokenId Token ID
     * @param to Recipient
     */
    function withdrawERC721(
        address nft,
        uint256 tokenId,
        address to
    ) external onlyOwner {
        IERC721(nft).safeTransferFrom(address(this), to, tokenId);
    }
    
    /**
     * @notice Update fee configuration
     */
    function setFeeConfig(uint256 _tipFeePercent, address _feeRecipient) external onlyOwner {
        require(_tipFeePercent <= 20, "Fee too high");
        tipFeePercent = _tipFeePercent;
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @notice Get contract stats
     */
    function getStats() external view returns (
        uint256 treasury,
        uint256 tips,
        uint256 users,
        uint256 balance
    ) {
        return (
            totalTreasury,
            totalTipsReceived,
            totalUsers,
            address(this).balance
        );
    }
    
    /**
     * @notice Receive ETH
     */
    receive() external payable {
        totalTreasury += msg.value;
        emit TreasuryDeposit(msg.sender, msg.value);
    }
    
    /**
     * @notice Receive NFTs
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
