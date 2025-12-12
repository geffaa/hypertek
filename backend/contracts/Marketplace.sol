// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


interface IMyNFT {
    function getRoyaltyInfo(uint256 tokenId) 
        external 
        view 
        returns (address creator, uint16 royaltyBps, bool isFirstSale);
    
    function markAsSold(uint256 tokenId) external;
}

contract Marketplace is ReentrancyGuard {
    address public platformWallet;
    uint16 public constant PLATFORM_FEE_BPS = 1000; // 10%
    
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }
    
    mapping(address => mapping(uint256 => Listing)) public listings;
    
    event ListingCreated(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    
    event ListingCancelled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );
    
    event NFTSold(
        address indexed buyer,
        address indexed seller,
        address indexed nftAddress,
        uint256 tokenId,
        uint256 price,
        uint256 creatorAmount,
        uint256 platformAmount,
        uint256 sellerAmount,
        bool isFirstSale
    );
    
    constructor(address _platformWallet) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }
    
    function createListing(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external {
        require(price > 0, "Price must be greater than 0");
        
        IERC721 nft = IERC721(nftAddress);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(
            nft.getApproved(tokenId) == address(this) || 
            nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );
        
        listings[nftAddress][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });
        
        emit ListingCreated(msg.sender, nftAddress, tokenId, price);
    }
    
    function cancelListing(address nftAddress, uint256 tokenId) external {
        Listing storage listing = listings[nftAddress][tokenId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");
        
        listing.active = false;
        
        emit ListingCancelled(msg.sender, nftAddress, tokenId);
    }
    
    function buyNFT(
    address nftAddress,
    uint256 tokenId
) external payable nonReentrant {
    Listing storage listing = listings[nftAddress][tokenId];
    require(listing.active, "Listing not active");
    require(msg.value == listing.price, "Incorrect payment amount");

    address seller = listing.seller;
    uint256 price = listing.price;

    // Mark as inactive
    listing.active = false;

    // Get royalty info from NFT contract
    IMyNFT nft = IMyNFT(nftAddress);
    (address creator, uint16 royaltyBps, bool isFirstSale) = nft.getRoyaltyInfo(tokenId);

    // Calculate distribution ALWAYS: creator (royaltyBps), platform (PLATFORM_FEE_BPS), seller (remainder)
    uint256 creatorAmount = (price * uint256(royaltyBps)) / 10000;
    uint256 platformAmount = (price * uint256(PLATFORM_FEE_BPS)) / 10000;
    uint256 sellerAmount = price - creatorAmount - platformAmount;

    // Transfer payments (order: creator -> platform -> seller)
    if (creatorAmount > 0) {
        (bool successCreator, ) = creator.call{value: creatorAmount}("");
        require(successCreator, "Creator payment failed");
    }

    if (platformAmount > 0) {
        (bool successPlatform, ) = platformWallet.call{value: platformAmount}("");
        require(successPlatform, "Platform payment failed");
    }

    if (sellerAmount > 0) {
        (bool successSeller, ) = seller.call{value: sellerAmount}("");
        require(successSeller, "Seller payment failed");
    }

    // If it was the first sale, mark as sold on the NFT contract
    if (isFirstSale) {
        nft.markAsSold(tokenId);
    }

    // Transfer NFT to buyer
    IERC721(nftAddress).safeTransferFrom(seller, msg.sender, tokenId);

    emit NFTSold(
        msg.sender,
        seller,
        nftAddress,
        tokenId,
        price,
        creatorAmount,
        platformAmount,
        sellerAmount,
        isFirstSale
    );
}

    
    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (address seller, uint256 price, bool active)
    {
        Listing memory listing = listings[nftAddress][tokenId];
        return (listing.seller, listing.price, listing.active);
    }
    
    function updatePlatformWallet(address newWallet) external {
        require(msg.sender == platformWallet, "Not authorized");
        require(newWallet != address(0), "Invalid wallet");
        platformWallet = newWallet;
    }
}