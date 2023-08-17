import { getCookie, setCookie, formatDate } from "@/utils/index.js";
import database from "@/utils/indexDB.js";
import bus from "@/utils/bus.js";
export default {
	props: [],
	data() {
		return {
			userName:'',
			address:'',
			txHash:[],
			txHashList:[],
			balanceUnit:''
		};
	},
	destroyed() {
	},
	mounted() {
		let self = this;
		database.getData('currentWalltAddress').then(res => {
			if (res && res.address) {
				self.userName = res.userName?res.userName:'';
				self.address = res.address;
			} else {
			}
		}).catch(err=>{})
		database.getData('rpc_url').then(res => {
			if (res && res.unit) {
				// 指定钱包单位
				self.balanceUnit = res.unit;
			} else {
			}
		}).catch(err=>{})
		
		database.getData('txHash').then(info=>{
			if(!info) return;
			this.txHash = info.txHashList;
			if(this.txHash && this.txHash.length){
				this.hashDispose()
			}
		}).catch(err=>{})
	},

	methods: {
		// 关闭整个组件
		closeModal() {
			console.log(8888888888888);
			this.$emit('closeMore','')
		},
		openAteonscan(){
			alert('跳转到QITMEER首页')
			this.closeModal()
		},
		hashDispose(){
			let self = this;
			this.txHash.forEach(item => {
				self.$web3.eth.getTransaction(item.transactionHash).then(res=>{
					let date;
					if(!item.date) date = Date.now();
					if(item.date) date = item.date;
					date = formatDate(date);
					let data = Object.assign({}, res, {time:date});
					self.txHashList.push(data)
				})
			});
		},
		// wei转币
		toWei(value){
		  return this.$web3.utils.fromWei(value, 'ether');
		}
	}
};
