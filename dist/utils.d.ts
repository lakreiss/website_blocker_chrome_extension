import type { BlockedSite, LocalStorageData } from "./types.js";
export declare function isMainDomainMatch(urlA: string, urlB: string): boolean;
export declare function findBlockedSite(blockedSites: BlockedSite[], hostname: string): BlockedSite | undefined;
export declare function normalizeBlockedSites(data: LocalStorageData): BlockedSite[];
//# sourceMappingURL=utils.d.ts.map