import { Readability } from '@mozilla/readability';
import DOMPurify from 'dompurify';

export async function scrapeUrl(url: string): Promise<string> {
    try {
        // Reverting to AllOrigins per user request
        console.log(`Scraping URL via AllOrigins: ${url}`);

        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&timestamp=${Date.now()}`;

        const response = await fetch(proxyUrl);
        console.log(`Proxy response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Proxy Error Details: ${errorText}`);
            throw new Error(`Failed to fetch URL via proxy: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const html = data.contents;

        if (!html || html.length < 100) {
            console.warn("Proxy returned suspiciously short or empty content.");
            throw new Error("No substantial content returned from AllOrigins proxy.");
        }

        // 1. Sanitize the HTML to prevent XSS (even though we are just parsing, it's good practice)
        const cleanHtml = DOMPurify.sanitize(html);

        // 2. Parse HTML string into a DOM Document
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanHtml, "text/html");

        // 3. Use Readability to extract the main article content
        const reader = new Readability(doc);
        const article = reader.parse();

        if (!article) {
            // Fallback: Just get body text if Readability fails
            const textContent = doc.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 15000);
            return `URL: ${url}\nTITLE: (Fallback Extraction)\n\nCONTENT:\n${textContent}`;
        }

        // Return structured text
        const title = article.title || "No Title";
        const textContent = article.textContent.replace(/\s+/g, ' ').trim();

        return `URL: ${url}\nTITLE: ${title}\n\nCONTENT:\n${textContent}`;

    } catch (error: any) {
        console.error(`Scraping error for ${url}:`, error);
        return `[FAILED TO SCRAPE URL: ${url} - Error: ${error.message}]`;
    }
}
