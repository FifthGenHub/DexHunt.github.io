// js/tokenomics.js
// Shared Tokenomics Modal for DexHunt (Pre-Bonding Curve)

const DEXHUNT_CA = "5eBbBt64RBZVvVAveM4rkSZJj28r2qDx5dCupesVpump";

// No burn logic pre-bonding curve
function updateBurnedUI() {
  const burnedEl = document.getElementById('burnedAmount');
  if (burnedEl) burnedEl.textContent = '0';
}

// Remove/disable burn button and burn modal
window.addEventListener('DOMContentLoaded', () => {
  // Remove burn button if present
  const burnBtn = document.getElementById('burnBtn');
  if (burnBtn) burnBtn.remove();
  // Remove tokenomics modal if present
  const tokenomicsBtn = document.getElementById('tokenomicsBtn');
  if (tokenomicsBtn) tokenomicsBtn.remove();
  updateBurnedUI();
});

// Remove/disable all burn handlers
function burnDexhunt() {
  alert('Burning is disabled until after the bonding curve launch.');
}
function handleDexhuntBurn() {
  alert('Burning is disabled until after the bonding curve launch.');
  return false;
}
