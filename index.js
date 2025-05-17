// Disclaimer
console.log("DexHunt: Reflex Showdown is an independent game and is not affiliated with Nintendo or any other entity.");

// Optional: Show alert on first load
if (!localStorage.getItem("disclaimerShown")) {
  alert("DexHunt: Reflex Showdown is an independent game and is not affiliated with Nintendo or any other entity.");
  localStorage.setItem("disclaimerShown", "true");
}

// Existing game logic (from duel.html, message #39)
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
let cloud1, cloud2, cowboy;

// Animation state
let animations = [
  { img: null, x: canvas.width - 65, y: canvas.height - 50, width: 60, height: 60, animation: "cowboy", duration: 1000, lastUpdate: 0, loop: true, zIndex: 4 },
  { img: null, x: -100, y: 175, width: 300, height: 180, speed: 0.005, animation: "moveCloud", duration: 25000, lastUpdate: 0, loop: true, zIndex: 1 },
  { img: null, x: -100, y: 70, width: 240, height: 140, speed: 0.25, animation: "moveCloud", duration: 30000, lastUpdate: 0, loop: true, zIndex: 2 }
];

// DOM elements
const bang = document.getElementById("bang");
const countdown = document.getElementById("countdown");
const quickDraw = document.getElementById("quickDraw");
const log = document.getElementById("log");
const startBtn = document.querySelector(".start-btn");

function positionCowboy(anim) {
  anim.x = canvas.width - 60;  // adjust left/right
  anim.y = canvas.height - 140; // adjust up/down
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

  cowboy = new Image();
  cowboy.src = "assets/cowboy.png";
  cowboy.onload = () => console.log("Cowboy loaded");
  cowboy.onerror = () => {
    console.error("Failed to load cowboy.png");
    log.textContent = "Error loading cowboy asset. Refresh or check assets.";
  };
}

function animateElements(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  animations.sort((a, b) => a.zIndex - b.zIndex);

  animations.forEach((anim, index) => {
    if (!anim.img) {
      if (anim.animation === "cowboy") anim.img = cowboy;
      if (anim.animation === "moveCloud") {
        anim.img = (index === 1 && cloud1) ? cloud1 : (cloud2 || cloud1);
      }
    }

    if (anim.img && anim.img.complete && anim.img.naturalWidth > 0) {
      if (!anim.lastUpdate) anim.lastUpdate = timestamp;
      const elapsed = timestamp - anim.lastUpdate;
      const progress = (elapsed % anim.duration) / anim.duration;

      if (anim.animation === "moveCloud") {
        anim.x = -anim.width + (canvas.width + anim.width) * progress;
      }

      if (anim.animation === "cowboy") {
        positionCowboy(anim);

        if (!blinkTimer || timestamp - blinkTimer > 3000) {
          cowboyBlinking = true;
          blinkTimer = timestamp;
          setTimeout(() => cowboyBlinking = false, 200); // blink duration
        }

        anim.opacity = cowboyBlinking ? 0.6 : 1;
      }

      ctx.globalAlpha = anim.opacity || 1;
      ctx.drawImage(anim.img, anim.x, anim.y, anim.width, anim.height);
      ctx.globalAlpha = 1;
    } else {
      console.warn("Skipping draw: Image not ready or invalid:", anim.img?.src);
    }
  });

  if (hitEffect.active) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(hitEffect.x, hitEffect.y, hitEffect.radius, 0, Math.PI * 2);
    ctx.fill();
    hitEffect.radius += 2;
    if (hitEffect.radius > 50) hitEffect.active = false;
  }

  requestAnimationFrame(animateElements);
}

function resizeCanvas() {
  const wrapper = document.getElementById("backgroundWrapper");
  const canvas = document.getElementById("gameCanvas");

  if (!wrapper || !canvas) {
    console.error("Missing wrapper or canvas");
    return;
  }

  const bounds = wrapper.getBoundingClientRect();
  canvas.width = bounds.width;
  canvas.height = bounds.height;

  animations.forEach(anim => {
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
    .then(data => {
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
  if (duelStarted || !gameStarted) {
    console.log("Duel blocked: duelStarted=", duelStarted, "gameStarted=", gameStarted);
    return;
  }
  console.log("Starting duel");
  duelStarted = true;
  startBtn.classList.add("clicked");
  document.getElementById("startSound").play();
  startCountdown(() => {
    drawTime = performance.now();
    quickDraw.style.display = "block";
    document.getElementById("drawSound").play();

    const wrapper = document.getElementById("backgroundWrapper");
    const rect = wrapper.getBoundingClientRect();
    const powWidth = 120;
    const powHeight = 120;

    const minX = 20;
    const maxX = rect.width - powWidth - 20;
    const minY = 20;
    const maxY = rect.height / 2 - powHeight;

    const randX = Math.random() * (maxX - minX) + minX;
    const randY = Math.random() * (maxY - minY) + minY;

    bang.style.left = `${randX}px`;
    bang.style.top = `${randY}px`;
    bang.style.display = "block";
  });
}

function shoot() {
  const now = performance.now();
  if (!duelStarted) {
    console.log("Shoot ignored: duel not started");
    return;
  }

  document.getElementById("gunshot").play();
  setTimeout(() => {
    document.getElementById("resetSound").play();
  }, 300);

  if (drawTime === 0) {
    document.getElementById("toosoon").play();
    log.textContent = "Too soon! You fired before the signal.";
    resetDuel();
    return;
  }

  const reaction = Math.floor(now - drawTime);
  drawTime = 0;
  bang.style.display = "none";
  quickDraw.style.display = "none";

  hitEffect.active = true;
  hitEffect.x = parseFloat(bang.style.left) + 60;
  hitEffect.y = parseFloat(bang.style.top) + 60;
  hitEffect.radius = 10;

  document.getElementById("cowboyHitSound").volume = 0.8;
  document.getElementById("cowboyHitSound").play();

  let cowboyAnim = animations.find(a => a.animation === "cowboy");
  if (cowboyAnim) {
    let originalX = cowboyAnim.x;
    let originalY = cowboyAnim.y;
    let shakeIntensity = 6;
    let shakeDuration = 200;
    const shakeStart = Date.now();

    const flashCanvas = () => {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    const reward = 5 + Math.floor(Math.max(0, 300 - reaction) / 25);
    dexhuntBalance += reward;
    winStreak++;
    localStorage.setItem("DexHuntBalance", dexhuntBalance);
    if (!bestDraw || reaction < bestDraw) {
      bestDraw = reaction;
      localStorage.setItem("bestDraw", bestDraw);
    }
    document.getElementById("winSound").play();
    log.textContent = `🎯 Shot in ${reaction}ms! Earned ${reward} $DEXHUNT (simulated). Streak: ${winStreak}!`;
    lossStreak = 0;

    if (isConnected) {
      performMockSwap(reward);
    }

    if (winStreak === 3) {
      log.textContent += " 🤠 Nice streak! Keep it up!";
    } else if (winStreak === 5) {
      log.textContent += " 🔥 Hot shot! 5 wins in a row!";
      document.getElementById("mockRewardStatus").textContent = "Mock Reward Earned!";
    }
  } else {
    document.getElementById("loseSound").play();
    log.textContent = `Too slow! Your draw was ${reaction}ms. Streak ended.`;
    lossStreak++;
    winStreak = 0;
    if (lossStreak >= 5) {
      showDoubleOrNothing();
    }
  }

  updateWalletHUD();
  log.innerHTML += '<br><button id="stopButton" onclick="cancelAutoRestart()">🛑 STOP!</button>';

  resetDuel();
  duelTimeout = setTimeout(() => {
    const stopBtn = document.getElementById("stopButton");
    if (stopBtn) stopBtn.remove();
    log.textContent = "Auto-restarting duel to test your reflexes again!";
    startDuel();
  }, 2000);

  if (gameStarted && (lossStreak + dexhuntBalance / 5) % 3 === 0) {
    showNotification();
  }
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
}

function cancelAutoRestart() {
  console.log("Canceling auto-restart");
  clearTimeout(duelTimeout);
  duelTimeout = null;
  const stopBtn = document.getElementById("stopButton");
  if (stopBtn) stopBtn.remove();
  log.textContent = "Auto-restart canceled. Click 'Start Duel' when ready.";
  resetDuel();
}

function showDoubleOrNothing() {
  const doubleOrNothingPopup = document.getElementById("doubleOrNothingPopup");
  doubleOrNothingPopup.style.display = "block";
}

function startDoubleOrNothing() {
  const doubleOrNothingPopup = document.getElementById("doubleOrNothingPopup");
  doubleOrNothingPopup.style.display = "none";
  log.textContent = "Double or Nothing challenge started! Win to double your $DEXHUNT!";
  resetDuel();
  startDuel();
}

function declineDoubleOrNothing() {
  const doubleOrNothingPopup = document.getElementById("doubleOrNothingPopup");
  doubleOrNothingPopup.style.display = "none";
  lossStreak = 0;
  log.textContent = "Double or Nothing declined. Keep dueling!";
  resetDuel();
}

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

if (!localStorage.getItem("duelLogs")) {
  localStorage.setItem("duelLogs", JSON.stringify([]));
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
  }, 2000);

  window.addEventListener("click", playBackgroundMusic);
};

window.addEventListener("resize", resizeCanvas);

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
