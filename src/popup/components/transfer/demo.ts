// 钱包转账以及加速
const Web3 = require('web3');
const transactionHash = '0x要加速的交易哈希'; // 要加速的交易哈希
const additionalGasPrice = '5000000000'; // 额外的gas价格

const web3 = new Web3('以太坊节点URL');

// 获取当前gas价格
web3.eth.getGasPrice().then((gasPrice) => {
    // 计算加速后的gas价格
    const newGasPrice = Number(gasPrice) + Number(additionalGasPrice);

    // 加速交易
    web3.eth.sendTransaction({
        from: '0x发送者地址',
        to: '0x接收者地址',
        gasPrice: newGasPrice,
        value: '0',//转账金额。以 wei 为单位
        data: '0x',//data: '0x'表示这是一笔没有任何数据的标准以太币转账交易。
        nonce: '0', // 交易nonce
        chainId: 1, // 以太坊主网的chainId
        transactionHash: transactionHash // 要加速的交易哈希
    }).on('transactionHash', function (hash) {
        console.log('Transaction Hash: ' + hash);
    }).on('receipt', function (receipt) {
        console.log('Receipt: ' + receipt);
    }).on('error', console.error);
});
// 发送nft
const Web3 = require('web3');
const contractABI = []; // 合约ABI
const contractAddress = '0x合约地址'; // NFT合约地址
const accountAddress = '0x发送者地址'; // 发送者地址
const receiverAddress = '0x接收者地址'; // 接收者地址
const tokenId = 1; // NFT的标识符
const gasLimit = 300000; // gas限制

const web3 = new Web3('以太坊节点URL');

const contract = new web3.eth.Contract(contractABI, contractAddress);

// 发送NFT并设置gas费
contract.methods.transfer(receiverAddress, tokenId).send({ from: accountAddress, gas: gasLimit })
    .on('transactionHash', function (hash) {
        console.log('Transaction Hash: ' + hash);
    })
    .on('receipt', function (receipt) {
        console.log('Receipt: ' + receipt);
    })
    .on('error', console.error);


// 查询交易noce
const accountAddress = '0x账户地址'; // 要查询nonce的账户地址
web3.eth.getTransactionCount(accountAddress, 'latest')
    .then((nonce) => {
        // 下一个可用noce
        console.log('Next Nonce: ' + nonce);
    })
    .catch((error) => {
        console.error('Error: ' + error);
    });

// 持续监听指定交易
const subscription = web3.eth.subscribe('logs', {
    address: '0x接收者地址', // NFT合约地址
    topics: [null, '0x' + transactionHash.substring(2)] // 通过topics过滤指定交易哈希的日志
}, (error, result) => {
    if (!error) {
        console.log('Transaction Log: ' + JSON.stringify(result));
        // 在这里处理交易状态变化的逻辑
    } else {
        console.error('Error: ' + error);
    }
});
// 取消订阅
// subscription.unsubscribe(function(error, success){
//     if(success)
//         console.log('Successfully unsubscribed!');
// });