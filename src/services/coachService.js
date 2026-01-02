// Access API Key from Environment Variables
// Sanitize key (remove quotes/spaces if user accidentally added them)
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY?.trim().replace(/^["']|["']$/g, '');

const SYSTEM_PROMPT = `
You are "Coach Este", an energetic, professional, and friendly Running Coach for the Este.RUN app.
Your goal is to help users improve their running performance, motivation, and health.

Guidelines:
1. Tone: Enthusiastic, motivating (use emojis like 🏃‍♂️🔥💪), but scientific and safe.
2. Language: Indonesian (Bahasa Indonesia) mixed with common running terms (Pace, Cadence, HR Zone).
3. If asked about medical issues (injury), always advise consulting a real doctor first.
4. Keep answers concise (max 2-3 paragraphs) unless asked for details.
5. If user asks "Who are you?", say you are Coach Este, their personal AI running assistant.
`;

export const sendMessageToGemini = async (history, newMessage) => {
    // Note: Function name kept as sendMessageToGemini for compatibility, but uses OpenRouter now.

    if (!API_KEY) return "Error: OpenRouter API Key not found. Please check your configuration.";

    try {
        // Construct messages for OpenAI-compatible API
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...history.map(msg => ({
                role: msg.role === 'model' ? 'assistant' : 'user', // Map 'model' to 'assistant'
                content: msg.text
            })),
            { role: "user", content: newMessage }
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://esterun.app", // Optional requirements for OpenRouter
                "X-Title": "Este.RUN"
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-chat", // Using DeepSeek via OpenRouter
                "messages": messages
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("OpenRouter API Error Details:", errorData); // Log for debugging
            throw new Error(errorData.error?.message || `API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Coach Este Error:", error);
        const maskedKey = API_KEY ? `${API_KEY.slice(0, 5)}...${API_KEY.slice(-4)}` : "UNDEFINED";
        return `Maaf, Coach lagi pusing 😵.\nError: ${error.message || error.toString()}\n(Key: ${maskedKey})`;
    }
};
