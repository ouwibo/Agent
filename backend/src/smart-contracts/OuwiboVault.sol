// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title OuwiboVault
 * @dev Treasury and Escrow contract for AI operations
 */
contract OuwiboVault is Ownable, ReentrancyGuard {
    
    // Events
    event Deposit(address indexed from, uint256 amount, address token);
    event Withdraw(address indexed to, uint256 amount, address token);
    event EscrowCreated(uint256 indexed escrowId, address buyer, address seller, uint256 amount);
    event EscrowReleased(uint256 indexed escrowId, address seller);
    event EscrowRefunded(uint256 indexed escrowId, address buyer);
    
    // Escrow
    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;
        address token; // address(0) for ETH
        bool released;
        bool refunded;
        uint256 createdAt;
        uint256 deadline;
    }
    
    uint256 public escrowCounter;
    mapping(uint256 => Escrow) public escrows;
    
    // Stats
    uint256 public totalVolumeETH;
    uint256 public totalEscrows;
    
    /**
     * @notice Deposit ETH
     */
    function depositETH() external payable {
        totalVolumeETH += msg.value;
        emit Deposit(msg.sender, msg.value, address(0));
    }
    
    /**
     * @notice Deposit ERC20
     */
    function depositERC20(address token, uint256 amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount, token);
    }
    
    /**
     * @notice Withdraw ETH (owner only)
     */
    function withdrawETH(address to, uint256 amount) external onlyOwner nonReentrant {
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Transfer failed");
        emit Withdraw(to, amount, address(0));
    }
    
    /**
     * @notice Withdraw ERC20 (owner only)
     */
    function withdrawERC20(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).transfer(to, amount);
        emit Withdraw(to, amount, token);
    }
    
    /**
     * @notice Create escrow
     */
    function createEscrow(
        address seller,
        uint256 amount,
        address token,
        uint256 duration
    ) external payable returns (uint256) {
        uint256 escrowId = escrowCounter++;
        
        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            IERC20(token).transferFrom(msg.sender, address(this), amount);
        }
        
        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            token: token,
            released: false,
            refunded: false,
            createdAt: block.timestamp,
            deadline: block.timestamp + duration
        });
        
        totalEscrows++;
        
        emit EscrowCreated(escrowId, msg.sender, seller, amount);
        return escrowId;
    }
    
    /**
     * @notice Release escrow (buyer confirms)
     */
    function releaseEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.buyer, "Not buyer");
        require(!escrow.released && !escrow.refunded, "Already finalized");
        
        escrow.released = true;
        
        if (escrow.token == address(0)) {
            (bool sent, ) = escrow.seller.call{value: escrow.amount}("");
            require(sent, "Transfer failed");
        } else {
            IERC20(escrow.token).transfer(escrow.seller, escrow.amount);
        }
        
        emit EscrowReleased(escrowId, escrow.seller);
    }
    
    /**
     * @notice Refund escrow (after deadline or by owner)
     */
    function refundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(
            msg.sender == escrow.buyer || 
            (block.timestamp >= escrow.deadline && msg.sender == owner()),
            "Not authorized"
        );
        require(!escrow.released && !escrow.refunded, "Already finalized");
        
        escrow.refunded = true;
        
        if (escrow.token == address(0)) {
            (bool sent, ) = escrow.buyer.call{value: escrow.amount}("");
            require(sent, "Transfer failed");
        } else {
            IERC20(escrow.token).transfer(escrow.buyer, escrow.amount);
        }
        
        emit EscrowRefunded(escrowId, escrow.buyer);
    }
    
    /**
     * @notice Get vault balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Get token balance
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    receive() external payable {
        totalVolumeETH += msg.value;
        emit Deposit(msg.sender, msg.value, address(0));
    }
}
