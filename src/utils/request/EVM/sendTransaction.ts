import indexDbData from '../../indexDB.js';
import Web3 from 'web3';
import { showExtensionPopup,chromeNotifications } from '../../index.ts';
import { hashSaveIndexDB } from '../../operateIndexDB.js';
import EthereumTx from 'ethereumjs-tx'
import { v4 as uuidv4 } from 'uuid';
// 执行智能合约调用
// utils/request/EVM/sendTransaction.ts

export default async function eth_sendTransaction(request: any): Promise<string> {
    try {
        const { params } = request;
        const [transaction] = params || [];

        // 验证必需参数
        if (!transaction || !transaction.to) {
            throw new Error('Missing "to" address parameter');
        }

         // 获取当前活动标签页
         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
         console.log(tab, '获取当前活动页');
         if (!tab?.url) {
             throw new Error('Unable to determine the current tab URL');
         }
         
         const currentOrigin = new URL(tab.url).origin;

         // 检查是否已授权
         const authorizedSites = await indexDbData.getData('authorized_sites') || {};
         const siteAuth = authorizedSites[currentOrigin];

        // if (!siteAuth) {
        //     throw new Error('DApp not authorized');
        // }
        
        // 检查授权是否过期
        // const currentTime = Date.now();
        // const expirationTime = siteAuth.timestamp + 7 * 24 * 60 * 60 * 1000; // 7天有效期
        // if (currentTime > expirationTime) {
        //     throw new Error('DApp authorization expired');
        // }

        // 获取当前网络配置
        const rpc_url = await indexDbData.getData('rpc_url');
        if (!rpc_url?.url) {
            throw new Error('No network selected');
        }

        // 获取当前钱包地址
        const currentWallt = await indexDbData.getData('currentWalltAddress');
        if (!currentWallt?.address) {
            throw new Error('No wallet address selected');
        }

        // 创建 Web3 实例
        const web3 = new Web3(new Web3.providers.HttpProvider(rpc_url.url));

        // 构建交易对象
        const txParams:any = {
            from: currentWallt.address,
            to: transaction.to,
            value: transaction.value,
            data: transaction.data || transaction.input,
            gas: transaction.gas,
            gasPrice: transaction.gasPrice,
            nonce: transaction.nonce,
            maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
            maxFeePerGas: transaction.maxFeePerGas,
            chainId: transaction.chainId || rpc_url.CHAIN_ID,
            currentOrigin:currentOrigin
        };

        // 清理空值参数
        Object.keys(txParams).forEach(key => {
            if (txParams[key] === undefined || txParams[key] === null) {
                delete txParams[key];
            }
        });

        // 如果没有指定gas，使用默认值
        if (!txParams.gas) {
            const estimateGas = await web3.eth.estimateGas(txParams);
            txParams.gas = `0x${estimateGas.toString(16)}`;
        }

        // 如果没有指定gasPrice，使用当前网络的gasPrice
        if (!txParams.gasPrice) {
            const gasPrice = await web3.eth.getGasPrice();
            txParams.gasPrice = gasPrice;
        }

        // 如果没有指定nonce，使用当前nonce
        if (!txParams.nonce) {
            const nonce = await web3.eth.getTransactionCount(currentWallt.address);
            txParams.nonce = `0x${nonce.toString(16)}`;
        }
        // 缓存当前交易数据
        // inndexDB.putData(currentWallt.address, txParams);
        // 存储数据
        chrome.storage.local.set({ sendTransaction: txParams }, function() {
            console.log('Data saved in sync storage');
        });

        // 显示确认弹窗
        const popupUrl = await showExtensionPopup(`/sendTransaction`);
        const nonce = await web3.eth.getTransactionCount(txParams.from);
        // 等待用户响应
        return new Promise((resolve, reject) => {
            const handleMessage :any= (message: any) => {
                // 将参数与hash合并，便于后面的取消和加速操作
                let sendData = {
                    uuid: uuidv4(),
                    action: 'transferEVM',
                    value: txParams.value,
                    key: message['privateKey'],
                    keyStore: currentWallt['keyStore'],
                    // accountAddress: currentWallt['address'],
                    gasUsed: txParams['gasPrice'],
                    accountAddress: txParams['from'],
                    balance:message.balance,
                    chainId: rpc_url.CHAIN_ID,
                    gasLimit: txParams['gas'],
                    type: 'sendtransfer'
                }
               
                if (message.action === 'eth_sendTransaction') {
                    console.log(txParams,"txParams");
                    let details = {
                        to: txParams.to, // 接收方地址                                                             
                        value: txParams.value, // 转账 wei  
                        // meer交易此处需要使用int类型
                        gasLimit: txParams.gas,
                        gasPrice: txParams.gasPrice,
                        nonce: nonce,
                        chainId: rpc_url.CHAIN_ID
                    }
                    console.log(sendData,"sendDatasendDatasendDatasendData");
                    
                    let tx = new EthereumTx(details)
                    let privateKey = Buffer.from(message.privateKey, 'hex');
                    tx.sign(privateKey)
                    let serializedTx = tx.serialize();
                    let raw = '0x' + serializedTx.toString('hex');
                    web3.eth.sendSignedTransaction(raw).then((hash:any) => {
                        // indexDbData.getData('nonce').then(res => {
                        //     res['content'] = nonce + 1;
                        //     indexDbData.putData(res);
                        // });
                        console.log(hash, 'hash');
                        chromeNotifications(hash)
                        let info = Object.assign(sendData, hash)
                        console.log(info,"缓存的交易数据");
                        resolve(hash);
                        
                        hashSaveIndexDB(currentWallt['keyStore'], 'dispose', info);
                    }).catch(error => {
                        reject(error);
                        console.log(sendData,"serroratasendDatasendData0.00.00.");
                        hashSaveIndexDB(currentWallt['keyStore'], 'error', sendData)
                        return;
                    })
                }
            };

            chrome.runtime.onMessage.addListener(handleMessage);

            // 设置超时
            setTimeout(() => {
                chrome.runtime.onMessage.removeListener(handleMessage);
                reject(new Error('Operation timeout'));
            }, 300000); // 5分钟超时
        });
    } catch (error) {
        console.error('Error in eth_sendTransaction:', error);
        throw error;
    }
}