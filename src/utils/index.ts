import Web3 from 'web3'
import CryptoJS from 'crypto-js'
import bip39 from 'bip39'
import { getEVMBlance } from '@/utils/EVM/index.js';
import { getUTXOBalance } from '@/utils/UTXO/meerRpc.js'
import ecc from 'tiny-secp256k1'
import { BIP32Factory } from 'bip32'
import browser from 'webextension-polyfill';
import indexDbData from './indexDB';
import {AllowedQueryParamPageType} from "./types"// 使用最新版本浏览器不支持，只能使用1.x版本替换
const bip32 = BIP32Factory(ecc)

//解密方法
export function Decrypt(ciphertext: any, key: any) {
	// 解密
	const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, key);
	console.log(decryptedBytes, 'decryptedBytes');
	const decryptedPlaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);
	console.log(decryptedPlaintext, 'decryptedPlaintext');
	return decryptedPlaintext;
}
//加密方法
export function Encrypt(mnemonic: any, key: any) {
	return CryptoJS.AES.encrypt(mnemonic, key).toString();
}
// utxo助记词转私钥
export async function utxoKey(mnemonic: any) {
	console.log(mnemonic, 'mnemonic');
	try {
		const seed = await bip39.mnemonicToSeed(mnemonic, "")
		console.log('seed:', seed)
		console.log("seed:", seed.toString('hex'))
		// 通过种子生成BIP32主节点
		const masterNode: any = bip32.fromSeed(seed);
		const rootPrivateKey = masterNode.privateKey.toString('hex');
		const rootPublicKey = masterNode.publicKey.toString('hex');
		console.log("rootPrivateKey:", rootPrivateKey);
		console.log("rootPublicKey:", rootPublicKey);
		return {
			privateKey: rootPrivateKey, //私钥
			publicKey: rootPublicKey, //公钥
		}
	} catch (err) {
		console.log(err, '11111');
	}
}
// evm助记词转私钥
export async function evmKey(mnemonic: any) {
	try {
		//2.将助记词转成seed
		let seed = await bip39.mnemonicToSeed(mnemonic, '');
		// 通过种子生成BIP32主节点
		const hdWallet = await bip32.fromSeed(seed);
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
// 判断地址，是否合法
export async function isAddress(address: any) {
	const web3 = new Web3();
	return web3.utils.isAddress(address);
}
// 获取钱包余额
export async function getBlance(url: any, data: any) {// 获取钱包余额
	console.log(data, 'getBlance');
	let netWork = data.netWorkType || data.netWork;
	if (netWork.toLowerCase() == 'evm') {
		return getEVMBlance(url, data.address)
	} else {
		return getUTXOBalance(url, data.utxoAddressTest || data.address)
	}
	// // 定义rpc
	// let web3 = new Web3(new Web3.providers.HttpProvider(url));
	// let data = await web3.eth.getBalance(address);
	// if (!data) {
	// 	return 0;
	// } else {
	// 	let balance = web3.utils.fromWei(data, 'ether');
	// 	balance = String(balance).replace(/^(.*\..{4}).*$/, '$1');
	// 	return balance;
	// }
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



// 存储弹出窗口的ID
// let popupWindowId: number | null = null;

export async function showExtensionPopup(
    url: AllowedQueryParamPageType
): Promise<browser.Windows.Window> {
	let popupWindowId:any = await indexDbData.getData('popupWindowId')
	console.log(popupWindowId,"popupWindowId");
	let window:any;
    // try {
        // 首先尝试获取已存在的弹出窗口
        if (popupWindowId && popupWindowId.content) {
            try {
            const window = await browser.windows.get(popupWindowId.content);
			console.log(window,'window');
			
            if (window) {
				browser.windows.remove(popupWindowId.content);
				let info = {
					id: 'popupWindowId',
					content: null
				};
				indexDbData.putData(info);
                }
            } catch (error) {
                console.log('Previous popup window not found:', error);
				window = await createPopupWindow(url);

            }
        }else{
			window = await createPopupWindow(url);
		}
		return window;

			
    // } catch (error) {
    //     console.error('Failed to show extension popup:', error);
    //     throw error;
    // }
}


const createPopupWindow = async (url: string) => { 
	let popupWindowId:any;
	let window:any;
	// 获取当前窗口的位置
	const { left = 0, top, width = 1920 } = await browser.windows.getCurrent();
	const popupWidth = 384;
	const popupHeight = 628;

	// 创建新的弹出窗口
	window = await browser.windows.create({
		url: `${browser.runtime.getURL('popup/index.html')}#${url}`,
		type: 'popup',
		left: left + width - popupWidth,
		top,
		width: popupWidth,
		height: popupHeight,
		focused: true
	});

	// 保存窗口ID
	popupWindowId = window.id || null;
	console.log('popupWindowId',popupWindowId);
	
	let info = {
		id: 'popupWindowId',
		content: popupWindowId
	};
	indexDbData.putData(info);

	// 监听窗口关闭事件
	browser.windows.onRemoved.addListener((windowId) => {
		if (windowId === popupWindowId) {
			popupWindowId = null;
			let info = {
				id: 'popupWindowId',
				content: popupWindowId
			};
			indexDbData.putData(info);
		}
	});
	return window;
};