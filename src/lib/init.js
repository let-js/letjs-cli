const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');
const { frameworkList } = require('../config/framework.json');
const { templateUrl, templateList } = require('../config/template.json');
const { uiList } = require('../config/ui.json');
const { log } = require('../utils/log');
const { cloneFile } = require('../utils/clone');

const framework = 'framework';
const template = 'template';
const branch = 'branch';
const templatePrefix = 'letjs';

function isEmptyDir(dir) {
  const files = fs.readdirSync(dir);
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

/**
 * 判断当前目录下是否已有当前名称的非空文件夹
 * @returns {Promise<void>}
 */
async function isEmptyFolder(targetDir) {
  if (!fs.existsSync(targetDir) || isEmptyDir(targetDir)) {
    return true;
  }

  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'override',
          default: false,
          message: () =>
            (targetDir === '.'
              ? 'Current directory'
              : `Target directory "${targetDir}"`) +
            ` is not empty. Remove existing files and continue?`,
        },
      ])
      .then((answers) => {
        resolve(answers['override']);
      });
  });
}

async function create(appName, options) {
  let projectName = appName;
  let projectFramework = options[framework];
  let projectTemplate = options[template];

  // 判断当前目录下是否已有当前名称的文件夹
  const isOverride = await isEmptyFolder(appName);
  if (isOverride) {
    emptyDir(appName);
  } else {
    return log('TEXT', 'Operation cancelled');
  }

  // 选框架
  if (!options.hasOwnProperty(framework)) {
    projectFramework = await selectFramework();
  }
  if (!frameworkList.includes(projectFramework)) {
    return log('ERROR', `not support ${projectFramework} framework`);
  }

  // 选模板
  if (!options.hasOwnProperty(template)) {
    projectTemplate = await selectTemplate(projectFramework);
  }
  const templateInfo = templateList.find(
    (item) => item.name === projectTemplate
  );
  if (!templateInfo) {
    return log('ERROR', `not support ${projectTemplate} template`);
  }

  // 选UI库
  const { name: uiName, plugins } = await selectUI(uiList);

  const templateName = `${projectTemplate}-${uiName}`;

  // 输入一下基本信息
  const userPackageInfo = await getUserPackageInfo(appName);

  const downloadSpinner = ora({
    text: 'start download template...',
    color: 'blue',
  }).start();

  console.log(templateUrl, templateName, projectName, process.cwd());

  const { dir, name, flag } = await cloneFile(
    templateUrl,
    templateName,
    projectName,
    process.cwd()
  );

  if (flag) {
    downloadSpinner.succeed('download success');
    const editConfigSpinner = ora({
      text: 'start edit config...',
      color: 'blue',
    }).start();

    const isSuc = await downloadSuccess(dir, name, userPackageInfo, plugins);

    if (isSuc) {
      editConfigSpinner.succeed('create success');
    } else {
      editConfigSpinner.fail('create fail');
    }
  } else {
    downloadSpinner.fail('download fail');
  }
}

/**
 * 选择工程框架
 * @returns {Promise<void>}
 */
async function selectFramework() {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'list',
          message: 'please select framework:',
          name: framework,
          choices: frameworkList,
        },
      ])
      .then((answers) => {
        resolve(answers[framework]);
      });
  });
}

/**
 * 选择工程模板
 * @param projectFramework
 * @returns {Promise<void>}
 */
async function selectTemplate(projectFramework) {
  try {
    const list = templateList
      .filter((item) => item.type === projectFramework)
      .map((item) => item.name);
    if (!list.length || !list) {
      return log('WARING', 'no template');
    }
    return new Promise((resolve) => {
      inquirer
        .prompt([
          {
            type: 'list',
            message: 'please select template:',
            name: template,
            choices: list,
          },
        ])
        .then((answers) => {
          resolve(answers[template]);
        });
    });
  } catch (e) {
    log('ERROR', e);
  }
}

/**
 * 选择分支
 * @param templateName
 * @returns {Promise<void>}
 */
async function selectBranch(templateName) {
  try {
    const list = templateList.find((item) => item.name === templateName).tags;
    if (!list.length || !list) {
      return log('WARING', 'no template');
    }
    return new Promise((resolve) => {
      inquirer
        .prompt([
          {
            type: 'list',
            message: 'please select branch:',
            name: branch,
            choices: list,
          },
        ])
        .then((answers) => {
          resolve(answers[branch]);
        });
    });
  } catch (e) {
    log('ERROR', e);
  }
}

/**
 * 选择UI库
 * @param UIList
 * @returns {Promise<void>}
 */
async function selectUI(UIList) {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'list',
          message: 'please select UI:',
          name: 'ui',
          choices: UIList,
        },
      ])
      .then((answers) => {
        const uiObj = UIList.find((ui) => ui.name === answers['ui']);
        resolve(uiObj);
      });
  });
}

/**
 * 用户自己输入一些配置信息
 * @param name
 * @returns {Promise<void>}
 */
async function getUserPackageInfo(name) {
  return new Promise(async (resolve, reject) => {
    try {
      const messageInfoList = await Promise.all([
        inquirer.prompt([
          {
            type: 'input',
            message: "what's your name?",
            name: 'author',
            default: '',
          },
          {
            type: 'input',
            message: 'please enter version?',
            name: 'version',
            default: '1.0.0',
          },
          {
            type: 'input',
            message: 'please enter description.',
            name: 'description',
            default: '',
          },
        ]),
      ]);
      resolve({ ...messageInfoList[0], name });
    } catch (e) {
      resolve({ name, author: '', description: '', version: '1.0.0' });
    }
  });
}

/**
 * 模板下载成功
 * @param dir
 * @param name
 * @param packageInfo
 * @param plugins
 * @returns {Promise<void>}
 */
async function downloadSuccess(dir, name, packageInfo, plugins) {
  return new Promise((resolve) => {
    try {
      fs.readFile(dir + '/package.json', 'utf8', (err, data) => {
        if (err) {
          console.log(err);
          resolve(false);
        }
        const packageJson = JSON.parse(data);

        if (plugins && plugins.length) {
          plugins.forEach((plugin) => {
            packageJson.dependencies[plugin.name] = plugin.version || 'latest';
          });
        }

        const packageFile = { ...packageJson, ...packageInfo };

        fs.writeFile(
          dir + '/package.json',
          JSON.stringify(packageFile, null, 4),
          'utf8',
          (err) => {
            if (err) {
              console.log(err);
              resolve(false);
            }
            resolve(true);
          }
        );
      });
    } catch (error) {
      console.log(error);
      resolve(false);
    }
  });
}

module.exports = {
  create,
};
