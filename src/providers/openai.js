const axios = require('axios');

/**
 * Generates a Git commit message using OpenAI's GPT model.
 *
 * @param {string} diff - The Git diff of staged changes.
 * @param {string} model - The OpenAI model to use (e.g., 'gpt-4.1').
 * @param {string} style - The style of the commit message (e.g., 'concise').
 * @param {object} config - Provider-specific configuration (e.g., { apiKey, url, models }).
 * @returns {Promise<string>} - The generated commit message.
 */
async function generateOpenAICommitMessage(diff, model, style, config) {
  const { apiKey, url, maxTokens = 100 } = config;

  if (!apiKey) {
    throw new Error('OpenAI API key is missing in configuration.');
  }

  const systemPrompt = `
You are an AI assistant designed to generate Git commit messages. Analyze the provided code diff and produce a ${style} commit message that accurately describes the changes.

Follow these guidelines:

1. Prefix: Start the commit message with an appropriate prefix based on the type of change:
   - feat: for new features
   - fix: for bug fixes
   - chore: for maintenance tasks
   - docs: for documentation updates
   - refactor: for code restructuring
   - test: for adding or updating tests
   - style: for formatting changes
   - perf: for performance improvements

2. Style: Generate the message in a ${style} style.

3. Length: Limit the message to ${maxTokens} tokens.

4. Language: Use clear and professional language.

5. Format: Do not include any additional explanations or formatting; output only the commit message.
  `;

  try {
    const response = await axios.post(
      `${url || 'https://api.openai.com/v1/'}/chat/completions`,
      {
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: diff,
          },
        ],
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
  }
}

module.exports = generateOpenAICommitMessage;