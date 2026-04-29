import type types = require("./types");
import { PuzzleGame } from "./games/puzzle.js";
import type { LocalStorageData } from "./types.js";
import { findBlockedSite, normalizeBlockedSites } from "./utils.js";

const gameContainer = document.getElementById("game-container") as HTMLElement;
const winButton = document.getElementById("win-game") as HTMLButtonElement;

// Ensure it starts disabled
winButton.disabled = true;

const params = new URLSearchParams(window.location.search);
const targetUrl = params.get("target");
if (targetUrl) {
  const hostname = new URL(targetUrl).hostname;
  chrome.storage.local.get("blockedSites", (rawData) => {
    const data = rawData as types.LocalStorageData;
    const blockedSites = normalizeBlockedSites(data);
    const blockedSite = findBlockedSite(blockedSites, hostname);
    const attempts = blockedSite?.siteStats?.length || 0;
    
    const messageEl = document.getElementById("stat-message");
    if (messageEl) {
      messageEl.innerText = `You've tried to visit ${hostname} ${attempts} times in the last 24 hours.`;
    }
  });

  winButton?.addEventListener("click", async () => {
    const params = new URLSearchParams(window.location.search);
    const targetUrl = params.get("target");

    if (targetUrl) {
      const hostname = new URL(targetUrl).hostname;
      
      // 1. Get existing blocked site data
      const data = await chrome.storage.local.get("blockedSites") as types.LocalStorageData;
      const blockedSites = normalizeBlockedSites(data);
      const blockedSite = findBlockedSite(blockedSites, hostname);
      if (!blockedSite) {
        window.location.href = targetUrl;
        return;
      }
      
      // 2. Add current timestamp for this hostname
      blockedSite.lastUnlocked = Date.now();
      
      // 3. Save and Redirect
      await chrome.storage.local.set({ blockedSites });
      window.location.href = targetUrl;
    }
  });
}

async function startChallenge() {
  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get("target");
  if (!targetUrl || !gameContainer) return;

  const hostname = new URL(targetUrl).hostname;
  const rawData = await chrome.storage.local.get("blockedSites");
  const data = rawData as LocalStorageData;
  const blockedSites = normalizeBlockedSites(data);
  const blockedSite = findBlockedSite(blockedSites, hostname);
  
  const visits = blockedSite?.siteStats?.length || 0;

  // Initialize the General Game
  PuzzleGame.init({
    visitCount: visits,
    container: gameContainer,
    onWin: () => {
      if (winButton) {    
      winButton.disabled = false;
      winButton.innerText = "Challenge Complete! Click to Enter.";
      winButton.style.backgroundColor = "#27ae60";
      }
    }
  });
}

startChallenge();