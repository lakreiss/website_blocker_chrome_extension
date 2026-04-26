// src/popup.ts
const input = document.getElementById('site-input');
const saveBtn = document.getElementById('save-btn');
const list = document.getElementById('site-list');
// Load and display sites on popup open
async function updateList() {
    const data = await chrome.storage.local.get("blockedSites");
    const sites = data.blockedSites || [];
    list.innerHTML = "";
    sites.forEach((site, index) => {
        const li = document.createElement('li');
        li.textContent = site.hostname;
        const del = document.createElement('span');
        del.textContent = "×";
        del.className = "delete-btn";
        del.onclick = () => removeSite(index);
        li.appendChild(del);
        list.appendChild(li);
    });
}
async function addSite() {
    const newSite = input.value.trim().toLowerCase();
    if (newSite) {
        const data = await chrome.storage.local.get("blockedSites");
        const sites = data.blockedSites || [];
        if (!sites.some(site => site.hostname === newSite)) {
            sites.push({ hostname: newSite });
            await chrome.storage.local.set({ blockedSites: sites });
            input.value = "";
            updateList();
        }
    }
}
async function removeSite(index) {
    const data = await chrome.storage.local.get("blockedSites");
    let sites = data.blockedSites || [];
    sites.splice(index, 1);
    await chrome.storage.local.set({ blockedSites: sites });
    updateList();
}
saveBtn.addEventListener('click', addSite);
updateList();
export {};
//# sourceMappingURL=popup.js.map