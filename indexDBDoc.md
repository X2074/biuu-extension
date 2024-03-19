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
  
  