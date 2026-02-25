import { ethers } from "ethers";

const rpc = "https://rpc.testnet.immutable.com";
const provider = new ethers.JsonRpcProvider(rpc);
const addr = "0x41E374A11391AfE9920c3c107CA8F578e34B6006"; // MARKETPLACE_ADDRESS

async function main() {
    const code = await provider.getCode(addr);
    const selector = ethers.id("depositFirstSalePayment(address,uint256)").substring(0, 10);
    console.log("depositFirstSalePayment selector:", selector);
    console.log("in contract? (code length: " + code.length + "):", code.includes(selector.substring(2)));
}
main();
