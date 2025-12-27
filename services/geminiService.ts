
import { GoogleGenAI } from "@google/genai";
import { FileContext, GroundingSource } from "../types";

export interface GeminiAgentResponse {
  text: string;
  sources?: GroundingSource[];
  searchEntryPointHtml?: string;
}

export async function callGeminiAgent(
  modelName: string,
  systemInstruction: string,
  userPrompt: string,
  contextFiles: FileContext[] = [],
  isThinking: boolean = false,
  useSearch: boolean = false
): Promise<GeminiAgentResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [{ text: userPrompt }];

  // Handle multimodal context (Images, PDFs, and Videos)
  contextFiles.forEach(file => {
    const isMultimodal = 
      file.mimeType.startsWith('image/') || 
      file.mimeType.startsWith('video/') || 
      file.mimeType === 'application/pdf';
    
    if (isMultimodal) {
      parts.push({
        inlineData: {
          data: file.content, // Base64
          mimeType: file.mimeType
        }
      });
    } else {
      // Text context
      parts.push({ text: `[FILE: ${file.name}]\n${file.content}` });
    }
  });

  try {
    // Force gemini-3-pro-preview for multimodal or thinking tasks as requested
    const hasMultimodal = contextFiles.some(f => f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/'));
    
    // Determine model. Note: gemini-3-flash-preview is usually better for fast search grounding
    let modelToUse = modelName;
    if (isThinking || hasMultimodal) {
      modelToUse = 'gemini-3-pro-preview';
    }

    const config: any = {
      systemInstruction: systemInstruction,
      temperature: isThinking ? 0.7 : 0.4,
      topP: 0.95,
    };

    if (isThinking) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: { parts },
      config: config,
    });

    const text = response.text || "No response received from agent.";
    
    // Extract grounding metadata if available
    const sources: GroundingSource[] = [];
    let searchEntryPointHtml: string | undefined = undefined;

    const metadata = response.candidates?.[0]?.groundingMetadata;
    
    // 1. Extract Chunks (URLs)
    const chunks = metadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sources.push({
            title: chunk.web.title || chunk.web.uri,
            uri: chunk.web.uri
          });
        }
      });
    }

    // 2. Extract Search Entry Point (The "Search on Google" button/query info)
    if (metadata?.searchEntryPoint?.renderedContent) {
      searchEntryPointHtml = metadata.searchEntryPoint.renderedContent;
    }

    // Deduplicate sources
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return { 
      text, 
      sources: uniqueSources.length > 0 ? uniqueSources : undefined,
      searchEntryPointHtml
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Communication failure.");
  }
}
