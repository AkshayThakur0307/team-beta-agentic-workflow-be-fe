import Groq from "groq-sdk";

export const onRequestPost: PagesFunction<{
    GROQ_API_KEY: string
}> = async ({ request, env }) => {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('file') as File;
        const appState = JSON.parse(formData.get('appState') as string);
        const systemPrompt = formData.get('systemPrompt') as string;

        if (!env.GROQ_API_KEY) {
            return new Response(JSON.stringify({ error: "Missing GROQ_API_KEY" }), { status: 500 });
        }

        const groq = new Groq({ apiKey: env.GROQ_API_KEY });

        // 1. Transcribe
        const transcription = await groq.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-large-v3-turbo',
        });

        const userText = transcription.text;
        if (!userText.trim()) {
            return new Response(JSON.stringify({ text: "", aiResponse: null }));
        }

        // 2. AI Response with Tool Calling
        const response = await groq.chat.completions.create({
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

        return new Response(JSON.stringify({
            userText,
            aiResponse: {
                content: aiMessage.content,
                tool_calls: aiMessage.tool_calls
            }
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("Voice API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
