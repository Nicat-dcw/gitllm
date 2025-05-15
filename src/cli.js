const { Command } = require('commander');
const commitCommand = require('./commands/commit');
const configCommand = require('./commands/config'); 

const program = new Command();

program
  .name('gitllm')
  .description('AI-powered Git commit message generator')
  .version('1.0.2');

program
  .command('config')
  .description('Configure GitLLM')
  .option('--model <model>', 'Specify AI model')
  .option('--apiKey <key>', 'Specify Api Key for provider')
  .option('--provider <provider>', 'Specify AI provider')
  .option('--baseUrl <url>', 'Provider base URL')
  .option('--defaultModel <model>', 'Specify default model')
  .action((options) => {
    configCommand(options);
  });

program
  .command('commit')
  .description('Generate an AI-powered commit message')
  .option('--model <model>', 'Specify the AI model to use')
  .option('--style <style>', 'Specify the commit message style (e.g., concise, detailed)')
  .action((options) => {
    commitCommand(options);
  });

program.parse(process.argv);