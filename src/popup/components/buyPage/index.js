
import { getCookie, setCookie, getQueryParams } from "@/utils/index.js";
export default {
	data() {
		return {
			loading: false,
			buyComponents: [
				{
					img: 'images/coinbase.png',
					title: 'Buy ATE with Coinbase Pay',
					text: 'You can easily buy or transfer cryptocurrencies with your Coinbase account.',
					btn: 'Continue to use Conunbase Pay',
					w: 133,
					h: 36,
					url:'https://www.coinbase.com/oauth/authorize/oauth_signin?account=all&client_id=0a986572691ed7e9cb12626959a58abacf4484b7998b209680d4488d26a30709&meta%5Baccount%5D=all&meta%5Bsend_limit_amount%5D=10000.00&meta%5Bsend_limit_currency%5D=USD&redirect_uri=https%3A%2F%2Fpay.coinbase.com%2Foauth%2Fexchange&response_type=code&scope=wallet%3Aaccounts%3Aread+wallet%3Abuys%3Aread+wallet%3Abuys%3Acreate+wallet%3Apayment-methods%3Aread+wallet%3Apayment-methods%3Alimits+wallet%3Atransactions%3Asend+wallet%3Atransactions%3Aread+wallet%3Auser%3Aread+wallet%3Asupported-assets%3Aread&state=%7B%22nonce%22%3A%224166f8e9-b491-4578-b9c1-e3e0c5ba66ca%22%2C%22landingPage%22%3A%22%2F%3FappId%3Dab4b8829-a59d-44d3-accc-de77e4f18df2%26attribution%3Dextension%26destinationWallets%3D%255B%257B%2522address%2522%253A%25220x89fb469ef2051e98c4f11fb824782acebcf292d0%2522%252C%2522assets%2522%253A%255B%2522ETH%2522%255D%257D%255D%22%2C%22appId%22%3A%22ab4b8829-a59d-44d3-accc-de77e4f18df2%22%7D'
				},
				{
					img: 'images/transak.png',
					title: 'Buy ATE with Transak',
					text: 'Transak supports credit and debit cards, Apple Pay, MobiKwik and bank transfers (depending on location) in over 100 countries. ATE will be deposited directly into your SpotPay account.',
					btn: 'Continue to Transak',
					w: 125,
					h: 42,
					url:'https://global.transak.com/?apiKey=25ac1309-a49b-4411-b20e-5e56c61a5b1c&hostURL=https%3A%2F%2Fmetamask.io&defaultCryptoCurrency=ETH&networks=ethereum&walletAddress=0x89fb469ef2051e98c4f11fb824782acebcf292d0'
				},
				{
					img: 'images/moon.png',
					title: 'Buy ATE with MoonPay',
					text: 'MoonPay supports popular payment methods, including Visa, MasterCard, Apple / Google / Samsung Pay, and bank transfers in more than 145 countries/regions. Tokens will be deposited into your SpotPay account.',
					btn: 'Continue to use MoonPay',
					w: 88,
					h: 28,
					url:'https://buy.moonpay.com/?apiKey=pk_live_WbCpe6PxSIcGPCSd6lKCbJNRht7uy&walletAddress=0x89fb469ef2051e98c4f11fb824782acebcf292d0&defaultCurrencyCode=ETH&showOnlyCurrencies=ETH%2CUSDT%2CUSDC%2CDAI%2CMATIC%2CORN%2CWETH%2CIMX&signature=eju86lwe8iyBpT0dwb%2BaFjzGQVfMaMGmC16Y7sVXiBI%3D'
				},
				{
					img: 'images/wyre.png',
					title: 'Buy ATE with Wyre',
					text: 'It can be easily activated by purchasing no more than ATE000. Quick interactive cap purchase verification. Debit/credit cards, Apple Pay, bank transfers are supported. Available in over 100 countries. Tokens are deposited into your SpotPa',
					btn: 'Continue to Wyre',
					w: 84,
					h: 40,
					url:'https://pay.sendwyre.com/purchase?accountId=AC-7AG3W4XH4N2&utm_campaign=AC-7AG3W4XH4N2&destCurrency=ETH&utm_medium=widget&paymentMethod=debit-card&reservation=3EHQFBVTLXVMAUG99D8C&autoRedirect=false&dest=ethereum%3A0x89fb469ef2051e98c4f11fb824782acebcf292d0&utm_source=checkout'
				},
				{
					img: 'images/unitLogo.png',
					title: 'Deposit directly into ATE',
					text: 'If you already have some ATE, the fastest way to get ATE in your new wallet is by direct deposit.',
					btn: 'View account',
					w: 25,
					h: 25,
					url:''
				}
			]
		};
	},
	destroyed() {
		console.log('重载');
	},
	mounted() {
		let self = this;
		console.log(window.location.href);
	},

	methods: {
		openWin(url) {
			if(!url) return;
			window.open(url)
		},
		onPage() {
			this.$emit('nextPage','userContent');
		},
		closeModal(){
			this.$emit('closeModal','buyPage');
		}
	}
};
