// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
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
    IERC20 public usdc;
    uint16 public constant PLATFORM_FEE_BPS = 2000; // 20% — HyperTek marketplace commission
    
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }
    
    mapping(address => mapping(uint256 => Listing)) public listings;
    
    // Internal Balance Storage
    mapping(address => uint256) public sellerBalance;
    mapping(address => uint256) public creatorBalance;
    uint256 public platformBalance;
    
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
    
    event Withdrawn(
        address indexed user,
        uint256 amount,
        string role
    );
    
    event FirstSaleDeposited(
        address indexed buyer,
        address indexed creator,
        uint256 amount
    );
    
    constructor(address _platformWallet, address _usdcAddress) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        require(_usdcAddress != address(0), "Invalid USDC address");
        platformWallet = _platformWallet;
        usdc = IERC20(_usdcAddress);
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
    
    // NEW: Handle first sale payments BEFORE minting is completed on backend
    function depositFirstSalePayment(address creator, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(creator != address(0), "Invalid creator address");
        
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");
        
        // Correct attribution for first sale (100% to creator balance)
        creatorBalance[creator] += amount;
        
        emit FirstSaleDeposited(msg.sender, creator, amount);
    }
    
    function buyNFT(
        address nftAddress,
        uint256 tokenId
    ) external nonReentrant {
        Listing storage listing = listings[nftAddress][tokenId];
        require(listing.active, "Listing not active");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");

        address seller = listing.seller;
        uint256 price = listing.price;

        // Mark as inactive immediately
        listing.active = false;

        // Transfer USDC from buyer to this contract
        require(usdc.transferFrom(msg.sender, address(this), price), "USDC transfer failed");

        // Get royalty info from NFT contract
        IMyNFT nft = IMyNFT(nftAddress);
        (address creator, uint16 royaltyBps, bool isFirstSale) = nft.getRoyaltyInfo(tokenId);

        uint256 creatorAmount;
        uint256 platformAmount;
        uint256 sellerAmount;

        if (isFirstSale) {
            // First sale: 100% to creator — held in creatorBalance (same escrow as royalties)
            creatorAmount = price;
            platformAmount = 0;
            sellerAmount = 0;
        } else {
            // Secondary sales: 5% creator royalty, 10% platform fee, 85% seller
            creatorAmount = (price * uint256(royaltyBps)) / 10000;
            platformAmount = (price * uint256(PLATFORM_FEE_BPS)) / 10000;
            sellerAmount = price - creatorAmount - platformAmount;
        }

        // All amounts held in contract escrow — claim via withdraw functions
        if (creatorAmount > 0) creatorBalance[creator] += creatorAmount;
        if (platformAmount > 0) platformBalance += platformAmount;
        if (sellerAmount > 0) sellerBalance[seller] += sellerAmount;

        // Mark first sale as done
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
    
    function withdrawSeller() external nonReentrant {
        uint256 amount = sellerBalance[msg.sender];
        require(amount > 0, "No seller balance to withdraw");
        
        sellerBalance[msg.sender] = 0;
        require(usdc.transfer(msg.sender, amount), "USDC transfer failed");
        
        emit Withdrawn(msg.sender, amount, "seller");
    }
    
    function withdrawCreator() external nonReentrant {
        uint256 amount = creatorBalance[msg.sender];
        require(amount > 0, "No creator balance to withdraw");
        
        creatorBalance[msg.sender] = 0;
        require(usdc.transfer(msg.sender, amount), "USDC transfer failed");
        
        emit Withdrawn(msg.sender, amount, "creator");
    }
    
    function withdrawPlatformFees() external nonReentrant {
        require(msg.sender == platformWallet, "Only platform wallet can withdraw fees");
        uint256 amount = platformBalance;
        require(amount > 0, "No platform balance to withdraw");
        
        platformBalance = 0;
        require(usdc.transfer(platformWallet, amount), "USDC transfer failed");
        
        emit Withdrawn(platformWallet, amount, "platform");
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