# jujin-dv

## 项目描述

* jujin-dv 是一款实现前后端分离开发的构建工具

* 工具构建的前端项目可基于 react 和 antd
> antd 即 [ant design](https://ant.design/docs/react/introduce-cn) 是蚂蚁金服旗下的企业级后台产品，有助于快速实现中后台前端需求

## 先决条件

* node v8.x

* git

## 开发步骤

* A. 下载构建工具

> 通过 npm install -g jujin-dv 安装。

* B. 使用构建工具创建项目

> 新建项目文件夹，例如：xxx。在 xxx 下打开命令行工具，执行 jjdv init 初始化一个前端项目。

* C. 使用构建工具运行项目

> 在 xxx 命令行目录下，执行 jjdv server。启动 server 后，浏览器地址栏输入 http://localhost:8000 访问新建的项目。

* D. 使用构建工具构建项目

> 在 xxx 命令行目录下，执行 jjdv build 生成生产环境使用的 js、html 文件。
 
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

* 命令详解

a. jjdv server [-p|-x|-r|-c]

> -p 参数表示 server 启动的端口号，默认为 8000。端口被占用时可通过 -p 参数指定端口号。

> -x 参数表示 server 代理地址，若指定 -x http://www.baidu.com 则所有请求会被转发到 baidu，并返回结果。

> -r 参数表示 server 代理转发的前缀，若指定 -r abc 则所有以 /abc 为前缀的请求都会被转发至 -x 指定的代理服务器。

> -c 参数表示是否独立打包 css 文件。

b. jjdv build [-o|-d|-c]

> -o 参数表示指定打包文件输出目录。

> -d 参数表示启用调试模式打包，不压缩输出文件。

> -c 参数同 jjdv server 命令。

