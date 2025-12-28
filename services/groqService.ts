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
    useSearch: boolean = false
): Promise<GroqAgentResponse> {
    console.log("Calling Backend AI Orchestrator...");

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

        const data = await response.json() as any;
        return {
            text: data.text,
            sources: data.sources,
            searchEntryPointHtml: data.searchEntryPointHtml
        };

    } catch (error: any) {
        console.error("Analysis Error:", error);
        throw new Error(error.message || "Communication failure with backend.");
    }
}

