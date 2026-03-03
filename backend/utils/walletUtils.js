import { ethers } from "ethers";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // Must be 32 bytes (256 bits)
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a private key using AES-256-CBC
 * @param {string} privateKey 
 * @returns {string} Encrypted string in format: iv:encryptedData
 */
export const encryptPrivateKey = (privateKey) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  // Ensure key is 32 bytes. If not, hash it to make it 32 bytes.
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(privateKey);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

/**
 * Decrypts an encrypted private key string
 * @param {string} encryptedPrivateKey 
 * @returns {string} Original private key
 */
export const decryptPrivateKey = (encryptedPrivateKey) => {
  const textParts = encryptedPrivateKey.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

/**
 * Generates a new Ethereum wallet and returns the address and encrypted private key
 * @returns {Object} { address, encryptedPrivateKey }
 */
export const generateWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey);
    return {
        address: wallet.address,
        encryptedPrivateKey
    };
};
