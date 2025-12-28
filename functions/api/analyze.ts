import Groq from "groq-sdk";

export const onRequestPost: PagesFunction<{
    discovery_db: D1Database,
    GROQ_API_KEY: string,
    SERPER_API_KEY: string
}> = async ({ request, env }) => {
    try {
        const {
            modelName,
            systemInstruction,
            userPrompt,
            contextFiles = [],
            isThinking = false,
            useSearch = false
        } = await request.json() as any;

        if (!env.GROQ_API_KEY) {
            return new Response(JSON.stringify({ error: "Missing GROQ_API_KEY on server" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const groq = new Groq({ apiKey: env.GROQ_API_KEY });

        // --- Search Logic (Simplified for brevity, but same as original) ---
        let finalPrompt = userPrompt;
        let searchSources: any[] = [];

        if (useSearch && env.SERPER_API_KEY) {
            try {
                const queryResponse = await groq.chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: 'Generate a single high-impact Google search query to find market trends or competitors based on the user intent. Output ONLY the query string.' },
                        { role: 'user', content: userPrompt.slice(0, 1000) }
                    ],
                    temperature: 0.3,
                    max_tokens: 50,
                });

                const query = queryResponse.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || "";

                if (query && query.length > 3) {
                    const searchRes = await fetch("https://google.serper.dev/search", {
                        method: "POST",
                        headers: {
                            "X-API-KEY": env.SERPER_API_KEY,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ q: query, num: 5 })
                    });
                    const searchData: any = await searchRes.json();

                    if (searchData.organic) {
                        const snippets = searchData.organic.map((res: any) => `[SOURCE: ${res.link}]\n${res.snippet}`).join('\n\n');
                        searchSources = searchData.organic.map((res: any) => ({ title: res.title, uri: res.link }));
                        finalPrompt = `=== VERIFIED MARKET DATA (Query: ${query}) ===\n${snippets}\n=============================================\n\n${finalPrompt}`;
                    }
                }
            } catch (e) {
                console.error("Search failed:", e);
            }
        }

        // --- AI Call Logic ---
        const hasImages = contextFiles.some((f: any) => f.mimeType.startsWith('image/'));
        const selectedModel = hasImages ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'openai/gpt-oss-120b';

        const messages: any[] = [
            {
                role: "system",
                content: isThinking ? `You are an expert Strategic Product Analyst. Step through your reasoning in <thought> tags first.\n\n${systemInstruction}` : systemInstruction
            }
        ];

        if (hasImages) {
            const userContent: any[] = [{ type: "text", text: finalPrompt }];
            contextFiles.forEach((file: any) => {
                if (file.mimeType.startsWith('image/')) {
                    userContent.push({ type: "image_url", image_url: { url: `data:${file.mimeType};base64,${file.content}` } });
                } else {
                    userContent[0].text += `\n\n[FILE: ${file.name}]\n${file.content}`;
                }
            });
            messages.push({ role: "user", content: userContent });
        } else {
            let fullText = finalPrompt;
            contextFiles.forEach((file: any) => {
                fullText += `\n\n[FILE: ${file.name}]\n${file.content}`;
            });
            messages.push({ role: "user", content: fullText });
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: selectedModel,
            temperature: isThinking ? 0.7 : 0.5,
            max_tokens: isThinking ? 4096 : 2048,
            stream: true,
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                // First, send the sources if any
                if (searchSources.length > 0) {
                    controller.enqueue(encoder.encode(JSON.stringify({ sources: searchSources }) + "\n"));
                }

                let inThought = false;
                for await (const chunk of chatCompletion) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (!content) continue;

                    let filteredContent = content;

                    if (isThinking) {
                        // Very rough thought filtering for a stream
                        // In a real implementation, we'd need a more robust buffer-based parser
                        // to handle tags splitting across chunks. For now, we'll just stream everything
                        // and let the frontend handle the tag stripping if needed, or just send raw.
                        // Actually, let's just send the raw stream and let the frontend decide.
                    }

                    controller.enqueue(encoder.encode(JSON.stringify({ text: filteredContent }) + "\n"));
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
