import { getCookie, setCookie, clearAllCookie } from "@/utils/index.js";
import QRCode from 'qrcodejs2'
import database from "@/utils/indexDB.js";
import bus from "@/utils/bus.js";
import md5 from 'js-md5';
export default {
	props: [],
	data() {
		return {
			userName:'',
			address:'',
			passwordValue:'',
			incorrect:false,
			privateKeyBol:true,
			privateKey:'',
			passKey:''
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
		// 获取密码
		database.getData('5ebe2294ecd0e0f08eab7690d2a6ee69').then(res=>{
			console.log(res);
			self.passKey = res.secret;
		}).catch(err=>{})
	},

	methods: {
		// 关闭整个组件
		closeModal() {
			this.$emit('closeMore','')
		},
		onCopy() {
			navigator.clipboard.writeText(this.privateKey.privateKey)
			this.$message.success('Copy Success!')
		},
		openAteonscan(){
			alert('跳转到ateonscan首页')
			this.closeModal()
		},
		confirm(){
			let self = this;
			this.incorrect = false; 
			// 获取keyStore
			if(md5(self.passwordValue) == self.passKey){
				// 获取当前账户的密钥
				database.getData(self.address).then(res=>{
					console.log(self.passwordValue,'self.privateKey');
					// 获取密钥
					self.privateKey = self.$web3.eth.accounts.decrypt(res.keystore,self.passwordValue);
					console.log(self.privateKey,'8888self.privateKey');
					self.privateKeyBol = false;
				}).catch(err=>{})
			}else{ 
				return this.incorrect = true; 
			}
		}
	}
};
