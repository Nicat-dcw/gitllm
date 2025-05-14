const { getStagedDiff } = require('./utils');
const openai = require('./providers/openai');
const anthropic = require('./providers/anthropic');

async function generateCommitMessage(config) {
  const diff = await getStagedDiff();
  let message;

  switch (config.provider) {
    case 'openai':
      message = await openai.generate(diff, config);
      break;
    case 'anthropic':
      message = await anthropic.generate(diff, config);
      break;
    default:
      throw new Error('Unsupported provider');
  }

  return message;
}

module.exports = generateCommitMessage;