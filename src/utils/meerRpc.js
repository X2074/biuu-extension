const axios = require('axios');
const config = {
    headers: {
        'Content-Type': 'application/json'
    },
};
// utxo的rpc链接，与evm的不一致，单独封装处理过的
const rpcUrls = {
    mainnet: 'https://qng.rpc.qitmeer.io/rpc/',
    testnet: 'https://testnet-qng.rpc.qitmeer.io/rpc/',
    // 当有新的网络时，在此添加
    // amanaMainnet: 'https://amana-mainnet.rpc.example.com/rpc/'
};
/**
 * 封装了调用utxo rpc的方法，utxo层的rpc方法可以通过以下链接查看：https://qitmeer.github.io/docs/en/json-rpc-api/
 * 通过传入的network字段调用对应的rpc
 */
const rpc = function(network, method, params) {
    if (!rpcUrls[network]) {
        throw new Error(`Unsupported network: ${network}`);
    }

    const data = {
        jsonrpc: '2.0',
        id: 1,
        method: method,
        params: params
    };

    return axios.post(rpcUrls[network], data, config);
}
// 获取目标地址的余额
const getBalance = async function (network = 'testnet', address) {
    try {
        const response = await rpc(network, 'getBalance', [address, 0]);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
    }
}
// 获取utxo（未花费交易对）
const getUtxos = async function (network = 'testnet', address) {
    try {
        const response = await rpc(network, 'getBalanceInfo', [address, 0])
        const result = response.data.result;
        return result.utxos
    } catch (error) {
        console.error('Error:', error, network);
    }
}
// 节点不会直接存储所有地址的utxo数据，想要获取对应地址的余额情况，需要调用addBalance方法让节点关注指定的钱包地址
const addBalance = async function (network = 'testnet', address){
    try {
        const response = await rpc(network, 'addBalance',[address])
        return response.data
    } catch (error) {
        console.error('Error:', error);
    }
}
// 获取指定的utxo详细信息
const getUtxo = async function (network = 'testnet', txid, idx) {
    try {
        const response = await rpc(network, 'getUtxo',[txid,idx])
        const result = response.data.result
        return result
    } catch (error) {
        console.error('Error:', error);
    }
}
// 查看节点信息
const nodeinfo = async function ( network = 'testnet'){
    try {
        const response = await rpc(network, 'getNodeInfo',[])
        const result = response.data
        return result
    } catch (error) {
        console.error('Error:', error);
    }
}
// 发送utxo交易给节点
const sendTraction = async function (network = 'testnet', newTransaction){
    try {
        const response = await rpc(network, 'sendRawTransaction',[newTransaction,false])
        const result = response.data
        return result
    } catch (error) {
        console.error('Error:', error);
    }
}
// 查看交易信息
const getTransaction = async function (network = 'testnet', txid){
    try {
        const response = await rpc(network, 'getRawTransaction',[txid, true])
        const result = response.data.result
        return result
    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = {
    rpc,
    getBalance,
    getUtxos,
    getUtxo,
    addBalance,
    nodeinfo,
    sendTraction,
    getTransaction
}
