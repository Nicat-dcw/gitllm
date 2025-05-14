const axios = require('axios');

/**
 * Generates a Git commit message using Anthropic's Claude model.
 *
 * @param {string} diff - The Git diff of staged changes.
 * @param {object} config - Configuration object containing provider details and preferences.
 * @returns {Promise<string>} - The generated commit message.
 */
async function generateAnthropicCommitMessage(diff, config) {
  const { apiKey, url } = config.providers.anthropic;
  const model = config.model || config.defaultModel;
  const style = config.style || 'concise';
  const maxTokens = config.maxTokens || 100;

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
      `${url ?? "https://api.anthropic.com"}/v1/messages`,
      {
        model,
        messages: [
          {
            role: 'user',
            content: diff,
          },
        ],
        system: systemPrompt,
        max_tokens: maxTokens,
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
      }
    );

    const messageContent = response.data.content;
    if (Array.isArray(messageContent)) {
      return messageContent.map(part => part.text).join('').trim();
    } else if (typeof messageContent === 'string') {
      return messageContent.trim();
    } else {
      throw new Error('Unexpected response format from Anthropic API.');
    }
  } catch (error) {
    console.error('Error generating commit message with Anthropic:', error.message);
    throw error;
  }
}

module.exports = generateAnthropicCommitMessage;