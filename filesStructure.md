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
│   │    ├── creasteWalletPage                    创建钱包 
│   │    │       ├── setPsd                       设置密码    
│   │    │       ├── createMnemonic               生成钱包 
│   │    │       ├── verifyMnemonic               二次确认助记词，创建钱包       
│   │    ├── loading                              全局loading指令
│   │    └── popup                                popup组件
│   │        ├── components  
│   │        │   ├── prompt                       全局提示弹框         
│   │        ├── homePage                         主页面中的组件         
│   │        │    ├── selectAccount               选择钱包管理的页面         
│   │        │    │     ├── createWallt           创建钱包        
│   │        │    │     ├── deleteWallt           删除钱包        
│   │        │    │     ├── ImportWallt           导入钱包        
│   │        │    │     ├── showPrivateKey        展示私钥        
│   │        │    ├── setting                     设置组件 
│   │        │    │     ├── components      
│   │        │    │     │   ├── addressBook       地址簿
│   │        │    │     │   ├── privateKey        展示私钥
│   │        │    │     │   ├── security          安全问答
│   │        │    │     │   │    ├── components 
│   │        │    │     │   │    │      ├── mnemonicPhrase  显示助记词
│   │        │    │     │   │    │      ├── privateKey      显示私钥
│   │        │    │     │   │    │      ├── revisePassword  修改密码    
│   ├── content
│   │   └── content.ts                            用来使页面与service-worker通信的中转
│   ├── contentPage                               暂未使用
│   ├── icons
│   │   └── icon.png                              扩展的logo
│   ├── popup                                     popup页面入口
│   │   ├── App.vue
│   │   ├── components
│   │   │   ├── secret                             关闭浏览器后进入，输入密码页面
│   │   │   ├── homePage                           popup主页面
│   │   │   └── transfer                           转账
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
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── watch.mjs
