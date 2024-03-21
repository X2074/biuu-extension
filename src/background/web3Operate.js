import Web3 from 'web3'
import indexDbData from '../utils/indexDB.js';
import EthereumTx from 'ethereumjs-tx'
import { chromeNotifications } from './utils';
import md5 from 'js-md5';

// evm转账
export async function evmTransfer(data) {
    console.log(data, 'datadatadata');
    let web3 = new Web3(new Web3.providers.HttpProvider(data.url));
    console.log(web3, 'web3');
    let details = {
        to: data.to, // 接收方地址                                                             
        value: web3.utils.toHex(web3.utils.toWei(data.value, 'ether')), // 转账 wei  
        // meer交易此处需要使用int类型
        gasLimit: web3.utils.toHex(data.gasLimit),
        gasPrice: web3.utils.toHex(data.gasPrice),
        nonce: web3.utils.toHex(data.nonce), //meer交易这个可以不填// 序号ID, 重要， 需要一个账号的交易序号，可以通过web3.eth.getTransactionCount(web3.eth.defaultAccount)获得
        chainId: data.chainId
    }
    console.log(web3.utils.toHex(5000000000), '44', web3.utils.toHex(web3.utils.toWei('5', 'gwei')));
    console.log(details, 'details');
    let tx = new EthereumTx(details)
    console.log(tx, 'tx');
    let privateKey = Buffer.from(data.key, 'hex');
    console.log(privateKey, 'privateKey');
    tx.sign(privateKey)
    let serializedTx = tx.serialize();
    let raw = '0x' + serializedTx.toString('hex');
    console.log(raw, 'raw');
    web3.eth.sendSignedTransaction(raw).then(hash => {
        console.log(hash, 'hash');
        chromeNotifications(hash)
        hashSaveIndexDB(data['keyStore'], 'dispose', hash)
    }).catch(error => {
        console.log(error.message, 'error');
        hashSaveIndexDB(data['keyStore'], 'error', data)
        return;
    })
}

/**保存交易hash
 * @param {*} keyStore uuid
 * @param {*} nftAddress nft合约地址
 * @param {*} data 更新后的nft数据 
  */
export async function hashSaveIndexDB(keyStore, status, data) {
    // 首先获取所有的nfts数据
    let tradeHash = await indexDbData.getData(md5('tradeHash'));
    let tradData;
    /* data示例：
        blockHash:区块hash，查询区块交易的所有信息
        blockNumber:用来查询交易时间
        transactionHash：交易hash，查询交易信息
        gasUsed 消耗的gas费
        from 发送方地址
        to 消息的目标地址（nft所在合约）
        status 交易的状态：队列中queue 已确认confirmed
    */
    let hashContent = {
        blockHash: data.blockHash || '',
        blockNumber: data.blockNumber || '',
        transactionHash: data.transactionHash || '',
        gasUsed: data.gasUsed || '',
        from: data.from || '',
        to: data.to || '',
        status: status || '',
        price: data['value'] ? data['value'] : 0
    }
    // 如果没有保存过hash
    if (!tradeHash) {
        tradData = {
            id: md5('tradeHash'),
            content: {}
        }
        tradData['content'][keyStore] = [hashContent];
    } else {
        // 如果当前账户keyStore下面没有数据
        if (!tradeHash['content'][keyStore] || !tradeHash['content'][keyStore].length) {
            tradeHash['content'][keyStore] = [hashContent];
        } else {
            // 查询当前账户，当前传递的合约地址下面的nft，并过滤出当前传递的tokenId相同的nft
            tradeHash['content'][keyStore].push(hashContent);
        }
        tradData = tradeHash;
    }
    indexDbData.putData(tradData);
    return true;
}

export default {
    evmTransfer,
    hashSaveIndexDB
}