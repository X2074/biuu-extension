import Web3 from 'web3'
import CryptoJS from 'crypto-js'
import bip39 from 'bip39'
import { EthereumTx } from 'ethereumjs-tx'
import ecc from 'tiny-secp256k1'
import { BIP32Factory } from 'bip32'
// 使用最新版本浏览器不支持，只能使用1.x版本替换
const bip32 = BIP32Factory(ecc)
import { hdkey } from 'ethereumjs-wallet';

export function getCookie(cookieName) {
	const strCookie = document.cookie
	const cookieList = strCookie.split('; ')
	var cookieValue = 'false';
	for (let i = 0; i < cookieList.length; i++) {
		const arr = cookieList[i].split('=')
		if (cookieName === arr[0]) {
			cookieValue = arr[1];
		}
	}

	return cookieValue;
}

export function setCookie(name, value) {
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
	document.cookie = name + '=' + escape(value) + ';expires=' + exp.toUTCString() + ';path=/;';
}
//清除所有cookie函数
export function clearAllCookie() {
	var keys = document.cookie.match(/[^ =;]+(?=)/g);
	if (keys) {
		for (var i = keys.length; i--;) {
			if (keys[i] != 'local') {
				setCookie(keys[i], '');
				// document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
			}
		}
	}
}
//   获取浏览器参数，判断当前如何显示
export function getQueryParams() {
	var url = document.location.toString()
	// 如果url中有特殊字符则需要进行一下解码
	url = decodeURI(url)
	var arr1 = url.split('?');
	var obj = {}
	if (arr1.length > 1) {
		var arr2 = arr1[1].split('&');
		for (var i = 0; i < arr2.length; i++) {
			var curArr = arr2[i].split('=');
			obj[curArr[0]] = decodeURIComponent(curArr[1])
		}
	}
	return obj
}
export function formatDate(millinSeconds) {
	let date = new Date(millinSeconds);
	let monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Spt', 'Oct', 'Nov', 'Dec'];
	let suffix = ['st', 'nd', 'rd', 'th'];

	let year = date.getFullYear(); //年
	let month = monthArr[date.getMonth()]; //月
	let ddate = date.getDate(); //日
	let hours = date.getHours();
	let minute = date.getMinutes();

	if (ddate % 10 < 1 || ddate % 10 > 3) {
		ddate = ddate + suffix[3];
	} else if (ddate % 10 == 1) {
		ddate = ddate + suffix[0];
	} else if (ddate % 10 == 2) {
		ddate = ddate + suffix[1];
	} else {
		ddate = ddate + suffix[2];
	}
	return month + ' ' + ddate;
}

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
	let web3 = new Web3(new Web3.providers.HttpProvider(data.rpc));
	let noce = await web3.eth.getTransactionCount(data.address);
	let details = {
		to: data.sendAddress, // 接收方地址                                                             
		value: web3.utils.toHex(web3.utils.toWei(data.assetNum, 'ether')), // 转账 wei  
		// gasLimit: web3.utils.toHex(gasLimit.value),
		// gasPrice: web3.utils.toHex(gasPrice.value),
		// meer交易此处需要使用int类型
		gasLimit: web3.utils.toHex(21000),
		gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
		nonce: web3.utils.toHex(noce), //meer交易这个可以不填// 序号ID, 重要， 需要一个账号的交易序号，可以通过web3.eth.getTransactionCount(web3.eth.defaultAccount)获得
		chainId: data.chainId
	}
	console.log(details, 'details');
	let privateKey = hexToBytes(data.key);
	let tx = new EthereumTx(details)
	tx.sign(privateKey)
	let serializedTx = tx.serialize();
	let raw = '0x' + serializedTx.toString('hex');
	let hash = await web3.eth.sendSignedTransaction(raw)
	return hash;
}


function hexToBytes(hex) {
	let bytes = new Uint8Array(Math.ceil(hex.length / 2));
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
	}
	return bytes;
}
