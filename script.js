// ===== script.js =====
// DexBlast Mini App - frontend (TON Connect + Telegram profile + Referral + Tasks)

// -------------- CONFIG --------------
const API_BASE = "https://YOUR_BACKEND_URL_HERE"; // <-- بعدا ست کن (مث: https://dexblast-api.example)
const BOT_USERNAME = "DexBlastBot"; // just for reference

// -------------- Force refresh (to avoid Telegram cached old JS) --------------
(function forceRefresh() {
  try {
    if (!window.location.search.includes("refresh=1")) {
      const sep = window.location.href.includes("?") ? "&" : "?";
      window.location.replace(window.location.href + sep + "refresh=1");
      return;
    }
  } catch (e) { console.warn("forceRefresh:", e); }
})();

// -------------- UI helpers --------------
function $(id){ return document.getElementById(id); }
function setText(id, txt){ const el=$(id); if(el) el.innerText = txt; }

// -------------- Theme --------------
function toggleTheme(){ document.body.classList.toggle("dark"); }
document.querySelector(".theme-toggle").addEventListener("click", toggleTheme);

// -------------- Telegram WebApp init & user --------------
const tg = window.Telegram?.WebApp;
let telegramUser = null;
if (tg) {
  try { tg.ready(); } catch(e){/*ignore*/ }
  telegramUser = tg.initDataUnsafe?.user;
}
if (!telegramUser) {
  // fallback for browser test
  telegramUser = { id: null, first_name: "Guest", username: null, photo_url: "assets/userpic.png" };
}
setText("userName", telegramUser.first_name || telegramUser.username || "User");
const userPicEl = $("userPic");
if (telegramUser.photo_url) userPicEl.src = telegramUser.photo_url;

// -------------- Referral initial value --------------
const refInput = $("refLink");
const userId = telegramUser?.id || `guest_${Math.floor(Math.random()*1000000)}`;
refInput.value = `https://t.me/${BOT_USERNAME}?start=${userId}`;

// copy referral
$("copyRefBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(refInput.value);
    alert("Referral link copied ✅");
    // register click with backend (optional)
    if (API_BASE && telegramUser?.id) {
      fetch(`${API_BASE}/api/referral/register`, {
        method: "POST",
        headers:{ "Content-Type":"application/json"},
        body: JSON.stringify({ userId: telegramUser.id, action: "copy" })
      }).catch(()=>{/*non-blocking*/});
    }
  } catch(e){ alert("Copy failed"); }
});

// -------------- XP / Level UI --------------
let userXP = 0, userLevel = 1;
function updateXPUI(){
  setText("userLevel", userLevel);
  const progress = Math.min(userXP, 500)/500*100;
  const xpFill = $("xpProgress");
  if(xpFill) xpFill.style.width = `${progress}%`;
}
updateXPUI();

// -------------- tasks buttons (calls backend to register completion) --------------
document.querySelectorAll(".task-btn").forEach(btn=>{
  btn.addEventListener("click", async (e)=>{
    const task = btn.dataset.task;
    // optimistic UI: add XP locally first
    userXP += 100;
    if(userXP >= 500 && userLevel==1){ userLevel = 2; userXP = userXP-500; } // simple leveling
    updateXPUI();

    // call backend to record task (if API available)
    if(API_BASE && telegramUser?.id){
      try {
        await fetch(`${API_BASE}/api/tasks/complete`, {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ userId: telegramUser.id, task })
        });
      } catch(err){
        console.warn("task API error", err);
      }
    }

    alert(`Task ${task} completed (+100 XP)`);
  });
});

// -------------- TON Connect init --------------
if (!window.TON_CONNECT_UI) {
  console.error("TON_CONNECT_UI not loaded - check CDN script tag");
} else {
  const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://jamiltc.github.io/dexblast/tonconnect-manifest.json"
  });

  const connectBtn = $("connectWalletBtn");
  const walletAddressEl = $("walletAddress");
  const walletBalanceEl = $("walletBalance");

  // helper to update
  function syncUIFromTon(){
    if(!tonConnectUI || !tonConnectUI.connected){
      walletAddressEl.innerText = "Wallet: Not Connected";
      walletBalanceEl.innerText = "Balance: -- TON";
      connectBtn.innerText = "🔗 Connect Wallet";
      return;
    }
    const account = tonConnectUI.account;
    if(account?.address) walletAddressEl.innerText = `Wallet: ${account.address}`;
    connectBtn.innerText = "Disconnect Wallet";
  }

  async function fetchBalance(address){
    try {
      const r = await fetch(`https://toncenter.com/api/v2/getAddressInformation?address=${encodeURIComponent(address)}`);
      const j = await r.json();
      if(j?.result?.balance !== undefined) return Number(j.result.balance);
    } catch(e){ console.warn("balance fetch err", e); }
    return null;
  }

  connectBtn.addEventListener("click", async ()=>{
    try {
      if(!tonConnectUI.connected){
        await tonConnectUI.modal.open();
        syncUIFromTon();
        const addr = tonConnectUI.account?.address;
        if(addr){
          const balance = await fetchBalance(addr);
          walletBalanceEl.innerText = balance !== null ? `Balance: ${balance/1e9} TON` : "Balance: unknown";

          // register wallet on backend
          if(API_BASE && telegramUser?.id){
            fetch(`${API_BASE}/api/users/connect-wallet`, {
              method:"POST",
              headers:{"Content-Type":"application/json"},
              body: JSON.stringify({ userId: telegramUser.id, wallet: addr })
            }).catch(()=>{});
          }
        }
      } else {
        await tonConnectUI.disconnect();
        syncUIFromTon();
      }
    } catch(err){
      console.error("connect error", err);
      alert("Wallet connection failed");
    }
  });

  syncUIFromTon();
}



