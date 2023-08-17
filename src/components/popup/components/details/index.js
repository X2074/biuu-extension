import { getCookie, setCookie, clearAllCookie } from "@/utils/index.js";
import QRCode from 'qrcodejs2'
import database from "@/utils/indexDB.js";
import bus from "@/utils/bus.js";
export default {
	inheritAttrs: false,
	props: [],
	data() {
		return {
			userName:'',
			address:''
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
				self.createdCode()
			} else {
			}
		}).catch(err=>{})
	},

	methods: {
		// 关闭整个组件
		closeModal() {
			this.$emit('closeMore','')
		},
		createdCode(){
			console.log(this.$refs.qrCodeUrl,5465465654456);
			let self = this;
			let qrcode = new QRCode(this.$refs.qrCodeUrl,{
				text:self.address,
				width:116,
				height:116,
				clorDark:"#000000",
				colorLight:"#ffffff",
				correctLevel:QRCode.CorrectLevel.H
			})
		},
		onCopy() {
			navigator.clipboard.writeText(this.userAddress)
			this.$message.success('Copy Success!')
		},
		openAteonscan(){
			alert('跳转到QITMEER首页')
			this.closeModal()
		},
		openModal(res){
			this.$emit('toModal',res)
		}
	}
};
