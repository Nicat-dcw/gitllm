const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const configDir = path.resolve(process.cwd(), '.gitllm');
const configPath = path.join(configDir, 'config.yml');

function ensureConfigDir() {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

function loadConfig() {
  if (fs.existsSync(configPath)) {
    return yaml.load(fs.readFileSync(configPath, 'utf8'));
  }

  return {
    defaultModel: 'gpt-4.1',
    style: 'concise',
    providers: {
      openai: {
        models: ['gpt-4.1', 'gpt-3.5-turbo']
      },
      anthropic: {
        models: ['claude-3', 'claude-instant']
      }
    }
  };
}

function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(configPath, yaml.dump(config), 'utf8');
}

module.exports = function configCommand(options) {
  const config = loadConfig();

  if (options.model) {
    const provider = options.provider || config.defaultProvider || 'openai';
    if (!config.providers[provider]) {
      config.providers[provider] = { models: [] };
    }
    if (!config.providers[provider].models.includes(options.model)) {
      config.providers[provider].models.push(options.model);
    }
  }

  if (options.provider) {
    if (!config.providers[options.provider]) {
      config.providers[options.provider] = { models: [] };
    }
  }

  if (options.baseUrl && options.provider) {
    config.providers[options.provider] = {
      ...(config.providers[options.provider] || {}),
      url: options.baseUrl,
      apiKey: options.apiKey
    };
  }

  if (options.defaultModel) {
    config.defaultModel = options.defaultModel;
  }
  console.log("Configuration saved at .gitllm/config.yml file")
  saveConfig(config);
};