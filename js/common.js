// js/common.js
// Shared UI logic for DexHunt: leaderboard, stat animation, meme/confetti popup, viral challenge, live feed, etc.

// --- Live Feed ---
function addLiveFeed(msg) {
  const feed = document.getElementById('liveFeed');
  if (!feed) return;
  const div = document.createElement('div');
  div.textContent = msg;
  div.style.marginBottom = '0.5rem';
  feed.insertBefore(div, feed.firstChild);
  // Limit to 20 messages
  while (feed.children.length > 20) feed.removeChild(feed.lastChild);
}

// --- Leaderboard Feed ---
function updateLeaderboardFeed() {
  const lb = document.getElementById('leaderboardFeed');
  if (!lb) return;
  let bestDraw = localStorage.getItem('bestDraw') || '--';
  let totalBurned = localStorage.getItem('DexHuntTotalBurned') || '0';
  let topStreak = localStorage.getItem('streak') || '0';
  lb.innerHTML = `
    <b>Your Best Draw:</b> <span id='bestDrawVal'>${bestDraw}</span>ms<br>
    <b>Total Burned:</b> <span id='burnedVal'>${totalBurned}</span> $DEXHUNT<br>
    <b>Top Streak:</b> <span id='streakVal'>${topStreak}</span>
  `;
  animateStat('bestDrawVal', bestDraw);
  animateStat('burnedVal', totalBurned);
  animateStat('streakVal', topStreak);
}

// --- Stat Animation ---
function animateStat(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  let end = parseInt(value.replace(/[\D]/g, '')) || 0;
  if (isNaN(end)) { el.textContent = value; return; }
  let duration = 700;
  let startTime = null;
  function animate(ts) {
    if (!startTime) startTime = ts;
    let progress = Math.min((ts - startTime) / duration, 1);
    el.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) requestAnimationFrame(animate);
    else el.textContent = value;
  }
  requestAnimationFrame(animate);
}

// --- Global Stats (mock dynamic for demo) ---
function updateGlobalStats() {
  const stats = document.getElementById('globalStats');
  if (!stats) return;
  let globalBest = 187 - Math.floor(Math.random()*5); // 182-187ms
  let topStreak = 12 + Math.floor(Math.random()*3); // 12-14
  let totalBurned = (1234567 + Math.floor(Math.random()*10000)).toLocaleString();
  stats.innerHTML = `<b>Global Best:</b> ${globalBest}ms | <b>Top Streak:</b> ${topStreak} | <b>Total Burned:</b> ${totalBurned} $DEXHUNT <span style='cursor:help;' title='Mock stats for demo. Real stats coming soon!'>ℹ️</span>`;
}

// --- Meme/Viral Features ---
const memePhrases = [
  "That draw was faster than a jackrabbit on a hot skillet! 🐇🔥",
  "You just outgunned Sawn-Off Slim! 💥🤠",
  "Streak hotter than a desert noon! 🌵☀️",
  "Flexin' that trigger finger! 💪🔫",
  "Legend of the Wild West leaderboard! 🏆💀",
  "Meme-worthy reflexes! Share it! 🧑‍🌾🚀"
];
function showMemePopup(text) {
  const popup = document.getElementById('memePopup');
  if (!popup) return;
  document.getElementById('memeContent').textContent = text;
  popup.style.display = 'block';
  showConfetti();
}
function closeMemePopup() {
  const popup = document.getElementById('memePopup');
  if (popup) popup.style.display = 'none';
}
document.addEventListener('DOMContentLoaded', function() {
  const copyBtn = document.getElementById('copyMemeBtn');
  if (copyBtn) {
    copyBtn.onclick = function() {
      const meme = document.getElementById('memeContent').textContent;
      navigator.clipboard.writeText(meme);
      this.textContent = 'Copied!';
      setTimeout(()=>{this.textContent='Copy Meme';},1200);
    };
  }
});

// --- Confetti Burst ---
// Shows a confetti burst using emoji for meme popups and rewards.
function showConfetti() {
  const confetti = document.getElementById('confetti');
  if (!confetti) return;
  confetti.innerHTML = '';
  confetti.style.display = 'block';
  const emojis = ['💰','🌵','💀','🧑‍🌾','🔥','🤠','🏆','⚡'];
  for (let i=0; i<18; i++) {
    confetti.appendChild(createConfettiEmoji(emojis));
  }
  setTimeout(()=>{confetti.style.display='none';}, 1800);
}

// Helper: Create a confetti emoji span with random position and delay
function createConfettiEmoji(emojis) {
  const span = document.createElement('span');
  span.textContent = emojis[Math.floor(Math.random()*emojis.length)];
  span.style.left = Math.random()*100 + 'vw';
  span.style.top = '-40px';
  span.style.animationDelay = (Math.random()*0.7)+'s';
  return span;
}

// --- Coin Drop Animation ---
// Shows a burst of coin emojis falling from the top of the screen.
function showCoinDrop(count = 12) {
  let coinDrop = document.getElementById('coinDrop');
  if (!coinDrop) {
    coinDrop = document.createElement('div');
    coinDrop.id = 'coinDrop';
    coinDrop.style.position = 'fixed';
    coinDrop.style.left = '0';
    coinDrop.style.top = '0';
    coinDrop.style.width = '100vw';
    coinDrop.style.height = '100vh';
    coinDrop.style.pointerEvents = 'none';
    coinDrop.style.zIndex = '3000';
    coinDrop.style.overflow = 'hidden';
    document.body.appendChild(coinDrop);
  }
  coinDrop.innerHTML = '';
  coinDrop.style.display = 'block';
  for (let i = 0; i < count; i++) {
    coinDrop.appendChild(createCoinDropSpan());
  }
  setTimeout(() => { coinDrop.style.display = 'none'; }, 1600);
}

// Helper: Create a coin drop span with random position, size, and delay
function createCoinDropSpan() {
  const span = document.createElement('span');
  span.textContent = '💰';
  span.style.position = 'absolute';
  span.style.left = (Math.random() * 90 + 5) + 'vw';
  span.style.top = '-40px';
  span.style.fontSize = (1.6 + Math.random() * 1.2) + 'rem';
  span.style.opacity = 0.92;
  span.style.animation = `coin-drop-fall 1.2s cubic-bezier(.4,1.6,.6,1) forwards`;
  span.style.animationDelay = (Math.random() * 0.5) + 's';
  return span;
}

// --- Share Score Button ---
// Returns the share text for the user's best draw and streak.
function getShareText() {
  const bestDraw = localStorage.getItem('bestDraw') || '--';
  const streak = localStorage.getItem('streak') || '0';
  return `My best draw on #DexHunt: ${bestDraw}ms, streak: ${streak}! Skill-to-Win cowboy reflexes. Try to beat me: https://dexhunt.io`;
}

// Sets up the share score button to open a pre-filled tweet.
function setupShareScoreButton() {
  const shareBtn = document.getElementById('shareScoreBtn');
  if (shareBtn) {
    shareBtn.onclick = function() {
      const text = getShareText();
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    };
  }
}
document.addEventListener('DOMContentLoaded', setupShareScoreButton);

// --- Flex Your Streak Button ---
// Shows the flex streak button if available.
function showFlexStreakBtn() {
  const btn = document.getElementById('flexStreakBtn');
  if (btn) btn.style.display = 'inline-block';
}

// Sets up the flex streak button to show a meme popup.
function setupFlexStreakButton() {
  const flexBtn = document.getElementById('flexStreakBtn');
  if (flexBtn) {
    flexBtn.onclick = function() {
      const streak = localStorage.getItem('streak') || '0';
      const meme = `I'm on a ${streak} win streak in #DexHunt! Can you beat my reflexes? 🧑‍🌾🔥 https://dexhunt.io`;
      showMemePopup(meme);
    };
  }
}
document.addEventListener('DOMContentLoaded', setupFlexStreakButton);

// --- Viral Challenge Status Logic ---
// Updates the viral challenge status based on streak and best draw time.
function updateChallengeStatus() {
  const streak = parseInt(localStorage.getItem('streak')||'0');
  const bestDraw = parseInt(localStorage.getItem('bestDraw')||'9999');
  let status = 'Not started';
  if (streak >= 3 && bestDraw < 400) {
    status = 'Completed! Flex it!';
    showFlexStreakBtn();
  } else if (streak > 0) {
    status = `In progress: ${streak}/3 wins under 400ms`;
  }
  const el = document.getElementById('challengeStatus');
  if (el) el.textContent = status;
}

// --- Event Listeners for Live Feed and UI Updates ---
// Handles custom events for burns, wins, losses, and memes.
function setupDexHuntEventListeners() {
  window.addEventListener('dexhunt-burn', e => {
    addLiveFeed(`Burned ${e.detail.amount} $DEXHUNT!`, 'burn');
    updateLeaderboardFeed();
    updateGlobalStats();
  });
  window.addEventListener('dexhunt-win', e => {
    addLiveFeed(`Quick Draw: ${e.detail.reaction}ms! +${e.detail.reward} $DEXHUNT`, 'win');
    updateLeaderboardFeed();
    updateGlobalStats();
    // Show meme popup randomly or on streak milestones
    const streak = parseInt(localStorage.getItem('streak')||'0');
    if (streak > 0 && streak % 3 === 0) {
      showMemePopup(memePhrases[Math.floor(Math.random()*memePhrases.length)]);
      showFlexStreakBtn();
    }
    updateChallengeStatus();
  });
  window.addEventListener('dexhunt-loss', e => {
    addLiveFeed(`Too slow! ${e.detail.reaction}ms`, 'loss');
    updateChallengeStatus();
  });
  window.addEventListener('dexhunt-meme', e => {
    addLiveFeed(e.detail.text, 'meme');
  });
}
setupDexHuntEventListeners();

document.addEventListener('DOMContentLoaded', function() {
  updateLeaderboardFeed();
  updateGlobalStats();
  addLiveFeed('Welcome to DexHunt!');
  updateChallengeStatus();
});

// --- Share for Free Gun Modal Logic ---
// Returns the n lowest-priced guns from the global guns array.
function getLowestPricedGuns(n = 3) {
  if (!window.guns) return [];
  return [...guns].sort((a, b) => a.cost - b.cost).slice(0, n);
}
// Shows the modal for claiming a free gun after sharing.
function showShareForGunModal() {
  // Remove if already present
  let modal = document.getElementById('shareForGunModal');
  if (modal) modal.remove();
  // Modal HTML
  const guns = getLowestPricedGuns();
  let gunOptions = guns.map(gun => `
    <label style='display:inline-block;margin:0.5em 1em 0.5em 0;cursor:pointer;'>
      <input type='radio' name='freeGun' value='${gun.id}' style='margin-right:0.5em;'>
      <img src='${gun.image}' alt='${gun.name}' style='width:48px;height:auto;vertical-align:middle;margin-right:0.3em;'>
      <b>${gun.name}</b> <span style='color:#ffc107;'>(${gun.rarity})</span>
    </label>
  `).join('');
  modal = document.createElement('div');
  modal.id = 'shareForGunModal';
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:4000;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style='background:#222;padding:2.2em 2.2em 1.5em 2.2em;border-radius:18px;max-width:420px;text-align:center;box-shadow:0 8px 32px #000a;'>
      <h2 style='color:#ffc107;margin-bottom:0.5em;'>Claim Your Free Gun! 💰🔫</h2>
      <p style='color:#fff;font-size:1.1em;'>Paste your tweet URL below to unlock <b>one of these guns</b>—your choice!<br><span style='color:#00ff99;'>Share your DexHunt score or meme, then claim your reward instantly!</span></p>
      <input id='tweetUrlInput' type='url' placeholder='Paste your tweet URL here' style='width:90%;margin:1em 0 1em 0;padding:0.6em;border-radius:8px;border:1px solid #ffc107;font-size:1em;'>
      <div style='margin-bottom:1em;'>${gunOptions}</div>
      <button id='claimFreeGunBtn' class='share-btn' style='font-size:1.1em;padding:0.7em 2em;'>Claim My Free Gun!</button>
      <div id='freeGunError' style='color:#ff4444;margin-top:0.7em;display:none;'></div>
      <button onclick='document.getElementById("shareForGunModal").remove()' style='margin-top:1.2em;background:#333;color:#ffc107;border-radius:8px;padding:0.5em 1.5em;cursor:pointer;'>Cancel</button>
    </div>
  `;
  document.body.appendChild(modal);
  showCoinDrop(18);
  document.getElementById('claimFreeGunBtn').onclick = function() {
    const url = document.getElementById('tweetUrlInput').value.trim();
    const gunId = (modal.querySelector('input[name="freeGun"]:checked')||{}).value;
    const errorDiv = document.getElementById('freeGunError');
    errorDiv.style.display = 'none';
    if (!url || !/^https?:\/\/(x|twitter)\.com\//.test(url)) {
      errorDiv.textContent = 'Please paste a valid tweet URL.';
      errorDiv.style.display = 'block';
      return;
    }
    if (!gunId) {
      errorDiv.textContent = 'Please select a gun to claim!';
      errorDiv.style.display = 'block';
      return;
    }
    // Add gun to inventory
    let owned = JSON.parse(localStorage.getItem('purchasedGuns') || '[]');
    if (!owned.includes(gunId)) {
      owned.push(gunId);
      localStorage.setItem('purchasedGuns', JSON.stringify(owned));
      showToast('Free gun added to your inventory!');
      if (typeof renderInventory === 'function') renderInventory('inventory');
      if (typeof renderGunShop === 'function') renderGunShop('gun-shop');
    } else {
      showToast('You already own this gun!');
    }
    modal.remove();
  };
}
// Wires up share buttons to show the free gun modal after sharing.
function setupShareForGunModalButtons() {
  const ids = ['shareScoreBtn','shareShopMemeBtn','flexStreakBtn'];
  ids.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', function() {
        setTimeout(showShareForGunModal, 1200); // Show after share window
      });
    }
  });
}
window.addEventListener('DOMContentLoaded', setupShareForGunModalButtons);

// === Daily Mission Logic ===
// Handles daily mission state, progress, and UI updates.
const DAILY_MISSION_KEY = 'dexhunt_daily_mission';
const DAILY_MISSION_PROGRESS_KEY = 'dexhunt_daily_mission_progress';
const XP_KEY = 'dexhunt_xp';
const SESSION_START_KEY = 'dexhunt_session_start';

function getTodayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
}

function getDailyMission() {
  // Example: Win 5 duels today for a bonus
  let mission = localStorage.getItem(DAILY_MISSION_KEY);
  let today = getTodayStr();
  if (!mission || !mission.startsWith(today)) {
    // Randomize mission type in future; for now, always win 5 duels
    mission = today + '|win_duels|5';
    localStorage.setItem(DAILY_MISSION_KEY, mission);
    localStorage.setItem(DAILY_MISSION_PROGRESS_KEY, '0');
  }
  return mission.split('|');
}

function getDailyMissionProgress() {
  return parseInt(localStorage.getItem(DAILY_MISSION_PROGRESS_KEY) || '0', 10);
}

function incrementDailyMissionProgress() {
  let progress = getDailyMissionProgress() + 1;
  localStorage.setItem(DAILY_MISSION_PROGRESS_KEY, progress);
  updateDailyMissionUI();
  if (progress >= 5) {
    showDailyMissionReward();
  }
}

function updateDailyMissionUI() {
  const [today, type, goal] = getDailyMission();
  const progress = getDailyMissionProgress();
  const content = document.getElementById('dailyMissionContent');
  const progressDiv = document.getElementById('dailyMissionProgress');
  if (content && progressDiv) {
    content.innerHTML = `Win <b>${goal}</b> duels today for a bonus reward!`;
    let percent = Math.min(100, Math.round((progress/goal)*100));
    progressDiv.innerHTML = `<div style='background:#232323;border-radius:8px;height:18px;overflow:hidden;'><div style='height:100%;width:${percent}%;background:linear-gradient(90deg,#ffc34d,#00ff99);transition:width 0.5s;'></div></div><span style='color:#ffc34d;'>${progress} / ${goal} duels won</span>`;
    if (progress >= goal) {
      progressDiv.innerHTML += `<div style='color:#00ff99;font-weight:bold;margin-top:0.5em;'>Mission Complete! 🎉<br>Claim your reward below.</div>`;
    }
  }
}

function showDailyMissionReward() {
  // Confetti burst and XP bonus
  showConfetti();
  addXP(50); // Example: 50 XP for daily mission
  setTimeout(() => {
    const content = document.getElementById('dailyMissionContent');
    if (content) content.innerHTML += '<br><span style="color:#00ff99;font-weight:bold;">+50 XP!</span>';
  }, 500);
}

function toggleDailyMissionPopup() {
  const popup = document.getElementById('dailyMissionPopup');
  if (!popup) return;
  if (popup.style.display === 'none' || popup.style.display === '') {
    updateDailyMissionUI();
    popup.style.display = 'block';
  } else {
    popup.style.display = 'none';
  }
}

// === Session Timer & XP Bar ===
// Handles session timer and XP bar updates.
let sessionStart = parseInt(localStorage.getItem(SESSION_START_KEY) || '0', 10);
if (!sessionStart || isNaN(sessionStart)) {
  sessionStart = Date.now();
  localStorage.setItem(SESSION_START_KEY, sessionStart);
}
function updateSessionTimer() {
  const timerSpan = document.getElementById('sessionTimer');
  if (!timerSpan) return;
  let now = Date.now();
  let elapsed = Math.floor((now - sessionStart)/1000);
  let min = Math.floor(elapsed/60);
  let sec = elapsed%60;
  timerSpan.textContent = `Session: ${min}m ${sec.toString().padStart(2,'0')}s`;
}
setInterval(updateSessionTimer, 1000);

function getXP() {
  return parseInt(localStorage.getItem(XP_KEY) || '0', 10);
}
function addXP(amount) {
  let xp = getLevelXP() + amount;
  let level = getLevel();
  let xpNeeded = getXPForLevel(level);
  let leveledUp = false;
  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level++;
    setLevel(level);
    leveledUp = true;
    showLevelUpReward(level);
    xpNeeded = getXPForLevel(level);
  }
  setLevelXP(xp);
  localStorage.setItem('XP_KEY', (level-1)*BASE_XP + xp); // for legacy
  updateXPBar();
  if (leveledUp) showConfetti();
}
function updateXPBar() {
  const xpBar = document.getElementById('xpBar');
  const xpLabel = document.getElementById('xpLabel');
  let level = getLevel();
  let xp = getLevelXP();
  let xpNeeded = getXPForLevel(level);
  let percent = Math.min(100, Math.round((xp/xpNeeded)*100));
  if (xpBar) xpBar.style.width = percent + '%';
  if (xpLabel) xpLabel.textContent = `XP: ${xp} / ${xpNeeded}  (Level ${level})`;
}

// === Dynamic Level System ===
// Handles level, XP, and level-up logic.
const LEVEL_KEY = 'dexhunt_level';
const LEVEL_XP_KEY = 'dexhunt_level_xp';
const BASE_XP = 100;
const LEVEL_MULTIPLIER = 1.5;

function getLevel() {
  return parseInt(localStorage.getItem(LEVEL_KEY) || '1', 10);
}
function setLevel(level) {
  localStorage.setItem(LEVEL_KEY, level);
}
function getLevelXP() {
  return parseInt(localStorage.getItem(LEVEL_XP_KEY) || '0', 10);
}
function setLevelXP(xp) {
  localStorage.setItem(LEVEL_XP_KEY, xp);
}
function getXPForLevel(level) {
  return Math.floor(BASE_XP * Math.pow(LEVEL_MULTIPLIER, level - 1));
}

// --- Level-Up Reward Modal ---
// Shows a modal with a random simulated/cosmetic reward for leveling up.
function showLevelUpReward(level) {
  // Legal, fun, and productive reward pool
  const rewards = [
    { type: 'cosmetic', msg: 'You unlocked a new hat! (Cosmetic only)', legal: true },
    { type: 'badge', msg: 'Badge unlocked: Quick Draw!', legal: true },
    { type: 'meme', msg: 'New meme unlocked! Check the meme generator.', legal: true },
    { type: 'sim-burn', msg: '🔥 10 $DEXHUNT burned for the community! (Simulated, for future scarcity)', legal: true },
    { type: 'sim-bonus', msg: '+25 $DEXHUNT bonus! (Simulated, no real value)', legal: true },
    { type: 'challenge', msg: 'New daily challenge unlocked!', legal: true }
  ];
  // Always legal, no real-world value, all simulated or cosmetic
  const reward = rewards[Math.floor(Math.random()*rewards.length)];
  // Simulate burn or bonus
  if (reward.type === 'sim-burn' && typeof handleDexhuntBurn === 'function') {
    alert('Burning is disabled until after the bonding curve launch.');
    return;
  }
  if (reward.type === 'sim-bonus') {
    let bal = parseInt(localStorage.getItem('DexHuntBalance')||'0',10);
    bal += 25;
    localStorage.setItem('DexHuntBalance', bal);
    if (typeof updateWalletHUD === 'function') updateWalletHUD();
  }
  // Show modal
  let modal = document.getElementById('levelUpModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'levelUpModal';
    modal.className = 'leaderboard-popup';
    modal.style.display = 'none';
    modal.style.maxWidth = '420px';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `<h3>🎉 Level Up! (Level ${level})</h3><div style='margin:1em 0;font-size:1.1em;'>${reward.msg}</div><button class='share-btn' onclick='document.getElementById("levelUpModal").style.display="none";'>Close</button><div style='margin-top:0.7em;font-size:0.9em;color:#ffc34d;'>All rewards are simulated, cosmetic, or for fun. No real-world value. $DEXHUNT burns are simulated for future on-chain scarcity.</div>`;
  modal.style.display = 'block';
}

// Patch: On page load, update XP bar and level
window.addEventListener('DOMContentLoaded', () => {
  updateSessionTimer();
  updateXPBar();
  updateDailyMissionUI();
});

// Cowboy image click/animation logic for index.html
// Sets up click handler for the cowboy image, animates movement, sound, and confetti.
function setupCowboyAnimation() {
  const cowboyImg = document.getElementById('cowboyImg');
  const gruntAudio = document.getElementById('gruntAudio');
  const yeehawAudio = document.getElementById('yeehawAudio');
  const heroSection = document.querySelector('.hero');
  let cowboyClicks = 0;
  if (cowboyImg && gruntAudio && yeehawAudio && heroSection) {
    cowboyImg.addEventListener('click', () => {
      playGrunt(gruntAudio);
      const { left, top, imgRect } = getRandomCowboyPosition(heroSection, cowboyImg);
      animateCowboyMove(cowboyImg, left, top);
      cowboyClicks++;
      if (cowboyClicks % 5 === 0 && yeehawAudio) {
        playYeehaw(yeehawAudio, heroSection, left, imgRect, top);
      }
    });
  }
}

// Play grunt sound effect
function playGrunt(audio) {
  audio.currentTime = 0;
  audio.play();
}

// Calculate a random position for the cowboy image within the hero section
function getRandomCowboyPosition(heroSection, cowboyImg) {
  const heroRect = heroSection.getBoundingClientRect();
  const imgRect = cowboyImg.getBoundingClientRect();
  const maxLeft = heroRect.width - imgRect.width - 20;
  const maxTop = heroRect.height - imgRect.height - 20;
  const left = Math.random() * maxLeft + 10;
  const top = Math.random() * maxTop + 10;
  return { left, top, imgRect };
}

// Animate cowboy movement and rotation
function animateCowboyMove(cowboyImg, left, top) {
  cowboyImg.style.transition = 'transform 0.25s, left 0.4s, top 0.4s';
  cowboyImg.style.transform = 'rotate(' + (Math.random() * 40 - 20) + 'deg) scale(1.15)';
  cowboyImg.style.left = left + 'px';
  cowboyImg.style.top = top + 'px';
  setTimeout(() => {
    cowboyImg.style.transform = '';
  }, 300);
}

// Play yeehaw sound, show text, and spawn confetti
function playYeehaw(audio, heroSection, left, imgRect, top) {
  audio.currentTime = 0;
  audio.play();
  // Show YEEHAW! text
  const yeehaw = document.createElement('div');
  yeehaw.className = 'yeehaw-effect';
  yeehaw.textContent = 'YEEHAW!';
  heroSection.appendChild(yeehaw);
  setTimeout(() => yeehaw.remove(), 1100);
  // Confetti burst at cowboy's new position
  const cowboyX = left + imgRect.width / 2;
  const cowboyY = top + 20;
  spawnConfetti(cowboyX, cowboyY);
}

// Confetti burst for cowboy animation
// Spawns confetti at (x, y) in the hero section
function spawnConfetti(x, y, count = 18) {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;
  const colors = ['#ffc107', '#00ffff', '#ff34b3', '#fffbe7', '#ff9800', '#00ff99'];
  for (let i = 0; i < count; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti';
    conf.style.background = colors[Math.floor(Math.random() * colors.length)];
    conf.style.left = (x + Math.random() * 60 - 30) + 'px';
    conf.style.top = (y + Math.random() * 20 - 10) + 'px';
    conf.style.transform = `rotate(${Math.random() * 360}deg)`;
    conf.style.animationDelay = (Math.random() * 0.2) + 's';
    heroSection.appendChild(conf);
    setTimeout(() => conf.remove(), 1300);
  }
}
// Call setupCowboyAnimation on DOMContentLoaded for index.html
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/index.html') {
  window.addEventListener('DOMContentLoaded', setupCowboyAnimation);
}
