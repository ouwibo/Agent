// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title OuwiboToken
 * @dev Governance token for Ouwibo DAO
 */
contract OuwiboToken is ERC20, ERC20Permit, Ownable {
    
    // Total supply: 1 billion tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    // Allocation
    uint256 public constant TEAM_ALLOCATION = 100_000_000 * 10**18; // 10%
    uint256 public constant COMMUNITY_ALLOCATION = 400_000_000 * 10**18; // 40%
    uint256 public constant TREASURY_ALLOCATION = 300_000_000 * 10**18; // 30%
    uint256 public constant LIQUIDITY_ALLOCATION = 200_000_000 * 10**18; // 20%
    
    // Vesting
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 claimed;
        uint256 startTime;
        uint256 duration;
    }
    
    mapping(address => VestingSchedule) public vestingSchedules;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensVested(address indexed to, uint256 amount, uint256 duration);
    event TokensClaimed(address indexed to, uint256 amount);
    
    constructor(
        address teamWallet,
        address treasuryWallet,
        address liquidityPool
    ) ERC20("Ouwibo Token", "OUWI") ERC20Permit("Ouwibo Token") Ownable(msg.sender) {
        // Mint allocations
        _mint(teamWallet, TEAM_ALLOCATION);
        _mint(address(this), COMMUNITY_ALLOCATION);
        _mint(treasuryWallet, TREASURY_ALLOCATION);
        _mint(liquidityPool, LIQUIDITY_ALLOCATION);
        
        emit TokensMinted(teamWallet, TEAM_ALLOCATION);
        emit TokensMinted(address(this), COMMUNITY_ALLOCATION);
        emit TokensMinted(treasuryWallet, TREASURY_ALLOCATION);
        emit TokensMinted(liquidityPool, LIQUIDITY_ALLOCATION);
    }
    
    /**
     * @notice Create vesting schedule for an address
     * @param to Recipient
     * @param amount Total amount to vest
     * @param duration Vesting duration in seconds
     */
    function createVesting(
        address to,
        uint256 amount,
        uint256 duration
    ) external onlyOwner {
        require(balanceOf(address(this)) >= amount, "Insufficient balance");
        require(vestingSchedules[to].totalAmount == 0, "Already vesting");
        
        vestingSchedules[to] = VestingSchedule({
            totalAmount: amount,
            claimed: 0,
            startTime: block.timestamp,
            duration: duration
        });
        
        emit TokensVested(to, amount, duration);
    }
    
    /**
     * @notice Claim vested tokens
     */
    function claimVested() external {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAmount > 0, "No vesting schedule");
        
        uint256 claimable = getClaimable(msg.sender);
        require(claimable > 0, "Nothing to claim");
        
        schedule.claimed += claimable;
        _transfer(address(this), msg.sender, claimable);
        
        emit TokensClaimed(msg.sender, claimable);
    }
    
    /**
     * @notice Get claimable amount for an address
     */
    function getClaimable(address account) public view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[account];
        if (schedule.totalAmount == 0) return 0;
        
        uint256 elapsed = block.timestamp - schedule.startTime;
        uint256 vested = (schedule.totalAmount * elapsed) / schedule.duration;
        if (vested > schedule.totalAmount) vested = schedule.totalAmount;
        
        return vested - schedule.claimed;
    }
    
    /**
     * @notice Mint additional tokens (owner only, limited)
     * @param to Recipient
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @notice Burn tokens
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
