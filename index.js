const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 🧩 GitHub credentials
const GITHUB_TOKEN = "sG8G27J90rcCerti1daHMBESOYGVcB0BHTD6";
const GITHUB_USER = "buddika-iresh17";

const githubHeaders = {
  "Authorization": `token ghp_${GITHUB_TOKEN}`,
  "Accept": "application/vnd.github+json",
  "User-Agent": GITHUB_USER,
};

// 🧠 Download a remote file
async function downloadFile(url) {
  try {
    const res = await axios.get(url, { responseType: "text" });
    return res.data;
  } catch (err) {
    console.warn(`⚠️ Could not download ${url}: ${err.response ? err.response.status : err}`);
    return null;
  }
}

// 🧠 Push or create a file in repo
async function pushFile(owner, repo, path, content, message) {
  if (!content) return;
  const base64Content = Buffer.from(content.toString(), "utf8").toString("base64");
  try {
    const { data } = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=main`,
      { headers: githubHeaders }
    );
    await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { message, content: base64Content, sha: data.sha, branch: "main" },
      { headers: githubHeaders }
    );
  } catch (err) {
    if (err.response && err.response.status === 404) {
      await axios.put(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        { message, content: base64Content, branch: "main" },
        { headers: githubHeaders }
      );
    } else {
      throw err;
    }
  }
}

// 🧩 Random Repo Name Generator
function randomRepoName(prefix = "manaofc", length = 6) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `${prefix}-${result}`;
}

// 🧩 Web Interface
app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <title>MANISHA-MD MINI BOT</title>
    <style>
      body {
        font-family: 'Poppins', sans-serif;
        background: linear-gradient(120deg, #ff0000, #ff9900, #ffee00, #00ff66, #00ffff, #0066ff, #cc00ff);
        background-size: 400% 400%;
        animation: rgbbg 10s infinite alternate;
        color: white;
        text-align: center;
        padding: 40px;
      }
      @keyframes rgbbg { 0%{background-position:left;} 100%{background-position:right;} }
      .container {
        background: rgba(0,0,0,0.55);
        border-radius: 20px;
        padding: 40px;
        display: inline-block;
        box-shadow: 0 0 20px rgba(255,255,255,0.3);
      }
      img { width: 150px; border-radius: 50%; box-shadow: 0 0 20px rgba(255,255,255,0.4); }
      input, button {
        padding: 10px; width: 80%; margin: 8px 0; border: none; border-radius: 10px; font-size: 16px;
      }
      input { background: #fff; color: #000; }
      button {
        background: linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet);
        color: white; font-weight: bold; cursor: pointer; transition: 0.3s;
      }
      button:hover { opacity: 0.9; transform: scale(1.05); }
      .contact, .pair-btn, .help-btn {
        display: inline-block; color: white; padding: 10px 20px; border-radius: 10px;
        text-decoration: none; font-weight: bold; margin-top: 10px; transition: 0.3s;
      }
      .contact { background: #00c851; }
      .pair-btn { background: #007bff; }
      .help-btn { background: #ff4444; }
      .contact:hover, .pair-btn:hover, .help-btn:hover { opacity: 0.8; transform: scale(1.05); }
      .rgb-text {
        background: linear-gradient(90deg,red,orange,yellow,green,cyan,blue,violet);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold;
      }
      #helpBox {
        display: none;
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8);
        justify-content: center; align-items: center;
      }
      #helpContent {
        background: #111; color: white; padding: 25px; border-radius: 20px;
        width: 90%; max-width: 500px; text-align: left; box-shadow: 0 0 15px rgba(255,255,255,0.3);
      }
      #helpContent h3 { color: #00ff99; text-align: center; }
      #closeHelp { background: crimson; color: white; border: none; border-radius: 8px; padding: 8px 15px; cursor: pointer; float: right; }
    </style>
  </head>
  <body>
    <div class="container" id="mainContainer">
      <img src="https://i.ibb.co/6RzcnLWR/jpg.jpg"/>
      <h2>🚀 <span class="rgb-text">MANISHA-MD MINI BOT</span></h2>
      <form id="botForm">
        <input type="text" name="ownerNumber" placeholder="Your WhatsApp Number (e.g 94XXXXXXXXX)" required/><br/>
        <input type="text" name="sessionId" placeholder="SESSION_ID" required/><br/>
        <button type="submit">Create Bot</button>
      </form>
      <a class="contact" href="https://wa.me/94721551183?text=Hello+I+need+help+to+create+bot" target="_blank">🟢 Contact</a>
      <a class="pair-btn" href="https://manaofc-minibot-pair.onrender.com/" target="_blank">🔵 Pair</a>
      <a class="help-btn" href="#" id="helpBtn">🔴 Help</a>
    </div>

    <footer style="margin-top:25px;">Developed by <span class="rgb-text">manaofc</span> ©2025</footer>

    <div id="helpBox">
      <div id="helpContent">
        <button id="closeHelp">X</button>
        <h3>📘 HOW TO CREATE MANISHA-MD MINI BOT 🤖</h3>
        <ul>
          <li>1️⃣ ඔබේ WhatsApp අංකය +94 සමඟ එකතු කරන්න.</li>
          <li>2️⃣ SESSION_ID එක ලබා ගැනිමට "Pair" බොත්තම ක්ලික් කරලා WhatsApp අංකය ඇතුලත් කර submit කරන්න.</li>
          <li>3️⃣ ලැබුණු 8 digit code එක WhatsApp එකේ "Link device" → "Enter code" මගින් යොදන්න.</li>
          <li>4️⃣ SESSION_ID එක මෙහි paste කර “Create Bot” ඔබන්න.</li>
          <li>5️⃣ Bot connected successfully ✔️ පෙනුනාම විනාඩියක් රැඳී ඉන්න.</li>
        </ul>
      </div>
    </div>

    <script>
      document.getElementById('helpBtn').addEventListener('click', () => {
        document.getElementById('helpBox').style.display = 'flex';
      });
      document.getElementById('closeHelp').addEventListener('click', () => {
        document.getElementById('helpBox').style.display = 'none';
      });

      document.getElementById('botForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = {
          ownerNumber: form.ownerNumber.value,
          sessionId: form.sessionId.value
        };
        document.getElementById("mainContainer").innerHTML = "<h2>⏳ Creating your bot...</h2>";
        try {
          const res = await fetch('/create-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          const data = await res.json();
          if (data.success) {
            document.getElementById("mainContainer").innerHTML = \`
              <h2>🤖 Bot connected successfully ✔️</h2>
              <p><b>bot:</b> \${data.repoName}</p>
              <p>Please wait 1 minute for setup...</p>
              <p><b>Developer:</b> <a href="https://wa.me/94721551183" style="color:lime;">manaofc</a></p>
            \`;
          } else {
            document.getElementById("mainContainer").innerHTML = "<h3>❌ Error: " + data.error + "</h3>";
          }
        } catch (err) {
          document.getElementById("mainContainer").innerHTML = "<h3>❌ Connection error</h3>";
        }
      });
    </script>
  </body>
  </html>
  `);
});

// 🧠 Bot creation route (random repo name)
app.post("/create-bot", async (req, res) => {
  const { ownerNumber, sessionId } = req.body;
  const repoName = randomRepoName(); // 👈 Random repo name generator

  try {
    await axios.post(
      "https://api.github.com/user/repos",
      { name: repoName, private: false },
      { headers: githubHeaders }
    );

    await new Promise(r => setTimeout(r, 2000));

    const config = `module.exports = {
  SESSION_ID: "${sessionId || ""}",
  OWNER_NUMBER: "${ownerNumber || ""}",
  MODE: "private",
  PREFIX: ".",
  OWNER_REACT: "false",
  AUTO_REACT: "false",
  ANTI_DEL_PATH: "inbox",
  READ_MESSAGE: "false",
  AUTO_READ_STATUS: "false",
  AUTO_STATUS_REPLY: "false",
  AUTO_STATUS_REACT: "false",
  AUTOLIKESTATUS: "false",
  AUTO_TYPING: "true",
  AUTO_RECORDING: "true",
  ALWAYS_ONLINE: "true",
  ANTI_CALL: "false",
  BAD_NUMBER_BLOCKER: "false",
  UNIFIED_PROTECTION: "kick",
};`;

    const packageJson = await downloadFile("https://raw.githubusercontent.com/manaofc/file/main/package.json");
    const manaofc = await downloadFile("https://raw.githubusercontent.com/manaofc/file/main/manaofc.js");

    await pushFile(GITHUB_USER, repoName, "package.json", packageJson, "Add package.json");
    await pushFile(GITHUB_USER, repoName, "manaofc.js", manaofc, "Add manaofc.js");
    await pushFile(GITHUB_USER, repoName, "config.js", config, "Add config.js");

    const workflow = `
name: Node.js CI
on:
  push:
    branches: [ "main" ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: node manaofc.js
`;
    await pushFile(GITHUB_USER, repoName, ".github/workflows/nodejs.yml", workflow, "Add workflow");

    res.json({ success: true, repoName });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));