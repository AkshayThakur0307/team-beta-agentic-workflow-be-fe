import Groq from "groq-sdk";
import { AppState, DiscoveryStage } from '../types';
import { STAGE_CONFIGS } from '../constants';

export interface VoiceHandlers {
    onUpdateMainContext: (text: string, mode: 'replace' | 'append') => void;
    onUpdateRefinementAnswer: (index: number, text: string) => void;
    onSwitchModule: (module: string) => void;
    onTranscription: (text: string, role: 'user' | 'assistant') => void;
    onStateChange: (state: { isListening: boolean; isSpeaking: boolean }) => void;
}

export class GroqVoiceAssistant {
    private groq: Groq;
    private handlers: VoiceHandlers;
    private appState: AppState;
    private mediaRecorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];
    private isProcessing = false;

    constructor(handlers: VoiceHandlers, appState: AppState) {
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY, dangerouslyAllowBrowser: true });
        this.handlers = handlers;
        this.appState = appState;
    }

    async start() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.chunks = [];

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.chunks.push(e.data);
            };

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.chunks, { type: 'audio/webm' });
                await this.processAudio(audioBlob);
            };

            this.mediaRecorder.start();
            this.handlers.onStateChange({ isListening: true, isSpeaking: false });
        } catch (err) {
            console.error("Microphone Access Error:", err);
        }
    }

    stop() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
            this.handlers.onStateChange({ isListening: false, isSpeaking: false });
        }
    }

    private async processAudio(blob: Blob) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            // 1. Transcription using Whisper-Large-V3-Turbo
            const file = new File([blob], 'audio.webm', { type: 'audio/webm' });
            const transcription = await this.groq.audio.transcriptions.create({
                file: file,
                model: 'whisper-large-v3-turbo',
            });

            const userText = transcription.text;
            if (!userText.trim()) return;

            this.handlers.onTranscription(userText, 'user');

            // 2. Intelligent Response & Action using GPT-OSS-120B
            const currentStageData = this.appState.stages[this.appState.currentStage];
            const questionsContext = currentStageData.questions.length > 0
                ? `Refinement Questions Available:\n${currentStageData.questions.map((q, i) => `${i}: ${q}`).join('\n')}`
                : "No refinement questions currently.";

            const systemPrompt = `
        You are the PRSIM.AI Discovery Voice Assistant powered by GPT-OSS-120B.
        
        Current Module: ${this.appState.currentStage} (${STAGE_CONFIGS[this.appState.currentStage].title})
        Current Text Input: "${currentStageData.input}"
        ${questionsContext}
        
        GOAL:
        - Determine if the user is providing new info, answering a question, or switching modules.
        - Respond concisely for text-to-speech.
        - You MUST use one of the tools provided to update the app state.
      `;

            const response = await this.groq.chat.completions.create({
                model: 'openai/gpt-oss-120b',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userText }
                ],
                tools: [
                    {
                        type: 'function',
                        function: {
                            name: 'updateMainContext',
                            description: 'Update the primary text box for the project analysis.',
                            parameters: {
                                type: 'object',
                                properties: {
                                    text: { type: 'string' },
                                    mode: { type: 'string', enum: ['replace', 'append'] }
                                },
                                required: ['text', 'mode']
                            }
                        }
                    },
                    {
                        type: 'function',
                        function: {
                            name: 'updateRefinementAnswer',
                            description: 'Answer a specific follow-up question.',
                            parameters: {
                                type: 'object',
                                properties: {
                                    index: { type: 'number' },
                                    text: { type: 'string' }
                                },
                                required: ['index', 'text']
                            }
                        }
                    },
                    {
                        type: 'function',
                        function: {
                            name: 'switchModule',
                            description: 'Navigate to a different discovery stage.',
                            parameters: {
                                type: 'object',
                                properties: {
                                    module: { type: 'string', enum: ['DOMAIN', 'BOD', 'KPI', 'EPICS'] }
                                },
                                required: ['module']
                            }
                        }
                    }
                ],
                tool_choice: 'auto',
            });

            const aiMessage = response.choices[0].message;

            // Handle Tool Calls
            if (aiMessage.tool_calls) {
                for (const toolCall of aiMessage.tool_calls) {
                    const args = JSON.parse(toolCall.function.arguments);
                    if (toolCall.function.name === 'updateMainContext') this.handlers.onUpdateMainContext(args.text, args.mode);
                    if (toolCall.function.name === 'updateRefinementAnswer') this.handlers.onUpdateRefinementAnswer(args.index, args.text);
                    if (toolCall.function.name === 'switchModule') this.handlers.onSwitchModule(args.module);
                }
            }

            const replyText = aiMessage.content || "Got it. I've updated the project details.";
            this.handlers.onTranscription(replyText, 'assistant');
            this.speak(replyText);

        } catch (err) {
            console.error("Voice Processing Error:", err);
            this.speak("I'm sorry, I had trouble processing your voice.");
        } finally {
            this.isProcessing = false;
        }
    }

    private speak(text: string) {
        this.handlers.onStateChange({ isListening: false, isSpeaking: true });
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => {
            this.handlers.onStateChange({ isListening: false, isSpeaking: false });
        };
        window.speechSynthesis.speak(utterance);
    }
}
