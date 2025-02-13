import * as fs from 'fs';
import stringSimilarity from 'string-similarity';
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const textReadability = require('text-readability');

const jsonFile = 'prompts.json';

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

// Function to check string similarity against topic descriptions
function checkSimilarity(prompt: string, topicDescription: string): number {
    if (!topicDescription) {
        console.warn(`Missing topic description for prompt: ${prompt}`);
        return 0;
    }
    console.log(`Checking similarity between: "${prompt}" and "${topicDescription}"`);
    return stringSimilarity.compareTwoStrings(prompt, topicDescription);
}

// Function to calculate readability score
function getReadabilityScore(text: string): number {
    console.log(`Calculating readability score for text: "${text}"`);
    if (typeof textReadability.fleschKincaidGrade === 'function') {
        const score = textReadability.fleschKincaidGrade(text);
        if (typeof score === 'number') {
            return score;
        }
    }
    console.warn('fleschKincaidGrade function not found or returned invalid value.');
    return 0;
}

// Identify correct key for topic descriptions in prompts.json
function getTopicDescription(prompt: any): string {
    if (prompt.category) return prompt.category;
    if (prompt.topic) return prompt.topic;
    console.warn(`No category or topic found for prompt ID: ${prompt.id}`);
    return '';
}

// Function to process fidelity checks
function processFidelityCheck(prompts: any[]): any[] {
    return prompts.map(prompt => {
        console.log(`Processing prompt ID: ${prompt.id}`);
        const dom = new JSDOM(`<html><body>${prompt.prompt}</body></html>`);
        const reader = new Readability(dom.window.document);
        const result = reader.parse();

        if (!result) {
            console.warn(`Readability parsing failed for prompt ID: ${prompt.id}`);
        }

        const readabilityScore = result ? getReadabilityScore(result.textContent) : 0;
        const topicDescription = getTopicDescription(prompt);
        const topicSimilarity = checkSimilarity(prompt.prompt, topicDescription);

        return {
            id: prompt.id,
            prompt: prompt.prompt,
            topicSimilarity: topicSimilarity,
            readabilityScore: readabilityScore
        };
    });
}

const fidelityResults = processFidelityCheck(prompts);
try {
    fs.writeFileSync('fidelityCheckResults.json', JSON.stringify(fidelityResults, null, 2));
    console.log('Fidelity check completed. Results saved to fidelityCheckResults.json');
} catch (error) {
    console.error('Error writing fidelityCheckResults.json:', error);
}
