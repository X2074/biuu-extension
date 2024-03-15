import Web3 from 'web3'
import indexDbData from './indexDB.js';
import erp721 from './erp721.json';
import bus from '@/utils/bus';
import md5 from 'js-md5';
/*
nft的indexDB数据处理
层级：
content{数据集合
    store{创建钱包时生成的uuis
        address{相同合约地址的放在一起
            name:合集名称
            collections[]合集下面的nft
        }
    }
}
*/
export async function NFTSaveIndexDB(data, wallt) {
    // 首先获取所有的nfts数据
    let nfts = await indexDbData.getData(md5('nfts'));
    let nftData, nftContent;
    // 如果没有保存过nft
    if (!nfts) {
        nftData = {//完整的nfts数据
            id: md5('nfts'),
            content: {}
        }
        /* nfts示例：
            content:nfts集合
            keyStore:当前钱包随机数
            nftAddress：合约地址，同一个合约都放一起
        */
        nftContent = {
            collectionName: data.collectionName,//合集名称
            collections: [data]//合集中的nft列表
        }
        let dataNft = {};
        dataNft[data.nftAddress] = nftContent;
        nftData['content'][wallt.keyStore] = dataNft;
    } else {
        // 如果当前账户keyStore或者是当前账户下该合约没有保存nft下没有保存nft
        if (!nfts['content'][wallt.keyStore] || !nfts['content'][wallt.keyStore][data.nftAddress]) {
            nftContent = {
                collectionName: data.collectionName,//合集名称
                collections: [data]//合集中的nft列表
            }
            nfts['content'][wallt.keyStore][data.nftAddress] = nftContent;
        } else {
            // 查询当前账户，当前传递的合约地址下面的nft，并过滤出当前传递的tokenId相同的nft
            console.log(nfts['content'][wallt.keyStore], "nfts['content'][wallt.keyStore]");
            let filterNft = nfts['content'][wallt.keyStore][data.nftAddress]['collections'].filter(item => {
                return item.address == data.address && item.tokenId == data.tokenId
            })
            // 如果有相同tokenId，return；
            if (filterNft && filterNft.length) {
                bus.emit('promptModalErr', '重复导入的NFT')
                return false;
            }
            nfts['content'][wallt.keyStore][data.nftAddress]['collections'].push(data);
        }
        nftData = nfts;
    }
    indexDbData.putData(nftData);
    return true;
}
/**
 * 更新nft
 * @param {*} keyStore uuid
 * @param {*} nftAddress nft合约地址
 * @param {*} data 更新后的nft数据
 * @returns 
 */
export async function NFTUpdataIndexDB(keyStore, nftAddress, data) {
    let nfts = await indexDbData.getData(md5('nfts'));
    nfts['content'][keyStore][nftAddress]['collections'] = data;
    console.log(nfts, 'nfts');
    indexDbData.putData(nfts)
    return true;
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
        blockHash: data.blockHash,
        blockNumber: data.blockNumber,
        transactionHash: data.transactionHash,
        gasUsed: data.gasUsed,
        from: data.from,
        to: data.to,
        status: status
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
/**
 * 保存曾经拥有（导入后又转移出去的nft)
 */
export async function usedToHaveNft(data, keyStore) {
    // 首先获取所有的nfts数据
    let nfts = await indexDbData.getData(md5('onceNft'));
    let nftData, nftContent;
    console.log(data, keyStore, nfts, 'nfts');
    // 如果没有保存过nft
    if (!nfts) {
        nftData = {//完整的nfts数据
            id: md5('onceNft'),
            content: {}
        }
        nftData['content'][keyStore] = [data];
    } else {
        // 如果当前账户keyStore或者是当前账户下该合约没有保存nft下没有保存nft
        if (!nfts['content'][keyStore] || !nfts['content'][keyStore].length) {
            nfts['content'][keyStore] = [data];
        } else {
            // 查询当前账户，当前传递的合约地址下面的nft，并过滤出当前传递的tokenId相同的nft
            console.log(nfts['content'][keyStore], "nfts['content'][wallt.keyStore]");
            let filterNft = nfts['content'][keyStore].filter(item => {
                return item.address == data.address && item.tokenId == data.tokenId
            })
            // 如果有相同tokenId，return；
            if (filterNft && filterNft.length) {
                bus.emit('promptModalErr', '重复导入的NFT')
                return false;
            }
            nfts['content'][keyStore].push(data);
        }
        nftData = nfts;
    }
    indexDbData.putData(nftData);
    return true;
}