// ======= script.js =======
// DexBlast Mini App - TON Connect + Referral + Tasks + Leveling

// Force refresh تلگرام
(function forceRefresh() {
  try {
    if (!window.location.search.includes("refresh=1")) {
      const sep = window.location.href.includes("?") ? "&" : "?";
      window.location.replace(window.location.href + sep + "refresh=1");
      return;
    }
  } catch (e) { console.warn(e); }
})();

// Dark/Light toggle
function toggleTheme() { document.body.classList.toggle("dark"); }

// ---------------- Telegram Profile ----------------
const tg = window.Telegram?.WebApp;

if(tg) {
  tg.ready(); // حتما init کن
  const user = tg.initDataUnsafe?.user || { first_name: "Test User", id: 123456, photo_url: "assets/userpic.png" };
  document.getElementById("userName").innerText = user.first_name;
  document.getElementById("userPic").src = user.photo_url;
} else {
  document.getElementById("userName").innerText = "Test User";
  document.getElementById("userPic").src = "assets/userpic.png";
}

// ---------------- TON Connect ----------------
const tonConnectUI = window.TON_CONNECT_UI ? new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: "https://jamiltc.github.io/dexblast/tonconnect-manifest.json"
}) : null;

const connectBtn = document.getElementById("connectWalletBtn");
const walletAddressEl = document.getElementById("walletAddress");
const walletBalanceEl = document.getElementById("walletBalance");

async function fetchBalance(address) {
  try {
    const resp = await fetch(`https://toncenter.com/api/v2/getAddressInformation?address=${encodeURIComponent(address)}`);
    const j = await resp.json();
    if (j?.result?.balance !== undefined) return Number(j.result.balance);
  } catch(e){ console.warn(e); }
  return null;
}

function updateFromTonConnect() {
  if (!tonConnectUI || !tonConnectUI.connected) {
    walletAddressEl.innerText = "Wallet: Not Connected";
    walletBalanceEl.innerText = "Balance: -- TON";
    connectBtn.innerText = "Connect Wallet";
    return;
  }
  const account = tonConnectUI.account;
  if (account?.address) walletAddressEl.innerText = `Wallet: ${account.address}`;
  connectBtn.innerText = "Disconnect Wallet";
}

connectBtn.addEventListener("click", async () => {
  try {
    if (!tonConnectUI.connected) {
      await tonConnectUI.modal.open();
      updateFromTonConnect();
      const account = tonConnectUI.account;
      if (account?.address) {
        walletAddressEl.innerText = `Wallet: ${account.address}`;
        let balance = await fetchBalance(account.address);
        walletBalanceEl.innerText = balance !== null ? `Balance: ${balance/1e9} TON` : "Balance: unknown";
      }
    } else {
      await tonConnectUI.disconnect();
      updateFromTonConnect();
    }
  } catch (err) { console.error("Connect button error:", err); alert("Wallet connection failed."); }
});

updateFromTonConnect();

// ---------------- Referral ----------------
const refInput = document.getElementById("refLink");
const userId = tg?.initDataUnsafe?.user?.id || Math.floor(Math.random()*1000000); // fallback
refInput.value = `https://t.me/DexBlastBot?start=${userId}`;

function copyReferral() {
  navigator.clipboard.writeText(refInput.value);
  alert("Referral link copied ✅");
}

// ---------------- Tasks + XP ----------------
let userXP = 0;
let userLevel = 1;

function updateLevel() {
  document.getElementById("userLevel").innerText = userLevel;
  const progress = Math.min(userXP, 500)/500*100;
  document.getElementById("xpProgress").style.width = `${progress}%`;
}

function completeTask(task) {
  userXP += 100;
  if (userXP >= 500) userLevel = 2;
  updateLevel();
  alert(`Task "${task}" completed! +100 XP`);
}

updateLevel();





