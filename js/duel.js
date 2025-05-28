// filepath: c:\Users\Charl\TXSE\DexHunt.github.io\js\duel.js
function setGunCursor() {
  // Use cursorSkin for the cursor image, default to gunbrown
  let cursorSkin = localStorage.getItem("cursorSkin") || "gunbrown";
  // Point directly to your cursor folder
  const gunImageFile = `assets/cursors/${cursorSkin}.png`;
  document.body.style.cursor = `url(${gunImageFile}) 16 16, auto`;
}

if (!localStorage.getItem("initialDuelRewardGiven")) {
  localStorage.setItem("DexHuntBalance", "500000");
  localStorage.setItem("initialDuelRewardGiven", "true");
  dexhuntBalance = 500000;
  console.log("🎁 500,000 mock $DEXHUNT rewarded for entering duel!");

  // Visual popup
  const rewardToast = document.createElement("div");
  rewardToast.textContent = "🎉 You earned 500,000 $DEXHUNT for entering!";
  rewardToast.style.cssText = `
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    background: #222;
    color: #ffc107;
    padding: 1rem 2rem;
    font-family: 'Press Start 2P', monospace;
    border-radius: 12px;
    z-index: 9999;
    box-shadow: 0 0 12px #000;
    font-size: 0.85rem;
  `;
  document.body.appendChild(rewardToast);
  setTimeout(() => rewardToast.remove(), 6000); // Auto remove after 6 seconds
}

window.addEventListener("DOMContentLoaded", () => {
  setGunCursor();
  setReticleCursor();
});

window.addEventListener("storage", function(e) {
  if (e.key === "cursorSkin") setGunCursor();
  if (e.key === "reticleSkin" || e.key === "purchasedReticles") setReticleCursor();
});

// --- GAME LOGIC STARTS HERE ---
let duelStarted = false;
let drawTime = 0;
let duelTimeout = null;
let dexhuntBalance = parseInt(localStorage.getItem("DexHuntBalance")) || 0;
let bestDraw = parseInt(localStorage.getItem("bestDraw")) || null;
let lossStreak = 0;
let winStreak = 0;
let isConnected = false;
let gameStarted = false;
let walletPublicKey = null;
let hasInteracted = false;
let tutorialShown = localStorage.getItem("tutorialShown") === "true";
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let hitEffect = { active: false, x: 0, y: 0, radius: 10 };
let cowboyBlinking = false;
let blinkTimer = 0;

// Animation image variables
let cloud1, cloud2, cloud3, cloud4, cowboy, backgroundImg = new Image();
backgroundImg.src = "assets/DexHuntBackground.png";
console.log("Background image src:", backgroundImg.src);

// Animation state
let animations = [
  { img: null, x: canvas.width - 65, y: canvas.height - 50, width: 100, height: 100, animation: "cowboy", duration: 1000, lastUpdate: 0, loop: true, zIndex: 4 },
  { img: null, x: -200, y: 120, width: 820, height: 620, speed: 0.008, animation: "moveCloud", duration: 35000, lastUpdate: 0, loop: true, zIndex: 1 }, // Large, slow, high
  { img: null, x: -150, y: 200, width: 620, height: 460, speed: 0.018, animation: "moveCloud", duration: 25000, lastUpdate: 0, loop: true, zIndex: 2 }, // Medium, faster, lower
  { img: null, x: -100, y: 60, width: 660, height: 320, speed: 0.012, animation: "moveCloud", duration: 30000, lastUpdate: 0, loop: true, zIndex: 3 }, // Medium, mid
  { img: null, x: -300, y: 40, width: 880, height: 300, speed: 0.022, animation: "moveCloud", duration: 20000, lastUpdate: 0, loop: true, zIndex: 0 } // Small, fast, low
];

// DOM elements
const bang = document.getElementById("bang");
const countdown = document.getElementById("countdown");
const quickDraw = document.getElementById("quickDraw");
const log = document.getElementById("log");
const startBtn = document.querySelector(".start-btn");

function positionCowboy(anim) {
  anim.x = canvas.width - 105;
  anim.y = canvas.height - 120;
}

function preloadImages() {
  cloud1 = new Image();
  cloud1.src = "assets/cloud1.png";
  cloud1.onload = () => console.log("Cloud1 loaded");
  cloud1.onerror = () => {
    console.error("Failed to load cloud1.png");
    log.textContent = "Error loading cloud1.png. Refresh to try again.";
  };

  cloud2 = new Image();
  cloud2.src = "assets/cloud2.png";
  cloud2.onload = () => console.log("Cloud2 loaded");
  cloud2.onerror = () => {
    console.error("Failed to load cloud2.png");
    log.textContent = "Error loading cloud2.png. Using fallback.";
    cloud2 = cloud1; // Fallback to cloud1
  };

  cloud3 = new Image();
  cloud3.src = "assets/cloud3.png";
  cloud3.onload = () => console.log("Cloud3 loaded");
  cloud3.onerror = () => {
    console.error("Failed to load cloud3.png");
    log.textContent = "Error loading cloud3.png. Using fallback.";
    cloud3 = cloud1; // Fallback to cloud1
  };

  cloud4 = new Image();
  cloud4.src = "assets/cloud4.png";
  cloud4.onload = () => console.log("Cloud4 loaded");
  cloud4.onerror = () => {
    console.error("Failed to load cloud4.png");
    log.textContent = "Error loading cloud4.png. Using fallback.";
    cloud4 = cloud2; // Fallback to cloud2
  };

  cowboy = new Image();
  cowboy.src = "assets/cowboy.png";
  cowboy.onload = () => console.log("Cowboy loaded");
  cowboy.onerror = () => {
    console.error("Failed to load cowboy.png");
    log.textContent = "Error loading cowboy asset. Refresh or check assets.";
  };

  backgroundImg = new Image();
  backgroundImg.src = "assets/DexHuntBackground.png";
  backgroundImg.onload = () => console.log("Background image loaded");
  backgroundImg.onerror = () => {
    console.error("Failed to load background image");
    log.textContent = "Error loading background image. Refresh or check assets.";
  };
}

function animateElements(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the background image onto the canvas
  if (backgroundImg.complete && backgroundImg.naturalWidth > 0) {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  animations.sort((a, b) => a.zIndex - b.zIndex);

  animations.forEach((anim, index) => {
    if (!anim.img) {
      if (anim.animation === "cowboy") anim.img = cowboy;
      if (anim.animation === "moveCloud") {
        if (index === 1) anim.img = cloud1;
        if (index === 2) anim.img = cloud2;
        if (index === 3) anim.img = cloud3;
        if (index === 4) anim.img = cloud4;
      }
    }

    if (anim.img && anim.img.complete && anim.img.naturalWidth > 0) {
      if (!anim.lastUpdate) anim.lastUpdate = timestamp;
      const elapsed = timestamp - anim.lastUpdate;
      const progress = (elapsed % anim.duration) / anim.duration;

      if (anim.animation === "moveCloud") {
        anim.x = -anim.width + (canvas.width + anim.width) * progress;
        // Add vertical drift for realism
        anim.y += Math.sin(timestamp / (2000 + index * 800)) * 0.3; // Gentle up/down
      }

      if (anim.animation === "cowboy") {
        positionCowboy(anim);

        // Blink every 3 seconds
        if (!blinkTimer || timestamp - blinkTimer > 3000) {
          cowboyBlinking = true;
          blinkTimer = timestamp;
          setTimeout(() => cowboyBlinking = false, 200); // blink duration
        }

        // Set blink opacity
        anim.opacity = cowboyBlinking ? 0.6 : 1;

        // Cowboy animation
        if (timestamp - anim.lastUpdate > 100) {
          anim.x = canvas.width - 105 + Math.random() * 5 - 2; // Randomize x position slightly
          anim.y = canvas.height - 120 + Math.random() * 3 - 1; // Randomize y position slightly
          anim.lastUpdate = timestamp;
        }
      }

      ctx.globalAlpha = anim.opacity || 1;
      ctx.drawImage(anim.img, anim.x, anim.y, anim.width, anim.height);
      ctx.globalAlpha = 1;
    } else {
      console.warn("Skipping draw: Image not ready or invalid:", anim.img?.src);
    }
  });

  // Draw hit effect if active
  if (hitEffect.active) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(hitEffect.x, hitEffect.y, hitEffect.radius, 0, Math.PI * 2);
    ctx.fill();
    hitEffect.radius += 2;
    if (hitEffect.radius > 50) hitEffect.active = false;
  }

  // Draw reticle centered at mouseX, mouseY
  if (reticleImg && reticleImg.complete) {
    const size = 48; // or whatever size you want
    ctx.drawImage(reticleImg, mouseX - size/2, mouseY - size/2, size, size);
  }

  requestAnimationFrame(animateElements);
}

function resizeCanvas() {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;

  canvas.width = 1280;
  canvas.height = 800; // Match #backgroundWrapper height exactly

  animations.forEach(anim => {
    // Safety bounds for animation placement
    if (anim.y < 50) anim.y = 50;
    if (anim.y > canvas.height - anim.height - 20) {
      anim.y = canvas.height - anim.height - 20;
    }
    if (anim.animation === "cowboy") {
      positionCowboy(anim);
    }
  });
}

function showGameContent() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  } else {
    console.error("Error: Could not find #loadingScreen");
  }

  if (!localStorage.getItem("cookiesAccepted")) {
    document.getElementById("cookieConsent").style.display = "block";
  }

  if (!tutorialShown) {
    toggleTutorial();
  }
  gameStarted = true;
}

function acceptCookies() {
  localStorage.setItem("cookiesAccepted", "true");
  document.getElementById("cookieConsent").style.display = "none";
}

function checkJurisdiction() {
  fetch("https://ipapi.co/json/")
    .then(response => response.json())
    .then((data) => {
      const restricted = ["US", "CN", "CA", "FR", "SG", "IR", "KP", "SY", "CU", "AE", "QA", "NL"];
      if (restricted.includes(data.country_code)) {
      log.textContent = "⚠️ Access restricted in your region. Proceed at your own risk. All rewards are simulated with no real-world value. For the best experience, please zoom to 133% during beta. I am working on a scaling fix!";
      }
    })
    .catch(err => console.error("Jurisdiction check failed:", err));
}

function playBackgroundMusic() {
  if (!hasInteracted) {
    const bgMusic = document.getElementById("backgroundMusic");
    bgMusic.volume = 0.5;
    bgMusic.play().catch(err => console.error("Error playing music:", err));
    hasInteracted = true;
  }
}

function updateWalletHUD() {
  const hud = document.getElementById("walletHUD");
  hud.innerHTML = `💰 $DEXHUNT: ${dexhuntBalance} | ⚡ Best Draw: ${bestDraw || '--'}ms | 🔥 Streak: ${winStreak}`;
  if (winStreak >= 3) {
    hud.classList.add('streak-fire');
  } else {
    hud.classList.remove('streak-fire');
  }
}

function startCountdown(callback) {
  let count = 3;
  countdown.style.display = "block";
  countdown.innerText = count;

  const ticker = setInterval(() => {
    count--;
    if (count > 0) {
      countdown.innerText = count;
    } else {
      clearInterval(ticker);
      countdown.style.display = "none";
      callback();
    }
  }, 1000);
}

function startDuel() {
  if (duelStarted || !gameStarted) return;
  duelStarted = true;
  startBtn.classList.add("clicked");
  document.getElementById("startSound").play();
  startCountdown(() => {
    drawTime = performance.now();
    quickDraw.style.display = "block";
    document.getElementById("drawSound").play();

    // Get the background image or wrapper bounds
    const wrapper = document.getElementById("backgroundWrapper");
    const rect = wrapper.getBoundingClientRect();

    // POW image size (adjust if needed)
    const powWidth = 120;
    const powHeight = 120;

    // Calculate safe area inside the background
    const minX = 0;
    const maxX = rect.width - powWidth;
    const minY = 0;
    const maxY = rect.height - powHeight;

    // Random position within safe area
    const randX = Math.random() * (maxX - minX) + minX;
    const randY = Math.random() * (maxY - minY) + minY;

    // Position the POW image
    bang.style.left = `${randX}px`;
    bang.style.top = `${randY}px`;
    bang.style.display = "block";
  });
  // Re-enable Start Duel button if it was disabled
  startBtn.disabled = false;
}

let lastShotTime = 0;

// Add Reset Duel button next to Start Duel
function addResetDuelButton() {
  if (!document.getElementById('resetDuelBtn')) {
    const btn = document.createElement('button');
    btn.id = 'resetDuelBtn';
    btn.className = 'reset-btn';
    btn.textContent = 'Reset Duel';
    btn.onclick = () => {
      console.log('Manual reset triggered');
      resetDuel();
      log.textContent = 'Duel reset! Click Start Duel to play again.';
    };
    startBtn.parentNode.insertBefore(btn, startBtn.nextSibling);
  }
}
addResetDuelButton();

function updateDexhuntBalanceUI() {
  // Update any UI elements that show the balance (if needed)
  updateWalletHUD();
}

function giveReward(reaction) {
  const reward = 5 + Math.floor(Math.max(0, 300 - reaction) / 25);
  dexhuntBalance += reward;
  localStorage.setItem('DexHuntBalance', dexhuntBalance);
  updateDexhuntBalanceUI();
  console.log(`Reward given: +${reward} $DEXHUNT, new balance: ${dexhuntBalance}`);
  return reward;
}

function handleWin(reaction) {
  const reward = giveReward(reaction);
  winStreak++;
  lossStreak = 0;
  localStorage.setItem('winStreak', winStreak);
  // === Engagement features: XP and Daily Mission ===
  if (typeof addXP === 'function') addXP(10); // 10 XP per win (adjust as needed)
  if (typeof incrementDailyMissionProgress === 'function') incrementDailyMissionProgress();
  // --- END ENGAGEMENT FEATURES ---
  if (!bestDraw || reaction < bestDraw) {
    bestDraw = reaction;
    localStorage.setItem('bestDraw', bestDraw);
    document.getElementById('winSound').play();
    log.textContent = `🎯 Shot in ${reaction}ms! NEW BEST! Earned ${reward} $DEXHUNT (simulated). Streak: ${winStreak}!`;
    showConfetti();
    maybeShowMemePopup();
    console.log('New best draw:', bestDraw);
  } else {
    log.textContent = `🎯 Shot in ${reaction}ms! Earned ${reward} $DEXHUNT (simulated). Streak: ${winStreak}!`;
  }
  if (winStreak === 3) {
    log.textContent += ' 🤠 Nice streak! Keep it up!';
  } else if (winStreak === 5) {
    log.textContent += ' 🔥 Hot shot! 5 wins in a row!';
    document.getElementById('mockRewardStatus').textContent = 'Mock Reward Earned!';
    showConfetti();
  }
  updateWalletHUD();
  // Fire event for live feed
  window.dispatchEvent(new CustomEvent('dexhunt-win', { detail: { reaction, reward } }));
}

function handleLoss(reaction) {
  document.getElementById('loseSound').play();
  log.textContent = `Too slow! Your draw was ${reaction}ms. Streak ended.`;
  lossStreak++;
  winStreak = 0;
  localStorage.setItem('winStreak', winStreak);
  if (lossStreak >= 5) {
    showDoubleOrNothing();
  }
  updateWalletHUD();
  console.log('Loss registered. Streak reset.');
}

function handleTooSoon() {
  document.getElementById('toosoon').play();
  log.textContent = 'Too soon! You fired before the signal.';
  resetDuel();
  console.log('Too soon! No reward.');
}

// Patch shoot() to use new handlers
function shoot() {
  const nowMs = Date.now();
  if (nowMs - lastShotTime < 300) {
    alert('Whoa there, cowboy! Too fast. No auto-clickers allowed.');
    return;
  }
  lastShotTime = nowMs;
  const now = performance.now();
  if (!duelStarted) {
    console.log('Shoot ignored: duel not started');
    return;
  }
  document.getElementById('gunshot').play();
  setTimeout(() => {
    document.getElementById('resetSound').play();
  }, 300);
  if (drawTime === 0) {
    handleTooSoon();
    return;
  }
  const reaction = Math.floor(now - drawTime);
  drawTime = 0;
  bang.style.display = 'none';
  quickDraw.style.display = 'none';
  hitEffect.active = true;
  hitEffect.x = parseFloat(bang.style.left) + 60;
  hitEffect.y = parseFloat(bang.style.top) + 60;
  hitEffect.radius = 10;
  document.getElementById('cowboyHitSound').volume = 0.8;
  document.getElementById('cowboyHitSound').play();
  let cowboyAnim = animations.find(a => a.animation === 'cowboy');
  if (cowboyAnim) {
    let originalX = cowboyAnim.x;
    let originalY = cowboyAnim.y;
    let shakeIntensity = 6;
    let shakeDuration = 200;
    const shakeStart = Date.now();
    const flashCanvas = () => {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    };
    const shaker = setInterval(() => {
      const elapsed = Date.now() - shakeStart;
      if (elapsed > shakeDuration) {
        clearInterval(shaker);
        cowboyAnim.x = originalX;
        cowboyAnim.y = originalY;
      } else {
        cowboyAnim.x = originalX + (Math.random() - 0.5) * shakeIntensity;
        cowboyAnim.y = originalY + (Math.random() - 0.5) * shakeIntensity;
        flashCanvas();
      }
    }, 33);
  }
  if (reaction <= 600) {
    handleWin(reaction);
  } else {
    handleLoss(reaction);
  }
  handlePostRound();
}

function resetDuel() {
  console.log("Resetting duel");
  duelStarted = false;
  drawTime = 0;
  clearTimeout(duelTimeout);
  duelTimeout = null;
  bang.style.display = "none";
  quickDraw.style.display = "none";
  startBtn.classList.remove("clicked");
  showCowboyQuote();
}

let autoRestart = true;
let autoRestartTimeout = null;

function showStopButtonInLog() {
  log.innerHTML += `<br><button id="stopButton" class="stop-btn">🛑 STOP!</button>`;
  const stopBtn = document.getElementById("stopButton");
  if (stopBtn) stopBtn.onclick = cancelAutoRestart;
}

function cancelAutoRestart() {
  if (autoRestartTimeout) {
    clearTimeout(autoRestartTimeout);
    autoRestartTimeout = null;
  }
  const stopBtn = document.getElementById("stopButton");
  if (stopBtn) stopBtn.remove();
  log.textContent = "Auto-restart canceled. Click 'Start Duel' when ready.";
  duelStarted = false; // <-- Ensure duel can be started again
  startBtn.classList.remove("clicked"); // <-- Visually reset button
}

function handlePostRound() {
  showStopButtonInLog();
  autoRestartTimeout = setTimeout(() => {
    const stopBtn = document.getElementById("stopButton");
    if (stopBtn) stopBtn.remove();
    log.textContent = "Auto-restarting duel to test your reflexes again!";
    resetDuel();
    setTimeout(() => {
      startDuel();
    }, 500); // Small delay to ensure reset
  }, 3000);
}

// function showDoubleOrNothing() {
//   const doubleOrNothingPopup = document.getElementById("doubleOrNothingPopup");
//   doubleOrNothingPopup.style.display = "block";
// }

// function startDoubleOrNothing() {
//   const doubleOrNothingPopup = document.getElementById("doubleOrNothingPopup");
//   doubleOrNothingPopup.style.display = "none";
//   log.textContent = "Double or Nothing challenge started! Win to double your $DEXHUNT!";
//   resetDuel();
//   startDuel();
// }

// function declineDoubleOrNothing() {
//   const doubleOrNothingPopup = document.getElementById("doubleOrNothingPopup");
//   doubleOrNothingPopup.style.display = "none";
//   lossStreak = 0;
//   log.textContent = "Double or Nothing declined. Keep dueling!";
//   resetDuel();
// }

function toggleSettings() {
  const settingsPopup = document.getElementById("settingsPopup");
  settingsPopup.style.display = settingsPopup.style.display === "block" ? "none" : "block";
}

function toggleSound() {
  const sounds = document.querySelectorAll("audio:not(#backgroundMusic)");
  const isMuted = sounds[0].muted;
  sounds.forEach(s => {
    s.muted = !isMuted;
    s.volume = 0.6;
  });
  document.querySelector(".sound-toggle-btn").textContent = isMuted ? "Mute Sound" : "Unmute Sound";
}

function toggleBackgroundMusic() {
  const bgMusic = document.getElementById("backgroundMusic");
  bgMusic.muted = !bgMusic.muted;
  bgMusic.volume = 0.5;
  document.querySelector(".settings-popup button:nth-child(2)").textContent = bgMusic.muted ? "Unmute Music" : "Mute Music";
}

function resetStats() {
  dexhuntBalance = 0;
  bestDraw = null;
  winStreak = 0;
  lossStreak = 0;
  localStorage.setItem("DexHuntBalance", dexhuntBalance);
  localStorage.setItem("bestDraw", bestDraw);
  updateWalletHUD();
  log.textContent = "Stats reset! Start dueling to earn simulated rewards.";
  resetDuel();
}

function toggleLinksLeaderboard() {
  const leaderboardPopup = document.getElementById("leaderboardPopup");
  leaderboardPopup.style.display = leaderboardPopup.style.display === "block" ? "none" : "block";
  leaderboardPopup.innerHTML = `
    <h3>Stats</h3>
    <p>Best Draw: ${bestDraw || '--'}ms</p>
    <p>$DEXHUNT Balance: ${dexhuntBalance}</p>
    <p>Win Streak: ${winStreak}</p>
    <button class="share-btn" onclick="toggleLinksLeaderboard()">Close</button>
  `;
}

function toggleTutorial() {
  const tutorialPopup = document.getElementById("tutorialPopup");
  tutorialPopup.style.display = tutorialPopup.style.display === "block" ? "none" : "block";
}

function closeTutorial() {
  const tutorialPopup = document.getElementById("tutorialPopup");
  tutorialPopup.style.display = "none";
  localStorage.setItem("tutorialShown", "true");
  tutorialShown = true;
}

function toggleRewardsPopup() {
  const rewardsPopup = document.getElementById("rewardsPopup");
  rewardsPopup.style.display = rewardsPopup.style.display === "block" ? "none" : "block";
  document.getElementById("mockRewardStatus").textContent = winStreak >= 5 ? "Mock Reward Earned!" : "None";
}

function showNotification() {
  const notificationPopup = document.getElementById("notificationPopup");
  notificationPopup.style.display = "block";
}

function closeNotification() {
  const notificationPopup = document.getElementById("notificationPopup");
  notificationPopup.style.display = "none";
}

function toggleWalletPopup(force = null) {
  const walletPopup = document.getElementById("walletPopup");
  const isVisible = walletPopup.classList.contains("visible");

  if (force === true || (!isVisible && force !== false)) {
    walletPopup.classList.add("visible");
    walletPopup.style.display = "block";
  } else {
    walletPopup.classList.remove("visible");
    walletPopup.style.display = "none";
  }
}

function mockConnectWallet() {
  isConnected = true;
  walletPublicKey = "MockWallet123";
  document.getElementById("connectWalletBtn").textContent = "💼 Mock";
  document.getElementById("connectWalletBtn").onclick = disconnectWallet;
  document.getElementById("walletSound").play();
  log.textContent = "Mock wallet connected! $DEXHUNT rewards will be simulated.";
  toggleWalletPopup();
  updateWalletHUD();
  initJupiterSwapWidget();
}

function disconnectWallet() {
  isConnected = false;
  walletPublicKey = null;
  document.getElementById("connectWalletBtn").textContent = "💼";
  document.getElementById("connectWalletBtn").onclick = connectWallet;
  log.textContent = "Mock wallet disconnected.";
  updateWalletHUD();
  toggleWalletPopup();
}

function connectWallet() {
  toggleWalletPopup();
}

function initJupiterSwapWidget() {
  const widgetContainer = document.getElementById("jupiterSwapWidget");
  widgetContainer.innerHTML = `
    <p><strong>$DEXHUNT is a testnet-only token used for demo purposes during beta.</strong></p>
    <p>Swap and utility features are simulated and carry no real-world value.</p>
    <p>💡 Full utility (including in-game purchases and progression) will launch with the live token!</p>
  `;
}

function performMockSwap(amount) {
  log.textContent = `Simulating swap of ${amount} $DEXHUNT on Devnet...`;
  setTimeout(() => {
    log.textContent = `Mock swap complete: ${amount} $DEXHUNT processed!`;
  }, 2000);
}

// 🎯 Lightweight play tracking
let lastActivity = localStorage.getItem("lastPlayTimestamp");
if (!lastActivity) {
  localStorage.setItem("lastPlayTimestamp", Date.now());
} else {
  const now = Date.now();
  const diffHours = (now - parseInt(lastActivity)) / (1000 * 60 * 60);
  if (diffHours > 1) {
    console.log("🔍 Someone likely played recently. Last play was", new Date(parseInt(lastActivity)).toLocaleString());
  }
  localStorage.setItem("lastPlayTimestamp", now);
}

// ⌛ Duel history tracker
if (!localStorage.getItem("duelLogs")) {
  localStorage.setItem("duelLogs", JSON.stringify([]));
}

// Give new users 5 free duels if not set
if (!localStorage.getItem("freeDuelsLeft")) {
  localStorage.setItem("freeDuelsLeft", "5");
}
function getFreeDuelsLeft() {
  return parseInt(localStorage.getItem("freeDuelsLeft") || "0");
}
function useFreeDuel() {
  let left = getFreeDuelsLeft();
  if (left > 0) {
    localStorage.setItem("freeDuelsLeft", left - 1);
    return true;
  }
  return false;
}

// On first load, set starter gun and meme reticle if not set
if (!localStorage.getItem("cursorSkin")) {
  localStorage.setItem("cursorSkin", "gunbrown");
}
if (!localStorage.getItem("reticleSkin")) {
  localStorage.setItem("reticleSkin", "gunbrownReticle");
}
    window.onload = function () {
      console.log("window.onload triggered");
      preloadImages();
      resizeCanvas();
      requestAnimationFrame(animateElements);
      updateWalletHUD();
      checkJurisdiction();

      setTimeout(() => {
        showGameContent();
        // Show toast if coming from PixelShop
        if (document.referrer && document.referrer.includes("pixelshop.html")) {
          log.textContent = "Skin equipped! Ready to duel. Good luck, cowboy!";
        }
      }, 2000);

      window.addEventListener("click", playBackgroundMusic);
      setGunCursor(); // Ensure cursor is set on load
    };

    // 🔌 Detect Phantom and offer real connection if available
    window.addEventListener("load", () => {
      (async () => {
        if (window.solana && window.solana.isPhantom) {
          try {
            const resp = await window.solana.connect({ onlyIfTrusted: true });
            walletPublicKey = resp.publicKey.toString();
            isConnected = true;
            document.getElementById("connectWalletBtn").textContent = "💼 " + walletPublicKey.slice(0, 4) + "..." + walletPublicKey.slice(-4);
            document.getElementById("connectWalletBtn").onclick = disconnectWallet;
            log.textContent = `Real Phantom wallet connected: ${walletPublicKey}`;
            updateWalletHUD();
          } catch (err) {
            console.warn("Phantom installed but not connected.");
          }
        } else {
          console.warn("Phantom not detected. Defaulting to mock wallet.");
        }
      })();
    });

    // Confetti dopamine burst for big wins!
function showConfetti() {
  const confetti = document.getElementById('confetti');
  confetti.innerHTML = '';
  const emojis = ['💰','💥','🔥','🎉','🤠','⚡','⭐','🪙'];
  for (let i = 0; i < 24; i++) {
    const span = document.createElement('span');
    span.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    span.style.left = Math.random()*100 + 'vw';
    span.style.animationDelay = (Math.random()*0.5) + 's';
    confetti.appendChild(span);
  }
  confetti.style.display = 'block';
  setTimeout(() => { confetti.style.display = 'none'; }, 1400);
}

function maybeShowMemePopup() {
  if (Math.random() < 0.03) { // 3% chance on big win
    const memes = [
      "When you draw faster than your WiFi: 🚀",
      "That moment when you beat your own reflexes. 🤯",
      "DexHunt: The only place where cowboys use memes as ammo.",
      "You just unlocked: Certified Reflex Maniac! 🏆",
      "Share your score and flex on your friends! 💪"
    ];
    alert(memes[Math.floor(Math.random()*memes.length)]);
  }
}

function shareScore() {
  const text = `I just scored ${bestDraw || '--'}ms on DexHunt! 🤠💥 Can you beat me? https://dexhunt.xyz #DexHunt #ReflexGame`;
  if (navigator.share) {
    navigator.share({ text });
  } else {
    navigator.clipboard.writeText(text);
    alert("Copied! Paste this on X/Twitter or Discord and flex your score!");
  }
}

const cowboyQuotes = [
  "“Fast is fine, but accuracy is final.”",
  "“There’s a new sheriff in town.”",
  "“You miss 100% of the shots you don’t take.”",
  "“Stay quick, stay slick.”",
  "“Legends never reload.”"
];
function showCowboyQuote() {
  log.textContent += "\n" + cowboyQuotes[Math.floor(Math.random()*cowboyQuotes.length)];
}
// Call showCowboyQuote() after resetDuel() or on loss

let mouseX = 0, mouseY = 0;
let reticleImg = null;

// Load the equipped reticle image
function loadReticleImage() {
  let purchasedReticles = JSON.parse(localStorage.getItem("purchasedReticles") || '["blasterReticle"]');
  let reticleSkin = localStorage.getItem("reticleSkin") || "blasterReticle";
  if (!purchasedReticles.includes(reticleSkin)) reticleSkin = "blasterReticle";
  const reticle = (typeof reticles !== "undefined") ? reticles.find(r => r.id === reticleSkin) : null;
  reticleImg = new window.Image();
  reticleImg.src = reticle ? reticle.image : "assets/reticles/blasterReticle.png";
}
loadReticleImage();

// Add this alias to fix the error:
function setReticleCursor() {
  loadReticleImage();
}

// Update reticle if changed
window.addEventListener("storage", function(e) {
  if (e.key === "reticleSkin" || e.key === "purchasedReticles") loadReticleImage();
});

// Track mouse position over canvas
canvas.addEventListener("mousemove", function(e) {
  const rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
  mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
});

ctx.fillStyle = "green";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// New function to end the round and show the STOP button
function endRound() {
  // ...existing end-of-round logic...

  // Show STOP button
  document.getElementById('stopButtonContainer').style.display = 'block';

  // Start auto-restart countdown (e.g., 3 seconds)
  autoRestart = true;
  autoRestartTimeout = setTimeout(() => {
    if (autoRestart) {
      startDuel();
    }
    document.getElementById('stopButtonContainer').style.display = 'none';
  }, 3000);
}

// Persistent Audio objects for swoosh and grunt
const swooshAudio = new Audio('assets/sounds/swoosh-5-329226.mp3');
const gruntAudio = new Audio('assets/sounds/cowboy-hit-grunt.mp3');
swooshAudio.volume = 0.9;
gruntAudio.volume = 0.9;

// Add event listener to cowboy for click grunt effect
function addCowboyClickEffect() {
  // Find the cowboy animation object
  const cowboyAnim = animations.find(a => a.animation === "cowboy");
  if (!cowboyAnim) return;
  // Add a transparent div over the cowboy for click detection
  let cowboyDiv = document.getElementById('cowboyClickArea');
  if (!cowboyDiv) {
    cowboyDiv = document.createElement('div');
    cowboyDiv.id = 'cowboyClickArea';
    cowboyDiv.style.position = 'absolute';
    cowboyDiv.style.zIndex = 10;
    cowboyDiv.style.cursor = 'pointer';
    document.getElementById('backgroundWrapper').appendChild(cowboyDiv);
  }
  function updateCowboyDiv() {
    cowboyDiv.style.left = cowboyAnim.x + 'px';
    cowboyDiv.style.top = cowboyAnim.y + 'px';
    cowboyDiv.style.width = cowboyAnim.width + 'px';
    cowboyDiv.style.height = cowboyAnim.height + 'px';
  }
  // Update position every frame
  function updateLoop() {
    updateCowboyDiv();
    requestAnimationFrame(updateLoop);
  }
  updateLoop();
  cowboyDiv.onclick = function() {
    // Stop swoosh if playing
    if (!swooshAudio.paused) {
      swooshAudio.pause();
      swooshAudio.currentTime = 0;
    }
    // Play grunt
    gruntAudio.currentTime = 0;
    gruntAudio.play();
    // Cowboy shake effect
    let shakeIntensity = 8;
    let shakeDuration = 200;
    let originalX = cowboyAnim.x;
    let originalY = cowboyAnim.y;
    const shakeStart = Date.now();
    const shaker = setInterval(() => {
      const elapsed = Date.now() - shakeStart;
      if (elapsed > shakeDuration) {
        clearInterval(shaker);
        cowboyAnim.x = originalX;
        cowboyAnim.y = originalY;
      } else {
        cowboyAnim.x = originalX + (Math.random() - 0.5) * shakeIntensity;
        cowboyAnim.y = originalY + (Math.random() - 0.5) * shakeIntensity;
      }
    }, 33);
  };
}
window.addEventListener('DOMContentLoaded', addCowboyClickEffect);

// Play swoosh sound when POW appears
function playSwooshOnBang() {
  const bang = document.getElementById('bang');
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      if (bang.style.display === 'block') {
        // Stop grunt if playing
        if (!gruntAudio.paused) {
          gruntAudio.pause();
          gruntAudio.currentTime = 0;
        }
        // Play swoosh
        swooshAudio.currentTime = 0;
        swooshAudio.play();
      }
    });
  });
  observer.observe(bang, { attributes: true, attributeFilter: ['style'] });
}
window.addEventListener('DOMContentLoaded', playSwooshOnBang);

// --- BURN LOGIC & TOKENOMICS MODAL ---
const DEXHUNT_CA = "0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF"; // Replace with real CA
let totalBurned = parseInt(localStorage.getItem('DexHuntTotalBurned')) || 0;

function updateBurnedUI() {
  const burnedEl = document.getElementById('burnedAmount');
  if (burnedEl) burnedEl.textContent = totalBurned;
}

function burnDexhunt() {
  const amount = parseInt(prompt("How much $DEXHUNT do you want to burn?", "100"));
  if (!amount || amount <= 0) return;
  // Use central burn handler if available
  if (typeof handleDexhuntBurn === "function") {
    alert('Burning is disabled until after the bonding curve launch.');
    return;
  } else {
    // Fallback (should not be needed)
    if (amount > dexhuntBalance) {
      alert("Not enough $DEXHUNT to burn!");
      return;
    }
    dexhuntBalance -= amount;
    let totalBurned = parseInt(localStorage.getItem('DexHuntTotalBurned')) || 0;
    totalBurned += amount;
    localStorage.setItem('DexHuntBalance', dexhuntBalance);
    localStorage.setItem('DexHuntTotalBurned', totalBurned);
    updateWalletHUD();
    updateBurnedUI();
    showBurnEffect(amount);
    log.textContent = `🔥 Burned ${amount} $DEXHUNT! Total burned: ${totalBurned}`;
  }
}

function showBurnEffect(amount) {
  // Simple burn animation (can be improved)
  const burnDiv = document.createElement('div');
  burnDiv.textContent = `🔥 -${amount} $DEXHUNT burned!`;
  burnDiv.style.position = 'fixed';
  burnDiv.style.left = '50%';
  burnDiv.style.top = '50%';
  burnDiv.style.transform = 'translate(-50%, -50%)';
  burnDiv.style.fontSize = '2rem';
  burnDiv.style.color = '#ff4500';
  burnDiv.style.zIndex = 9999;
  burnDiv.style.pointerEvents = 'none';
  document.body.appendChild(burnDiv);
  setTimeout(() => { burnDiv.remove(); }, 1500);
}

function showTokenomicsModal() {
  const modal = document.getElementById('tokenomicsModal');
  if (modal) modal.style.display = 'block';
}
function closeTokenomicsModal() {
  const modal = document.getElementById('tokenomicsModal');
  if (modal) modal.style.display = 'none';
}

// Add Tokenomics and Burn buttons after DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  // Burn button
  if (!document.getElementById('burnBtn')) {
    const burnBtn = document.createElement('button');
    burnBtn.id = 'burnBtn';
    burnBtn.className = 'burn-btn';
    burnBtn.textContent = '🔥 Burn $DEXHUNT';
    burnBtn.onclick = burnDexhunt;
    const hud = document.getElementById('walletHUD');
    if (hud) hud.appendChild(burnBtn);
  }
  // Tokenomics button
  if (!document.getElementById('tokenomicsBtn')) {
    const tokenomicsBtn = document.createElement('button');
    tokenomicsBtn.id = 'tokenomicsBtn';
    tokenomicsBtn.className = 'tokenomics-btn';
    tokenomicsBtn.textContent = '📊 Tokenomics (Post Bonding Curve)';
    tokenomicsBtn.onclick = showTokenomicsModal;
    document.body.appendChild(tokenomicsBtn);
  }
  updateBurnedUI();
});
