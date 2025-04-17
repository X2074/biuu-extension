# Vue 3 + TypeScript + Vite

# 安装包

```shell
pnpm i
```

# 启动
```shell
pnpm run watch-build # 监听 build 构建
pnpm run watch-json # 监听 manifest.json 文件变化
```




流程：
1、没有indexDB的时候就让用户重头开始创建钱包
2、创建完的钱包数据全部分类放置于indexDB，不保存私钥，只保存加密后的提示词
3、indexDB数据：
    1、最外层为模型
    2、模型下面分不同的网络
    2、创建的账户分置于每一个网络下面
4、获取私钥需要先获取提示词，然后根据提示词来获取私钥


# 项目结构概述

.
├── README.md
├── manifest.json                                扩展的权限配置
├── package.json                                 引入的组件 
├── pnpm-lock.yaml
├── src
│   ├── assets                                    公共文件
│   │   ├── css                                   公共样式
│   │   └── images                                公共图片
│   │           ├── icons                         公共小图标   
│   │           └── logos                         虚拟币的logo
│   ├── background    
│   │   └── service-worker.ts                     后台运行的js，主要是用来作为通信中转
│   ├── components                                全局公共组件     
│   │    ├── loading                              全局loading指令 
│   │    │── addressBook                          地址簿操作
│   │    └── prompt                               全局提示弹框  
│   ├── content
│   │   └── content.ts                            用来使页面与service-worker通信的中转
│   ├── contentPage                               测试多入口页面，暂未使用
│   ├── icons
│   │   └── icon.png                              扩展的logo
│   ├── popup                                     popup页面入口
│   │   ├── App.vue               
│   │   ├── create                                首次进入页面        
│   │   ├── createWallt                           创建钱包 
│   │   ├── selectAccount                         选择钱包管理的页面         
│   │   │   ├── deleteWallt                       删除钱包        
│   │   │   ├── ImportWallt                       导入钱包        
│   │   │   └── showPrivateKey                    展示私钥     
│   │   ├── creasteWalletPage                     创建钱包 
│   │   │       ├── setPsd                        设置密码    
│   │   │       ├── createMnemonic                生成钱包 
│   │   │       └── verifyMnemonic                二次确认助记词，创建钱包     
│   │   ├── setting                               设置组件
│   │   │       ├── security                      安全问答
│   │   │       └── components 
│   │   │           ├── mnemonicPhrase              显示助记词
│   │   │           ├── privateKey                  显示私钥
│   │   │           ├── revisePassword              修改密码    
│   │   │           ├── privateKey                  展示私钥   
│   │   ├──  secret                                 关闭浏览器后进入，输入密码页面
│   │   ├── homePage                                popup主页面
│   │   ├── transfer                                转账（备份）
│   │   ├── index.html
│   │   ├── main.ts
│   ├── utils                                      公共js方法
│   │   ├── bus.js                                 全局通信  
│   │   ├── createUser.js                          创建钱包相关（一键创建钱包） 
│   │   ├── editContent.js                         修改信息（修改昵称） 
│   │   ├── erp721.json                            721合约 
│   │   ├── index.js                               cookie、加密解密、转账、助记词转私钥等 
│   │   ├── indexDB.js                             indexDB方法 
│   │   ├── nft.js                                 nft相关操作（获取、转移的dome） 
└── watch.mjs
