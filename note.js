// 当前展示的钱包数据
currentWalltAddress = {
    id: 'currentWalltAddress',//固定不变，方便直接获取数据
    userName: '',//用户昵称
    userUrl: '',//用户头像
    address: walltInfo.value.address,//账户地址
    NoIndex: 1//第几个账户
}
// 当前链接的网络信息
rpc_url = {
    id: 'rpc_url',//固定不变，方便直接获取数据
    unit: 'BNB',//货币符号
    CHAIN_ID: 97,
    type: 'EVM',//网络类型
    url: 'https://data-seed-prebsc-1-s2.binance.org:8545/'//rpc地址
}
// 网络类型，钱包存储方式参照小狐狸，以网络为基准，用户数据都存储为网络的子级，一个网络下面有多个用户数据
EVM_UTXO = {
    "8131": {//chainId，直接根据chainId来查询网络信息
        "unit": "Meer",//货币符号
        "netName":"Qitmeer Testnet",//网络名称
        "CHAIN_ID": 8131,//chainId
        "url": "https://testnet-qng.rpc.qitmeer.io",//rpc地址
        "walltInfo": []//用户创建的账户信息都存储在这里
    },
}