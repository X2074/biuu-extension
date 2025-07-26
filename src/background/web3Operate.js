import Web3 from 'web3'
import indexDbData from '../utils/indexDB.js';
import EthereumTx from 'ethereumjs-tx'
import { hashSaveIndexDB } from '../utils/operateIndexDB.js';
import { chromeNotifications } from './utils';
import { selectMinUTXOs, selectMaxUTXOs, selectUtxosMinViable, selectUtxosBranchAndBound } from '../utils/UTXO/calculateTxid.js';
import qitmeer from "qitmeer-js";
import { getUtxos, getUTXOBalance, getUtxo, sendTraction, rpcUrls } from '../utils/UTXO/meerRpc.js'
import bip39 from 'bip39'
import ecc from 'tiny-secp256k1'
import { BIP32Factory } from 'bip32'
const bip32 = BIP32Factory(ecc)
import BigNumber from 'bignumber.js';

// evm转账
export async function evmTransfer(data) {
    let web3 = new Web3(new Web3.providers.HttpProvider(data.url));
    console.log(data, "测试地址");

    let details = {
        to: data.to, // 接收方地址                                                             
        value: web3.utils.toHex(web3.utils.toWei(data.value, 'ether')), // 转账 wei  
        // meer交易此处需要使用int类型
        gasLimit: web3.utils.toHex(data.gasLimit),
        gasPrice: web3.utils.toHex(data.gasPrice),
        nonce: await web3.eth.getTransactionCount(data.accountAddress),
        chainId: data.chainId,
        type:'EVMtoEVM'
    }
    let tx = new EthereumTx(details)
    let privateKey = Buffer.from(data.key, 'hex');
    tx.sign(privateKey)
    let serializedTx = tx.serialize();
    let raw = '0x' + serializedTx.toString('hex');
    web3.eth.sendSignedTransaction(raw).then(hash => {
        // indexDbData.getData('nonce').then(res => {
        //     res['content'] = res['content'] + 1;
        //     indexDbData.putData(res);
        // });
        console.log(hash, 'hash');
        chromeNotifications(hash)
        // 将参数与hash合并，便于后面的取消和加速操作
        let info = Object.assign(data, hash)
        hashSaveIndexDB(data['keyStore'], 'dispose', info);
    }).catch(error => {
        console.log(error.message, 'error');
        hashSaveIndexDB(data['keyStore'], 'error', data)
        return;
    })
}
// 取消交易
export async function closeTransfer(data) {
    let web3 = new Web3(new Web3.providers.HttpProvider(data.url));
    let details = {
        to: data.to, // 接收方地址                                                             
        value: web3.utils.toHex(0), // 转账 wei  
        // meer交易此处需要使用int类型
        gasLimit: web3.utils.toHex(data.gasLimit),
        gasPrice: web3.utils.toHex(data.gasPrice * 10),
        nonce: await web3.eth.getTransactionCount(data.accountAddress),
        chainId: data.chainId
    }
    let tx = new EthereumTx(details)
    let privateKey = Buffer.from(data.key, 'hex');
    tx.sign(privateKey)
    let serializedTx = tx.serialize();
    let raw = '0x' + serializedTx.toString('hex');
    web3.eth.sendSignedTransaction(raw).then(hash => {
        console.log(hash, '取消成功');
    }).catch(error => {
        console.log(error.message, '取消失败');
        return;
    })
}
// 加速交易
export async function hastenTransfer(data) {
    let web3 = new Web3(new Web3.providers.HttpProvider(data.url));
    let details = {
        to: data.to, // 接收方地址                                                             
        value: web3.utils.toHex(web3.utils.toWei(data.value, 'ether')), // 转账 wei  
        // meer交易此处需要使用int类型
        gasLimit: web3.utils.toHex(data.gasLimit),
        gasPrice: web3.utils.toHex(data.gasPrice * 10),
        nonce: await web3.eth.getTransactionCount(data.accountAddress),
        chainId: data.chainId
    }
    let tx = new EthereumTx(details)
    let privateKey = Buffer.from(data.key, 'hex');
    tx.sign(privateKey)
    let serializedTx = tx.serialize();
    let raw = '0x' + serializedTx.toString('hex');
    web3.eth.sendSignedTransaction(raw).then(hash => {
        console.log(hash, '加速成功');
    }).catch(error => {
        console.log(error.message, '取消失败');
        return;
    })
}

//  UTXO交易
export async function utxoTransfer(data) {
    console.log(data, '交易的数据');
    const keyPair = qitmeer.ec.fromPrivateKey(Buffer.from(data.key, 'hex'))
    // 获取发送方地址的余额
    const balance1 = await getUTXOBalance(data.url, data.accountAddress)
    console.log(balance1, 'balance1')
    // 获取发送方地址的未花费交易对信息（为一个数组，暂不确定返回的长度是否有上限，可以通过转入多个小额交易到指定地址进行测试）
    const utxos = await getUtxos(data.url, data.accountAddress)
    console.log(utxos, 'utxos');
    // 指定转出到特定地址的金额，此处我们从本地转给目标地址n MEER（1MEER为100000000个最小单位）
    // 剩余的金额需要设置转回到自己的账户，不然全部会变成手续费。此处我们原本地址的utxo中有500MEER，转出0.8MEER到指定地址，转回499MEER给自己，那么剩下的0.2MEER就会是手续费。手续费过低时交易无法成立，过高时会给用户带来损失，需要多少手续费也需要计算（当然，对于钱包业务来说，除了给矿工的手续费外，我们也可以在这一步对用户收取一定比例的手续费。对于矿工需要多少手续费，我忘记怎么计算了，这块也可以问下兴辉）
    // 计算余额 总的余额 - 交易的数量 - 手续费 = 剩余的额度
    // 手续费
    // 使用big组件，避免计算不精确
    let y = new BigNumber(100000000)
    let num = parseFloat(Math.ceil(data.value / 1024));
    let gas = parseFloat(new BigNumber(num).multipliedBy(0.0002).multipliedBy(y));
    let valueTo = parseFloat(new BigNumber(data.value).multipliedBy(y));
    let remaining = parseFloat(new BigNumber(balance1).multipliedBy(y).minus(valueTo).minus(gas));
    console.log(remaining, 'remaining');
    let allPrice = parseFloat(new BigNumber(valueTo).plus(remaining));
    console.log(allPrice, remaining, 'remaining');
    let selectUtxos;
    // 选择对应的策略
    if (data.tactics == 'min') {
        selectUtxos = await selectMinUTXOs(utxos, allPrice);
    }
    if (data.tactics == 'max') {
        selectUtxos = await selectMaxUTXOs(utxos, allPrice);
    }
    if (data.tactics == 'minimum') {
        selectUtxos = await selectUtxosMinViable(utxos, allPrice);
    }
    if (data.tactics == 'branch') {
        selectUtxos = await selectUtxosBranchAndBound(utxos, allPrice);
    }
    console.log(selectUtxos, 'selectUtxos');
    let network;
    // 设置网络 mainnet【主网】, testnet【测试】, privnet【私有】
    if (rpcUrls.testnet.includes(data.url)) {
        network = qitmeer.networks.testnet;
    } else {
        network = qitmeer.networks.mainnet;
    }
    console.log(network, 'network')
    // 构造交易
    const txb = qitmeer.txsign.newSigner(network);
    // lockTime 是指交易的锁定时间，它表示交易在区块链上的生效时间。通常情况下，如果您不需要特别设置锁定时间，可以将其设置为 0。
    const lockTime = parseInt(new Date().getTime() / 1000);
    txb.setTimestamp(lockTime);
    // 本次使用的txid
    let txids = []
    // 选取合适的utxo
    for (let utxo of selectUtxos.selectedUTXOs) {
        txb.addInput(utxo.txid, utxo.idx);
        // txids.push(utxo.txid);
    }
    txb.addOutput(data.to, valueTo);
    txb.addOutput(data.accountAddress, remaining);

    console.log(txb, '交易的数据txb');
    // 使用前面通过私钥生成的密钥对签署交易
    utxos.map((v, i) => {
        txb.sign(i, keyPair);
    })
    // 构建交易体
    const newTransaction = txb.build().toBuffer().toString('hex');
    console.log(newTransaction, 'newTransaction')
    // 发送交易
    try {
        const response = await sendTraction(data.url, newTransaction)
        let info = Object.assign(data, { 'transactionHash': response,type:'UTXOtoUTXO' })
        console.log(info, 'info')
        chromeNotifications(response);
        hashSaveIndexDB(data['keyStore'], 'dispose', info);
    } catch (error) {
        hashSaveIndexDB(data['keyStore'], 'error', data)
        console.log(error, 'error');
    }
}
// 划转
export async function transferUtxo(data) {
    console.log(data, 'data');
    const network = qitmeer.networks.testnet;
    const keyPair = qitmeer.ec.fromPrivateKey(Buffer.from(data.key, 'hex'));
    const bnalance = await getUTXOBalance(data.url, data.from)
    const txb = qitmeer.txsign.newSigner(network);

    // 设置时间戳，避免timestamp为0导致交易被拒绝
    const lockTime = Math.floor(Date.now() / 1000);
    txb.setTimestamp(lockTime);

    const utxos = await getUtxos(data.url, data.from)
    console.log(utxos, 'utxos');
    // 估算手续费
    let y = new BigNumber(100000000)
    let num = parseFloat(Math.ceil(1 / 1024));
    let gas = parseFloat(new BigNumber(num).multipliedBy(0.0002).multipliedBy(y));
    let valueTo = parseFloat(new BigNumber(data.value).multipliedBy(y));
    let remaining = parseFloat(new BigNumber(bnalance).multipliedBy(y).minus(valueTo).minus(gas));
    let allPrice = parseFloat(new BigNumber(valueTo).plus(remaining));
    // 选取足够的UTXO
    let selectedUtxos = [];
    let selectUtxos;
    // 选择对应的策略
    if (data.tactics == 'min') {
        selectUtxos = await selectMinUTXOs(utxos, allPrice);
    }
    if (data.tactics == 'max') {
        selectUtxos = await selectMaxUTXOs(utxos, allPrice);
    }
    if (data.tactics == 'minimum') {
        selectUtxos = await selectUtxosMinViable(utxos, allPrice);
    }
    if (data.tactics == 'branch') {
        selectUtxos = await selectUtxosBranchAndBound(utxos, allPrice);
    }
    selectedUtxos = selectUtxos.selectedUTXOs;
    // 添加输入
    selectedUtxos.forEach((utxo, i) => {
        txb.addInput(utxo.txid, utxo.idx);
    });
    console.log(gas,"gas");
    console.log(txb,"txbtxbtxb");

    // 添加输出1：EVM pkaddr，coinID=1，pubkey
    txb.addOutput(data.pkaddr, valueTo, 1, 'pubkey');
    // 添加输出2：找零回原地址，coinID=0，pubkeyhash
    txb.addOutput(data.from, remaining, 0, 'pubkeyhash');
    // 签名
    selectedUtxos.forEach((v, i) => {
        txb.sign(i, keyPair);
    });
    // 构建交易
    const hex = txb.build().toBuffer().toString('hex');
    // 发送交易
    try {
        const response = await sendTraction(data.url, hex)
        let info = Object.assign(data, { 'transactionHash': response,type:'UTXOtoEVM' })
        console.log(info, 'info')
        chromeNotifications(response);
        hashSaveIndexDB(data['keyStore'], 'dispose', info);
    } catch (error) {
        // hashSaveIndexDB(data['keyStore'], 'error', data)
        console.log(error, 'error');
    }
}
export default {
    evmTransfer,
    utxoTransfer,
    transferUtxo
}