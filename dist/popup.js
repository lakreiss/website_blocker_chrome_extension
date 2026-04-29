import { isMainDomainMatch, normalizeBlockedSites } from "./utils.js";
// src/popup.ts
const input = document.getElementById('site-input');
const saveBtn = document.getElementById('save-btn');
const list = document.getElementById('site-list');
// Load and display sites on popup open
async function updateList() {
    const data = await chrome.storage.local.get("blockedSites");
    const sites = normalizeBlockedSites(data);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    list.innerHTML = "";
    sites.forEach((site, index) => {
        const li = document.createElement('li');
        // 1. Determine Status
        const unlockTime = site.lastUnlocked || 0;
        const isLeaseValid = (now - unlockTime) < fiveMinutes;
        // 2. Create Toggle Button
        const statusBtn = document.createElement('button');
        statusBtn.className = `status-btn ${isLeaseValid ? 'unlocked' : 'locked'}`;
        statusBtn.innerHTML = isLeaseValid ? '🔓' : '🔒';
        statusBtn.title = isLeaseValid ? 'Currently Unlocked (Click to Lock)' : 'Locked';
        // If unlocked, allow user to lock it manually
        if (isLeaseValid) {
            statusBtn.onclick = () => lockSite(site.hostname);
        }
        else {
            statusBtn.onclick = () => unlockSite(site.hostname); // Allow manual unlocking even if already locked
        }
        // 3. Label and Delete Button
        const label = document.createElement('span');
        label.textContent = site.hostname;
        label.style.flexGrow = "1";
        const del = document.createElement('span');
        del.textContent = "×";
        del.className = "delete-btn";
        del.onclick = () => removeSite(index);
        li.appendChild(statusBtn);
        li.appendChild(label);
        li.appendChild(del);
        list.appendChild(li);
    });
}
async function addSite() {
    const newSite = input.value.trim().toLowerCase();
    if (newSite) {
        const data = await chrome.storage.local.get("blockedSites");
        const sites = normalizeBlockedSites(data);
        if (!sites.some(site => isMainDomainMatch(site.hostname, newSite))) {
            sites.push({ hostname: newSite, lastUnlocked: 0, siteStats: [] });
            await chrome.storage.local.set({ blockedSites: sites });
            input.value = "";
            updateList();
        }
    }
}
async function removeSite(index) {
    const data = await chrome.storage.local.get("blockedSites");
    let sites = normalizeBlockedSites(data);
    sites.splice(index, 1);
    await chrome.storage.local.set({ blockedSites: sites });
    updateList();
}
// Function to manually "Relock" a site by clearing its timestamp
async function lockSite(hostname) {
    const data = await chrome.storage.local.get("blockedSites");
    const sites = normalizeBlockedSites(data);
    const site = sites.find((entry) => entry.hostname === hostname);
    // Setting to 0 effectively expires the 5-minute lease
    if (!site) {
        return;
    }
    site.lastUnlocked = 0;
    await chrome.storage.local.set({ blockedSites: sites });
    updateList();
}
async function unlockSite(hostname) {
    const data = await chrome.storage.local.get("blockedSites");
    const sites = normalizeBlockedSites(data);
    const site = sites.find((entry) => entry.hostname === hostname);
    if (site) {
        site.lastUnlocked = Date.now(); // Create a valid lease
        await chrome.storage.local.set({ blockedSites: sites });
        updateList();
    }
}
// Add site when 'Enter' is pressed
input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addSite();
    }
});
// Your existing button click listener
saveBtn.addEventListener('click', addSite);
updateList();
//# sourceMappingURL=popup.js.map