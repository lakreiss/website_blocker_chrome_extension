export function isMainDomainMatch(urlA, urlB) {
    const getDomainLabel = (input) => {
        try {
            let hostname = input.toLowerCase().trim();
            // 1. Strip protocol if present (e.g., https://www.google.com -> www.google.com)
            if (hostname.includes('://')) {
                hostname = new URL(hostname).hostname;
            }
            else {
                // Handle paths if user passes "reddit.com/r/all"
                hostname = hostname.split('/')[0] ?? hostname;
            }
            // 2. Remove 'www.' prefix
            hostname = hostname.replace(/^www\./, '');
            // 3. Extract the core name
            const parts = hostname.split('.');
            // If it's something like "localhost", parts.pop() is the only thing there
            const tld = parts.pop() ?? "";
            const mainPart = parts.pop() ?? tld;
            return mainPart;
        }
        catch (e) {
            return "";
        }
    };
    const domain1 = getDomainLabel(urlA);
    const domain2 = getDomainLabel(urlB);
    return domain1 !== "" && domain1 === domain2;
}
//# sourceMappingURL=utils.js.map