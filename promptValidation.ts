// File: promptValidation.ts

import * as fs from 'fs';
import stringSimilarity from 'string-similarity';
const natural = require('natural');
const SentimentAnalyzer = natural.SentimentAnalyzer;
const PorterStemmer = natural.PorterStemmer;

const prompts = JSON.parse(fs.readFileSync('prompts.json', 'utf-8'));

// Predefined flagged words (expandable list)
const flaggedWords = ["bias", "stereotype", "offensive", "discriminatory", "prejudice"];

// Function to check clarity using simple grammar rules
function checkClarity(prompt: string): boolean {
    return /^[A-Z][^.!?]*[.!?]$/.test(prompt); // Ensures sentence starts uppercase & ends properly
}

// Function to check relevance using similarity score
function checkRelevance(prompt: string, category: string): boolean {
    return stringSimilarity.compareTwoStrings(prompt.toLowerCase(), category.toLowerCase()) > 0.6; // 0.6 threshold for relevance
}

// Function to check for flagged words
function containsFlaggedWords(prompt: string): boolean {
    return flaggedWords.some(word => prompt.toLowerCase().includes(word));
}

// Function to validate length constraints
function validateLength(prompt: string, min: number = 10, max: number = 200): boolean {
    return prompt.length >= min && prompt.length <= max;
}

// Sentiment Analysis using natural.js
const sentimentAnalyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
function analyzeSentiment(prompt: string): string {
    const score = sentimentAnalyzer.getSentiment(prompt.split(' '));
    return score < 0 ? "Negative" : score > 0 ? "Positive" : "Neutral";
}

// Run validation on all prompts
(async () => {
    const results = prompts.map((item: any) => {
        return {
            id: item.id,
            clarity: checkClarity(item.prompt),
            relevance: checkRelevance(item.prompt, item.category),
            flaggedWords: containsFlaggedWords(item.prompt),
            lengthValid: validateLength(item.prompt),
            sentiment: analyzeSentiment(item.prompt)
        };
    });

    console.log(results);
    fs.writeFileSync('promptValidationResults.json', JSON.stringify(results, null, 2));
})();
