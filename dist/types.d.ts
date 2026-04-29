export interface BlockedSite {
    hostname: string;
    lastUnlocked?: number;
    siteStats?: number[];
}
export interface LocalStorageData {
    blockedSites?: BlockedSite[];
}
//# sourceMappingURL=types.d.ts.map