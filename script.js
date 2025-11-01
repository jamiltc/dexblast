// ---------------- Force refresh برای مقابله با کش تلگرام ----------------
(function forceRefresh() {
  try {
    if (!window.location.search.includes("refresh=1")) {
      // replace (نه assign) تا history شلوغ نشه
      const sep = window.location.href.includes("?") ? "&" : "?";
      window.location.replace(window.location.href + sep + "refresh=1");
      return; // بلافاصله صفحه reload می‌شود
    }
  } catch (e) {
    console.warn("forceRefresh error:", e);
  }
})();

// (بعد از reload ادامه فایل اجرا خواهد شد)
// ---------------- Dark/Light toggle ----------------
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// ---------------- Telegram WebApp init ----------------
const tg = window.Telegram?.WebApp;
if (tg && typeof tg.expand === "function") {
  try { tg.expand(); } catch(e){ console.warn(e); }
}
if (tg?.initDataUnsafe?.user) {
  const user = tg.initDataUnsafe.user;
  document.getElementById("userName").innerText = user.first_name || user.username || "User";
  if (user.photo_url) document.getElementById("userPic").src = user.photo_url;
}

// ---------------- TonConnect UI init (uses CDN global TON_CONNECT_UI) ----------------
if (!window.TON_CONNECT_UI) {
  console.error("TON_CONNECT_UI not loaded. Check CDN script tag in <head>.");
} else {
  // create instance
  const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://jamiltc.github.io/dexblast/tonconnect-manifest.json",
    // optional: buttonRootId if you want TonConnect to render its button automatically
    // buttonRootId: 'connectWalletBtn'
  });

  // UI & state elements
  const connectBtn = document.getElementById("connectWalletBtn");
  const walletAddressEl = document.getElementById("walletAddress");
  const walletBalanceEl = document.getElementById("walletBalance");

  // helper: update UI from tonConnectUI state
  function updateFromTonConnect() {
    try {
      const connected = !!tonConnectUI.connected;
      if (!connected) {
        walletAddressEl.innerText = "Wallet: Not Connected";
        walletBalanceEl.innerText = "Balance: -- TON";
        connectBtn.innerText = "Connect Wallet";
        return;
      }

      // account/address info
      const account = tonConnectUI.account; // object or undefined
      if (account?.address) {
        walletAddressEl.innerText = `Wallet: ${account.address}`;
      } else {
        walletAddressEl.innerText = `Wallet: (connected)`;
      }

      connectBtn.innerText = "Disconnect Wallet";
    } catch (e) {
      console.error("updateFromTonConnect error", e);
    }
  }

  // try to fetch balance via TonConnect functionality (preferred)
  async function fetchBalanceFallback(address) {
    // Try SDK-provided method first
    try {
      if (typeof tonConnectUI.getAccountBalance === "function") {
        const nano = await tonConnectUI.getAccountBalance(); // if available
        return Number(nano);
      }
    } catch(e){ console.warn("tonConnectUI.getAccountBalance failed", e); }

    // Fallback: call public TON REST (toncenter) - note: may need API key for production
    try {
      const resp = await fetch(`https://toncenter.com/api/v2/getAddressInformation?address=${encodeURIComponent(address)}`);
      const j = await resp.json();
      // response format may vary; try common fields
      if (j && j.result && typeof j.result.balance !== "undefined") {
        // balance usually in nanotons or setup; check value
        return Number(j.result.balance);
      }
    } catch(e){
      console.warn("fallback balance fetch failed", e);
    }

    return null;
  }

  // Connect / Disconnect handler
  connectBtn.addEventListener("click", async () => {
    try {
      if (!tonConnectUI.connected) {
        console.log("Opening TonConnect modal...");
        // open modal and wait for user connect (wallet selection & approve)
        await tonConnectUI.modal.open(); // open the modal
        // after successful connect, tonConnectUI.connected should be true
        // update UI
        updateFromTonConnect();

        // try to read account and balance
        const account = tonConnectUI.account;
        if (account?.address) {
          const addr = account.address;
          walletAddressEl.innerText = `Wallet: ${addr}`;

          // try to get balance via provider (if SDK exposes)
          let nanoBalance = null;
          try {
            if (tonConnectUI.provider && typeof tonConnectUI.provider.getBalance === "function") {
              nanoBalance = await tonConnectUI.provider.getBalance(addr);
            }
          } catch(e) {
            console.warn("provider.getBalance failed", e);
          }

          // fallback generic fetch
          if (!nanoBalance) {
            nanoBalance = await fetchBalanceFallback(addr);
          }

          if (nanoBalance !== null) {
            walletBalanceEl.innerText = `Balance: ${Number(nanoBalance) / 1e9} TON`;
          } else {
            walletBalanceEl.innerText = "Balance: unknown";
          }
        }
      } else {
        // disconnect
        await tonConnectUI.disconnect();
        updateFromTonConnect();
      }
    } catch (err) {
      console.error("Connect button error:", err);
      alert("Wallet connection failed. Check console for details.");
    }
  });

  // subscribe to modal / connection changes so UI updates if wallet connects elsewhere
  if (typeof tonConnectUI.onModalStateChange === "function") {
    tonConnectUI.onModalStateChange((state) => {
      console.log("modal state", state);
      // when modal closed, update UI (user may have connected)
      updateFromTonConnect();
    });
  }

  // initial UI sync (in case already connected)
  updateFromTonConnect();
}


