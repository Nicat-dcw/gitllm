const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const readline = require('readline');
const { execSync } = require('child_process');

// Define the default configuration path
const configDir = path.resolve(process.cwd(), '.gitllm');
const configPath = path.join(configDir, 'config.yml');

// Define the default configuration content
const defaultConfig = {
  defaultModel: 'gpt-4.1',
  style: 'concise',
  providers: {
    openai: {
      url: "https://api.openai.com/v1/",
      models: ['gpt-4.1', 'gpt-3.5-turbo']
    },
    anthropic: {
      url: "https://api.anthropic.com/v1/",
      models: ['claude-3', 'claude-instant']
    }
  }
};

// Ensure the configuration file exists
if (!fs.existsSync(configPath)) {
  // Create the configuration directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Write the default configuration to the file
  fs.writeFileSync(configPath, yaml.dump(defaultConfig), 'utf8');
  console.log(`Created default configuration at ${configPath}`);
}

// Load the configuration
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

// Determine the provider based on the model
function getProvider(model) {
  if (config?.providers?.openai?.models?.includes(model)) {
    return 'openai';
  } else if (config?.providers?.anthropic?.models?.includes(model)) {
    return 'anthropic';
  } else {
    throw new Error(`Model ${model} not found in configuration.`);
  }
}

// Load the appropriate provider module
function loadProvider(providerName) {
  const providerPath = path.resolve(__dirname, `../providers/${providerName}.js`);
  return require(providerPath);
}

// Get staged Git diff
function getStagedDiff() {
  try {
    return execSync("git diff --cached -- . ':(exclude)*lock.json' ':(exclude)*lock.yaml'", {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 20 // Increase buffer to 20MB
    });
  } catch (error) {
    console.error('Error retrieving Git diff:', error.message);
    process.exit(1);
  }
}

// Prompt user for confirmation
function promptUser(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(`${message} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

module.exports = async function commitCommand(options) {
  const diff = getStagedDiff();
  if (!diff) {
    console.log('No staged changes to commit.');
    process.exit(0);
  }

  const model = options.model || config.defaultModel;
  const style = options.style || config.style || 'concise';
  const providerName = getProvider(model);
  const generateCommitMessage = loadProvider(providerName);

  try {
    const providerConfig = config.providers[providerName];
    const commitMessage = await generateCommitMessage(diff, model, style, providerConfig);
    console.log('\nGenerated Commit Message:\n');
    console.log(commitMessage);

    const userConfirmed = await promptUser('\nDo you want to commit with this message?');
    if (userConfirmed) {
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    } else {
      console.log('Commit aborted by the user.');
    }
  } catch (error) {
    console.error('Error generating commit message:', error.message);
    process.exit(1);
  }
};