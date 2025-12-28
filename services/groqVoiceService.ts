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
    private handlers: VoiceHandlers;
    private appState: AppState;
    private mediaRecorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];
    private isProcessing = false;

    constructor(handlers: VoiceHandlers, appState: AppState) {
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
            const formData = new FormData();
            formData.append('file', blob, 'audio.webm');
            formData.append('appState', JSON.stringify(this.appState));

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
            formData.append('systemPrompt', systemPrompt);

            const response = await fetch('/api/voice', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error("Voice processing failed on backend");

            const data = await response.json() as any;
            if (!data.userText) return;

            this.handlers.onTranscription(data.userText, 'user');

            if (data.aiResponse) {
                const aiMessage = data.aiResponse;

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
            }

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

