// const axios = require('axios');
const config = {
    headers: {
        'Content-Type': 'application/json'
    },
};
// utxo的rpc链接，与evm的不一致，单独封装处理过的
export const rpcUrls = {
    mainnet: 'https://qng.rpc.qitmeer.io/rpc/',
    testnet: 'https://testnet-qng.rpc.qitmeer.io/rpc/',
    // 当有新的网络时，在此添加
    // amanaMainnet: 'https://amana-mainnet.rpc.example.com/rpc/'
};
/**
 * 封装了调用utxo rpc的方法，utxo层的rpc方法可以通过以下链接查看：https://qitmeer.github.io/docs/en/json-rpc-api/
 * 通过传入的network字段调用对应的rpc
 */
const rpc = function (url, method, params) {
    // if (!rpcUrls[network]) {
    //     throw new Error(`Unsupported network: ${network}`);
    // }

    const data = {
        jsonrpc: '2.0',
        id: 1,
        method: method,
        params: params
    };
    var request = new Request(url, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(data)
    });

    return fetch(request).then(data => {
        if (!data.ok) {
            throw Error(data.status);
        }
        return data.json();
    })
}
// 获取目标地址的余额
export async function getUTXOBalance(url, address) {
    console.log(url, address, 'url, address');
    try {
        const response = await rpc(url, 'getBalance', [address, 0]);
        console.log(response, 'utxo的余额');
        return response.result / 100000000;
    } catch (error) {
        console.error('Error:', error);
    }
}
// 获取utxo（未花费交易对）
export async function getUtxos(url, address) {
    try {
        const response = await rpc(url, 'getBalanceInfo', [address, 0])
        const result = response.result;
        return result.utxos
    } catch (error) {
        console.error('Error:', error);
    }
}
// 节点不会直接存储所有地址的utxo数据，想要获取对应地址的余额情况，需要调用addBalance方法让节点关注指定的钱包地址
const addBalance = async function (network = 'testnet', address) {
    try {
        const response = await rpc(network, 'addBalance', [address])
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error('Error:', error);
    }
}
// 获取指定的utxo详细信息
export async function getUtxo(url, txid, idx) {
    try {
        const response = await rpc(url, 'getUtxo', [txid, idx])
        const result = response.result
        return result
    } catch (error) {
        console.error('Error:', error);
    }
}
// 查看节点信息
const nodeinfo = async function (network = 'testnet') {
    try {
        const response = await rpc(network, 'getNodeInfo', [])
        const result = response.data
        console.log(result)
        return result
    } catch (error) {
        console.error('Error:', error);
    }
}
// 发送utxo交易给节点
export async function sendTraction(url, newTransaction) {
    try {
        const response = await rpc(url, 'sendRawTransaction', [newTransaction, false])
        console.log(response, 'response');
        const result = response.result
        return result
    } catch (error) {
        console.error('Error:', error);
    }
}

// 获取交易hash
export async function getUtxoHash(url, txid) {
    try {
        const response = await rpc(url, 'getRawTransaction', [txid, true])
        const result = response.result;
        return result
    } catch (error) {
        console.error('Error:', error);
    }
}
