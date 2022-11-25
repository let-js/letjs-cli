// #! /usr/bin/env node
const shell = require('shelljs');
const path = require('path');
const { log } = require('./log');

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git');
  shell.exit(1);
}

async function cloneFile(
  templateUrl,
  templateName,
  appName,
  target = process.cwd()
) {
  return new Promise((resolve, reject) => {
    const dir = path.join(target, appName);
    try {
      shell.mkdir(appName);
      shell.cd(appName);
      shell.exec('git init');
      shell.exec(`git remote add origin ${templateUrl}`);
      shell.exec('git config core.sparsecheckout true');
      shell.exec(`echo "${templateName}" >> .git/info/sparse-checkout`);
      shell.exec('git pull origin main');
      shell.rm('-rf', '.git');
      shell.mv('-f', `./${templateName}/*`, './');
      shell.rm('-rf', templateName);
      shell.exec('git init');
      resolve({ flag: true, dir, appName });
    } catch (error) {
      log('ERROR', error.toString());
      shell.rm('-rf', appName);
      resolve({ flag: false, dir, appName });
    }
  });
}

module.exports = { cloneFile };
