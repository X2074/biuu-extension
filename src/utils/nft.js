import Web3 from 'web3'
import indexDbData from './indexDB.js';
import erp721 from './erp721.json';
import bus from '@/utils/bus';
import md5 from 'js-md5';
let web3;
// 获取web3
async function getRpc() {
	let data = await indexDbData.getData('rpc_url');
	// 定义rpc;
	web3 = new Web3(new Web3.providers.HttpProvider(data.url));
}
// 区分nft和钱包地址
export async function distinguishAddress(address) {
	if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
		// 如果地址不符合以太坊地址规范，则返回 false
		return false;
	} else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
		// 如果地址符合以太坊地址规范，则返回 true
		return true;
	} else {
		// 否则返回 false
		return false;
	}
}
// 区分utxo和evm钱包地址
export async function distinguishUtxoEvm(address) {
	if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
		// 如果地址符合比特币地址规范，则返回 true
		return 'utxo';
	} else if (/^(0x)?[0-9a-f]{40}$/i.test(address)) {
		// 如果地址符合以太坊地址规范，则返回 true
		return 'evm';
	} else {
		return false
	}
}
// 获取nft信息
export async function getNFTContent(currentWallt, nftAddress, tokenId) {
	await getRpc();
	// 获取nft实例
	const abi = erp721; // NFT 合约 ABI
	const nftContract = new web3.eth.Contract(abi, nftAddress);
	let tokenOwner, tokenURI, collectionName;
	// 查询信息
	try {
		tokenOwner = await nftContract.methods.ownerOf(tokenId).call();
	} catch (error) {
		return false;
	}
	if (tokenOwner != currentWallt.address) {
		bus.emit('promptModalErr', '该账户不是nft的拥有者')
		return false;
	}
	// 查询信息
	try {
		tokenURI = await nftContract.methods.tokenURI(tokenId).call();
	} catch (error) {
		return false;
	}
	// 查询信息
	try {
		collectionName = await nftContract.methods.name().call();
	} catch (error) {
		return false;
	}
	return {
		// nftContract: nftContract,
		tokenOwner: tokenOwner,//拥有者账户
		tokenURI: tokenURI,
		collectionName: collectionName,//合集名称
		nftAddress: nftAddress,//合约地址
		tokenId: tokenId
	}
}
// 获取地址下所有nft信息
export async function getNFTContentAll(currentWallt, nftAddress) {
	await getRpc();
	// 获取nft实例
	const abi = erp721; // NFT 合约 ABI
	console.log(abi, 'abi');
	const nftContract = new web3.eth.Contract(abi, nftAddress);
	console.log(nftContract, 'nftContractNFT');
	let tokenIndexs, tokenIds, tokenURI, collectionName;
	let [promises, promisesUrls] = [[], []];
	// 查询信息 nft下标
	try {
		tokenIndexs = await nftContract.methods.balanceOf(currentWallt.address).call();
	} catch (error) {
		return 'unNft';
	}
	if (!tokenIndexs) return 'unNft';
	// 判断tokenOfOwnerByIndex是否可用
	try {
		await nftContract.methods.tokenOfOwnerByIndex(currentWallt.address, 0).call()
	} catch (error) {
		return 'unNft';
	}
	for (let index = 0; index < tokenIndexs; index++) {
		console.log(index, 'index');
		const promise1 = nftContract.methods.tokenOfOwnerByIndex(currentWallt.address, index).call()
		promises.push(promise1);
	}
	console.log(promises, 'promisespromises');
	// 等待所有请求完成
	const results = await Promise.all(promises);
	console.log('所有请求已完成，结果:', results);
	results.forEach(item => {
		const promises02 = getNFTContent(currentWallt, nftAddress, item * 1);
		promisesUrls.push(promises02)
	});
	const resultsNft = await Promise.all(promisesUrls);
	console.log('promisesUrls:', resultsNft);
	return {
		nftAddress: resultsNft[0]['nftAddress'],
		content: resultsNft
	};
}

// 通过nft的url查询nft信息
export async function getNftBase64(data) {
	console.log(data.tokenURI, 'tokenURI');
	// 查询tokenURI下面的信息
	try {
		let response = await fetch(data.tokenURI);
		if (!response.ok) {
			return false;
		}
		let content = await response.json();
		content = Object.assign(data, content)
		return content;
	} catch (error) {
		return false;
	}
}
/* nft转移
// contractABI = []; // NFT合约ABI
// contractAddress = '0x合约地址'; // NFT合约地址
// accountAddress = '0x发送者地址'; // 发送者地址
// receiverAddress = '0x接收者地址'; // 接收者地址
// tokenId = 1; // NFT的标识符
*/
export async function NFTTransfer(data) {
	await getRpc();
	console.log(data, 'data');
	// 转移nft之前需要先将私钥赋值给web3，不然会报错
	web3.eth.accounts.wallet.add(data.key);
	// 获取nft实例
	const abi = erp721; // NFT 合约 ABI
	const contract = new web3.eth.Contract(abi, data.contractAddress);
	console.log(data.accountAddress, 'abi');
	let hash = await contract.methods.safeTransferFrom(data.accountAddress, data.receiverAddress, data.tokenId * 1).send({
		from: data.accountAddress,
		gas: data.gas
	}); // 发送交易
	console.log(hash, 'hash');
	return hash;
}
// 估算gas费
// const contractABI = []; // NFT合约ABI
// const contractAddress = '0x合约地址'; // NFT合约地址
// const accountAddress = '0x发送者地址'; // 发送者地址
// const receiverAddress = '0x接收者地址'; // 接收者地址
// const tokenId = 1; // NFT的标识符

export async function computeNftGas(data) {
	await getRpc();
	// 获取nft实例
	const abi = erp721; // NFT 合约 ABI
	console.log(abi, 'abi');
	const contract = new web3.eth.Contract(abi, data.contractAddress);
	console.log(data, 'data');
	// 估算NFT转移的gas费
	const transferData = contract.methods.safeTransferFrom(data.accountAddress, data.receiverAddress, data.tokenId * 1).encodeABI();
	console.log(transferData, 'transferData');
	try {
		let gas = await web3.eth.estimateGas({
			// from: data.accountAddress,
			to: data.contractAddress,
			data: transferData,
			gas: 5000000 // 增加gas限制
		})
		return gas;
	} catch (error) {
		return false;
	}
}