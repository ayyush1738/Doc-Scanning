const axios = require("axios");
require("dotenv").config();

const API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";
const API_KEY = "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";

async function embedTexts(textArray) {
    try {
        const response = await axios.post(
            API_URL,
            { inputs: textArray }, 
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
            }
        );

        if (!Array.isArray(response.data) || response.data.some(item => !Array.isArray(item))) {
            console.error("Unexpected API response:", response.data);
            return null;
        }

        return response.data; 
    } catch (error) {
        console.error("Error fetching BERT embeddings:", error.response?.data || error.message);
        return null;
    }
}

function cosineSimilarity(vec1, vec2) {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;

    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        normA += vec1[i] * vec1[i];
        normB += vec2[i] * vec2[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { embedTexts, cosineSimilarity };
