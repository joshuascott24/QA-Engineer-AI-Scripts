import * as fs from 'fs';
import natural from 'natural';

const jsonFile = 'prompts.json';
const biasKeywords = ['gender', 'race', 'ethnicity', 'religion', 'disability', 'political', 'biased', 'stereotype', 'prejudice'];
const Sentiment = require('sentiment');
const sentimentAnalyzer = new Sentiment();



// Load prompts from JSON file
let prompts: any[] = [];
if (fs.existsSync(jsonFile)) {
    try {
        prompts = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
        console.log('Successfully loaded prompts.json');
    } catch (error) {
        console.error('Error reading prompts.json:', error);
    }
}

// Function to detect potential bias in prompts
function detectBias(text: string): boolean {
    return biasKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

// Function to analyze sentiment
function analyzeSentiment(text: string): number {
    const result = sentimentAnalyzer.analyze(text);
    return result.score;
}

// Function to analyze prompts for bias and sentiment
function processBiasDetection(prompts: any[]): any[] {
    return prompts.map(prompt => {
        console.log(`Processing prompt ID: ${prompt.id}`);
        const biasDetected = detectBias(prompt.prompt);
        const sentimentScore = analyzeSentiment(prompt.prompt);
        return {
            id: prompt.id,
            prompt: prompt.prompt,
            biasDetected: biasDetected,
            sentimentScore: sentimentScore
        };
    });
}

const biasResults = processBiasDetection(prompts);
try {
    fs.writeFileSync('biasDetectionResults.json', JSON.stringify(biasResults, null, 2));
    console.log('Bias detection completed. Results saved to biasDetectionResults.json');
} catch (error) {
    console.error('Error writing biasDetectionResults.json:', error);
}
