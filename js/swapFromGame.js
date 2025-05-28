// swapFromGame.js – Beta Version (Safe for Launch)
const DEXHUNT_MINT = "5eBbBt64RBZVvVAveM4rkSZJj28r2qDx5dCupesVpump";

async function connectWallet() {
  if (window.solana && window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect();
      document.getElementById("wallet-address")?.textContent = "Wallet: " + resp.publicKey.toString();
      return resp.publicKey;
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  } else {
    alert("Phantom wallet not found.");
  }
}

async function getDexhuntBalance(publicKey) {
  const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'));
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    publicKey,
    { mint: new solanaWeb3.PublicKey(DEXHUNT_MINT) }
  );
  let balance = 0;
  if (tokenAccounts.value.length > 0) {
    balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
  }
  return balance;
}

// Stub for burn – safe until post-bonding curve
async function burnDexhuntToken(itemName) {
  alert("Burning not active yet. This is a placeholder for unlocking: " + itemName);
}
