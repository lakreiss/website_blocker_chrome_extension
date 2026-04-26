export interface SiteStats {
    [hostname: string]: number[];
}
export interface BlockedSite {
    hostname: string;
}
export interface LocalStorageData {
    blockedSites?: BlockedSite[];
    stats?: SiteStats;
    lastUnlocked?: {
        [hostname: string]: number;
    };
}
//# sourceMappingURL=types.d.ts.map