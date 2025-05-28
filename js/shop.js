// --- Utility Functions ---
function getBalance() {
  return parseInt(localStorage.getItem("DexHuntBalance") || "100");
}
function setBalance(newBalance) {
  localStorage.setItem("DexHuntBalance", newBalance);
}
function updateBalanceDisplay() {
  const el = document.getElementById("balance");
  if (el) el.textContent = `Your $DEXHUNT Balance: ${getBalance()}`;
}

// --- Gun Shop ---
function renderGunShop(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const owned = JSON.parse(localStorage.getItem("purchasedGuns") || '["gunbrown"]');
  const equipped = localStorage.getItem("cursorSkin") || "gunbrown";
  guns.forEach(gun => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${gun.image}" alt="${gun.name}">
      <div>${gun.name}</div>
      <div style="color:#ffc107;">${gun.rarity}</div>
      <small>${gun.lore}</small>
      <div style="margin:6px 0;">Cost: <b>${gun.cost}</b> $DEXHUNT <span title='A portion of every purchase is burned, reducing supply!'>🔥</span></div>
    `;
    const button = document.createElement("button");
    if (equipped === gun.id) {
      button.innerText = "✅ Equipped";
      button.classList.add("equipped");
      button.disabled = true;
    } else if (owned.includes(gun.id)) {
      button.innerText = "Equip";
      button.onclick = () => {
        localStorage.setItem("cursorSkin", gun.id);
        renderGunShop(containerId);
        renderInventory("inventory");
        showToast(`Equipped ${gun.name}`);
      };
    } else {
      button.innerText = `Buy (${gun.cost})`;
      button.onclick = () => {
        alert('Burning is disabled until after the bonding curve launch.');
        alert(`You unlocked ${gun.name}!`);
        owned.push(gun.id);
        localStorage.setItem("purchasedGuns", JSON.stringify(owned));
        localStorage.setItem("cursorSkin", gun.id);
        renderGunShop(containerId);
        renderInventory("inventory");
        showToast(`Equipped ${gun.name}`);
      };
    }
    div.appendChild(button);
    container.appendChild(div);
  });
}

// --- Reticle Shop ---
function renderReticleShop(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const owned = JSON.parse(localStorage.getItem("purchasedReticles") || "[]");
  const equipped = localStorage.getItem("reticleSkin") || "blasterReticle";
  reticles.forEach(reticle => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${reticle.image}" alt="${reticle.name}">
      <div>${reticle.name}</div>
      <div style="color:#ffc107;">${reticle.rarity}</div>
      <small>${reticle.lore}</small>
      <div style="margin:6px 0;">Cost: <b>${reticle.cost}</b> $DEXHUNT <span title='A portion of every purchase is burned, reducing supply!'>🔥</span></div>
    `;
    const button = document.createElement("button");
    if (equipped === reticle.id) {
      button.innerText = "✅ Equipped";
      button.classList.add("equipped");
      button.disabled = true;
    } else if (owned.includes(reticle.id)) {
      button.innerText = "Equip";
      button.onclick = () => {
        localStorage.setItem("reticleSkin", reticle.id);
        renderReticleShop(containerId);
        renderInventory("inventory");
        showToast(`Equipped ${reticle.name}`);
      };
    } else {
      button.innerText = `Buy (${reticle.cost})`;
      button.onclick = () => {
        alert('Burning is disabled until after the bonding curve launch.');
        alert(`You unlocked ${reticle.name}!`);
        owned.push(reticle.id);
        localStorage.setItem("purchasedReticles", JSON.stringify(owned));
        localStorage.setItem("reticleSkin", reticle.id);
        renderReticleShop(containerId);
        renderInventory("inventory");
        showToast(`Equipped ${reticle.name}`);
      };
    }
    div.appendChild(button);
    container.appendChild(div);
  });
}

// --- Toast Notification ---
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "#222";
    toast.style.color = "#ffc107";
    toast.style.padding = "12px 28px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "1.1rem";
    toast.style.zIndex = "9999";
    toast.style.boxShadow = "0 2px 12px #0008";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  setTimeout(() => { toast.style.opacity = "0"; }, 1800);
}

// --- Reticle Selector ---
function renderReticleSelector() {
  const optionsDiv = document.getElementById("reticleOptions");
  if (!optionsDiv) return;

  const purchased = JSON.parse(localStorage.getItem("purchasedReticles") || '["blasterReticle"]');
  const equipped = localStorage.getItem("reticleSkin") || "blasterReticle";
  optionsDiv.innerHTML = "";
  reticles.forEach(reticle => {
    if (purchased.includes(reticle.id)) {
      const btn = document.createElement("button");
      btn.title = reticle.name;
      btn.style.margin = "4px";
      btn.style.border = (equipped === reticle.id) ? "2px solid gold" : "1px solid #888";
      btn.onclick = () => {
        localStorage.setItem("reticleSkin", reticle.id);
        showToast(`${reticle.name} equipped!`);
        renderReticleSelector();
        renderReticleInventory("reticle-inventory");
      };
      btn.innerHTML = `<img src="${reticle.image}" width="32" height="32" alt="${reticle.name}"><br>${reticle.name}`;
      optionsDiv.appendChild(btn);
    }
  });
}

// --- Reticle Inventory ---
function renderReticleInventory(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const owned = JSON.parse(localStorage.getItem("purchasedReticles") || "[]");
  const equipped = localStorage.getItem("reticleSkin") || "blasterReticle";
  owned.forEach(id => {
    const item = reticles.find(i => i.id === id);
    if (item) {
      const div = document.createElement("div");
      div.className = "item";
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;
      div.appendChild(img);
      const name = document.createElement("div");
      name.innerText = item.name;
      div.appendChild(name);
      const button = document.createElement("button");
      if (equipped === item.id) {
        button.innerText = "✅ Equipped";
        button.classList.add("equipped");
        button.disabled = true;
      } else {
        button.innerText = "Equip";
        button.onclick = () => {
          localStorage.setItem("reticleSkin", item.id);
          renderReticleInventory(containerId);
          renderReticleShop("reticle-shop");
        };
      }
      div.appendChild(button);
      container.appendChild(div);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  renderReticleSelector();
  renderGunShop("gun-shop");
  renderInventory("inventory");
  renderReticleInventory("reticle-inventory");
});