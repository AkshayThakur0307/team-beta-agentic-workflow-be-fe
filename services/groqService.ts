import { FileContext, GroundingSource } from "../types";

export interface GroqAgentResponse {
    text: string;
    sources?: GroundingSource[];
    searchEntryPointHtml?: string;
}

export async function callGroqAgent(
    modelName: string,
    systemInstruction: string,
    userPrompt: string,
    contextFiles: FileContext[] = [],
    isThinking: boolean = false,
    useSearch: boolean = false,
    onProgress?: (text: string) => void
): Promise<GroqAgentResponse> {
    console.log("Calling Backend AI Orchestrator (Streaming)...");

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                modelName,
                systemInstruction,
                userPrompt,
                contextFiles,
                isThinking,
                useSearch
            })
        });

        if (!response.ok) {
            const errData = await response.json() as any;
            throw new Error(errData.error || "Backend analysis failed");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let aggregatedText = "";
        let sources: GroundingSource[] | undefined;

        if (!reader) throw new Error("No readable stream in response");

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const data = JSON.parse(line);
                    if (data.sources) {
                        sources = data.sources;
                    }
                    if (data.text) {
                        aggregatedText += data.text;
                        if (onProgress) onProgress(data.text);
                    }
                } catch (e) {
                    console.warn("Failed to parse stream line:", line);
                }
            }
        }

        return {
            text: aggregatedText,
            sources: sources
        };

    } catch (error: any) {
        console.error("Analysis Error:", error);
        throw new Error(error.message || "Communication failure with backend.");
    }
}

