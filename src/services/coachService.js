// Access API Key from Environment Variables
// Sanitize key (remove quotes/spaces if user accidentally added them)
// TEMPORARY DEBUG: Hardcoded key to bypass .env caching issues
const API_KEY = "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"; // import.meta.env.VITE_OPENROUTER_API_KEY?.trim().replace(/^["']|["']$/g, '');

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

    // DEBUG: Log key (safe) to check if hardcode is working
    console.log("DEBUG: Using API Key:", API_KEY ? `${API_KEY.slice(0, 8)}...` : "UNDEFINED");

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
                "Content-Type": "application/json"
                // REMOVED REFERER to avoid 'User not found' on localhost
            },
            body: JSON.stringify({
                "model": "xiaomi/mimo-v2-flash:free", // Using Xiaomi Mimo Flash via OpenRouter
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
        return `Maaf, Coach lagi pusing 😵.\nError: ${error.message || error.toString()}`;
    }
};
