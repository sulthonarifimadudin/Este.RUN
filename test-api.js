
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDZw2Kz3_85ZnGZWg-09OFjuUx2_v0WOBg";

async function testSDK() {
    console.log("Testing Google Gemini SDK...");

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Using "gemini-pro" as it's the standard for free tier text
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = "Hello! Reply 'Gemini SDK Online'.";
        console.log("Prompting:", prompt);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("SUCCESS:", text);

    } catch (error) {
        console.error("SDK ERROR:", error);
    }
}

testSDK();
