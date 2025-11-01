// ------------------ Force Refresh برای کش تلگرام ------------------
if (window.location.href.indexOf("?refresh=1") === -1) {
    window.location.href = window.location.href + "?refresh=1";
}

// ------------------ Dark/Light Toggle ------------------
function toggleTheme() {
    document.body.classList.toggle("dark");
}

// ------------------ Telegram WebApp Init ------------------
const tg = window.Telegram.WebApp;
tg.expand();

let user = tg.initDataUnsafe?.user;
if(user){
    document.getElementById("userName").innerText = user.first_name;
    if(user.photo_url) document.getElementById("userPic").src = user.photo_url;
}

// ------------------ TON Connect Init ------------------
const tonConnect = new TonConnect.UI({
    manifestUrl: "https://jamiltc.github.io/dexblast/manifest.json"
});

const walletBtn = document.getElementById("connectWalletBtn");
const walletAddress = document.getElementById("walletAddress");
const walletBalance = document.getElementById("walletBalance");

walletBtn.addEventListener("click", async () => {
    console.log("Connect Wallet clicked"); // برای تست
    try {
        const wallet = await tonConnect.connect();
        walletAddress.innerText = `Wallet: ${wallet.account}`;
        
        // دریافت موجودی TON (NanoTON -> TON)
        const balance = await wallet.getBalance();
        walletBalance.innerText = `Balance: ${balance / 1e9} TON`;
    } catch (err) {
        console.error(err);
        alert("Wallet connection failed");
    }
});

// ------------------ Referral ------------------
function copyReferral() {
    let link = `https://t.me/DexBlastBot?start=USERID`;
    navigator.clipboard.writeText(link);
    alert("Referral Copied ✅");
}

// ------------------ Join Channel Verify ------------------
function checkJoin() {
    alert("Channel join verification coming soon ✅");
}

// ------------------ XP / Level (نمونه) ------------------
let userXP = 0;
let userLevel = 1;

function addXP(amount){
    userXP += amount;
    document.getElementById("userXP").innerText = userXP;
    
    // Level up هر 500 XP
    if(userXP >= userLevel*500){
        userLevel += 1;
        document.getElementById("userLevel").innerText = userLevel;
        document.getElementById("xpFill").style.width = "0%";
        userXP = 0;
    }
    
    // آپدیت نوار XP
    let percent = (userXP / (userLevel*500)) * 100;
    document.getElementById("xpFill").style.width = percent + "%";
}



