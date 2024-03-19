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


// 查询代币
// tokenContractAddress：代币的合约地址。
// tokenHolderAddress：代币持有者的地址。
// tokenAbi：代币合约的ABI（应从代币合约的开发者处获取）
// 连接到以太坊节点
const web3 = new Web3('https://mainnet.infura.io/v3/your_infura_project_id');

// 代币合约地址
const tokenContractAddress = '0x1234567890123456789012345678901234567890';
// 代币持有者地址
const tokenHolderAddress = '0xabcdef1234567890abcdef1234567890abcdef1234';

// 代币合约 ABI（根据代币合约自行获取）
const tokenAbi = [
    // ABI内容
];

const tokenContract = new web3.eth.Contract(tokenAbi, tokenContractAddress);

// 查询代币余额
tokenContract.methods.balanceOf(tokenHolderAddress).call((error, balance) => {
    if (!error) {
        console.log('代币余额：', balance);
    } else {
        console.error('查询代币余额出错：', error);
    }
});


// 代币交易
// 要使用web3.js进行代币交易，您可以按照以下步骤操作：

// 首先，确保您已经连接到以太坊网络，并且已经通过web3.js实例化了一个Web3对象。例如：
const web3 = new Web3('https://mainnet.infura.io/v3/your_infura_project_id');
// 请将上述代码中的your_infura_project_id替换为您自己的Infura项目ID，并确保您已经安装了web3.js。

// 接下来，您需要设置您的账户私钥以进行交易。请确保私钥的安全性，并不要在公共场合泄露私钥。例如：
const account = web3.eth.accounts.privateKeyToAccount('your_private_key');
web3.eth.accounts.wallet.add(account);
// 请将上述代码中的your_private_key替换为您自己的账户私钥。

// 然后，您可以使用web3.js提供的方法来发送代币交易。以下是一个简单的示例代码，用于发送代币交易：
const contractAddress = '0x1234567890abcdef1234567890abcdef12345678'; // 代币合约地址
const contractABI = [ /* 代币合约ABI */];

const contract = new web3.eth.Contract(contractABI, contractAddress);

const receiverAddress = '0xabcdef1234567890abcdef1234567890abcdef12'; // 接收者地址
const amount = '1000000000000000000'; // 代币数量

contract.methods.transfer(receiverAddress, amount).send({ from: account.address })
    .on('transactionHash', function (hash) {
        console.log('Transaction Hash: ' + hash);
    })
    .on('receipt', function (receipt) {
        console.log('Transaction Receipt: ' + receipt);
    })
    .on('error', console.error);