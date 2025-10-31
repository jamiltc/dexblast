// Initialize Telegram Mini App
const tg = window.Telegram.WebApp;

// Expand to full height
tg.expand();

// Get Telegram User Data
let user = tg.initDataUnsafe?.user;

if (user) {
  document.getElementById("userName").innerText = user.first_name;

  // Set profile photo if exists
  if (user.photo_url) {
    document.getElementById("userPic").src = user.photo_url;
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function connectWallet() {
  alert("Wallet system will be connected to TON next step ✅");
}

function copyReferral() {
  let link = "https://t.me/DexBlastBot?start=USERID";

  navigator.clipboard.writeText(link);
  alert("Referral Copied ✅");
}

function checkJoin() {
  alert("Channel join checker connects to API later ✅");
}
