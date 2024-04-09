
import indexDbData from '../utils/indexDB.js';
import { stopHeartbeat } from './resident.js';
import { hashSaveIndexDB } from '../utils/operateIndexDB.js';
import Web3 from 'web3'
import md5 from 'js-md5';
let timer = null;
let rpc_url = null;//获取的rpc数据
let web3 = null;
let tradeHash = null;//获取的hash数据
let currentWallt = null;//当前主账户数据
indexDbData.getData('rpc_url').then(res => {
    console.log(res, 'indexDBashuju');
})
// 轮循交易hash的状态
export async function roundRobin() {
    currentWallt = await indexDbData.getData("currentWalltAddress");
    let data = await indexDbData.getData(md5("tradeHash"));//获取缓存的hash数据
    tradeHash = data["content"][currentWallt["keyStore"]];
    // 如果没有交易数据，就停止js常驻
    if (!tradeHash || !tradeHash.length) {
        stopHeartbeat()
    } else {
        getTransactionStatus()
    };
}
// 过滤出未完成交易的数据
async function getTransactionStatus() {
    let queueTransactions = [];
    // 对交易数据进行分类，没有成功的放置数组中
    tradeHash.forEach(item => {
        // 存在交易hash并且是进行中的才能去查询状态
        if (item.transactionHash && (!item.status || item.status == "queue" || item.status == "dispose")) {
            queueTransactions.push(item);
        }
    });
    console.log('tradeHash', tradeHash);
    console.log('queueTransactions', queueTransactions);
    if (timer) clearTimeout(timer)
    // 如果有未完成的,5s后轮循
    if (queueTransactions.length) {
        console.log(queueTransactions, '未完成的交易');
        // 定义rpc;
        rpc_url = await indexDbData.getData('rpc_url');
        web3 = new Web3(new Web3.providers.HttpProvider(rpc_url.url));
        timer = setTimeout(() => {
            lunxunData(queueTransactions)
        }, 10000);
    } else {
        stopHeartbeat()
    }

}
// 轮循hash状态
async function lunxunData(data) {
    const promises = [];
    for (const transactionDetail of data) {
        let data = web3.eth.getTransactionReceipt(transactionDetail.transactionHash);
        promises.push(data)
    }
    Promise.all(promises)
        .then(results => {
            // 在所有异步操作都完成后执行的逻辑
            console.log("所有异步操作已完成", results);
            results.forEach(item => {
                if (item.status) {
                    item['status'] = 'finish';
                    hashSaveIndexDB(currentWallt["keyStore"], 'finish', item);
                }
            });
            getTransactionStatus()
        })
        .catch(error => {
            // 处理任何可能的错误
            console.error("发生错误", error);
            getTransactionStatus()
        });
}