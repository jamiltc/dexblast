// Dark/Light toggle
function toggleTheme() { document.body.classList.toggle("dark"); }

// Telegram WebApp init
const tg = window.Telegram.WebApp;
tg.expand();
let user = tg.initDataUnsafe?.user;
if(user){
  document.getElementById("userName").innerText = user.first_name;
  if(user.photo_url) document.getElementById("userPic").src = user.photo_url;
}

// TON Connect init
const tonConnect = new TonConnect.UI({
  manifestUrl: "https://jamiltc.github.io/dexblast/manifest.json"
});

const walletBtn = document.getElementById("connectWalletBtn");
const walletAddress = document.getElementById("walletAddress");
const walletBalance = document.getElementById("walletBalance");

walletBtn.addEventListener("click", async () => {
  try {
    const wallet = await tonConnect.connect();
    walletAddress.innerText = `Wallet: ${wallet.account}`;
    
    // Fetch balance (in NanoTON)
    const balance = await wallet.getBalance();
    walletBalance.innerText = `Balance: ${balance / 1e9} TON`;
  } catch (err) {
    console.error(err);
    alert("Wallet connection failed");
  }
});

// Referral
function copyReferral() {
  let link = "https://t.me/DexBlastBot?start=USERID";
  navigator.clipboard.writeText(link);
  alert("Referral Copied ✅");
}

// Join channel verify
function checkJoin() { alert("Channel join will verify via API ✅"); }
