const bip39 = require('bip39')
const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
const bip32 = BIP32Factory(ecc)

// Address creation
const ethUtil = require('ethereumjs-util');
const qitmeer = require('qitmeer-js')

// main function
async function generateKeysFromMnemonic(mnemonic) {
    // const entropy = bip39.mnemonicToEntropy(mnemonic)
    const entropy = '4dfd9b1ad569fee7aafefd2e8492f2d5'
    const seed = await bip39.mnemonicToSeed(mnemonic, "")
    console.log('seed:',seed)
    console.log("seed:", seed.toString('hex'))
    // 通过种子生成BIP32主节点
    const masterNode = bip32.fromSeed(seed);
    const rootPrivateKey = masterNode.privateKey.toString('hex');
    const rootPublicKey = masterNode.publicKey.toString('hex');
    console.log("rootPrivateKey:",rootPrivateKey);
    console.log("rootPublicKey:",rootPublicKey);

    console.log("Meer UTXO Address:")
    const testNetwork = qitmeer.networks.testnet;
    console.log(testNetwork)
    const mainNetwork = qitmeer.networks.mainnet;
    console.log(mainNetwork)
    const hash160 = qitmeer.hash.hash160(masterNode.publicKey);
    const p2pkhAddressTest = qitmeer.address.toBase58Check(hash160, testNetwork.pubKeyHashAddrId);
    const p2pkhAddressMain = qitmeer.address.toBase58Check(hash160, mainNetwork.pubKeyHashAddrId);

    console.log(p2pkhAddressTest, p2pkhAddressMain, hash160.toString('hex'), entropy, rootPublicKey)
    console.log("Meer derive address(evm address):")
    // 派生一个子密钥对的BIP32导出路径
    const path = "m/44'/60'/0'/0/0"; // 你可以更改路径来生成不同的子密钥
    const childNode = masterNode.derivePath(path);
    // console.log(childNode)

    // 获取子私钥的WIF格式
    const privateKeyWIF = childNode.toWIF();

    // 获取子公私钥的十六进制格式
    const privateKeyHex = childNode.privateKey.toString('hex');
    const publicKeyHex = childNode.publicKey.toString('hex');

    console.log('Private Key (WIF):', privateKeyWIF);
    console.log('Private Key (Hex):', privateKeyHex);
    console.log('Public Key (Hex):', publicKeyHex);

    const address = ethUtil.publicToAddress(childNode.publicKey, true).toString('hex');

    console.log("evm address:",'0x'+address)
}