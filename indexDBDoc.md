# indexDB前端数据库文档

# EVM、UTXO：EVM、UTXO网络模块数据
  ## 包含网络，当前网络下的用户列表
  ```
  json code
	{
		id:"EVM \ UTXO",//唯一值，用以获取数据
		content:[
			"网络id":{
				CHAIN_ID:"网络id",
				netName:"网络名称",
				unit:"货币单位",
				url:"网络链接",
			    walltInfo:[//当前网络下用户列表
				   {
						NoIndex:'创建的钱包顺序',
						address:"钱包地址",
						keyStore:"当前钱包助记词、私钥下标，用以在keyStore里面获取加密后的数据",
						userName:"账户昵称，默认的为：wallt + {NoIndex}",
						userUrl:"保留字段，如果允许用户自定义头像"
				   }
			   ]
			}
       ]
	}
  ```
# keyStore：助记词、密钥 
  - 数据格式：
  ```
  json code{
        id:"keyStore",//唯一值，用以获取数据
        secret:[
            {
                '使用uuid作为数据下标':'当前下标为账户导入和创建时候绑定的唯一值，用来获取当前用户下的一系列数据'
            }
        ]
    }
  ```
# rpc_url：当前选择的网络
 ```
 json code{
       id:"rpc_url",//唯一值，用以获取数据
       CHAIN_ID:"网络id",
	   netName:"网络名称",
	   netWorkType:"网络模块（EVM\UTXO）",
	   type:"冗余字段",
	   unit:"货币单位",
	   url:"网络链接",
       walltInfo:[
           {
				NoIndex:'创建的钱包顺序',
				address:"钱包地址",
				keyStore:"当前钱包助记词、私钥下标，用以在keyStore里面获取加密后的数据",
				userName:"账户昵称，默认的为：wallt + {NoIndex}",
				userUrl:"保留字段，如果允许用户自定义头像"
           }
       ]
   }
 ```
 
# currentWalltAddress：当前主账户
 ## 与rpc_url下的walltInfo中数据保持一致
  ```
  json code
	{
		id:"currentWalltAddress",//唯一值，用以获取数据
		NoIndex:'创建的钱包顺序',
	    address:"钱包地址",
	    keyStore:"当前钱包助记词、私钥下标，用以在keyStore里面获取加密后的数据",
	    userName:"账户昵称，默认的为：wallt + {NoIndex}",
	    userUrl:"保留字段，如果允许用户自定义头像"
	}
  ```
 
# addressBook：通讯录
  ```
  json code
	{
		id:"addressBook",//唯一值，用以获取数据
		content:[
           {
				address:"钱包地址",
				name:"通讯录数据名称"
           }
       ]
	}
  ```
  
  #### 考虑到用户隐私方面，除了上面的数据（key对数据进行的加密），对以下数据的name进行了md5加密，后期根据需要对数据进行加密与否

# md5('onceNft')：使用biuu工具转移出去的nft数据
 ## b23e56a94ea67c1885fdc5592cccd5d9：md5加密后的文本

	```
	json code
 	{
 		id:"b23e56a94ea67c1885fdc5592cccd5d9",//唯一值，用以获取数据
 		content:[
            '使用uuid作为数据下标':{//'当前下标为账户导入和创建时候绑定的唯一值，用来获取当前用户下的一系列数据'
			
 				collectionName:"合集名称",
				description:"合集描述",
				name:"nft名称",
				nftAddress:"nft合约地址",
				tokenId:"nft id",
				tokenOwner:"nft所有者信息",
				tokenURI:"nft的url",
            }
        ]
 	}
	```
	
# md5('nfts')：nft数据
 ## 96c843d405c0cb5052b60c6110df03a8：md5加密后的文本

	```
	json code
 	{
 		id:"96c843d405c0cb5052b60c6110df03a8",//唯一值，用以获取数据
 		content:[
			//'当前下标为账户导入和创建时候绑定的唯一值，用来获取当前用户下的一系列数据'
            '使用uuid作为数据下标':{
				collectionName:"合集名称"
				collections:[//合集下nft列表
					{
						collectionName:"合集名称",
						description:"合集描述",
						name:"nft名称",
						nftAddress:"nft合约地址",
						tokenId:"nft id",
						tokenOwner:"nft所有者信息",
						tokenURI:"nft的url",
					}
				]
 				
            }
        ]
 	}
	```
  	
# md5('secret')：钱包密码
 ## 5ebe2294ecd0e0f08eab7690d2a6ee69：md5加密后的文本

	```
	json code
 	{
 		id:"5ebe2294ecd0e0f08eab7690d2a6ee69",//唯一值，用以获取数据
 		secret:"md5加密后的密码数据"
 	}
	```
  	
# md5('tradeHash')：交易的hash数据
 ## 0a8936cb93208550e6c573cb96abde3b：md5加密后的文本

	```
	json code
 	{
 		id:"0a8936cb93208550e6c573cb96abde3b",//唯一值，用以获取数据
 		content:[
			//'当前下标为账户导入和创建时候绑定的唯一值，用来获取当前用户下的一系列数据'
			'使用uuid作为数据下标':{
				blockHash:"区块hash",
				blockNumber:"用以查询交易时间",
				from:"转出的账户",
				gasUsed:"消耗的gas费",
				status:"状态",
				time:"时间",
				to:"接收地址，如果是nft的话就是合约地址，转账的话就是接收人地址",
				transactionHash:"交易hash"
			}
		]
 	}
	```
  
##web3交易、私钥等方法
# utxoKey： utxo助记词转私钥
	```
	export async function utxoKey(mnemonic) {
		try {
			const masterNode = bip32.fromSeed(seed);
			const rootPrivateKey = masterNode.privateKey.toString('hex');
			const rootPublicKey = masterNode.publicKey.toString('hex');
			return {
				privateKey: rootPrivateKey, //私钥
				publicKey: rootPublicKey, //公钥
			}
		} catch (err) {
		}
	}
	```
# evmKey： evm助记词转私钥
	```
	export async function utxoKey(mnemonic) {
		try {
			let seed = await bip39.mnemonicToSeed(mnemonic, '');
			const hdWallet = await bip32.fromSeed(seed);
			let key = hdWallet.derivePath("m/44'/60'/0'/0/0");
			const privateKeyHex = key.privateKey.toString('hex');
			const publicKeyHex = key.publicKey.toString('hex');
			return {
				privateKey: privateKeyHex, //私钥
				publicKey: publicKeyHex, //公钥
			}
		} catch (err) {
		}
	}
	```
# transferUtxo: 划转
	```
	export async function transferUtxo(data) {
		// 获取公钥地址
		const seed = await bip39.mnemonicToSeed(data.mnemonic, "")
		// 通过种子生成BIP32主节点
		const masterNode = bip32.fromSeed(seed);
		// 派生一个子密钥对的BIP32导出路径
		const path = "m/44'/60'/0'/0/0"; // 你可以更改路径来生成不同的子密钥
		const childNode = masterNode.derivePath(path);
		const pkaddr = qitmeer.address.ecToPkAddress(childNode.publicKey, 'testnet')

		const keyPair = qitmeer.ec.fromPrivateKey(Buffer.from(data.key, 'hex'))
		// 获取发送方地址的余额
		const balance1 = await getUTXOBalance(data.url, data.accountAddress)
		const utxos = await getUtxos(data.url, data.accountAddress)
		<!-- BigNumber计算，防止精度丢失 -->
		let y = new BigNumber(100000000)
		let num = parseFloat(Math.ceil(data.value / 1024));
		let gas = parseFloat(new BigNumber(num).multipliedBy(0.0002).multipliedBy(y));
		let valueTo = parseFloat(new BigNumber(data.value).multipliedBy(y));
		let remaining = parseFloat(new BigNumber(balance1).multipliedBy(y).minus(valueTo).minus(gas));
		let allPrice = parseFloat(new BigNumber(valueTo).plus(remaining));
		let selectUtxos;
		if (data.tactics == 'min') {
			selectUtxos = await selectMinUTXOs(utxos, allPrice);
		}
		if (data.tactics == 'max') {
			selectUtxos = await selectMaxUTXOs(utxos, allPrice);
		}
		if (data.tactics == 'minimum') {
			selectUtxos = await selectUtxosMinViable(utxos, allPrice);
		}
		if (data.tactics == 'branch') {
			selectUtxos = await selectUtxosBranchAndBound(utxos, allPrice);
		}
		let network;
		// 设置网络 mainnet【主网】, testnet【测试】, privnet【私有】
		if (rpcUrls.testnet.includes(data.url)) {
			network = qitmeer.networks.testnet;
		} else {
			network = qitmeer.networks.mainnet;
		}
		const txb = qitmeer.txsign.newSigner(network);
		const lockTime = parseInt(new Date().getTime() / 1000);
		txb.setTimestamp(lockTime);
		// 选取合适的utxo
		for (let utxo of selectUtxos.selectedUTXOs) {
			txb.addInput(utxo.txid, utxo.idx);
		}
		txb.addOutput(pkaddr, valueTo, 1);
		txb.addOutput(data.accountAddress, remaining);
		// 使用前面通过私钥生成的密钥对签署交易
		utxos.map((v, i) => {
			txb.sign(i, keyPair);
		})
		// 构建交易体
		const newTransaction = txb.build().toBuffer().toString('hex');
		// 发送交易
		try {
			const response = await sendTraction(data.url, newTransaction)
			let info = Object.assign(data, { 'transactionHash': response })
			chromeNotifications(response);
			hashSaveIndexDB(data['keyStore'], 'dispose', info);
		} catch (error) {
			console.log(error, 'error');
		}
	}
	```



# utxoTransfer:  UTXO交易
	```
	export async function utxoTransfer(data) {
		console.log(data, '交易的数据');
		const keyPair = qitmeer.ec.fromPrivateKey(Buffer.from(data.key, 'hex'))
		// 获取发送方地址的余额
		const balance1 = await getUTXOBalance(data.url, data.accountAddress)
		// 获取发送方地址的未花费交易对信息（为一个数组，暂不确定返回的长度是否有上限，可以通过转入多个小额交易到指定地址进行测试）
		const utxos = await getUtxos(data.url, data.accountAddress)
		// 指定转出到特定地址的金额，此处我们从本地转给目标地址n MEER（1MEER为100000000个最小单位）
		// 剩余的金额需要设置转回到自己的账户，不然全部会变成手续费。此处我们原本地址的utxo中有500MEER，转出0.8MEER到指定地址，转回499MEER给自己，那么剩下的0.2MEER就会是手续费。手续费过低时交易无法成立，过高时会给用户带来损失，需要多少手续费也需要计算（当然，对于钱包业务来说，除了给矿工的手续费外，我们也可以在这一步对用户收取一定比例的手续费。对于矿工需要多少手续费，我忘记怎么计算了，这块也可以问下兴辉）
		// 计算余额 总的余额 - 交易的数量 - 手续费 = 剩余的额度
		// 手续费
		// 使用big组件，避免计算不精确
		let y = new BigNumber(100000000)
		let num = parseFloat(Math.ceil(data.value / 1024));
		let gas = parseFloat(new BigNumber(num).multipliedBy(0.0002).multipliedBy(y));
		let valueTo = parseFloat(new BigNumber(data.value).multipliedBy(y));
		let remaining = parseFloat(new BigNumber(balance1).multipliedBy(y).minus(valueTo).minus(gas));
		let allPrice = parseFloat(new BigNumber(valueTo).plus(remaining));
		let selectUtxos;
		if (data.tactics == 'min') {
			selectUtxos = await selectMinUTXOs(utxos, allPrice);
		}
		if (data.tactics == 'max') {
			selectUtxos = await selectMaxUTXOs(utxos, allPrice);
		}
		if (data.tactics == 'minimum') {
			selectUtxos = await selectUtxosMinViable(utxos, allPrice);
		}
		if (data.tactics == 'branch') {
			selectUtxos = await selectUtxosBranchAndBound(utxos, allPrice);
		}
		let network;
		// 设置网络 mainnet【主网】, testnet【测试】, privnet【私有】
		if (rpcUrls.testnet.includes(data.url)) {
			network = qitmeer.networks.testnet;
		} else {
			network = qitmeer.networks.mainnet;
		}
		// 构造交易
		const txb = qitmeer.txsign.newSigner(network);
		// lockTime 是指交易的锁定时间，它表示交易在区块链上的生效时间。通常情况下，如果您不需要特别设置锁定时间，可以将其设置为 0。
		const lockTime = parseInt(new Date().getTime() / 1000);
		txb.setTimestamp(lockTime);
		// 选取合适的utxo
		for (let utxo of selectUtxos.selectedUTXOs) {
			txb.addInput(utxo.txid, utxo.idx);
		}
		txb.addOutput(data.to, valueTo);
		txb.addOutput(data.accountAddress, remaining);
		// 使用前面通过私钥生成的密钥对签署交易
		utxos.map((v, i) => {
			txb.sign(i, keyPair);
		})
		// 构建交易体
		const newTransaction = txb.build().toBuffer().toString('hex');
		// 发送交易
		try {
			const response = await sendTraction(data.url, newTransaction)
			let info = Object.assign(data, { 'transactionHash': response })
			console.log(info, 'info')
			chromeNotifications(response);
			hashSaveIndexDB(data['keyStore'], 'dispose', info);
		} catch (error) {
			console.log(error, 'error');
		}
	}
	```

# utxoTransfer:  evm转账
	```
	export async function evmTransfer(data) {
		let web3 = new Web3(new Web3.providers.HttpProvider(data.url));
		let details = {
			to: data.to, // 接收方地址
			value: web3.utils.toHex(web3.utils.toWei(data.value, 'ether')), // 转账 wei  
			// meer交易此处需要使用int类型
			gasLimit: web3.utils.toHex(data.gasLimit),
			gasPrice: web3.utils.toHex(data.gasPrice),
			nonce: web3.utils.toHex(data.nonce),
			chainId: data.chainId
		}
		let tx = new EthereumTx(details)
		let privateKey = Buffer.from(data.key, 'hex');
		tx.sign(privateKey)
		let serializedTx = tx.serialize();
		let raw = '0x' + serializedTx.toString('hex');
		web3.eth.sendSignedTransaction(raw).then(hash => {
			indexDbData.getData('nonce').then(res => {
				res['content'] = res['content'] + 1;
				indexDbData.putData(res);
			});
			chromeNotifications(hash)
			// 将参数与hash合并，便于后面的取消和加速操作
			let info = Object.assign(data, hash)
			hashSaveIndexDB(data['keyStore'], 'dispose', info);
		}).catch(error => {
			hashSaveIndexDB(data['keyStore'], 'error', data)
			return;
		})
	}
	```