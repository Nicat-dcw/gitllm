const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const readline = require('readline');
const { execSync } = require('child_process');

// Mock the execSync function
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

// Mock readline to simulate user input
jest.mock('readline', () => ({
  createInterface: () => ({
    question: (query, callback) => callback('y'),
    close: jest.fn(),
  }),
}));

// Mock fs and yaml for configuration
jest.mock('fs');
jest.mock('js-yaml');

// Define the test
describe('gitllm CLI', () => {
  let cli;

  beforeEach(() => {
    // Reset modules and mocks before each test
    jest.resetModules();
    jest.clearAllMocks();

    // Mock fs.existsSync to simulate missing config file
    fs.existsSync.mockImplementation((path) => false);

    // Mock fs.mkdirSync and fs.writeFileSync
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});

    // Mock yaml.dump and yaml.load
    yaml.dump.mockImplementation(() => 'defaultConfig');
    yaml.load.mockImplementation(() => ({
      defaultModel: 'gpt-4.1',
      style: 'concise',
      providers: {
        openai: { models: ['gpt-4.1'] },
        anthropic: { models: [] },
      },
    }));

    // Mock execSync behavior
    execSync.mockImplementation((command) => {
      if (command === 'git diff --cached') {
        return 'diff --git a/file.js b/file.js\n+console.log("Hello World");';
      } else if (command.startsWith('git commit')) {
        return 'Committed successfully';
      }
      return '';
    });

    // Mock process.exit to prevent exiting
    jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });

    // Import the CLI module after setting up mocks
    cli = require('../src/cli');
  });

  afterEach(() => {
    // Restore process.exit after each test
    process.exit.mockRestore();
  });

  test('should generate and commit message based on staged diff', async () => {
    // Set process arguments
    process.argv = ['node', 'gitllm', 'commit', '--model', 'gpt-4.1'];

    // Run the CLI
    await expect(cli()).resolves.not.toThrow();

    // Assertions
    expect(execSync).toHaveBeenCalledWith('git diff --cached', { encoding: 'utf8' });
    expect(execSync).toHaveBeenCalledWith(expect.stringContaining('git commit -m'), { stdio: 'inherit' });
  });
});