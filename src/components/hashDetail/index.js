import { getCookie, setCookie, formatDate } from "@/utils/index.js";
import indexDbData from "@/utils/indexDB.js";
// import getBlockNumber from "@/utils/ethAddress.js";
const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx')
export default {
	props: ['walltContent'],
	data() {
		return {
			loading: false,
			userAddress: '',
			address:'',
			web3: null,
			balance: 0,//余额
			balanceUnit: 'ETH',
			transactionHash:0,
			txHashList:[]
		};
	},
	destroyed() {
		console.log('重载');
	},
	mounted() {
		let self = this;
		indexDbData.getData('rpc_url').then(res => {
			if (res && res.unit) {
				// 指定钱包单位
				self.balanceUnit = res.unit;
			} else {
			}
		}).catch(err=>{})
		indexDbData.getData('currentWalltAddress').then(res => {
			if (res && res.address) {
				self.userName = res.userName?res.userName:'';
				self.address = res.address;
			} else {
			}
		}).catch(err=>{})
		// 获取当前账户的密钥
		// indexDbData.getData('0xe58CFb87188c3e2060e21669aC3d051D911C4C82').then(res=>{
		// 	// 获取密钥
		// 	let data = self.$web3.eth.accounts.decrypt(res.keystore,'11111111')
		// 	self.swapBlance(data)
		// }).catch(err=>{})
		
		if(this.walltContent.txHash && this.walltContent.txHash.length > 1){
			this.loading = true;
			this.hashDispose()
		}
	},

	methods: {
		hashDispose(){
			let self = this;
			this.walltContent.txHash.forEach(item => {
				self.$web3.eth.getTransaction(item.transactionHash).then(res=>{
					let date;
					if(!item.date) date = Date.now();
					if(item.date) date = item.date;
					date = formatDate(date);
					let data = Object.assign({}, res, {time:date});
					self.txHashList.push(data)
				})
			});
			this.loading = false;
		},
		// 转账功能
		swapBlance(data) {
			let self = this;
			self.$web3.eth.defaultAccount = this.walltContent.address;
			self.$web3.eth.getTransactionCount(self.$web3.eth.defaultAccount).then(res=>{
				let details = {
					"to": '0x4445Bbd1f0942857741EEbA3B36970390E9cb887',// 接收方地址                                                              
					"value": self.$web3.utils.toHex(self.$web3.utils.toWei('0.01', 'ether')),// 转账 0.1wei  
					gasLimit: self.$web3.utils.toHex(99000),   
        			gasPrice: self.$web3.utils.toHex(10e9),
					"nonce": self.$web3.utils.toHex(res++), // 序号ID, 重要， 需要一个账号的交易序号，可以通过web3.eth.getTransactionCount(web3.eth.defaultAccount)获得
					"chainId": self.walltContent.CHAIN_ID
				}
				let privateKey = Buffer(data.privateKey.substr(2), 'hex')
				let tx = new EthereumTx(details)
				tx.sign(privateKey)
				var serializedTx = tx.serialize();
				let raw = '0x'+serializedTx.toString('hex');
				self.$web3.eth.sendSignedTransaction(raw).on('receipt',(res)=>{
					console.log(res,'交易后的hash');
					indexDbData.getData('txHash').then(info=>{
						if(info && info.txHashList.length>0){
							let data = info;
							let hash = res;
							hash['date'] = Date.now()
							data.txHashList.push(res);
							indexDbData.putData(data)
						}else{
							let hash = res;
							hash['date'] = Date.now()
							let data = {
								id:'txHash',
								txHashList:[hash]
							}
							indexDbData.putData(data)
						}
					}).catch(err=>{})
				});
				// (raw,(err,txHash)=>{
				// })
			})
		},
		webSign() {
			let details = {
				"to": '0x5cf83df52a32165a7f392168ac009b168c9e8915',// 接收方地址    
				"value": 4052500000,// 转账多少wei                                                             
				"gas": 51000,// GAS                                                                     
				"gasPrice": 2 * 1000000000, // GAS PRICE 需要一个比较合理的价格， 不然可能会报错（replacement transaction underpriced）                                                                              
				"gasLimit": '0x420710',
				"nonce": 40,// 序号ID, 重要， 需要一个账号的交易序号，可以通过web3.eth.getTransactionCount(web3.eth.defaultAccount)获得
				"chainId": 11243575,
				"data": '0x40aabbccdd000011223344'
			}
		},
		toCreate() {
			let createData = {
				url: 'chrome-extension://kkhfpjkgnkckiofggkkiedpfjknmpemo/walltBackground.html?query=newPage',//打开的网页地址（即'http://www.google.com'，不是'www.google.com'）
				left: 0,//新视窗相对于屏幕的左边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个    有焦点的视窗自然偏移。
				top: 0,//新视窗相对于屏幕的上边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个有焦点的视窗自然偏移。
				width: 560,//新视窗的像素宽度。如果没有指定，默认为自然宽度。
				height: 500,//新视窗的像素高度。如果没有指定，默认为自然高度。
				type: "popup",// ( optional enumerated string ["normal", "popup"]可选，枚举字符串["normal", "popup"] ) 指定新建浏览器视窗的类型。
			}
			//打开一个浏览器
			chrome.windows.create(createData, () => {
				window.close();
				console.log('打开新页面')
			})
		},
		onCopy() {
			navigator.clipboard.writeText(this.userAddress)
			this.$message.success('Copy Success!')
		},
		toPage(res){
			if(res == 'buy') this.$emit('nextPage','buyPage')
		},
		refresh(){
		  location.reload()
		},
		hashDetail(){
		  this.$emit('nextPage','assetsRecording')
		},
		// wei转币
		toWei(value){
		  return this.$web3.utils.fromWei(value, 'ether');
		}
	}
};
