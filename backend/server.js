/**
 * Backend Entry Point & Gemini Configuration Verification
 */

const {
  isGeminiConfigured,
  getGeminiConfigStatus,
  getGeminiClient,
  verifyConfig,
  rootEnvPath
} = require('./gemini');

const port = process.env.PORT || 3000;

function start() {
  console.log(`[Backend] Initializing Hackathon AI Mentor Backend (Port: ${port})...`);
  const status = verifyConfig();

  if (!status.configured) {
    console.log(
      `[Backend] Notice: To enable Gemini AI features, create a .env file at '${rootEnvPath}' and set GEMINI_API_KEY.`
    );
  } else {
    console.log('[Backend] Gemini SDK client is ready for use.');
  }
}

if (require.main === module) {
  start();
}

module.exports = {
  start,
  isGeminiConfigured,
  getGeminiConfigStatus,
  getGeminiClient,
  verifyConfig
};
