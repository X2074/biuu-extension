import Web3 from 'web3'
import indexDbData from '../utils/indexDB.js';
import EthereumTx from 'ethereumjs-tx'
import { hashSaveIndexDB } from '../utils/operateIndexDB.js';
import { chromeNotifications } from './utils';
import qitmeer from "qitmeer-js";
import { getUtxos, getUTXOBalance, getUtxo, sendTraction, rpcUrls } from '../utils/UTXO/meerRpc.js'

// evm转账
export async function evmTransfer(data) {
    let web3 = new Web3(new Web3.providers.HttpProvider(data.url));
    let details = {
        to: data.to, // 接收方地址                                                             
        value: web3.utils.toHex(web3.utils.toWei(data.value, 'ether')), // 转账 wei  
        // meer交易此处需要使用int类型
        gasLimit: web3.utils.toHex(data.gasLimit),
        gasPrice: web3.utils.toHex(data.gasPrice),
        nonce: web3.utils.toHex(data.nonce),
        chainId: data.chainId
    }
    let tx = new EthereumTx(details)
    let privateKey = Buffer.from(data.key, 'hex');
    tx.sign(privateKey)
    let serializedTx = tx.serialize();
    let raw = '0x' + serializedTx.toString('hex');
    web3.eth.sendSignedTransaction(raw).then(hash => {
        indexDbData.getData('nonce').then(res => {
            res['content'] = res['content'] + 1;
            indexDbData.putData(res);
        });
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
        nonce: web3.utils.toHex(data.nonce),
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
        nonce: web3.utils.toHex(data.nonce),
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
    const balance1 = (await getUTXOBalance(data.url, data.accountAddress))
    console.log(balance1, 'balance1')
    // 获取接收方地址余额
    const balance2 = (await getUTXOBalance(data.url, data.to))
    console.log(balance2, 'balance2')
    // 获取发送方地址的未花费交易对信息（为一个数组，暂不确定返回的长度是否有上限，可以通过转入多个小额交易到指定地址进行测试）
    const utxos = await getUtxos(data.url, data.accountAddress)
    console.log(utxos, 'utxos')
    let network;
    // 设置网络 mainnet【主网】, testnet【测试】, privnet【私有】
    if (rpcUrls.testnet.includes(data.url)) {
        network = qitmeer.networks.testnet;
    } else {
        network = qitmeer.networks.mainnet;
    }
    // 构造交易
    const txb = qitmeer.txsign.newSigner(network);
    // lockTime 是指交易的锁定时间，它表示交易在区块链上的生效时间。通常情况下，如果您不需要特别设置锁定时间，可以将其设置为 0。
    const lockTime = parseInt(new Date().getTime() / 1000)
    console.log(txb, 'txb')
    txb.setTimestamp(lockTime)
    // txb.setLockTime(lockTime)
    // 将未花费交易对添加到输入中，此处示例是我把全部的未花费交易对都传入了，实际上只需要总额加起来足够支付手续费和转出金额就行，因此如何选取合适的utxo交易对是一个问题，可以其他开源的btc钱包中的这部分计算方案（实际钱包处理这块时，应该不需要每次都重新获取未花费交易对，对弈已有的数据本地应该暂存了，然后每次操作完后更新，移除使用的utxo，加入新的utxo）
    for (let utxo of utxos) {
        txb.addInput(utxo.txid, utxo.idx);
        const utxoD = await getUtxo(data.url + '/', utxo.txid, utxo.idx)
        console.log(txb, 'utxoD')
    }
    // 指定转出到特定地址的金额，此处我们从本地转给目标地址n MEER（1MEER为100000000个最小单位）
    txb.addOutput(data.to, data.value * 100000000);
    // 剩余的金额需要设置转回到自己的账户，不然全部会变成手续费。此处我们原本地址的utxo中有500MEER，转出0.8MEER到指定地址，转回499MEER给自己，那么剩下的0.2MEER就会是手续费。手续费过低时交易无法成立，过高时会给用户带来损失，需要多少手续费也需要计算（当然，对于钱包业务来说，除了给矿工的手续费外，我们也可以在这一步对用户收取一定比例的手续费。对于矿工需要多少手续费，我忘记怎么计算了，这块也可以问下兴辉）
    // 计算余额 总的余额 - 交易的数量 - 手续费 = 剩余的额度
    // 手续费
    let num = Math.ceil(data.value / 1024);
    let gas = num * 0.0002 * 100000000;
    let remaining = (balance1 * 100000000) - (data.value * 100000000) - gas;
    console.log(remaining, 'remaining');
    txb.addOutput(data.accountAddress, remaining);
    console.log(txb, '交易的数据txb');
    return;
    // 使用前面通过私钥生成的密钥对签署交易
    utxos.map((v, i) => {
        txb.sign(i, keyPair);
    })
    // 构建交易体
    const newTransaction = txb.build().toBuffer().toString('hex');
    console.log(newTransaction, 'newTransaction')
    // 发送交易
    const response = await sendTraction('testnet', newTransaction)
    console.log(response, 'response')
    // try {
    //   const response = await axios.post(url, payload, config);
    //   console.log(response.data)
    // } catch (error) {
    //   console.error('Error:', error);
    // }
}

export default {
    evmTransfer,
    utxoTransfer
}