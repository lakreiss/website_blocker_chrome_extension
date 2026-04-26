import type types = require("./types");

const params = new URLSearchParams(window.location.search);
const targetUrl = params.get("target");
if (targetUrl) {
  const hostname = new URL(targetUrl).hostname;
  chrome.storage.local.get("stats", (data) => {
    const stats: types.SiteStats = data.stats as types.SiteStats || ({} as types.SiteStats);
    const attempts = stats[hostname]?.length || 0;
    
    const messageEl = document.getElementById("stat-message");
    if (messageEl) {
      messageEl.innerText = `You've tried to visit ${hostname} ${attempts} times in the last 24 hours.`;
    }
  });

  const winButton = document.getElementById("win-game");

  winButton?.addEventListener("click", async () => {
    const params = new URLSearchParams(window.location.search);
    const targetUrl = params.get("target");

    if (targetUrl) {
      const hostname = new URL(targetUrl).hostname;
      
      // 1. Get existing unlock data
      const data = await chrome.storage.local.get("lastUnlocked") as types.LocalStorageData;
      const lastUnlocked = data.lastUnlocked || {};
      
      // 2. Add current timestamp for this hostname
      lastUnlocked[hostname] = Date.now();
      
      // 3. Save and Redirect
      await chrome.storage.local.set({ lastUnlocked });
      window.location.href = targetUrl;
    }
  });
}