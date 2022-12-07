# [letjs-cli](https://github.com/let-js/letjs-cli)

## 安装 letjs-cli

letjs-cli 是一个简单的命令行工具，用于构建基于 letjs 的脚手架项目，支持选择项目模板，UI 框架。

```sh
$ npm install -g @let-js/letjs-cli
```

## letjs 命令介绍

```
$ letjs

Usage: letjs <command> [options]

Options:
  -V, --version              output the version number
  -h, --help                 display help for command

Commands:
  init [options] <app-name>  create a new project powered by letjs
  help [command]             display help for command

Run letjs <command> --help for detailed usage of given command.
```

## 使用示例

```sh
# 初始化工程
letjs init demo-app
# 选择框架
? please select framework: (Use arrow keys)
❯ vue
# 选择 ts 还是 es 版本
? please select template: (Use arrow keys)
❯ letjs
  letjs-ts
# 选择 UI 库
? please select UI: (Use arrow keys)
❯ naive-ui
  element-plus
# 补充一些基本信息
? what's your name?
? please enter version? 1.0.0
? please enter description.

# 进入创建工程目录，安装NPM依赖，然后启动demo页面
cd demo-app
npm install
npm run dev

# 根据提示访问页面，看到欢迎页表示成功

# 编译/打包项目代码
npm run build
```
