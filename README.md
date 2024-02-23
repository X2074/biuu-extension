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
