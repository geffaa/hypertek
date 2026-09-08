// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BuybackEscrow
 * @notice Holds the guaranteed minimum buy-back funds for Hyper Tek items.
 *
 * Every item has its own pot, keyed by (nft contract, tokenId). A share of each sale
 * is paid in here and can only ever leave in one of two directions: to whoever owns
 * that specific item, either as a partial early withdrawal or as the full buy-back
 * when the item is surrendered.
 *
 * Each deposit into an item's pot is tracked as its own dated layer, because the
 * guarantee vests over five years starting from when that specific deposit was made
 * — a resale's top-up starts its own clock, separate from the item's original
 * first-sale deposit. `reservedFor` sums every layer for the usual "how much is
 * this item worth" question; the layers only matter internally, for vesting math.
 *
 * DELIBERATE ABSENCES — these are the point of this contract, not oversights:
 *
 *   - There is no admin role, and no function that can move funds to the company,
 *     to a team member, or to any address other than the item's own owner.
 *   - There is no pause and no upgrade path. Every address this contract uses —
 *     the payment token, the item vault, and the wind-down trigger — is immutable,
 *     fixed at deployment, and can never be changed afterward.
 *   - The one privileged function, `triggerWindDown`, cannot withdraw, redirect or
 *     reduce anything. Its only possible effect is to pay every owner sooner, at
 *     the maximum rate the fund ever pays. See its NatSpec below for why that
 *     specific exception is safe where a general admin function would not be.
 *
 * The consequence is that Hyper Tek cannot access this money under any circumstance,
 * including its own insolvency. That is intentional: the guarantee is only worth
 * something if the company genuinely cannot reach it.
 */
contract BuybackEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice The settlement token. USDC on Base. Nothing else is ever accepted —
    /// there is no per-call token parameter anywhere in this contract, so "USDC
    /// only" is a deploy-time guarantee enforced by what address this is set to.
    IERC20 public immutable paymentToken;

    /// @notice Where a surrendered item goes when its owner takes the full buy-back.
    /// Immutable so it can never be redirected after deployment.
    address public immutable itemVault;

    /// @notice The only address ever allowed to call `triggerWindDown`. Fixed
    /// forever at deployment. See `triggerWindDown` for exactly what this address
    /// can and cannot do — it is not an admin key.
    address public immutable windDownTrigger;

    /// @notice The item balance (sum of all its deposit layers) that must be
    /// reached before `withdrawPartial` becomes available for that item. Fixed at
    /// deployment; raising or lowering it later would need a new contract.
    uint256 public immutable partialWithdrawalThreshold;

    /// @notice One deposit into one item's pot. `amount` is what's left of this
    /// layer's principal after any partial withdrawal has drawn from it; `timestamp`
    /// is fixed at the moment of deposit and never changes, since it is what the
    /// five-year vesting clock for this specific layer runs from.
    struct Deposit {
        uint256 amount;
        uint64 timestamp;
    }

    /// @notice Every deposit layer held against one item: nft contract => tokenId => layers.
    mapping(address => mapping(uint256 => Deposit[])) private _deposits;

    /// @notice Whether an item has already used its one-time partial withdrawal.
    /// Scoped to the item, not to whichever address currently owns it — once used,
    /// it stays used no matter how many times the item changes hands afterward.
    /// This is deliberate: scoping it to the owner instead would let someone reset
    /// the option for free by selling to a wallet they also control.
    mapping(address => mapping(uint256 => bool)) private _partialWithdrawn;

    /// @notice Total principal still owed across every item. Together with
    /// `retainedFees` and `unattributedBalance()`, this should always account for
    /// the entire token balance held by the contract.
    uint256 public totalReserved;

    /// @notice The portion of claimed/withdrawn deposits that was never paid out,
    /// because it had not vested yet at the moment of the claim or withdrawal.
    /// Reported for transparency only, exactly like `unattributedBalance()` below
    /// — there is no function anywhere that can move this to any address.
    uint256 public retainedFees;

    /// @notice Once true, every deposit layer vests at the maximum rate regardless
    /// of age. See `triggerWindDown`.
    bool public woundDown;

    event Deposited(
        address indexed nft,
        uint256 indexed tokenId,
        address indexed from,
        uint256 amount,
        uint256 newBalance
    );

    event BuybackClaimed(
        address indexed nft,
        uint256 indexed tokenId,
        address indexed owner,
        uint256 payout,
        uint256 retainedFee
    );

    event PartialWithdrawn(
        address indexed nft,
        uint256 indexed tokenId,
        address indexed owner,
        uint256 payout,
        uint256 principalConsumed
    );

    event WoundDown(uint256 timestamp);

    /// @notice Most deposit layers one item will ever carry. Past this, a new
    /// deposit is folded into the newest existing layer instead of adding a row.
    ///
    /// @dev Claiming and withdrawing both walk every layer of an item, so an
    /// unbounded array is a way to make an item's own money unspendable: enough
    /// dust deposits and the payout transaction no longer fits in a block, with
    /// no upgrade path to rescue it. Folding rather than reverting means a
    /// genuine deposit is never rejected — the money still lands, it just joins
    /// the newest layer. That layer keeps its original timestamp, so folding
    /// can only ever date the new money EARLIER than its own deposit, never
    /// later: it can shorten the owner's wait, never extend it.
    uint256 public constant MAX_LAYERS = 40;

    error ZeroAddress();
    error ZeroAmount();
    error ZeroThreshold();
    error InvalidNft();
    error NothingReserved();
    error NotItemOwner(address caller, address actualOwner);
    error AlreadyWithdrawn();
    error BelowThreshold();
    error NotWindDownTrigger();
    error AlreadyWoundDown();
    error WindDownActive();

    /**
     * @param paymentToken_ USDC address on the target chain.
     * @param itemVault_ Address that receives items surrendered in a buy-back.
     *        Must be able to hold an ERC-721 (an EOA, or a contract implementing
     *        IERC721Receiver).
     * @param windDownTrigger_ The only address ever able to call `triggerWindDown`.
     *        Expected to be a multisig held by the team, not a single EOA — that is
     *        an operational choice made at deploy time, not something this
     *        contract enforces.
     * @param partialWithdrawalThreshold_ Minimum item balance (in the payment
     *        token's smallest unit) before `withdrawPartial` is available.
     */
    constructor(
        address paymentToken_,
        address itemVault_,
        address windDownTrigger_,
        uint256 partialWithdrawalThreshold_
    ) {
        if (
            paymentToken_ == address(0) ||
            itemVault_ == address(0) ||
            windDownTrigger_ == address(0)
        ) revert ZeroAddress();

        // A zero threshold would make `withdrawPartial` available on an item
        // holding nothing, burning that item's one-time option for a payout of
        // zero. Nothing can change this value after deployment, so it has to be
        // caught here.
        if (partialWithdrawalThreshold_ == 0) revert ZeroThreshold();

        paymentToken = IERC20(paymentToken_);
        itemVault = itemVault_;
        windDownTrigger = windDownTrigger_;
        partialWithdrawalThreshold = partialWithdrawalThreshold_;
    }

    /**
     * @notice Add funds to one item's guaranteed buy-back.
     * @dev Permissionless on purpose. The marketplace calls this on every sale, and
     *      anyone may top an item up afterwards. There is no way to take funds back
     *      out through this path, so allowing anyone to pay in carries no risk.
     *
     *      Each call creates a new deposit layer with its own five-year clock,
     *      rather than adding to an existing balance. This is what lets a resale's
     *      top-up vest independently of the item's original first-sale deposit.
     *      Once an item reaches `MAX_LAYERS`, further deposits fold into the
     *      newest layer instead — see that constant for why.
     *
     *      The token must actually exist. Funding a tokenId that was never minted
     *      would put money somewhere no owner can ever be resolved for, and this
     *      contract has no way to move it back out.
     *
     *      Caller must have approved this contract for `amount` beforehand.
     */
    function deposit(address nft, uint256 tokenId, uint256 amount) external nonReentrant {
        if (nft == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        // Checked before the call: Solidity's own extcodesize guard would revert
        // with no data on an address holding no code, and that revert is not
        // catchable below — so an EOA would fail with an unreadable error
        // instead of this one.
        if (nft.code.length == 0) revert InvalidNft();

        try IERC721(nft).ownerOf(tokenId) returns (address currentOwner) {
            if (currentOwner == address(0)) revert InvalidNft();
        } catch {
            revert InvalidNft();
        }

        paymentToken.safeTransferFrom(msg.sender, address(this), amount);

        Deposit[] storage layers = _deposits[nft][tokenId];
        if (layers.length < MAX_LAYERS) {
            layers.push(Deposit({ amount: amount, timestamp: uint64(block.timestamp) }));
        } else {
            layers[layers.length - 1].amount += amount;
        }
        totalReserved += amount;

        emit Deposited(nft, tokenId, msg.sender, amount, reservedFor(nft, tokenId));
    }

    /**
     * @notice Surrender an item and take its guaranteed buy-back.
     *
     * Callable only by the current owner of that exact item, verified against the
     * NFT contract itself rather than against anything this contract stores. The
     * item moves to the vault; every deposit layer is paid out at its own current
     * vesting rate, and the item's whole entry is then cleared.
     *
     * @dev The owner must first approve this contract to move the token, either
     *      with `approve(escrow, tokenId)` or `setApprovalForAll(escrow, true)`.
     *
     *      No condition beyond ownership is imposed on when this may be called.
     *      Whether an auction actually failed to reach reserve is a marketplace
     *      rule, enforced by which items the UI offers this button for — it is
     *      deliberately not enforced here, because doing so on-chain would need
     *      this contract to trust an oracle's account of an auction's outcome,
     *      which is a worse trade than simply letting an owner always take what
     *      has vested. The floor is a right the owner can exercise at any time.
     */
    function claimBuyback(address nft, uint256 tokenId) external nonReentrant {
        Deposit[] storage layers = _deposits[nft][tokenId];
        uint256 layerCount = layers.length;
        if (layerCount == 0) revert NothingReserved();

        address currentOwner = IERC721(nft).ownerOf(tokenId);
        if (currentOwner != msg.sender) revert NotItemOwner(msg.sender, currentOwner);

        // Weight every layer at its own rate first and divide once at the end.
        // Dividing per layer would throw away the remainder on each one, so an
        // item split across many small layers would pay less than the same
        // principal held as one layer.
        uint256 totalPrincipal;
        uint256 weighted;
        for (uint256 i = 0; i < layerCount; i++) {
            uint256 principal = layers[i].amount;
            totalPrincipal += principal;
            weighted += principal * _vestedBps(layers[i].timestamp);
        }
        uint256 payout = weighted / 10000;
        uint256 fee = totalPrincipal - payout;

        // Effects before interactions.
        delete _deposits[nft][tokenId];
        totalReserved -= totalPrincipal;
        retainedFees += fee;

        // Item goes to the vault, the vested payout goes to the owner. If either
        // leg fails the whole claim reverts and every layer stays untouched.
        IERC721(nft).safeTransferFrom(msg.sender, itemVault, tokenId);
        paymentToken.safeTransfer(msg.sender, payout);

        emit BuybackClaimed(nft, tokenId, msg.sender, payout, fee);
    }

    /**
     * @notice Take part of an item's guaranteed buy-back early, without giving up
     *         the item.
     *
     * @dev A one-time option per item, not per owner — see `_partialWithdrawn`'s
     *      NatSpec for why. Available only once the item's total balance passes
     *      `partialWithdrawalThreshold`. Draws up to 45% of the item's total
     *      principal, oldest deposit layer first, paying each layer's consumed
     *      portion at that layer's own current vesting rate — exactly the same
     *      lookup `claimBuyback` uses, so the fee always matches "the standard
     *      vesting fee for the year in which the withdrawn funds were originally
     *      deposited," per item terms.
     *
     *      Whatever principal is not consumed keeps its original deposit timestamp
     *      and keeps vesting normally toward an eventual full claim. Disabled once
     *      `woundDown` is true, since every layer is already paying its maximum
     *      through `claimBuyback` at that point and a partial draw adds nothing.
     */
    function withdrawPartial(address nft, uint256 tokenId) external nonReentrant {
        if (woundDown) revert WindDownActive();
        if (_partialWithdrawn[nft][tokenId]) revert AlreadyWithdrawn();

        address currentOwner = IERC721(nft).ownerOf(tokenId);
        if (currentOwner != msg.sender) revert NotItemOwner(msg.sender, currentOwner);

        Deposit[] storage layers = _deposits[nft][tokenId];
        uint256 totalPrincipal = reservedFor(nft, tokenId);
        if (totalPrincipal < partialWithdrawalThreshold) revert BelowThreshold();

        uint256 principalCap = (totalPrincipal * 45) / 100;
        uint256 principalConsumed;
        uint256 weighted;

        for (uint256 i = 0; i < layers.length && principalConsumed < principalCap; i++) {
            uint256 layerAmount = layers[i].amount;
            if (layerAmount == 0) continue;

            uint256 remainingCap = principalCap - principalConsumed;
            uint256 principalFromLayer = layerAmount < remainingCap ? layerAmount : remainingCap;

            layers[i].amount = layerAmount - principalFromLayer;
            principalConsumed += principalFromLayer;
            // Weighted here, divided once below — same reason as `claimBuyback`.
            weighted += principalFromLayer * _vestedBps(layers[i].timestamp);
        }

        uint256 payout = weighted / 10000;
        uint256 fee = principalConsumed - payout;

        // Effects before interactions.
        _partialWithdrawn[nft][tokenId] = true;
        totalReserved -= principalConsumed;
        retainedFees += fee;

        paymentToken.safeTransfer(msg.sender, payout);

        emit PartialWithdrawn(nft, tokenId, msg.sender, payout, principalConsumed);
    }

    /**
     * @notice Accelerate every item's vesting to the maximum rate, permanently.
     *
     * @dev The one privileged function in this contract, callable only by the
     *      fixed `windDownTrigger` address, and only once. It cannot withdraw
     *      anything, cannot redirect anything, and cannot reduce any payout —
     *      its only possible effect is that every deposit layer, on every item,
     *      immediately starts paying out at the same 97% rate a deposit normally
     *      only reaches after five years. That is a strictly pro-owner change:
     *      the worst outcome of this function being called by mistake, or by
     *      whoever holds `windDownTrigger` acting in bad faith, is that owners
     *      get paid the maximum sooner than scheduled. There is no path from here
     *      to a dollar reaching the company, a team member, or `windDownTrigger`
     *      itself. That asymmetry is what makes this one exception acceptable in
     *      a contract that otherwise has no privileged functions at all.
     */
    function triggerWindDown() external {
        if (msg.sender != windDownTrigger) revert NotWindDownTrigger();
        if (woundDown) revert AlreadyWoundDown();
        woundDown = true;
        emit WoundDown(block.timestamp);
    }

    /// @notice The guaranteed buy-back currently backing one item — the sum of
    /// every deposit layer's remaining principal, before any vesting discount.
    function reservedFor(address nft, uint256 tokenId) public view returns (uint256 total) {
        Deposit[] storage layers = _deposits[nft][tokenId];
        for (uint256 i = 0; i < layers.length; i++) {
            total += layers[i].amount;
        }
    }

    /// @notice Whether an item has already used its one-time partial withdrawal.
    function partialWithdrawn(address nft, uint256 tokenId) external view returns (bool) {
        return _partialWithdrawn[nft][tokenId];
    }

    /**
     * @notice What an item's owner would actually receive by claiming right now,
     *         and what would be retained as the unvested remainder.
     *
     * @dev `reservedFor` answers "how much is held against this item", which is
     *      the raw principal — not what a claim pays today. Anyone checking the
     *      guarantee independently needs the vested figure, so this returns the
     *      same arithmetic `claimBuyback` performs, without sending anything.
     */
    function previewClaim(address nft, uint256 tokenId)
        external
        view
        returns (uint256 principal, uint256 payout, uint256 fee, uint256 layerCount)
    {
        Deposit[] storage layers = _deposits[nft][tokenId];
        layerCount = layers.length;

        uint256 weighted;
        for (uint256 i = 0; i < layerCount; i++) {
            principal += layers[i].amount;
            weighted += layers[i].amount * _vestedBps(layers[i].timestamp);
        }
        payout = weighted / 10000;
        fee = principal - payout;
    }

    /// @notice Every deposit layer held against one item, with each layer's own
    /// remaining principal and deposit timestamp, so an owner can see when each
    /// part of their guarantee vests rather than only the total.
    function layersOf(address nft, uint256 tokenId) external view returns (Deposit[] memory) {
        return _deposits[nft][tokenId];
    }

    /**
     * @notice Tokens sent here by mistake, outside the deposit function.
     * @dev Reported for transparency only. There is no function to recover them,
     *      because any such function would be a way for someone to take funds out,
     *      which this contract does not have. Send only through `deposit`.
     */
    function unattributedBalance() external view returns (uint256) {
        // Returns zero rather than reverting if the books ever exceed the actual
        // balance. That should be impossible, but if it did happen this view is
        // exactly what a monitor would be reading to find out — it is no use if
        // it reverts at precisely the moment something is wrong. `isSolvent`
        // below is the check that actually reports the problem.
        uint256 balance = paymentToken.balanceOf(address(this));
        uint256 accounted = totalReserved + retainedFees;
        return balance > accounted ? balance - accounted : 0;
    }

    /// @notice Whether the contract still physically holds everything it owes:
    /// all item principal plus all retained fees. Anyone can call this at any
    /// time; it should never return false.
    function isSolvent() external view returns (bool) {
        return paymentToken.balanceOf(address(this)) >= totalReserved + retainedFees;
    }

    /**
     * @dev The vesting rate for a single deposit layer, in basis points, based on
     *      how long ago it was made: 80% before one year, rising 4 points per
     *      year to 96% at five years, then 97% forever after. Once `woundDown` is
     *      true this always returns the maximum (9700) regardless of age.
     */
    function _vestedBps(uint64 depositTimestamp) internal view returns (uint16) {
        if (woundDown) return 9700;

        uint256 age = block.timestamp - depositTimestamp;
        uint256 year = 365 days;

        if (age < year) return 8000;
        if (age < 2 * year) return 8400;
        if (age < 3 * year) return 8800;
        if (age < 4 * year) return 9200;
        if (age < 5 * year) return 9600;
        return 9700;
    }
}
