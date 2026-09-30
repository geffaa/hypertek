// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// Test helpers only. Never deployed to a live network.

/// @dev Mirrors USDC's 6 decimals so amounts in tests match production.
contract TestUSDC is ERC20 {
    constructor() ERC20("Test USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract TestNFT is ERC721 {
    constructor() ERC721("Test Item", "ITEM") {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
}
