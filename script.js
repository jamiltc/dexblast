// =====================================================
// 🟡 DexBlast Mini App - Real Telegram + TON Connect
// =====================================================

// ✅ Splash Screen: fade out after 2.5s
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("mainContent").classList.remove("hidden");
  }, 2500);
});

// ✅ Dark Mode Toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// ✅ Refresh Button
document.getElementById("refreshBtn").addEventListener("click", () => {
  location.reload();
});

// =====================================================
// 🟢 Telegram Connection (Real)
// =====================================================
const tg = window.Telegram?.WebApp;
let userData = null;
const API_BASE = "https://YOUR_BACKEND_URL_HERE"; // ← تغییر بده بعد از دیپلوی سرور

if (tg) {
  try {
    tg.ready();

    if (tg.initDataUnsafe?.user) {
      userData = tg.initDataUnsafe.user;
      console.log("✅ Telegram user:", userData);

      const name = userData.first_name + (userData.last_name ? " " + userData.last_name : "");
      document.getElementById("userName").innerText = name || userData.username;
      if (userData.photo_url) document.getElementById("userPic").src = userData.photo_url;

      // 📡 Register user in backend
      fetch(`${API_BASE}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: userData.id,
          username: userData.username,
          photo: userData.photo_url
        })
      })
        .then(res => res.json())
        .then(r => console.log("🟢 User registered:", r))
        .catch(e => console.error("Register error:", e));
    } else {
      console.warn("⚠️ No Telegram user found. Must open from Telegram.");
      showGuest();
    }
  } catch (err) {
    console.error("Telegram init error:", err);
    showGuest();
  }
} else {
  console.warn("⚠️ Telegram WebApp not found");
  showGuest();
}

function showGuest() {
  document.getElementById("userName").innerText = "Guest User";
  document.getElementById("userPic").src = "assets/userpic.png";
}

// =====================================================
// 🔗 Referral System (Local + Copy)
// =====================================================
const refInput = document.getElementById("refLink");
const userId = userData?.id || Math.floor(Math.random() * 1000000);
refInput.value = `https://t.me/DexBlastBot?start=${userId}`;

function copyReferral() {
  navigator.clipboard.writeText(refInput.value);
  alert("Referral link copied ✅");
}

// =====================================================
// 💰 TON Connect Integration (Connect / Disconnect)
// =====================================================
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
    } catch (err) {
      console.log("Balance error:", err);
    }
    return "--";
  }

  function updateWalletUI() {
    if (tonConnectUI.connected && tonConnectUI.account?.address) {
      const addr = tonConnectUI.account.address;
      walletAddressEl.innerText = `Wallet: ${addr}`;
      connectBtn.innerText = "❌ Disconnect Wallet";

      // fetch live balance
      getBalance(addr).then(b => {
        walletBalanceEl.innerText = `Balance: ${b} TON`;
      });

      // register wallet in backend
      if (userData?.id && API_BASE) {
        fetch(`${API_BASE}/api/users/connect-wallet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userData.id, wallet: addr })
        }).catch(() => {});
      }
    } else {
      walletAddressEl.innerText = "Wallet: Not Connected";
      walletBalanceEl.innerText = "Balance: -- TON";
      connectBtn.innerText = "🔗 Connect Wallet";
    }
  }

  connectBtn.addEventListener("click", async () => {
    if (!tonConnectUI.connected) {
      await tonConnectUI.modal.open();
      updateWalletUI();
    } else {
      await tonConnectUI.disconnect();
      updateWalletUI();
    }
  });

  updateWalletUI();
}

// =====================================================
// ✅ Responsive helper (auto fit page on any device)
// =====================================================
function fitScreen() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
fitScreen();
window.addEventListener("resize", fitScreen);




