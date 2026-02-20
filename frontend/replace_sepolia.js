const fs = require('fs');

const files = [
  'src/pages/NfaLand.jsx',
  'src/Components/ProfileSection/Listing.jsx',
  'src/Components/ProfileSection/Land.jsx',
  'src/hooks/useTokenBalance.js'
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
      console.log(`Skipping ${file} - does not exist.`);
      return;
  }
  let content = fs.readFileSync(file, 'utf8');
  
  // Constants
  content = content.replace(/SEPOLIA_MARKETPLACE_ADDRESS/g, 'IMMUTABLE_MARKETPLACE_ADDRESS');
  content = content.replace(/SEPOLIA_NFT_ADDRESS/g, 'IMMUTABLE_NFT_ADDRESS');
  content = content.replace(/SEPOLIA_CHAIN_ID/g, 'IMMUTABLE_CHAIN_ID');
  content = content.replace(/SEPOLIA_USDC_ADDRESS/g, 'IMMUTABLE_USDC_ADDRESS');
  
  // Functions & Chain ID hex
  content = content.replace(/switchToSepolia/g, 'switchToImmutable');
  content = content.replace(/"0xaa36a7"/g, '"0x34a1"'); // 13473 in hex
  content = content.replace(/'0xaa36a7'/g, "'0x34a1'");
  
  // Text & Network params
  content = content.replace(/Sepolia Testnet/g, 'Immutable zkEVM Testnet');
  content = content.replace(/Sepolia network/g, 'Immutable network');
  content = content.replace(/Sepolia ETH/gi, 'IMX');
  content = content.replace(/SepoliaETH/gi, 'IMX');
  content = content.replace(/to Sepolia/g, 'to Immutable');
  content = content.replace(/add Sepolia/g, 'add Immutable');
  content = content.replace(/symbol: "ETH"/g, 'symbol: "IMX"'); 

  content = content.replace(/https:\/\/sepolia\.infura\.io\/v3\//g, 'https://rpc.testnet.immutable.com');
  content = content.replace(/https:\/\/sepolia\.etherscan\.io/g, 'https://explorer.testnet.immutable.com');
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
