const bs58 = require('bs58');
const fs = require('fs');

// Read the base58 string from phantom-keypair.json
const arr = JSON.parse(fs.readFileSync('phantom-keypair.json', 'utf8'));
const base58 = arr[0];

// Decode and write the Solana keypair array
const keypair = bs58.default.decode(base58);
console.log(JSON.stringify(Array.from(keypair)));
fs.writeFileSync('phantom-keypair-solana.json', JSON.stringify(Array.from(keypair)));