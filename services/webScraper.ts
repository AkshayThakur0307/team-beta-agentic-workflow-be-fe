
import { Readability } from '@mozilla/readability';
import DOMPurify from 'dompurify';

export async function scrapeUrl(url: string): Promise<string> {
    try {
        // Use a public CORS proxy to bypass browser restrictions
        // api.allorigins.win is a reliable free proxy
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch URL via proxy: ${response.statusText}`);
        }

        const data = await response.json();
        const html = data.contents; // allorigins returns { contents: "...", status: ... }

        if (!html) {
            throw new Error("No content returned from proxy.");
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
            return doc.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 15000);
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
