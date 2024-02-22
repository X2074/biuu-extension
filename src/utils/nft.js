import Web3 from 'web3'
import indexDbData from './indexDB.js';
import erp721 from './erp721.json';
let web3;
// 获取web3
async function getRpc() {
	let data = await indexDbData.getData('rpc_url');
	console.log(data, 'dadasdsad');
	// 定义rpc
	web3 = new Web3(new Web3.providers.HttpProvider(data.content.url));
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
export async function getNFTContent(nftAddress, tokenId) {
	await getRpc();
	// 获取nft实例
	const contractAddress = nftAddress; // NFT 合约地址
	const abi = erp721; // NFT 合约 ABI
	console.log(abi, 'abi');
	const nftContract = new web3.eth.Contract(abi, contractAddress);
	console.log(nftContract, 'nftContractNFT');
	// 查询信息
	const tokenOwner = await nftContract.methods.ownerOf(tokenId).call();
	const tokenURI = await nftContract.methods.tokenURI(tokenId).call();
	const name = await nftContract.methods.name().call();
	console.log('拥有者:', tokenOwner);
	console.log('Token URI:', tokenURI);
	console.log('name:', name);
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