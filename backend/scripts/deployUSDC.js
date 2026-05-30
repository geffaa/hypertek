// scripts/deployUSDC.js
import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying MockUSDC with account:", deployer.address);

  let currentNonce = await ethers.provider.getTransactionCount(deployer.address, "pending");

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy({ nonce: currentNonce });
  await usdc.waitForDeployment();
  const address = await usdc.getAddress();

  console.log("MockUSDC deployed to:", address);

  // Update .env file with new USDC address
  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

  const updateEnv = (key, value) => {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  };

  updateEnv("BASE_USDC_ADDRESS", address);
  fs.writeFileSync(envPath, envContent);
  console.log(".env file updated with BASE_USDC_ADDRESS");
}

main().catch(console.error);
