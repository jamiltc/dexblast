// =============== DexBlast Script.js ===============

// Splash screen fade out after 2.5 seconds
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("mainContent").classList.remove("hidden");
  }, 2500);
});

// Dark mode toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// Telegram WebApp data
const tg = window.Telegram?.WebApp;
let userData = { first_name: "Guest", photo_url: "assets/userpic.png", id: null };

if (tg && tg.initDataUnsafe?.user) {
  tg.ready();
  const u = tg.initDataUnsafe.user;
  userData = u;
  document.getElementById("userName").innerText = u.first_name || u.username || "User";
  if (u.photo_url) document.getElementById("userPic").src = u.photo_url;
} else {
  document.getElementById("userName").innerText = "Guest";
  document.getElementById("userPic").src = "assets/userpic.png";
}

// Referral link
const refInput = document.getElementById("refLink");
const userId = userData.id || Math.floor(Math.random() * 1000000);
refInput.value = `https://t.me/DexBlastBot?start=${userId}`;
function copyReferral() {
  navigator.clipboard.writeText(refInput.value);
  alert("Referral link copied ✅");
}

// Refresh button
document.getElementById("refreshBtn").addEventListener("click", () => {
  location.reload();
});

// TON Connect
if (!window.TON_CONNECT_UI) {
  console.error("TON Connect UI not loaded!");
} else {
  const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://jamiltc.github.io/dexblast/tonconnect-manifest.json"
  });

  const connectBtn = document.getElementById("connectWalletBtn");
  const walletAddressEl = document.getElementById("walletAddress");
  const walletBalanceEl = document.getElementById("walletBalance");

  async function getBalance(addr) {
    try {
      const r = await fetch(`https://toncenter.com/api/v2/getAddressInformation?address=${encodeURIComponent(addr)}`);
      const j = await r.json();
      if (j.result && j.result.balance) {
        return (Number(j.result.balance) / 1e9).toFixed(3);
      }
    } catch (err) { console.log(err); }
    return "--";
  }

  function updateUI() {
    if (tonConnectUI.connected && tonConnectUI.account?.address) {
      const addr = tonConnectUI.account.address;
      walletAddressEl.innerText = `Wallet: ${addr}`;
      connectBtn.innerText = "❌ Disconnect Wallet";
      getBalance(addr).then(b => walletBalanceEl.innerText = `Balance: ${b} TON`);
    } else {
      walletAddressEl.innerText = "Wallet: Not Connected";
      walletBalanceEl.innerText = "Balance: -- TON";
      connectBtn.innerText = "🔗 Connect Wallet";
    }
  }

  connectBtn.addEventListener("click", async () => {
    if (!tonConnectUI.connected) {
      await tonConnectUI.modal.open();
      updateUI();
    } else {
      await tonConnectUI.disconnect();
      updateUI();
    }
  });

  updateUI();
}





