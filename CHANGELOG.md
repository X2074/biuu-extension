## [0.0.1] - 2025-05-09

### Added
- 向钱包添加以太坊链：wallet_addEthereumChain
- 要求钱包切换到指定的以太坊链：wallet_switchEthereumChain
- 获取用户的权限信息：wallet_getPermissions
- 请求权限（即授权）：wallet_requestPermissions
- 纯文本签名：personal_sign
- 添加以太坊代币：wallet_watchAsset
- 获取授权签名的用户地址：eth_requestAccounts
- 获取授权地址列表：eth_accounts
- 创建新的钱包确认，从用户账户发起以太坊交易：eth_sendTransaction
- 返回当前版本：web3_clientVersion
- 返回最近的区块数量：eth_blockNumber
- 返回当前网络的链ID：eth_chainId
- 返回每单位气体的当前价格：eth_gasPrice
- 返回给定地址的账户余额：eth_getBalance
- 根据区块哈希获取特定区块的详细信息：eth_getBlockByHash
- 通过区块号返回有关块的信息：eth_getBlockByNumber
- 返回与给定块哈希匹配的块中的交易数：eth_getBlockTransactionCountByHash
- 返回与给定区块号匹配的块中的交易数：eth_getBlockTransactionCountByNumber
- 获取指定地址的智能合约的字节码：eth_getCode
- 返回给定地址的存储位置的值：eth_getStorageAt
- 通过区块哈希和交易索引位置返回有关交易的信息：eth_getTransactionByBlockHashAndIndex
- 按区块编号和交易索引位置返回有关交易的信息：eth_getTransactionByBlockNumberAndIndex
- 返回通过交易哈希请求的交易信息：eth_getTransactionByHash
- 返回从某个地址发送的交易数量：eth_getTransactionCount
- 通过交易哈希返回交易的收据：eth_getTransactionReceipt
- 返回与给定块哈希匹配的块中的块数：eth_getUncleCountByBlockHash
- 返回与给定块号匹配的块中的交易数：eth_getUncleCountByBlockNumber
- 检查节点是否正在同步区块链数据：eth_syncing
- 发送账户变化事件：accountsChanged
- 发送链变化事件：chainChanged
- 发送网络变化事件：networkChanged



## [0.0.1] - 2025-05-10

### Added
- 授权签名: 实现 personal_sign 方法，弹出授权签名页面并返回签名结果。

## [0.0.1] - 2025-05-09

### Added
- 基础功能实现: 完成浏览器钱包扩展的核心功能，包括创建账户、转账、签名和私钥管理等。
- EIP-6963 支持: 添加对 EIP-6963 标准的支持，使浏览器能够正确识别当前连接的钱包。
- EIP-1193 支持: 实现 EIP-1193 标准，通过 window.ethereum 注入 injectedProvider，建立浏览器与钱包之间的通信桥梁。
- 账号请求功能: 实现 eth_requestAccounts 方法，返回当前钱包的账户信息。
- 权限请求功能: 实现 wallet_requestPermissions 方法，弹出授权页面并返回基于 EIP-2255 的权限列表，同时实现权限的缓存机制。