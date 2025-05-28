// LEGAL DISCLAIMER: All guns and reticles in DexHunt PixelShop are cosmetic only. No gameplay advantage, no real-world value, and no investment or profit. All descriptions are for fun and lore only. $DEXHUNT is a utility token for in-game cosmetic unlocks only.

// --- Gun & Reticle Metadata (for shop, inventory, and future NFTs) ---

const guns = [
  {
    name: "Hellfire Revolver",
    id: "hellfire",
    image: "assets/cursors/hellfire.png",
    rarity: "Epic",
    cost: 1250000,
    lore: "Tier-1 version of the infernal classic. Cosmetic only. No gameplay advantage. For fun/visual use only."
  },
  {
    name: "Dusty Iron",
    id: "dusty",
    image: "assets/cursors/dusty.png",
    rarity: "Rare",
    cost: 500000,
    lore: "Scratched, cursed, still kicking. Cosmetic only. No gameplay advantage. For fun/visual use only."
  },
  {
    name: "Golden Flame",
    id: "golden",
    image: "assets/cursors/golden.png",
    rarity: "Legendary",
    cost: 2500000,
    lore: "Forged in reflex fire and paid in full. Cosmetic only. No gameplay advantage. For fun/visual use only."
  },
  {
    name: "Starter Piece",
    id: "gunbrown",
    image: "assets/cursors/gunbrown.png",
    rarity: "Common",
    cost: 50000,
    lore: "Every cowboy starts somewhere. Cosmetic only. No gameplay advantage. For fun/visual use only."
  },
  {
    name: "Shotgun Classic",
    id: "shotgun",
    image: "assets/cursors/shotgun.png",
    rarity: "Rare",
    cost: 500000,
    lore: "Double-barrel, single purpose. Cosmetic only. No gameplay advantage. For fun/visual use only."
  },
  {
    name: "Plasma Blaster",
    id: "blaster",
    image: "assets/cursors/blaster.png",
    rarity: "Uncommon",
    cost: 250000,
    lore: "Charged with energy. Cosmetic only. No gameplay advantage. For fun/visual use only."
  }
];

const reticles = [
  {
    name: "Hellfire Reticle",
    id: "hellfireReticle",
    image: "assets/reticles/hellfireReticle.png",
    rarity: "Epic",
    cost: 1250000,
    lore: "Forged in the flames of the Last Draw. Cosmetic only. No gameplay advantage. For fun/visual use only.",
    effect: "Replaces reticle with a flaming crosshair (visual only)"
  },
  {
    name: "Demon’s Gaze",
    id: "dustyReticle",
    image: "assets/reticles/dustyReticle.png",
    rarity: "Rare",
    cost: 500000,
    lore: "Eyes of the Badlands. Cosmetic only. No gameplay advantage. For fun/visual use only.",
    effect: "Replaces reticle with cursed demon face (visual only)"
  },
  {
    name: "Money Shot",
    id: "goldenReticle",
    image: "assets/reticles/goldenReticle.png",
    rarity: "Legendary",
    cost: 2500000,
    lore: "Hit the coin, win the prize (in style). Cosmetic only. No gameplay advantage. For fun/visual use only.",
    effect: "Replaces reticle with $DEXHUNT coin icon (visual only)"
  },
  {
    name: "Blaster Dot",
    id: "blasterReticle",
    image: "assets/reticles/blasterReticle.png",
    rarity: "Uncommon",
    cost: 250000,
    lore: "Precision-engineered plasma sight. Cosmetic only. No gameplay advantage. For fun/visual use only.",
    effect: "Replaces reticle with a neon tech dot (visual only)"
  },
  {
    name: "Scatterblast",
    id: "shotgunReticle",
    image: "assets/reticles/shotgunReticle.png",
    rarity: "Rare",
    cost: 500000,
    lore: "Fires wide. Hits loud. Cosmetic only. No gameplay advantage. For fun/visual use only.",
    effect: "Replaces reticle with explosive spread burst (visual only)"
  },
  {
    name: "Plopper Dot",
    id: "gunbrownReticle",
    image: "assets/reticles/gunbrownReticle.png",
    rarity: "Meme",
    cost: 100000,
    lore: "It stinks… but it sticks. Cosmetic only. No gameplay advantage. For fun/visual use only.",
    effect: "Replaces reticle with a pixel poop (visual only)"
  }
];

// Utility functions for inventory/shop logic can go here (see previous scaffolds)