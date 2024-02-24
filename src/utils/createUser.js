
import indexDbData from './indexDB.js';
import { Encrypt } from '@/utils/index.js';
import netWork from './utils/netWork.json'
import qitmeer from 'qitmeer-js'
import ethUtil from 'ethereumjs-util'
import bip39 from 'bip39'
import eip55 from 'eip55'
// 使用最新版本浏览器不支持，只能使用1.x版本替换
import ecc from 'tiny-secp256k1'
import { BIP32Factory } from 'bip32'
const bip32 = BIP32Factory(ecc)
// 助记词生成钱包信息
const createWallet = async (mnemonic) => {
    try {
        console.log(mnemonic, 'bip39');
        mnemonicArray.value = mnemonic.split(' ');
        // console.log(mnemonicArray.value, '助记词');
        // //2.将助记词转成seed
        let seed = await bip39.mnemonicToSeed(mnemonic, '');
        // console.log(seed, '将助记词转成seed');
        // // 通过种子生成BIP32主节点
        const hdWallet = bip32.fromSeed(seed);
        // EVM
        console.log(hdWallet, '将助记词转成seed');
        const rootPrivateKey = hdWallet.privateKey.toString('hex');
        const rootPublicKey = hdWallet.publicKey.toString('hex');
        console.log('私钥:', rootPrivateKey);
        console.log('公钥:', rootPublicKey);
        // UTXO
        const testNetwork = qitmeer.networks.testnet;
        console.log('Meer UTXO Address:', testNetwork)
        const mainNetwork = qitmeer.networks.mainnet;
        const hash160 = qitmeer.hash.hash160(hdWallet.publicKey);
        const p2pkhAddressTest = qitmeer.address.toBase58Check(hash160, testNetwork.pubKeyHashAddrId);
        const p2pkhAddressMain = qitmeer.address.toBase58Check(hash160, mainNetwork.pubKeyHashAddrId);
        // //4.派生一个子密钥对的BIP32导出路径
        let key = hdWallet.derivePath("m/44'/60'/0'/0/0");
        // // 获取子私钥的WIF格式
        // const privateKeyWIF = key.toWIF();
        // // 获取子公私钥的十六进制格式
        const privateKeyHex = key.privateKey.toString('hex');
        // const publicKeyHex = key.publicKey.toString('hex');

        let address = ethUtil.publicToAddress(key.publicKey, true).toString('hex');
        address = eip55.encode(address.toString('hex'));
        console.log(address, 'address');

        // console.log('私钥(WIF):', privateKeyWIF);
        console.log('私钥 (Hex):', privateKeyHex);
        // console.log('公钥 (Hex):', publicKeyHex);
        // console.log({
        //     mnemonic, privateKeyHex, publicKeyHex, address
        // });
        return {
            mnemonicArray: mnemonicArray.value,
            mnemonic: mnemonic, //助记词
            privateKey: privateKeyHex, //私钥
            publicKey: publicKeyHex, //公钥
            address: address, //钱包地址
            // keystore: {}, //钱包的keystore
            utxoRootPrivateKey: rootPrivateKey, //私钥
            utxoRootPublicKey: rootPublicKey, //公钥
            utxoAddressTest: p2pkhAddressTest, //UTXO测试网地址
            utxoAddressMain: p2pkhAddressMain, //UTXO正式网地址

        }
    } catch (err) {
        console.log(err, '33333');
    }
}
// 助记词加密
const UtxoEvmKey = (walltInfo, passKey) => {
    let ciphertext = Encrypt(walltInfo.mnemonic, passKey);
    console.log(ciphertext, '加密后的数据');
    // 判断是否存过key，如果存过就以数组形式组合为字符串
    indexDbData.getData('keyStore').then(resKey => {
        // 存为当前展示的钱包数据
        indexDbData.getData('currentWalltAddress').then(res => {
            console.log(!res, 'dasdsad');
            if (!res) {
                indexDbData.putData({
                    id: 'currentWalltAddress',
                    userName: '',
                    userUrl: '',
                    address: walltInfo.address,
                    NoIndex: 1
                })
            } else {
                // 将密钥组合为：(钱包地址：密钥)的格式，方便后续获取
                let data;
                data[walltInfo.address] = ciphertext;
                let secret;
                if (typeof resKey == "string") {
                    let key;
                    key[resKey] = resKey;
                    secret = [resKey, data]
                } else {
                    secret = [...resKey, data]
                }
                indexDbData.putData({
                    id: 'keyStore',
                    secret: ciphertext
                })
                indexDbData.putData({
                    id: 'currentWalltAddress',
                    address: walltInfo.address,
                    userName: '',
                    userUrl: '',
                    NoIndex: res.NoIndex + 1//当前第几个用户
                })
            }
        }).catch(err => { })
        evmNetwork();//新增并存储evm网络
        utxoNetwork();//新增并存储evm网络
    })

}
// 保存evm钱包
export async function evmNetwork(walltInfo) {
    indexDbData.getData('EVM').then(res => {
        // 提取数据库存储的网络 chainid
        if (!res || !res.content) {
            res.content['8031'] = netWork.EVM['8031'];
            res.content['97'] = netWork.EVM['97'];
            indexDbData.putData({
                id: 'rpc_url',
                unit: 'BNB',
                CHAIN_ID: 97,
                type: 'EVM',
                url: 'https://data-seed-prebsc-1-s2.binance.org:8545/'
            })
        }
        let chainId = Object.keys(res.content)
        Object.keys(netWork.EVM).forEach(item => {
            if (!chainId.includes(item)) { //如果数据库没有这个网络
                res.content[item] = netWork.EVM[item];
            }
        })
        Object.keys(res.content).forEach((item, index) => {
            res.content[item].walltInfo.push({
                address: walltInfo.address, //当前用户地址
                userName: '',
                userUrl: '',
                NoIndex: index + 1//当前第几个用户
            })
        })
        console.log(res, 1111111);
        indexDbData.putData(res)
    })
}
// 保存utxo钱包
export async function utxoNetwork(walltInfo) {
    indexDbData.getData('UTXO').then(res => {
        if (!res || !res.content) {
            // 新增默认utxo网络
            res.content = {
                8131: {
                    id: 'rpc_url',
                    unit: 'MEER',
                    CHAIN_ID: 8131,
                    url: 'https://testnet-qng.rpc.qitmeer.io',
                    walltInfo: []
                }
            }
        }
        // 提取数据库存储的网络 chainid
        let chainId = Object.keys(res.content)
        Object.keys(netWork.UTXO).forEach(item => {
            if (!chainId.includes(item)) { //如果数据库没有这个网络
                res.content[item] = netWork.UTXO[item];
            }
        })
        Object.keys(res.content).forEach((item, index) => {
            res.content[item].walltInfo.push({
                address: walltInfo.utxoAddressTest, //当前用户地址
                userName: '',
                userUrl: '',
                NoIndex: index + 1//当前第几个用户
            })
        })
        indexDbData.putData(res)
    })
}