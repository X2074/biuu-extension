import Web3 from 'web3'
import indexDbData from './indexDB.js';
import erp721 from './erp721.json';
import bus from '@/utils/bus';
import md5 from 'js-md5';
let web3;
// 获取web3
async function getRpc() {
	let data = await indexDbData.getData('rpc_url');
	console.log(data, 'dadasdsad');
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
	console.log(abi, 'abi');
	const nftContract = new web3.eth.Contract(abi, nftAddress);
	console.log(nftContract, 'nftContractNFT');
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

/*
nft的indexDB数据处理
层级：
content{数据集合
	store{创建钱包时生成的uuis
		address{相同合约地址的放在一起
			name:合集名称
			collections[]合集下面的nft
		}
	}
}
*/
export async function NFTSaveIndexDB(data, wallt) {
	console.log(data, 'data');
	// 首先获取所有的nfts数据
	let nfts = await indexDbData.getData(md5('nfts'));

	let nftData, nftContent;
	// 如果没有保存过nft
	if (!nfts) {
		nftData = {//完整的nfts数据
			id: md5('nfts'),
			content: {}
		}
		/* nfts示例：
			content:nfts集合
			keyStore:当前钱包随机数
			nftAddress：合约地址，同一个合约都放一起
		*/
		nftContent = {
			collectionName: data.collectionName,//合集名称
			collections: [data]//合集中的nft列表
		}
		let dataNft = {};
		dataNft[data.nftAddress] = nftContent;
		nftData['content'][wallt.keyStore] = dataNft;
	} else {
		// 如果当前账户keyStore或者是当前账户下该合约没有保存nft下没有保存nft
		if (!nfts['content'][wallt.keyStore] || !nfts['content'][wallt.keyStore][data.nftAddress]) {
			nftContent = {
				collectionName: data.collectionName,//合集名称
				collections: [data]//合集中的nft列表
			}
			nfts['content'][wallt.keyStore][data.nftAddress] = nftContent;
		} else {
			// 查询当前账户，当前传递的合约地址下面的nft，并过滤出当前传递的tokenId相同的nft
			console.log(nfts['content'][wallt.keyStore], "nfts['content'][wallt.keyStore]");
			let filterNft = nfts['content'][wallt.keyStore][data.nftAddress]['collections'].filter(item => {
				return item.address == data.address && item.tokenId == data.tokenId
			})
			// 如果有相同tokenId，return；
			if (filterNft && filterNft.length) {
				bus.emit('promptModalErr', '重复导入的NFT')
				return false;
			}
			nfts['content'][wallt.keyStore][data.nftAddress]['collections'].push(data);
		}
		nftData = nfts;
	}
	indexDbData.putData(nftData);
	return true;
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