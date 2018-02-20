# jujin-dv

## 项目描述

* jujin-dv 是一款实现前后端分离开发的构建工具

* 工具构建的前端项目默认基于 react 和 antd
> antd 即 [ant design](https://ant.design/docs/react/introduce-cn) 是蚂蚁金服旗下的企业级后台产品，有助于快速实现中后台前端需求

## 先决条件

* node v8.x

* git

## 开发步骤

* A. 下载构建工具

> 1. 直接 git clone 该项目
> 2. 通过 npm install -g jujin-dv 安装

* B. 安装 node 包

> 1. 接 A1 需要在项目根目录下通过命令行 npm install 安装 node 依赖包
> 2. 接 A2 无需其他操作

* C. 使用构建工具创建项目

> 1. 新建项目文件夹，例如：xxx
> 2. 在 xxx 下打开命令行工具
> 3. 接 B1 随后执行 xx1/xx2/.../jujin-dv/bin/jjdv init
> 4. 接 B2 随后执行 jjdv init

* D. 使用构建工具运行项目

> 1. 接 C3 在 xxx 命令行目录下，执行 xx1/xx2/.../jujin-dv/bin/jjdv server
> 2. 接 C4 在 xxx 命令行目录下，执行 jjdv server
> 3. 启动 server 后，浏览器地址栏输入 http://localhost:8000 访问新建项目

* E. 使用构建工具构建项目

> 1. 接 D1 在 xxx 命令行目录下，执行 xx1/xx2/.../jujin-dv/bin/jjdv build
> 2. 接 D2 在 xxx 命令行目录下，执行 jjdv build
 
## 项目说明

* 注意事项

> 1. 构建工具基于 webpack，默认不打包 react react-dom react-router antd moment 需要在 html 中引入相应的 js 脚本；如果想要修改该规则，则可编辑 jujin-dv/lib/webpack.common.config.js 的如下代码片段

```javascript
function resolveExternals(externals, globalConfig) {
    var defaults = {
        React: 'window.React',
        react: 'window.React',
        ReactDOM: 'window.ReactDOM',
        'react-dom': 'window.ReactDOM',
        ReactRouter: 'window.ReactRouter',
        'react-router': 'window.ReactRouter',
        antd: 'window.antd',
        moment: 'window.moment',
        'global-config': JSON.stringify(globalConfig),
    }
    ...
};
```

