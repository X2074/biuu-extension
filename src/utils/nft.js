import Web3 from 'web3'
import indexDbData from './indexDB.js';
import erp721 from './erp721.json';
import bus from '@/utils/bus';
let web3;
// 获取web3
async function getRpc() {
	let data = await indexDbData.getData('rpc_url');
	console.log(data, 'dadasdsad');
	// 定义rpc
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
	console.log(abi, 'abi');
	const nftContract = new web3.eth.Contract(abi, nftAddress);
	console.log(nftContract, 'nftContractNFT');
	let tokenOwner, tokenURI, name;
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
		name = await nftContract.methods.name().call();
	} catch (error) {
		return false;
	}
	return {
		// nftContract: nftContract,
		tokenOwner: tokenOwner,
		tokenURI: tokenURI,
		name: name,
		address: nftAddress,
		tokenId: tokenId
	}
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
		console.log('Data received:', content);
		content = Object.assign(data, content)
		return content;
	} catch (error) {
		return false;
	}
}
/* nft转移
fromAddress = '0x...'; // 转移NFT的地址
toAddress = '0x...'; // 接收NFT的地址
 tokenId = 123; // NFT的ID
*/
export async function NFTTransfer(nftAddress, fromAddress, toAddress, tokenId) {
	await getRpc();
	// 转移nft之前需要先将私钥赋值给web3，不然会报错
	web3.eth.accounts.wallet.add('0efa4ef92b67c0ced2eea5cd38333a5ae80c4d4c94890bd93e2dd7ecaa5ef24b');
	// 获取nft实例
	const contractAddress = nftAddress; // NFT 合约地址
	const abi = erp721; // NFT 合约 ABI
	const contract = new web3.eth.Contract(abi, contractAddress);
	console.log(fromAddress, 'abi');
	// nft转移需要支付gas费用
	const gasLimit = 300000; // 设置gas限制
	let hash = await contract.methods.safeTransferFrom(fromAddress, toAddress, tokenId).send({
		from: fromAddress,
		gas: gasLimit
	}); // 发送交易
	console.log(hash, 'hash');
}

// nft的indexDB数据处理
export async function NFTSaveIndexDB(data) {
	console.log(data, 'data');
	// 更新currentWalltAddress
	let currentContent;
	try {
		currentContent = await indexDbData.getData('currentWalltAddress');
		console.log(currentContent['nfts'], 'data001');
		if (currentContent['nfts']) {
			console.log(currentContent, 'data0002');
			currentContent['nfts'].push(data);
		} else {
			console.log(currentContent, 'data0003');
			currentContent['nfts'] = [data];
		}
		console.log(currentContent, 'data0001');
		indexDbData.putData(currentContent);
	} catch (error) {
		return false;
	}
	console.log('data01');
	// 更新currentWalltAddress
	try {
		let content = await indexDbData.getData('rpc_url');
		content['walltInfo'].forEach(item => {
			if (item.address == currentContent['address']) {
				item['nfts'] = currentContent['nfts'];
			}
		});
		indexDbData.putData(content);
		console.log('data02');
		if (content.netWorkType == 'evm') chengeEvmUtxo(content, 'EVM')
		if (content.netWorkType == 'utxo') chengeEvmUtxo(content, 'UTXO')
	} catch (error) {
		return false;
	}
	return true;
}
// 更新evm\utxo
async function chengeEvmUtxo(data, type) {
	console.log(data, type, 'data03');
	let chinaId = data['CHAIN_ID'];
	try {
		let content = await indexDbData.getData(type);
		content['content'][chinaId] = data;
		indexDbData.putData(content);
	} catch (error) {
		return false;
	}
}