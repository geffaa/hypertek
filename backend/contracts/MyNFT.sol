// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    
    struct NFTRoyalty {
        address creator;
        uint16 royaltyBps; // basis points (500 = 5%)
    }
    
    mapping(uint256 => NFTRoyalty) public tokenRoyalties;
    mapping(uint256 => bool) public hasBeenSold; // Track first sale
    mapping(address => bool) public authorizedMarketplaces; // Allow marketplace to mark as sold
    
    event Minted(
        address indexed owner,
        uint256 tokenId,
        string tokenURI,
        uint16 royaltyBps
    );
    
    event MarketplaceAuthorized(address indexed marketplace, bool authorized);
    
    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {
        nextTokenId = 1;
    }
    
    // Authorize marketplace to call markAsSold
    function setMarketplaceAuthorization(address marketplace, bool authorized) external onlyOwner {
        authorizedMarketplaces[marketplace] = authorized;
        emit MarketplaceAuthorized(marketplace, authorized);
    }
    
    function mint(
        string memory tokenURI,
        uint16 royaltyBps
    ) external returns (uint256) {
        require(royaltyBps <= 10000, "Royalty too high"); // Max 100%
        
        uint256 tokenId = nextTokenId;
        nextTokenId++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        tokenRoyalties[tokenId] = NFTRoyalty({
            creator: msg.sender,
            royaltyBps: royaltyBps
        });
        
        hasBeenSold[tokenId] = false;
        
        emit Minted(msg.sender, tokenId, tokenURI, royaltyBps);
        
        return tokenId;
    }
    
    function getRoyaltyInfo(uint256 tokenId) 
        external 
        view 
        returns (address creator, uint16 royaltyBps, bool isFirstSale) 
    {
        NFTRoyalty memory royalty = tokenRoyalties[tokenId];
        return (royalty.creator, royalty.royaltyBps, !hasBeenSold[tokenId]);
    }
    
    // FIXED: Allow authorized marketplaces to mark as sold
    function markAsSold(uint256 tokenId) external {
        require(
            authorizedMarketplaces[msg.sender] || msg.sender == owner(),
            "Not authorized to mark as sold"
        );
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        hasBeenSold[tokenId] = true;
    }
}