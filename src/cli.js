const { Command } = require('commander');
const commitCommand = require('./commands/commit');

const program = new Command();

program
  .name('gitllm')
  .description('AI-powered Git commit message generator')
  .version('1.0.0');

program
  .command('commit')
  .description('Generate an AI-powered commit message')
  .option('--model <model>', 'Specify the AI model to use')
  .option('--style <style>', 'Specify the commit message style (e.g., concise, detailed)')
  .action((options) => {
    commitCommand(options);
  });

program.parse(process.argv);