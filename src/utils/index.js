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

// 判断地址，是否合法
export async function isAddress(address) {
	const web3 = new Web3();
	return web3.utils.isAddress(address);
}
// 交易hash的保存
export async function saveTransaction(data, key) {
	let hashData = {
		blockNumber: data.blockNumber,//查询交易时间
		blockHash: data.blockHash,//区块hash
		transactionHash: data.transactionHash,//交易hash
		gasUsed: data.gasUsed,//实际3使用的gas费
	}
	hashData = JSON.stringify(hashData);
	// 获取当前账户
	let currentWallt = await indexDbData.getData('currentWalltAddress');
	// 对交易数据进行简单加密
	// hashData = CryptoJS.AES.encrypt(hashData, currentWallt.keyStore).toString();
	// 获取是否有hash缓存
	let transactionData = await indexDbData.getData('transactionHash');
	// 没有就新增
	if (!transactionData) {
		let hashInfo = {
			id: "transactionHash",
			content: {}
		}
		hashInfo.content[currentWallt.keyStore] = [hashData];
		indexDbData.putData(hashInfo);
	} else {
		// 如果当前账户存在hash了
		if (transactionData['content'] && transactionData['content'][currentWallt.keyStore]) {
			transactionData['content'][currentWallt.keyStore] = transactionData['content'][currentWallt.keyStore].push(hashData)
		} else {//如果没有就直接赋值
			transactionData['content'][currentWallt.keyStore] = [hashData];
		}
		indexDbData.putData(transactionData);
	}
	return true;
}
// 更新交易hash
export async function updateTransaction(data, key) {
	let hashData = {
		blockNumber: data.blockNumber,//查询交易时间
		blockHash: data.blockHash,//区块hash
		transactionHash: data.transactionHash,//交易hash
		gasUsed: data.gasUsed,//实际3使用的gas费
	}
	hashData = JSON.stringify(hashData);
	// 获取当前账户
	let currentWallt = await indexDbData.getData('currentWalltAddress');
	// hash缓存-当前hash
	let transactionData = await indexDbData.getData('transactionHash');
	transactionData['content'][currentWallt.keyStore] = transactionData['content'][currentWallt.keyStore].map(item => {
		if (item.transactionHash == data.transactionHash) {
			item.status = true;
		}
		return item;
	})
	indexDbData.putData(transactionData);
	return true;
}

// 监听交易状态 - 后期改为组件形式，在vue内部使用
export async function waitTransactionLogs(data, key) {
	// 持续监听指定交易
	const subscription = web3.eth.subscribe('logs', {
		address: '0x接收者地址', // NFT合约地址
		topics: [null, '0x' + data.transactionHash.substring(2)] // 通过topics过滤指定交易哈希的日志
	}, (error, result) => {
		if (!error) {
			console.log('Transaction Log: ' + JSON.stringify(result));
			// 在这里处理交易状态变化的逻辑
		} else {
			console.error('Error: ' + error);
		}
	});

	// 监听订阅事件
	subscription.on('data', (log) => {
		console.log('Log Data:', log.data);
		console.log('Log Topics:', log.topics);
	});

	// 取消订阅
	// subscription.unsubscribe(function(error, success){
	//     if(success)
	//         console.log('Successfully unsubscribed!');
	// });

}