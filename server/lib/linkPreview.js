const cache = new Map();
const TTL_MS = 1000 * 60 * 60; // 1 hour
const URL_REGEX = /(https?:\/\/[^\s]+)/i;

export const extractFirstUrl = (text) => {
    const match = text?.match(URL_REGEX);
    return match ? match[1] : null;
};

const metaTag = (html, property) => {
    const re = new RegExp(
        `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
        "i"
    );
    const match = html.match(re);
    return match ? match[1] : null;
};

export const fetchLinkPreview = async (url) => {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < TTL_MS) {
        return cached.data;
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        const html = await response.text();
        const data = {
            url,
            title: metaTag(html, "og:title") || html.match(/<title>([^<]*)<\/title>/i)?.[1] || url,
            description: metaTag(html, "og:description") || metaTag(html, "description") || "",
            image: metaTag(html, "og:image") || "",
        };
        cache.set(url, { data, timestamp: Date.now() });
        return data;
    } catch (error) {
        return null;
    }
};
