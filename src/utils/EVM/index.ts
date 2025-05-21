import Web3 from 'web3'
import bip39 from 'bip39'
import EthereumTx from 'ethereumjs-tx'
import ecc from 'tiny-secp256k1'
// import { chromeNotifications } from '../index';
import { BIP32Factory } from 'bip32'
// evm助记词转私钥
const bip32 = BIP32Factory(ecc)
export async function evmKey(mnemonic: any) {
    try {
        //2.将助记词转成seed
        let seed = await bip39.mnemonicToSeed(mnemonic, '');
        // 通过种子生成BIP32主节点
        const hdWallet = bip32.fromSeed(seed);
        // //4.派生一个子密钥对的BIP32导出路径
        let key: any = hdWallet.derivePath("m/44'/60'/0'/0/0");
        // // 获取子公私钥的十六进制格式
        const privateKeyHex = key.privateKey.toString('hex');
        const publicKeyHex = key.publicKey.toString('hex');
        return {
            privateKey: privateKeyHex, //私钥
            publicKey: publicKeyHex, //公钥
        }
    } catch (err) {
        console.log(err, '22222');
    }
}
// evm转账
export async function evmTransfer(data: any) {
    let web3 = new Web3(new Web3.providers.HttpProvider(data.url));
    let details = {
        to: data.to, // 接收方地址                                                             
        value: web3.utils.toHex(web3.utils.toWei(data.value, 'ether')), // 转账 wei  
        // meer交易此处需要使用int类型
        gasLimit: web3.utils.toHex(data.gasLimit),
        gasPrice: web3.utils.toHex(data.gasPrice),
        nonce: await web3.eth.getTransactionCount(data.accountAddress),
        chainId: data.chainId
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
        // chromeNotifications(hash)
        // 将参数与hash合并，便于后面的取消和加速操作
        let info = Object.assign(data, hash)
        // hashSaveIndexDB(data['keyStore'], 'dispose', info);
    }).catch(error => {
        console.log(error.message, 'error');
        // hashSaveIndexDB(data['keyStore'], 'error', data)
        return;
    })
}
// 判断地址，是否合法
export async function isAddress(address: any) {
    const web3 = new Web3();
    return web3.utils.isAddress(address);
}
// 获取钱包余额
export async function getEVMBalance(url: any, address: any) {// 获取钱包余额
    // 定义rpc
    let web3 = new Web3(new Web3.providers.HttpProvider(url));
    let data = await web3.eth.getBalance(address);
    if (!data) {
        return 0;
    } else {
        let balance = web3.utils.fromWei(data, 'ether');
        balance = String(balance).replace(/^(.*\..{4}).*$/, '$1');
        return balance;
    }
}
// 获取gasLimit\gasPrice
export async function getGas(url: any, from: any, to: any, value: any) {// 获取钱包余额
    // 定义rpc
    let web3 = new Web3(new Web3.providers.HttpProvider(url));
    let transaction = {
        from: from,
        to: to,
        value: web3.utils.toWei(value, 'ether')
    };
    let gasLimit = await web3.eth.estimateGas(transaction);
    let gasPrice = await web3.eth.getGasPrice();
    console.log(gasLimit, gasPrice, 'gasLimitgasPrice');
    return {
        gasLimit: gasLimit,
        gasPrice: gasPrice
    }
}