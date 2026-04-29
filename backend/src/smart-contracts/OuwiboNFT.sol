// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @title OuwiboNFT
 * @dev AI-Generated NFT Collection
 */
contract OuwiboNFT is ERC721, ERC721URIStorage, Ownable {
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    
    // Minting
    uint256 public constant MINT_PRICE = 0.01 ether;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_PER_WALLET = 10;
    
    // Royalty
    uint256 public royaltyFee = 500; // 5%
    address public royaltyRecipient;
    
    // Metadata
    string public baseURI;
    bool public revealed;
    
    // Mappings
    mapping(address => uint256) public mintedPerWallet;
    
    // Events
    event NFTMinted(address indexed to, uint256 tokenId, string uri);
    event BaseURIUpdated(string newBaseURI);
    event RoyaltyUpdated(uint256 fee, address recipient);
    
    constructor(
        string memory _baseURI,
        address _royaltyRecipient
    ) ERC721("Ouwibo AI NFT", "OUWI-NFT") Ownable(msg.sender) {
        baseURI = _baseURI;
        royaltyRecipient = _royaltyRecipient;
        revealed = false;
    }
    
    /**
     * @notice Mint NFT
     * @param to Recipient
     * @param uri Metadata URI (AI-generated)
     */
    function mint(address to, string calldata uri) external payable {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        require(mintedPerWallet[msg.sender] < MAX_PER_WALLET, "Max per wallet");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        mintedPerWallet[msg.sender]++;
        
        emit NFTMinted(to, tokenId, uri);
    }
    
    /**
     * @notice Mint multiple NFTs
     * @param to Recipient
     * @param amount Number to mint
     * @param uris Array of metadata URIs
     */
    function mintBatch(
        address to,
        uint256 amount,
        string[] calldata uris
    ) external payable {
        require(msg.value >= MINT_PRICE * amount, "Insufficient payment");
        require(_tokenIdCounter.current() + amount <= MAX_SUPPLY, "Max supply");
        require(mintedPerWallet[msg.sender] + amount <= MAX_PER_WALLET, "Max per wallet");
        require(uris.length == amount, "URI count mismatch");
        
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uris[i]);
            
            emit NFTMinted(to, tokenId, uris[i]);
        }
        
        mintedPerWallet[msg.sender] += amount;
    }
    
    /**
     * @notice Owner mint (no cost)
     */
    function ownerMint(address to, string calldata uri) external onlyOwner {
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit NFTMinted(to, tokenId, uri);
    }
    
    /**
     * @notice Withdraw funds
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Transfer failed");
    }
    
    /**
     * @notice Set base URI
     */
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }
    
    /**
     * @notice Reveal collection
     */
    function reveal() external onlyOwner {
        revealed = true;
    }
    
    /**
     * @notice Set royalty
     */
    function setRoyalty(uint256 fee, address recipient) external onlyOwner {
        require(fee <= 1000, "Fee too high"); // Max 10%
        royaltyFee = fee;
        royaltyRecipient = recipient;
        emit RoyaltyUpdated(fee, recipient);
    }
    
    /**
     * @notice Get total minted
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @notice Override functions
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    receive() external payable {}
}
