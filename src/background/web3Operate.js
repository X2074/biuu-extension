import Web3 from 'web3'
import indexDbData from '../utils/indexDB.js';
import EthereumTx from 'ethereumjs-tx'
import { hashSaveIndexDB } from '../utils/operateIndexDB.js';
import { chromeNotifications } from './utils';
import md5 from 'js-md5';

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
// /**保存交易hash
//  * @param {*} keyStore uuid
//  * @param {*} nftAddress nft合约地址
//  * @param {*} data 更新后的nft数据 
//   */
// export async function hashSaveIndexDB(keyStore, status, data) {
//     // 首先获取所有的nfts数据
//     let tradeHash = await indexDbData.getData(md5('tradeHash'));
//     let tradData;
//     /* data示例：
//         blockHash:区块hash，查询区块交易的所有信息
//         blockNumber:用来查询交易时间
//         transactionHash：交易hash，查询交易信息
//         gasUsed 消耗的gas费
//         from 发送方地址
//         to 消息的目标地址（nft所在合约）
//         status 交易的状态：队列中queue 已确认confirmed
//     */
//     let hashContent = {
//         blockHash: data.blockHash || '',
//         blockNumber: data.blockNumber || '',
//         transactionHash: data.transactionHash || '',
//         gasUsed: data.gasUsed || '',
//         from: data.from || '',
//         to: data.to || '',
//         status: status || '',
//         price: data['value'] ? data['value'] : 0
//     }
//     // 如果没有保存过hash
//     if (!tradeHash) {
//         tradData = {
//             id: md5('tradeHash'),
//             content: {}
//         }
//         tradData['content'][keyStore] = [hashContent];
//     } else {
//         // 如果当前账户keyStore下面没有数据
//         if (!tradeHash['content'][keyStore] || !tradeHash['content'][keyStore].length) {
//             tradeHash['content'][keyStore] = [hashContent];
//         } else {
//             // 查询当前账户，当前传递的合约地址下面的nft，并过滤出当前传递的tokenId相同的nft
//             tradeHash['content'][keyStore].push(hashContent);
//         }
//         tradData = tradeHash;
//     }
//     indexDbData.putData(tradData);
//     return true;
// }

export default {
    evmTransfer
}