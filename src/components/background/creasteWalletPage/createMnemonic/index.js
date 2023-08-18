import { getCookie, setCookie, clearAllCookie } from "@/utils/index.js";
const bip39 = require('bip39')
import md5 from 'js-md5';
const {hdkey} = require('ethereumjs-wallet')
const util = require('ethereumjs-util')
const eip55 = require('eip55')
import database from "@/utils/indexDB.js";
import Web3 from 'web3'
import bus from "@/utils/eventBus.js";
export default {
  data() {
    return {
      loading:true,
      mnemonicArray:'',
      passMnemonic:true
    };
  },
  destroyed(){
    console.log('重载');
  },
  mounted(){
    let self = this;
    this.createWallet().then(res=>{
      console.log(res,8888888);
      bus.$emit('mnemonicContent',res);
      this.loading = false;
    })
    console.log(window.location.href);
  },

  methods: {
    nextPage(){
      this.$emit('nextPage','createWallt')
    },
		// 生成相关信息
		async createWallet(){
			try {
				// 1.生成助记词
				let mnemonic = bip39.generateMnemonic();
        		this.mnemonicArray = mnemonic.split(" ");
				//2.将助记词转成seed
				let seed = bip39.mnemonicToSeedSync(mnemonic);
				//3.通过hdkey将seed生成HD Wallet
				let hdWallet = hdkey.fromMasterSeed(seed);
				//4.生成钱包中在m/44'/60'/0'/0/0路径的keypair;
				let key = hdWallet.derivePath("m/44'/60'/0'/0/0");
				//5.从keypair中获取私钥
				let privateKey = util.bufferToHex(key._hdkey._privateKey);
				console.log('钱包私钥',privateKey);
				//6.从keypair中获取公钥
				let publicKey = util.bufferToHex(key._hdkey._publicKey);
				//7.使用keypair中的公钥生成地址
				let address = util.pubToAddress(key._hdkey._publicKey, true);
				address = eip55.encode(address.toString('hex'));
				console.log('钱包地址',address);
				return {
					mnemonicArray:this.mnemonicArray,
					mnemonic:mnemonic,//助记词
					privateKey:privateKey,//私钥
					publicKey:publicKey,//公钥
					address:address,//钱包地址
					keystore:{}//钱包的keystore
				}
			} catch (err){

			}
		}
  }
};
