import { createPublicClient, http, parseUnits, parseAbi } from 'viem';
import { immutableZkEvmTestnet } from 'viem/chains';

const publicClient = createPublicClient({
  chain: immutableZkEvmTestnet,
  transport: http()
});

async function main() {
  const marketplaceAddress = '0x41E374A11391AfE9920c3c107CA8F578e34B6006';
  const myWallet = '0x17d6928eDDeB7BB5638cdaeb36c535EF98FDE8f1'; // dummy, replace with platform
  const PLATFORM_WALLET_ADDRESS = "0x11Dd223303346021d21a72818c3188187eA07FD3";
  const amount = parseUnits('0.01', 6);

  try {
    console.log("Simulating depositFirstSalePayment...");
    const abi = parseAbi([
      'function depositFirstSalePayment(address creator, uint256 amount) external'
    ]);
    
    await publicClient.simulateContract({
      address: marketplaceAddress,
      abi: abi,
      functionName: 'depositFirstSalePayment',
      args: [PLATFORM_WALLET_ADDRESS, amount],
      account: PLATFORM_WALLET_ADDRESS, // try simulating from platform wallet
    });
    console.log("Simulation succeeded!");
  } catch (err) {
    console.error("Simulation failed:", err.shortMessage || err.message);
  }
}

main();
