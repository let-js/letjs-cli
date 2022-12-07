#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const { create } = require('../lib/init');
const { downloadDirectory } = require('../config/constance');

// version
program
  .version(`@let-js/letjs-cli ${require('../../package').version}`)
  .usage('<command> [options]');

// 申明 init 命令，并声明两个参数 -c 和 -t。action调用init时需要执行的函数
program
  .command('init <app-name>')
  .description('create a new project powered by letjs')
  .option('-f, --framework <framework>', '开发框架，[vue | react]')
  .option('-t, --template <template>', 'template name')
  .action((name, options) => {
    create(name, options);
  });

// add some useful info on help
program.on('--help', () => {
  console.log();
  console.log(
    `Run ${chalk.cyan(
      `letjs <command> --help`
    )} for detailed usage of given command.`
  );
  console.log();
});

program.on('command:*', ([cmd]) => {
  console.log(`${chalk.red(`Invalid command: ${chalk.yellow(cmd)}`)}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`letjs --help`)} for a list of available commands.`
  );
  process.exit(1);
});

program.parse(process.argv);
