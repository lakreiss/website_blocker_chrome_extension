import type { BlockedSite, LocalStorageData } from "./types.js"; // Note the .js extension
import { isMainDomainMatch } from "./utils.js";

// src/popup.ts
const input = document.getElementById('site-input') as HTMLInputElement;
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const list = document.getElementById('site-list') as HTMLUListElement;

// Load and display sites on popup open
async function updateList() {
  const data = await chrome.storage.local.get("blockedSites") as LocalStorageData;
  const sites: BlockedSite[] = data.blockedSites || [];
  
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
    const data = await chrome.storage.local.get("blockedSites") as LocalStorageData;
    const sites: BlockedSite[] = data.blockedSites || [];
    
    if (!sites.some(site => isMainDomainMatch(site.hostname, newSite))) {
      sites.push({ hostname: newSite });
      await chrome.storage.local.set({ blockedSites: sites });
      input.value = "";
      updateList();
    }
  }
}

async function removeSite(index: number) {
  const data = await chrome.storage.local.get("blockedSites") as LocalStorageData;
  let sites: BlockedSite[] = data.blockedSites || [];
  sites.splice(index, 1);
  await chrome.storage.local.set({ blockedSites: sites });
  updateList();
}

saveBtn.addEventListener('click', addSite);
updateList();