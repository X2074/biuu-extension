import indexDbData from '../../indexDB.js';
import { showExtensionPopup } from '../../index.ts';
import { ethers } from 'ethers';
import addEthereumChain from "./addEthereumChain";
import requestPermissions from "./requestPermissions";
import {watchAsset} from "./watchAsset";

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
	return new Promise((resolve) => {
		resolve('1.0.0')
	})
}


// 钱包切换到指定的以太坊链
async function switchEthereumChain(request:any){
	const [chainId] = request.params || [];
	let numChainId = Number(chainId['chainId'])
	console.log(numChainId,'chainId'); // 输出: "0x1fc3"
	// 获取当前所有的链
	let chainsEVM = await indexDbData.getData('EVM');
	let chainsUTXO = await indexDbData.getData('UTXO');
	let chainsEVMData  = chainsEVM['content'][numChainId]
	let chainsUTXOData  = chainsUTXO['content'][numChainId]
	return new Promise((resolve, reject) => {
		if(chainsEVMData || chainsUTXOData){
			// 当前要切换的网络
			let checkChain = chainsEVMData || chainsUTXOData;
			checkChain['netWorkType'] = chainsEVMData ? 'EVM' : 'UTXO';
			// 存储选中的网络数据
			indexDbData.putData(
				Object.assign(
				{
					id: 'rpc_url'
				},
				checkChain
				)
			);
			// 当前用户信息
			let currentWalltAddress = checkChain['walltInfo'][0];
			currentWalltAddress['id'] = 'currentWalltAddress';
			currentWalltAddress['netWorkType'] = checkChain['netWorkType'];
			indexDbData.putData(currentWalltAddress);
			resolve(true)
		}else{
			let err = {
				"code": 4902,
				"message": `Unrecognized chain ID \"${chainId['chainId']}\". Try adding the chain using wallet_addEthereumChain first.`
			}
			reject(err)
		}
	})
}

// 撤销当前dapp的授权
async function revokePermissions(){
	
}

// 返回给定地址的账户余额
async function eth_getBalance(request:any): Promise<string> {
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
				debugger
		// 返回十六进制格式的余额（以 wei 为单位）
        return ethers.utils.hexlify(balance);
    } catch (error) {
        console.error('Error in eth_getBalance:', error);
        throw error;
    }
}
async function eth_gasPrice(request:any){
	console.log(request, 'requesteth_gasPrice');
	debugger
	let RPC_URL = await indexDbData.getData('rpc_url');
const provider = new ethers.providers.JsonRpcProvider(RPC_URL.url);

  const gasPriceWei = await provider.getGasPrice(); // 返回 BigNumber 对象（wei）
  const gasPriceGwei = ethers.utils.formatUnits(gasPriceWei, "gwei"); // 转为 Gwei
  console.log(`当前 Gas 价格: ${gasPriceGwei} Gwei`);
  return gasPriceWei;
	
}

export default {
	requestPermissions,
	handleSignMessage,
	requestGetPermissions,
	getChainId,
	requestAccounts,
	getWalltVersion,
	eth_getBalance,
	addEthereumChain,
	switchEthereumChain,
	watchAsset,
	eth_gasPrice
}
