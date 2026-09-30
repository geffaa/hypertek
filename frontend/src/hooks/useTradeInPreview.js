import { useCallback, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { BASE_CHAIN_ID } from "../Web3/Config";
import { TRADE_IN_ESCROW_ABI, getTradeInConfig, loyaltyPct, nextTierChange } from "../Web3/tradeInEscrow";

// Reads an item's Programmatic Trade-In Value straight from the escrow contract.
export function useTradeInPreview(tokenId) {
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });
  const [state, setState] = useState({ loading: true, live: false });

  const load = useCallback(async () => {
    if (tokenId == null || !publicClient) {
      setState({ loading: false, live: false });
      return;
    }
    try {
      const config = await getTradeInConfig();
      if (!config.isLive || !config.contractAddress || !config.nftAddress) {
        setState({ loading: false, live: false });
        return;
      }
      const escrow = { address: config.contractAddress, abi: TRADE_IN_ESCROW_ABI };
      const args = [config.nftAddress, BigInt(tokenId)];
      const [preview, layers, partialWithdrawn, threshold, woundDown] = await Promise.all([
        publicClient.readContract({ ...escrow, functionName: "previewClaim", args }),
        publicClient.readContract({ ...escrow, functionName: "layersOf", args }),
        publicClient.readContract({ ...escrow, functionName: "partialWithdrawn", args }),
        publicClient.readContract({ ...escrow, functionName: "partialWithdrawalThreshold" }),
        publicClient.readContract({ ...escrow, functionName: "woundDown" }),
      ]);
      const [principal, amountNow] = preview;
      const now = Math.floor(Date.now() / 1000);
      setState({
        loading: false,
        live: true,
        escrowAddress: config.contractAddress,
        nftAddress: config.nftAddress,
        principal,
        amountNow,
        pctNow: principal > 0n ? Number((amountNow * 10000n) / principal) / 100 : loyaltyPct(now, now, woundDown),
        next: nextTierChange(layers, now, woundDown),
        partialWithdrawn,
        canWithdrawPartial: !partialWithdrawn && !woundDown && principal >= threshold,
        threshold,
      });
    } catch (err) {
      console.warn("[useTradeInPreview]", err.message);
      setState({ loading: false, live: false, error: err.message });
    }
  }, [tokenId, publicClient]);

  useEffect(() => { load(); }, [load]);

  return { ...state, reload: load };
}
