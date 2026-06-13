// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

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
    mapping(address => bool) public authorizedMinters;      // Allow backend server wallet to lazy-mint editions
    
    event Minted( 
        address indexed owner,
        uint256 tokenId,
        string tokenURI,
        uint16 royaltyBps
    );
    
    event MarketplaceAuthorized(address indexed marketplace, bool authorized);
    event MinterAuthorized(address indexed minter, bool authorized);
    event FirstSaleCompleted(uint256 indexed tokenId);
    
    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {
        nextTokenId = 1;
    }
    
    // Authorize backend server wallet to lazy-mint edition tokens to buyers
    function setMinterAuthorization(address minter, bool authorized) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        authorizedMinters[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }

    // Lazy-mint one edition token directly to a buyer — called by authorized backend minter only
    function mintTo(
        address to,
        address creator,
        string memory tokenURI,
        uint16 royaltyBps
    ) external returns (uint256) {
        require(authorizedMinters[msg.sender], "Not authorized minter");
        require(to != address(0), "Invalid recipient");
        require(creator != address(0), "Invalid creator");
        require(royaltyBps <= 10000, "Royalty too high");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");

        uint256 tokenId = nextTokenId;
        nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        tokenRoyalties[tokenId] = NFTRoyalty({ creator: creator, royaltyBps: royaltyBps });
        hasBeenSold[tokenId] = false;

        emit Minted(to, tokenId, tokenURI, royaltyBps);
        return tokenId;
    }

    // FIX: Authorize marketplace to call markAsSold
    function setMarketplaceAuthorization(address marketplace, bool authorized) external onlyOwner {
        require(marketplace != address(0), "Invalid marketplace address");
        authorizedMarketplaces[marketplace] = authorized;
        emit MarketplaceAuthorized(marketplace, authorized);
    }
    
    function mint(
        string memory tokenURI,
        uint16 royaltyBps
    ) external returns (uint256) {
        require(royaltyBps <= 10000, "Royalty too high"); // Max 100%
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        
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
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        NFTRoyalty memory royalty = tokenRoyalties[tokenId];
        return (royalty.creator, royalty.royaltyBps, !hasBeenSold[tokenId]);
    }
    
    // FIX: Better authorization check and validation
    function markAsSold(uint256 tokenId) external {
        require(
            authorizedMarketplaces[msg.sender] || msg.sender == owner(),
            "Not authorized to mark as sold"
        );
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!hasBeenSold[tokenId], "Already marked as sold");
        
        hasBeenSold[tokenId] = true;
        emit FirstSaleCompleted(tokenId);
    }
    
    // NEW: Helper function to check if marketplace is authorized
    function isMarketplaceAuthorized(address marketplace) external view returns (bool) {
        return authorizedMarketplaces[marketplace];
    }
    
    // NEW: Get creator of a token
    function getCreator(uint256 tokenId) external view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenRoyalties[tokenId].creator;
    }
}