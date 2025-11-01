import { Connect } from '@volcengine/volc-mini-js-sdk';

const connect = new Connect({
  appId: 'YOUR_APP_ID', // از پنل ولت بگیر
  env: 'development'    // یا 'production'
});

const volcStatus = document.getElementById("volcStatus");
const volcMessages = document.getElementById("volcMessages");
const volcConnectBtn = document.getElementById("volcConnectBtn");
const volcDisconnectBtn = document.getElementById("volcDisconnectBtn");
const volcSendBtn = document.getElementById("volcSendBtn");

async function initializeConnect() {
  try {
    await connect.init();
    console.log('Volc Mini Connect initialized');

    connect.on('message', (message) => {
      console.log('Received message:', message);
      const div = document.createElement("div");
      div.textContent = message.text || JSON.stringify(message);
      volcMessages.appendChild(div);
    });

    connect.on('connection_status', (status) => {
      console.log('Connection status:', status);
      volcStatus.textContent = `Status: ${status}`;
    });

  } catch (err) {
    console.error('Volc Connect init error:', err);
  }
}

async function sendMessage(messageData) {
  try {
    await connect.send({
      type: 'message',
      data: messageData
    });
  } catch (err) {
    console.error(err);
  }
}

function disconnect() {
  connect.close();
}

volcConnectBtn.addEventListener("click", async () => {
  await initializeConnect();
});

volcDisconnectBtn.addEventListener("click", () => {
  disconnect();
  volcStatus.textContent = "Status: Disconnected";
});

volcSendBtn.addEventListener("click", () => {
  sendMessage({ text: "سلام! پیام تست Volc Mini" });
});
