/**
 * Gemini API Configuration and Client Initialization
 *
 * Configures the Google Gemini SDK using environment variables loaded
 * from the project root .env file, with a fallback to .env.example.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Resolve path to root-level .env and .env.example files
const rootDir = path.resolve(__dirname, '..');
const rootEnvPath = path.join(rootDir, '.env');
const exampleEnvPath = path.join(rootDir, '.env.example');

// Prioritize root .env; fallback to .env.example if .env does not exist
let activeEnvPath = rootEnvPath;
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
  activeEnvPath = rootEnvPath;
} else if (fs.existsSync(exampleEnvPath)) {
  dotenv.config({ path: exampleEnvPath });
  activeEnvPath = exampleEnvPath;
}

// Also support local directory .env if present
dotenv.config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Returns whether GEMINI_API_KEY is configured in the environment.
 * Does not expose or print the key.
 *
 * @returns {boolean}
 */
function isGeminiConfigured() {
  const key = process.env.GEMINI_API_KEY;
  return typeof key === 'string' && key.trim().length > 0;
}

/**
 * Safely inspects the API key configuration without logging the key value.
 *
 * @returns {{ configured: boolean, keyLength: number, envFileLocation: string }}
 */
function getGeminiConfigStatus() {
  const key = process.env.GEMINI_API_KEY;
  const configured = typeof key === 'string' && key.trim().length > 0;
  return {
    configured,
    keyLength: configured ? key.trim().length : 0,
    envFileLocation: activeEnvPath
  };
}

/**
 * Initializes and returns a GoogleGenerativeAI client instance.
 * Throws a descriptive error if GEMINI_API_KEY is missing.
 *
 * @returns {GoogleGenerativeAI}
 */
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please create a .env file in the project root with GEMINI_API_KEY=<your-key>.'
    );
  }
  return new GoogleGenerativeAI(key.trim());
}

/**
 * Verification utility to check configuration status securely without exposing key contents.
 */
function verifyConfig() {
  const status = getGeminiConfigStatus();
  console.log('--- Gemini API Configuration Status ---');
  console.log(`Target .env location : ${status.envFileLocation}`);
  if (status.configured) {
    console.log(`Status               : CONFIGURED (Key length: ${status.keyLength} characters, value hidden)`);
  } else {
    console.log('Status               : NOT CONFIGURED (GEMINI_API_KEY is missing or empty)');
  }
  console.log('---------------------------------------');
  return status;
}

/**
 * Executes a Gemini API request to analyze a hackathon problem statement.
 *
 * @param {Object} params
 * @param {string} params.problem_statement
 * @param {number} params.team_size
 * @param {number} params.time_limit_minutes
 * @returns {Promise<{ problem_summary: string, users: string[], user_needs: string[], features: string[] }>}
 */
async function generateGeminiMentorAnalysis({ problem_statement, team_size, time_limit_minutes }) {
  const ai = getGeminiClient();

  const prompt = `You are an expert Hackathon AI Mentor. Analyze the following hackathon problem statement and project constraints:

Problem Statement: "${problem_statement}"
Team Size: ${team_size} members
Time Limit: ${time_limit_minutes} minutes

Provide a concrete, actionable analysis for an MVP sprint.
Respond ONLY with a valid JSON object matching this exact schema:
{
  "problem_summary": "A clear, simple 1-2 sentence summary of the core problem and MVP focus",
  "users": ["2 to 4 specific target user groups"],
  "user_needs": ["Practical needs those users have"],
  "features": ["3 to 5 feasible, relevant MVP features that can be built within the time limit and team size"]
}`;

  const candidateModels = [
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview',
    'gemini-flash-latest'
  ];

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const parsed = JSON.parse(text);

      if (
        typeof parsed.problem_summary === 'string' &&
        Array.isArray(parsed.users) &&
        Array.isArray(parsed.user_needs) &&
        Array.isArray(parsed.features)
      ) {
        let users = parsed.users.filter(u => typeof u === 'string' && u.trim().length > 0);
        if (users.length > 4) users = users.slice(0, 4);
        if (users.length < 2) users.push('Secondary stakeholders and community users');

        let features = parsed.features.filter(f => typeof f === 'string' && f.trim().length > 0);
        if (features.length > 5) features = features.slice(0, 5);
        if (features.length < 3) features.push('Core MVP dashboard for tracking actions and status');

        const user_needs = parsed.user_needs.filter(n => typeof n === 'string' && n.trim().length > 0);

        return {
          problem_summary: parsed.problem_summary.trim(),
          users,
          user_needs,
          features
        };
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate mentor analysis from Gemini models');
}

module.exports = {
  isGeminiConfigured,
  getGeminiConfigStatus,
  getGeminiClient,
  generateGeminiMentorAnalysis,
  verifyConfig,
  rootEnvPath,
  activeEnvPath
};
