// File: dataIntegrity.ts

import * as fs from 'fs';
const csv = require('csv-parser'); // Fixing csv-parser import
import stringSimilarity from 'string-similarity';

const jsonFile = 'prompts.json';
const csvFile = 'prompts.csv';

// Load prompts from JSON file
let prompts: any[] = [];
if (fs.existsSync(jsonFile)) {
    prompts = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
}

// Function to read CSV file
function loadCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data: any) => results.push(data)) // Explicitly type 'data' as any
            .on('end', () => resolve(results))
            .on('error', (error: Error) => reject(error)); // Explicitly type 'error' as Error
    });
}

(async () => {
    // Load prompts from CSV file if it exists
    if (fs.existsSync(csvFile)) {
        const csvPrompts = await loadCSV(csvFile);
        prompts = prompts.concat(csvPrompts);
    }

    // Function to check for missing answer keys
    function checkMissingAnswers(data: any[]): any[] {
        return data.filter(item => !item.correctAnswer);
    }

    // Function to detect duplicate or highly similar questions
    function detectDuplicates(data: any[]): any[] {
        const seen = new Set();
        return data.filter(item => {
            if (!item.prompt || typeof item.prompt !== 'string') return false; // Skip undefined prompts
            const normalized = item.prompt.toLowerCase().trim();
            if (seen.has(normalized)) {
                return true;
            }
            seen.add(normalized);
            return false;
        });
    }

    // Function to check for inconsistencies (e.g., invalid or missing difficulty levels)
    function checkInconsistencies(data: any[]): any[] {
        return data.filter(item => {
            if (!item.difficulty) return true; // Mark as inconsistent if missing
            if (!['Easy', 'Medium', 'Hard'].includes(item.difficulty)) {
                console.log(`Inconsistent difficulty found: ${item.difficulty}`);
                return true;
            }
            return false;
        });
    }

    // Run data integrity checks
    const missingAnswers = checkMissingAnswers(prompts);
    const duplicateQuestions = detectDuplicates(prompts);
    const inconsistencies = checkInconsistencies(prompts);

    const results = {
        missingAnswers,
        duplicateQuestions,
        inconsistencies
    };

    console.log(results);
    fs.writeFileSync('dataIntegrityResults.json', JSON.stringify(results, null, 2));
})();
