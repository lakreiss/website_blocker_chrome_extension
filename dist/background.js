import { findBlockedSite, isMainDomainMatch, normalizeBlockedSites } from "./utils.js";
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url && !changeInfo.url.includes(chrome.runtime.id)) {
        const url = new URL(changeInfo.url);
        // Pull both the blocklist and the unlock timestamps
        const data = await chrome.storage.local.get("blockedSites");
        const blockedSites = normalizeBlockedSites(data);
        const isBlocked = blockedSites.some(s => isMainDomainMatch(s.hostname, url.hostname));
        // Check if they have a valid lease (e.g., 5 minutes)
        const blockedSite = findBlockedSite(blockedSites, url.hostname);
        const unlockTime = blockedSite?.lastUnlocked || 0;
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
async function updateVisitCount(hostname) {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    const data = await chrome.storage.local.get("blockedSites");
    const blockedSites = normalizeBlockedSites(data);
    const blockedSite = findBlockedSite(blockedSites, hostname);
    if (!blockedSite) {
        return;
    }
    // Filter for the last 24 hours
    const siteStats = blockedSite.siteStats || [];
    blockedSite.siteStats = siteStats.filter(time => now - time < dayInMs);
    blockedSite.siteStats.push(now);
    await chrome.storage.local.set({ blockedSites });
}
console.log('Background script finishes loading');
//# sourceMappingURL=background.js.map