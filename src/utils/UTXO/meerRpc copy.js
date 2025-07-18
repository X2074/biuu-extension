import BigNumber from 'bignumber.js';
// const axios = require('axios');
import qitmeer from 'qitmeer-js';
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
        if (response.result) {
            let x = new BigNumber(response.result)
            let y = new BigNumber(100000000)
            console.log(x.dividedBy(y), 'utxo的余额');
            return x.dividedBy(y);
        } else {
            return 0
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
// 获取utxo（未花费交易对）
export async function getUtxos(url, address) {
    try {
        const response = await rpc(url, 'getBalanceInfo', [address, 0, true])
        const result = response.result;
        return result.utxos
    } catch (error) {
        console.error('Error:', error);
    }
}
// 节点不会直接存储所有地址的utxo数据，想要获取对应地址的余额情况，需要调用addBalance方法让节点关注指定的钱包地址
export async function addBalance(url, address) {
    try {
        const response = await rpc(url, 'addBalance', [address])
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
    console.log(url, 'urlurlurl');
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

/**
 * 构建 UTXO -> EVM (cross chain export) 交易
 * @param {string} fromAddress - UTXO地址
 * @param {string} pkaddr - 目标EVM pkaddr（如 Tk2ccA1wxfrXEseUCYqss7N7RbhHAprVwmZrDvodcE8qcqYxTbDTD）
 * @param {string} secretKey - 主私钥（hex字符串）
 * @param {number} amountToEvm - 转到EVM的金额（最小单位）
 * @param {Array} utxos - 可用UTXO列表 [{txid, idx, amount}]
 * @returns {string|null} 交易HEX字符串
 */
export async function buildExportToEvmTx(fromAddress, pkaddrKey, secretKey, amountToEvm, utxos) {
    let pkaddr = evmKeyToPkaddr(pkaddrKey)
    const network = qitmeer.networks.testnet;
    const keyPair = qitmeer.ec.fromPrivateKey(Buffer.from(secretKey, 'hex'));
    const txb = qitmeer.txsign.newSigner(network);
    // 选取足够的UTXO
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
        selectedUtxos.push(utxo);
        totalInput += utxo.amount;
    }

    // 添加输入
    selectedUtxos.forEach((utxo, i) => {
        txb.addInput(utxo.txid, utxo.idx);
    });

    // 设置时间戳，避免timestamp为0导致交易被拒绝
    const lockTime = Math.floor(Date.now() / 1000);
    txb.setTimestamp(lockTime);

    // 估算手续费
    const inputCount = selectedUtxos.length;
    const outputCount = 2;
    const fee = estimateFee(inputCount, outputCount);
    const change = totalInput - amountToEvm - fee;
    if (change < 0) {
        console.error('余额不足，无法支付手续费');
        return null;
    }
console.log(txb,"txbtxbtxb");

    // 添加输出1：EVM pkaddr，coinID=1，pubkey
    txb.addOutput(pkaddr, amountToEvm, 1, 'pubkey');
    // 添加输出2：找零回原地址，coinID=0，pubkeyhash
    if (change > 0) {
        txb.addOutput(fromAddress, change, 0, 'pubkeyhash');
    }

    // 签名
    selectedUtxos.forEach((v, i) => {
        txb.sign(i, keyPair);
    });

    // 构建交易
    const hex = txb.build().toBuffer().toString('hex');
    return hex;
}

function estimateFee(inputCount, outputCount, feeRate = 1000) {
     // 交易大小 = 输入数量 * 148 + 输出数量 * 34 + 10（固定开销）
    const txSize = inputCount * 148 + outputCount * 34 + 10;
    // 手续费 = 交易大小 * 费率（satoshi/字节）
    return txSize * feeRate;
}


function evmKeyToPkaddr(secretKey){

    // 生成 keyPair
    const keyPair = qitmeer.ec.fromPrivateKey(Buffer.from(secretKey, 'hex'));

    // 生成 pkaddr（EVM公钥地址，Tk开头）
    const pkaddr = qitmeer.address.ecToPkAddress(keyPair.publicKey, 'testnet');
    console.log('EVM pkaddr (Tk开头):', pkaddr);
    return pkaddr;
    // 生成普通 UTXO 地址（Tn开头）
    // const utxoAddr = qitmeer.address.ecToPkHAddress(keyPair.publicKey, 'testnet');
    // console.log('UTXO地址 (Tn开头):', utxoAddr); 
}
