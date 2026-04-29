import type { BlockedSite, LocalStorageData, SiteStats } from "./types.js"; // Note the .js extension
import { isMainDomainMatch } from "./utils.js";

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && !changeInfo.url.includes(chrome.runtime.id)) {
    const url = new URL(changeInfo.url);
    
    // Pull both the blocklist and the unlock timestamps
    const data = await chrome.storage.local.get(["blockedSites", "lastUnlocked"]) as LocalStorageData;
    const blockedSites: BlockedSite[] = data.blockedSites || [];
    const lastUnlocked = data.lastUnlocked || {};

    const isBlocked = blockedSites.some(s => isMainDomainMatch(s.hostname, url.hostname));
    
    // Check if they have a valid lease (e.g., 5 minutes)
    const unlockTime = lastUnlocked[url.hostname] || 0;
    const fiveMinutes = 5 * 60 * 1000;
    const isLeaseValid = (Date.now() - unlockTime) < fiveMinutes;

    // ONLY redirect if it's blocked AND they don't have a valid lease
    if (isBlocked && !isLeaseValid) {
      await updateVisitCount(url.hostname);
      const blockerUrl = chrome.runtime.getURL("blocker.html");
      chrome.tabs.update(tabId, { 
        url: `${blockerUrl}?target=${encodeURIComponent(url.href)}` 
      });
    }
  }
});

async function updateVisitCount(hostname: string): Promise<void> {
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  const data = await chrome.storage.local.get("stats") as LocalStorageData;
  let stats: SiteStats = data.stats || {};

  if (!stats[hostname]) {
    stats[hostname] = [];
  }

  // Filter for the last 24 hours
  stats[hostname] = stats[hostname].filter(time => now - time < dayInMs);
  stats[hostname].push(now);

  await chrome.storage.local.set({ stats });
}