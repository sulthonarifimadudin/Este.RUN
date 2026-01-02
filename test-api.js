
const API_KEY = "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";

async function testOpenRouter() {
    console.log("Testing OpenRouter API...");
    console.log("Key:", API_KEY.slice(0, 10) + "...");

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://esterun.app",
                "X-Title": "Este.RUN"
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-chat",
                "messages": [
                    { "role": "user", "content": "Hello, are you online?" }
                ]
            })
        });

        console.log("Status:", response.status);
        const data = await response.json();

        if (!response.ok) {
            console.error("ERROR RESPONSE:", JSON.stringify(data, null, 2));
        } else {
            console.log("SUCCESS:", data.choices[0].message.content);
        }

    } catch (error) {
        console.error("FETCH ERROR:", error);
    }
}

testOpenRouter();
