// ---------------- Force refresh برای تلگرام ----------------
(function forceRefresh() {
  try {
    if (!window.location.search.includes("refresh=1")) {
      const sep = window.location.href.includes("?") ? "&" : "?";
      window.location.replace(window.location.href + sep + "refresh=1");
      return;
    }
  } catch (e) { console.warn(e); }
})();

// ---------------- Dark/Light toggle ----------------
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// ---------------- TonConnect UI init ----------------
if (!window.TON_CONNECT_UI) {
  console.error("TON_CONNECT_UI not loaded. Check CDN script tag in <head>.");
} else {
  const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: "https://jamiltc.github.io/dexblast/tonconnect-manifest.json"
  });

  const connectBtn = document.getElementById("connectWalletBtn");
  const walletAddressEl = document.getElementById("walletAddress");
  const walletBalanceEl = document.getElementById("walletBalance");

  function updateFromTonConnect() {
    try {
      const connected = !!tonConnectUI.connected;
      if (!connected) {
        walletAddressEl.innerText = "Wallet: Not Connected";
        walletBalanceEl.innerText = "Balance: -- TON";
        connectBtn.innerText = "Connect Wallet";
        return;
      }
      const account = tonConnectUI.account;
      if (account?.address) walletAddressEl.innerText = `Wallet: ${account.address}`;
      connectBtn.innerText = "Disconnect Wallet";
    } catch (e) {
      console.error("updateFromTonConnect error", e);
    }
  }

  async function fetchBalance(address) {
    try {
      const resp = await fetch(`https://toncenter.com/api/v2/getAddressInformation?address=${encodeURIComponent(address)}`);
      const j = await resp.json();
      if (j && j.result && typeof j.result.balance !== "undefined") {
        return Number(j.result.balance);
      }
    } catch (e) { console.warn("fetchBalance error", e); }
    return null;
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
          if (balance !== null) walletBalanceEl.innerText = `Balance: ${balance / 1e9} TON`;
          else walletBalanceEl.innerText = "Balance: unknown";
        }
      } else {
        await tonConnectUI.disconnect();
        updateFromTonConnect();
      }
    } catch (err) {
      console.error("Connect button error:", err);
      alert("Wallet connection failed. Check console for details.");
    }
  });

  updateFromTonConnect();
}




