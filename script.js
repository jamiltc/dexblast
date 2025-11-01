// Dark/Light toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// Placeholder Wallet connect
function connectWallet() {
  alert("Wallet will connect in next step ✅");
}

// Copy Referral
function copyReferral() {
  let link = "https://t.me/DexBlastBot?start=USERID";
  navigator.clipboard.writeText(link);
  alert("Referral Copied ✅");
}

// Join channel verify
function checkJoin() {
  alert("Channel join will verify via API ✅");
}

// Telegram WebApp init
const tg = window.Telegram.WebApp;
tg.expand();
let user = tg.initDataUnsafe?.user;
if (user) {
  document.getElementById("userName").innerText = user.first_name;
  if (user.photo_url) document.getElementById("userPic").src = user.photo_url;
}
