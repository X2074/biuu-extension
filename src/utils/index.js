import Web3 from 'web3'
import CryptoJS from 'crypto-js'
import bip39 from 'bip39'
import indexDbData from '@/utils/indexDB.js';
import EthereumTx from 'ethereumjs-tx'
import ecc from 'tiny-secp256k1'
import { BIP32Factory } from 'bip32'
// 使用最新版本浏览器不支持，只能使用1.x版本替换
const bip32 = BIP32Factory(ecc)
import { hdkey } from 'ethereumjs-wallet';

//解密方法
export function Decrypt(ciphertext, key) {
	// 解密
	const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, key);
	console.log(decryptedBytes, 'decryptedBytes');
	const decryptedPlaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);
	console.log(decryptedPlaintext, 'decryptedPlaintext');
	return decryptedPlaintext;
}

//加密方法
export function Encrypt(mnemonic, key) {
	return CryptoJS.AES.encrypt(mnemonic, key).toString();
}
// utxo助记词转私钥
export async function utxoKey(mnemonic) {
	try {
		//2.将助记词转成seed
		let seed = await bip39.mnemonicToSeed(mnemonic, '');
		// 通过种子生成BIP32主节点
		let hdWallet = hdkey.fromMasterSeed(Buffer.from(seed, 'hex'));
		//派生 BIP32 导出的密钥对
		let key = hdWallet.derivePath("m/44'/60'/0'/0/0").getWallet();
		const rootPrivateKey = key.privateKey.toString('hex');
		const rootPublicKey = key.publicKey.toString('hex');
		return {
			utxoRootPrivateKey: rootPrivateKey, //私钥
			utxoRootPublicKey: rootPublicKey, //公钥
		}
	} catch (err) {
		console.log(err, '11111');
	}
}
// evm助记词转私钥
export async function evmKey(mnemonic) {
	try {
		//2.将助记词转成seed
		let seed = await bip39.mnemonicToSeed(mnemonic, '');
		// 通过种子生成BIP32主节点
		const hdWallet = bip32.fromSeed(seed);
		// //4.派生一个子密钥对的BIP32导出路径
		let key = hdWallet.derivePath("m/44'/60'/0'/0/0");
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
export async function evmTransfer(data) {
	console.log(data, 'datadatadata');
	let web3 = new Web3(new Web3.providers.HttpProvider(data.url));
	let details = {
		to: data.to, // 接收方地址                                                             
		value: web3.utils.toHex(web3.utils.toWei(data.value, 'ether')), // 转账 wei  
		// meer交易此处需要使用int类型
		gasLimit: web3.utils.toHex(21000),
		gasPrice: web3.utils.toHex(web3.utils.toWei('5', 'gwei')),
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
	// return web3.eth.sendSignedTransaction(raw);
	try {
		let hash = await web3.eth.sendSignedTransaction(raw)
		console.log(hash, 'hash');
		return hash;
	} catch (error) {
		console.log(error.message, 'error');
		return {
			errBol: true,
			error: error
		};
	}
}

// 判断地址，是否合法
export async function isAddress(address) {
	const web3 = new Web3();
	return web3.utils.isAddress(address);
}

// 获取钱包余额
export async function getBlance(url, address) {// 获取钱包余额
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
export async function getGas(url, from, to, value) {// 获取钱包余额
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

// 查询交易noce
export async function getNonce(address, url) {
	// let nonce = await indexDbData.getData('nonce');
	// if (nonce) {
	// 	nonce['content'] = nonce['content'] + 1;
	// 	indexDbData.putData(nonce);
	// 	console.log(nonce, 'nonce');
	// 	return nonce['content'];
	// 	// return nonce['content'];
	// } else {
	let web3 = new Web3(new Web3.providers.HttpProvider(url));
	let data = await web3.eth.getTransactionCount(address, 'latest');
	// console.log(data, 'nonce');
	// let nonceData = {
	// 	id: 'nonce',
	// 	content: data
	// }
	// indexDbData.putData(nonceData);
	return data;
	// }
}