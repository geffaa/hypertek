const fs = require('fs');
const https = require('https');

const code = fs.readFileSync('/Users/geffaaa/Upwork/hyper-tek-game-web/backend/scripts/seedMarketplace.js', 'utf8');
const links = code.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9?-]+(&[a-zA-Z0-9_=-]+)*/g);

if (!links) {
  console.log("No links found");
  process.exit(0);
}
const uniqueLinks = [...new Set(links)];
console.log(`Testing ${uniqueLinks.length} links...`);

let pending = uniqueLinks.length;
uniqueLinks.forEach(link => {
  https.get(link, (res) => {
    if (res.statusCode !== 200) {
      console.log(`❌ BROKEN (${res.statusCode}): ${link}`);
    } else {
      console.log(`✅ OK: ${link}`);
    }
    pending--;
    if (pending === 0) process.exit(0);
  }).on('error', (e) => {
    console.log(`❌ ERROR: ${link} - ${e.message}`);
    pending--;
    if (pending === 0) process.exit(0);
  });
});
