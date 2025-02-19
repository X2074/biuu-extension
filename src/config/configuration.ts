
// 账号使用默认格式的数据配置，然后重新赋值，便于后期改动

// rpc全局公共配置
export const rpcConfig = {
  // 默认创建测试环境的rpc
  "evmTest": {
    id: 'rpc_url',
    unit: 'Meer',
    netName: 'Qitmeer Testnet',
    CHAIN_ID: 8131,
    netWorkType: 'EVM',
    url: 'https://testnet-qng.rpc.qitmeer.io',
    walltInfo: []
  },
  "uxtoTest": {
    id: 'rpc_url',
    unit: 'MEER',
    netName: 'MEER_TESTNET',
    CHAIN_ID: 8131,
    netWorkType: 'EVM',
    url: 'https://testnet-qng.rpc.qitmeer.io/rpc/',
    walltInfo: []
  },

}

export const defaultAccount = {
  address: "", //当前用户地址
  keyStore: "",
  userName: 'Wallt 01',
  userUrl: '',
  netWork: '',
  NoIndex: 1 //当前第几个用户
}
export const defaultUTXOAccount = {
  utxoAddressTest: "", //当前用户测试地址
  address: "", //当前用户地址
  keyStore: "",
  userName: 'Wallt 01',
  userUrl: '',
  netWork: 'UTXO',
  NoIndex: 1 //当前第几个用户
}