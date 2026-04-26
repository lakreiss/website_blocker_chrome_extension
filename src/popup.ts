import type types = require("./types");

// src/popup.ts
const input = document.getElementById('site-input') as HTMLInputElement;
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const list = document.getElementById('site-list') as HTMLUListElement;

// Load and display sites on popup open
async function updateList() {
  const data = await chrome.storage.local.get("blockedSites") as types.LocalStorageData;
  const sites: types.BlockedSite[] = data.blockedSites || [];
  
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
    const data = await chrome.storage.local.get("blockedSites") as types.LocalStorageData;
    const sites: types.BlockedSite[] = data.blockedSites || [];
    
    if (!sites.some(site => site.hostname === newSite)) {
      sites.push({ hostname: newSite });
      await chrome.storage.local.set({ blockedSites: sites });
      input.value = "";
      updateList();
    }
  }
}

async function removeSite(index: number) {
  const data = await chrome.storage.local.get("blockedSites") as types.LocalStorageData;
  let sites: types.BlockedSite[] = data.blockedSites || [];
  sites.splice(index, 1);
  await chrome.storage.local.set({ blockedSites: sites });
  updateList();
}

saveBtn.addEventListener('click', addSite);
updateList();