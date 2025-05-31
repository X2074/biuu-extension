
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
import Web3 from 'web3';
import store from '@/store';
import { showExtensionPopup } from '../../index.ts';
// watchAsset.ts
// utils/request/EVM/requestEVM.ts
export default async function watchAsset(request: any): Promise<boolean> {
    try {
        const { params } = request;
        
        // 验证参数
        if (!params?.type) {
            throw new Error('Asset type is required.');
        }

        if (!params?.options) {
            throw new Error('Must specify address, symbol, and decimals.');
        }

        const { address, symbol, decimals, image } = params.options;

        // 验证地址
        if (!address) {
            throw new Error('Invalid address.');
        }

        if (!Web3.utils.isAddress(address)) {
            throw new Error(`Invalid address '${address}'`);
        }

        // 验证符号
        if (!symbol) {
            throw new Error('Invalid symbol: not a string.');
        }

        if (typeof symbol !== 'string') {
            throw new Error('Invalid symbol: not a string.');
        }

        if (symbol.length > 11) {
            throw new Error(`Invalid symbol '${symbol}': longer than 11 characters.`);
        }

        // 验证小数位数
        if (!decimals) {
            throw new Error('Invalid decimals: must be specified.');
        }

        if (typeof decimals !== 'number') {
            throw new Error('Invalid decimals: must be a number.');
        }

        if (decimals < 0 || decimals > 18) {
            throw new Error(`Invalid decimals '${decimals}': must be 0 <= 18.`);
        }

        // 验证合约类型
        if (params.type !== 'ERC20' && params.type !== 'ERC721') {
            throw new Error(`暂时只支持ERC721、ERC20.`);
        }

        // 验证网络
        const currentNetwork = await indexDbData.getData('rpc_url');
        if (!currentNetwork) {
            throw new Error('No network selected.');
        }

        // 验证钱包地址
        const currentAddress = await indexDbData.getData('currentWalltAddress');
        if (!currentAddress) {
            throw new Error('No wallet address selected.');
        }
        const erc721Abi:any = [
            {
                constant: true,
                inputs: [{ name: "_owner", type: "address" }],
                name: "balanceOf",
                outputs: [{ name: "balance", type: "uint256" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            },
            {
                constant: true,
                inputs: [{ name: "_owner", type: "address" }, { name: "_index", type: "uint256" }],
                name: "tokenOfOwnerByIndex",
                outputs: [{ name: "tokenId", type: "uint256" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            },
            {
                constant: true,
                inputs: [{ name: "_tokenId", type: "uint256" }],
                name: "ownerOf",
                outputs: [{ name: "owner", type: "address" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            }
        ];
        // 对于 ERC721，验证 NFT 所有权
        if (params.type === 'ERC721') {
            const web3 = new Web3(new Web3.providers.HttpProvider(currentNetwork.url));
            const contract = new web3.eth.Contract(erc721Abi, address);
            
            // 验证合约是否支持 ERC721
            try {
                await contract.methods.balanceOf(currentAddress.address).call();
            } catch (error) {
                throw new Error(`Suggested NFT of type ERC721 does not match received type ${params.type}`);
            }
        }
        
        // 验证代币是否已添加
        await indexDbData.getData('rpc_url').then(async (res:any) => {
            res.walltInfo.forEach((element:any) => {
                // 匹配当前地址
                if (element.address == currentAddress.address) {
                    // 如果没有添加过
                    if(!element.asset){
                        return false;
                    }else{ 
                        // 过滤是否有同样的资产
                        let assets = element.asset.filter((item:any) => {
                            return item.address == address;
                        });
                        if(assets && assets.length){
                            throw new Error('Token already exists.');
                        }
                    }
                }
            });
        });

        // 如果所有验证都通过，显示确认弹窗
        const popupUrl = await showExtensionPopup('/confirmWatchAsset');
        
        return new Promise((resolve, reject) => {
            const handleMessage:any = (message: any) => {
                if (message.action === 'watch_asset_response') {
                    chrome.runtime.onMessage.removeListener(handleMessage);
                    if (message.result) {
                        // 保存 token 信息
                        const newToken = {
                            type:params.type,
                            address: address,
                            symbol: symbol,
                            decimals: decimals,
                            image: image || 'https://placeholder.com/100x100',
                            balance: 0
                        };
                        // 保存到 IndexedDB
                        changeAssetIndexDB(newToken,address)
                        // 返回成功
                        resolve(true);
                    } else {
                        reject(new Error('User rejected the request'));
                    }
                }
            };

            chrome.runtime.onMessage.addListener(handleMessage);

            // 设置超时
            setTimeout(() => {
                chrome.runtime.onMessage.removeListener(handleMessage);
                reject(new Error('Operation timeout'));
            }, 300000); // 5分钟超时
        });

    } catch (error:any) {
        console.error('Error in watchAsset:', error);
        
        // 如果已经有 code 则直接抛出
        if (error.code) {
            throw error;
        }
        
        // 其他错误
        const err:any = new Error(error.message || 'Failed to wallet_watchAsset');
        err.code = -32602; // Invalid params
        throw err;
    }
}
// 同步修改indexDB数据
export async function changeAssetIndexDB(data: any,address:string): Promise<any> { 
    let chain:any = '';
    let currentWalltAddress = await indexDbData.getData('currentWalltAddress');
    // 获取当前网络作为默认值
    await indexDbData.getData('rpc_url').then(async (res:any) => {
        chain = res.CHAIN_ID;
        res.walltInfo.forEach((element:any) => {
            element = filterAssset(element,currentWalltAddress,address,data)
        });
        console.log(res,"element");
        
        indexDbData.putData(res);
    });
    // EVM
    await indexDbData.getData('EVM').then(async (res:any) => {
        res.content[chain].walltInfo.forEach((element:any) => {
            element = filterAssset(element,currentWalltAddress,address,data)
        });
        console.log(res,"element");
        
        indexDbData.putData(res);
    })
}


function filterAssset (element:any,currentWalltAddress:any,address:string,data:any){
    // 匹配当前地址
    if (element.address == currentWalltAddress['address']) {
        // 如果没有添加过
        if(!element.asset){
            element.asset = [data];
        }else{ 
            // 过滤是否有同样的资产
            let assets = element.asset.filter((item:any) => {
                return item.address == address;
            });
            if(!assets || !assets.length){
                element.asset = [...element.asset,...[data]];
            }else{
                bus.emit('promptModalWarn','代币已存在')
            }
        }
    }
    return element;
}
