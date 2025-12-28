// =======================================
// 🌐 MANISHA-MD MINI BOT CREATOR SERVER
// =======================================

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname)); // serve index.html + assets

// 🧩 GitHub credentials (set these in .env file)
const GITHUB_TOKEN = "8lPKJuIR3L84EuOHOngfanxoc5WHVc0MOwbn";
const GITHUB_USER = "dhanukadiwan-sketch";

const githubHeaders = {
  Authorization: `token ghp_${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "User-Agent": GITHUB_USER,
};

// 🧠 Download a remote file
async function downloadFile(url) {
  try {
    const res = await axios.get(url, { responseType: "text" });
    return res.data;
  } catch (err) {
    console.warn(`⚠️ Could not download ${url}: ${err.message}`);
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

// 🧩 Serve the web interface
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🧠 Create Bot Route
app.post("/create-bot", async (req, res) => {
  const { ownerNumber, sessionId } = req.body;
  const repoName = randomRepoName();

  try {
    // 1️⃣ Create repo (private)
    await axios.post(
      "https://api.github.com/user/repos",
      { name: repoName, private: true },
      { headers: githubHeaders }
    );

    // 2️⃣ Create config.js
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

    // 3️⃣ Download required files
    const packageJson = await downloadFile("https://raw.githubusercontent.com/manaofc/file/main/package.json");
    const manaofc = await downloadFile("https://raw.githubusercontent.com/manaofc/file/main/manaofc.js");

    // 4️⃣ Push files to GitHub
    await pushFile(GITHUB_USER, repoName, "package.json", packageJson, "Add package.json");
    await new Promise(r => setTimeout(r, 1000));
    await pushFile(GITHUB_USER, repoName, "manaofc.js", manaofc, "Add manaofc.js");
    await new Promise(r => setTimeout(r, 1000));
    await pushFile(GITHUB_USER, repoName, "config.js", config, "Add config.js");

    // 5️⃣ Add GitHub Actions workflow
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
    console.error(err.response ? err.response.data : err.message);
    res.json({ success: false, error: "GitHub API error or invalid token." });
  }
});

// 🧹 Delete Bot Route
app.post("/delete-bot", async (req, res) => {
  const { repoName } = req.body;

  if (!repoName) {
    return res.json({ success: false, error: "Repository name required" });
  }

  try {
    await axios.delete(`https://api.github.com/repos/${GITHUB_USER}/${repoName}`, {
      headers: githubHeaders,
    });
    res.json({ success: true, message: `✅ '${repoName}' bot deleted successfully.` });
  } catch (err) {
    res.json({
      success: false,
      error: err.response ? err.response.data.message : err.message,
    });
  }
});

// 🟢 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
