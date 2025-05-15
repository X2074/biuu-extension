import indexDbData from './indexDB.js';
import { showExtensionPopup } from './index.ts';
import Web3 from 'web3';
import { ethers } from 'ethers';
// import { JsonRpcProvider } from "ethers";
// 从dapp发送消息到background，background响应消息到dapp
const requestContentScript = (method: any, params: any) => {
	return new Promise((resolve, reject) => {
	// 发送请求到 content script
	window.postMessage(
		{
		target: 'biuu-provider-bridge',
		request: {
			method,
			params
		}
		},
		'*'
	);

	// 监听响应
	const listener = (event: MessageEvent) => {
		console.log(event, 'event465465');
		if (event.data.target === 'biuu-window-provider') {
		window.removeEventListener('message', listener);
		if (event.data.type === method) {
			resolve(event.data.accounts);
		} else {
			reject(new Error('Request failed'));
		}
		}
	};

	window.addEventListener('message', listener);
	});
};

/* 接收 wallet_requestPermissions 请求，并从中提取请求的权限参数
	获取当前活动标签页的 URL 和 origin  属性
	创建一个授权弹窗，将当前 origin 作为参数传递
	等待用户响应（授权或拒绝）
	如果用户授权，将权限信息保存到 IndexedDB
	返回符合 EIP-2255 标准的权限响应
*/
async function requestPermissions(request: any) {
	try {
	const { params } = request;
	const [permissions] = params || [{}];

	// 获取当前活动标签页
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (!tab?.url) {
		throw new Error('Unable to determine the current tab URL');
	}

	const currentOrigin = new URL(tab.url).origin;
	const url: any = `/connect?origin=${encodeURIComponent(currentOrigin)}`;
	const popupUrl: any = await showExtensionPopup(url);

	// 返回一个 Promise，等待用户响应
	return new Promise((resolve, reject) => {
		// 监听来自弹窗的响应
		const handleMessage: any = (message: any) => {
		console.log(message, 'messagemessagemessage');
		if (message.action === 'authorization_response') {
			// 清理消息监听
			chrome.runtime.onMessage.removeListener(handleMessage);

			if (message.approved) {
			// 用户已授权，保存权限信息
			indexDbData
				.getData('authorized_sites')
				.then((sites: any) => {
				const authorizedSites = sites || {};
				authorizedSites['id'] = 'authorized_sites';
				authorizedSites[currentOrigin] = {
					permissions: Object.keys(permissions),
					timestamp: Date.now()
				};

				return indexDbData.putData(authorizedSites);
				})
				.then(() => {
				// 返回符合 EIP-2255 的响应
				resolve([
					{
					parentCapability: 'eth_accounts',
					invoker: currentOrigin,
					caveats: [
						{
						type: 'filterResponse',
						value: [message.account || ''] // 使用从弹窗返回的账户地址
						}
					]
					}
				]);
				})
				.catch((error: any) => {
				console.error('Error saving permissions:', error);
				reject(new Error('Failed to save permissions'));
				});
			} else {
			reject(new Error('User rejected the request'));
			}
		}
		};

		// 添加消息监听
		chrome.runtime.onMessage.addListener(handleMessage);

		// 设置超时
		setTimeout(() => {
		chrome.runtime.onMessage.removeListener(handleMessage);
		reject(new Error('Request timeout'));
		}, 300000); // 5分钟超时
	});
	} catch (error) {
	console.error('Error in requestPermissions:', error);
	throw error;
	}
}


// 添加处理签名请求的函数
async function handleSignMessage(request: any) {
	try {
		const [message, address] = request.params || [];

	// 获取当前活动标签页
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (!tab?.url) {
		throw new Error('Unable to determine the current tab URL');
	}

	const currentOrigin = new URL(tab.url).origin;
	// 创建签名弹窗
	let url: any = `/sign?message=${encodeURIComponent(message)}&address=${address}&origin=${encodeURIComponent(currentOrigin)}`;
	let popupUrl: any = await showExtensionPopup(url);  
	// const popup = await chrome.windows.create({
	//     // url: chrome.runtime.getURL(`popup/index.html#/sign?message=${encodeURIComponent(message)}&address=${address}&origin=${encodeURIComponent(currentOrigin)}`),
	//     url: popupUrl,
	//     type: 'popup',
	//     width: 400,
	//     height: 600
	// });

	// 返回一个 Promise，等待用户响应
	return new Promise((resolve, reject) => {
		const handleMessage:any = (message: any) => {
			console.log(message, "messagehandleMessage");

			if (message.action === 'signature_response') {
				chrome.runtime.onMessage.removeListener(handleMessage);

				if (message.signature) {
					resolve(message.signature);
				} else {
					reject(new Error(message.error || 'User rejected the request'));
				}
			}
		};

		chrome.runtime.onMessage.addListener(handleMessage);

		// 设置超时
		setTimeout(() => {
			chrome.runtime.onMessage.removeListener(handleMessage);
			reject(new Error('Sign request timeout'));
		}, 300000); // 5分钟超时
	});
	} catch (error) {
		
	}
}


//   获取权限数据
function requestGetPermissions() {

	return indexDbData.getData('authorized_sites');
}


// 添加处理签名请求的函数
async function getChainId() {
	try {
		let rpcData:any = await indexDbData.getData('rpc_url');
		return new Promise((resolve, reject) => {
			if (rpcData) {
				resolve(rpcData.CHAIN_ID);
			} else {
				reject(new Error('RPC URL not found'));
			}
		})
	}catch{

	}
}
// 获取授权签名的用户地址
async function requestAccounts(){

}

// 获取钱包版本
async function getWalltVersion(){
	return new Promise((resolve, reject) => {
		resolve('1.0.0')
	})
}

// 向钱包添加以太坊链
async function addEthereumChain(){
	
	
}


// 钱包切换到指定的以太坊链
async function switchEthereumChain(){
	
	
}

// 撤销当前dapp的授权
async function revokePermissions(){
	
	
}

// 添加代币
async function watchAsset(){
	
	
}

// 返回给定地址的账户余额
async function eth_getBalance(request): Promise<string> {
	try {
        const [address, blockTag = 'latest'] = request.params || [];
        if (!address) {
            throw new Error('Missing address parameter');
        }
		let RPC_URL = await indexDbData.getData('rpc_url');
        // 使用 JSON-RPC 提供者
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url); // 替换为你的 RPC URL
		// const provider = new JsonRpcProvider(RPC_URL.url);  高版本的使用方式
        // 获取余额（返回的是 BigNumber）
        const balance = await provider.getBalance(address, blockTag);
        // 返回十六进制格式的余额（以 wei 为单位）
        return ethers.utils.hexlify(balance);
    } catch (error) {
        console.error('Error in eth_getBalance:', error);
        throw error;
    }
}

export default {
	requestPermissions,
	handleSignMessage,
	requestGetPermissions,
	getChainId,
	requestAccounts,
	getWalltVersion,
	eth_getBalance
}
