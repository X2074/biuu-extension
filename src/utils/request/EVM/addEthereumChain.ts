import indexDbData from '../../indexDB.js';
import { showExtensionPopup } from '../../index.ts';
// 向钱包添加以太坊链 (EIP-3085)
export default async function addEthereumChain(request: any): Promise<null> {
    console.log(request,"requestaddEthereumChain");
    
    try {
        const params = request.params?.[0];
        if (!params) {
            throw new Error('Missing chain parameters');
        }

        // 验证 chainId
        const { chainId, chainName, rpcUrls, nativeCurrency, blockExplorerUrls } = params;
        
        // 验证 chainId 格式
        if (!chainId || typeof chainId !== 'string' || !/^0x[1-9a-fA-F][0-9a-fA-F]*$/.test(chainId)) {
            const err = new Error(`Expected 0x-prefixed, unpadded hex string "chainId". Received: ${chainId}`);
            err.code = -32602;
            throw err;
        }
        let chainIdNum:any;
        // 验证 chainId 数值范围
        try {
            chainIdNum = parseInt(chainId, 16);
            if (chainIdNum > Number.MAX_SAFE_INTEGER) {
                const err = new Error(`Invalid chain ID "${chainId}": numerical value greater than max safe value. Received: ${chainId}`);
                err.code = -32602;
                throw err;
            }
        } catch (e) {
            const err = new Error(`Invalid chain ID: ${e.message}`);
            err.code = -32602;
            throw err;
        }

        // 验证 rpcUrls
        if (!Array.isArray(rpcUrls) || rpcUrls.length === 0 || 
            !rpcUrls.every(url => typeof url === 'string' && url.startsWith('https://'))) {
            const err = new Error('Expected an array with at least one valid HTTPS URL "rpcUrls"');
            err.code = -32602;
            throw err;
        }

        // 验证 nativeCurrency
        if (!nativeCurrency || typeof nativeCurrency !== 'object') {
            const err = new Error('Missing or invalid nativeCurrency');
            err.code = -32602;
            throw err;
        }

        // 验证 nativeCurrency.symbol
        if (!nativeCurrency.symbol || typeof nativeCurrency.symbol !== 'string' || 
            nativeCurrency.symbol.length < 2 || nativeCurrency.symbol.length > 6) {
            const err = new Error(`Expected 2-6 character string 'nativeCurrency.symbol'. Received: ${nativeCurrency.symbol}`);
            err.code = -32602;
            throw err;
        }

        // 验证 nativeCurrency.decimals
        if (typeof nativeCurrency.decimals !== 'number' || 
            nativeCurrency.decimals < 0 || 
            nativeCurrency.decimals > 36) {
            const err = new Error('Invalid nativeCurrency.decimals. Must be between 0 and 36');
            err.code = -32602;
            throw err;
        }
console.log(chainIdNum,"chainIdNum");

        // 验证 blockExplorerUrls（如果提供）
        if (blockExplorerUrls !== undefined) {
            if (!Array.isArray(blockExplorerUrls) || 
                blockExplorerUrls.length === 0 || 
                !blockExplorerUrls.every(url => typeof url === 'string' && url.startsWith('https://'))) {
                const err = new Error('Expected null or an array with at least one valid HTTPS URL "blockExplorerUrls"');
                err.code = -32602;
                throw err;
            }
        }
        // 获取当前所有的链
        let chainsEVM = await indexDbData.getData('EVM');
        let chainsUTXO = await indexDbData.getData('UTXO');
        let chainsEVMData  = chainsEVM['content'][chainIdNum]
        let chainsUTXOData  = chainsUTXO['content'][chainIdNum]
        
        // 检查链是否已存在
        if (chainsEVMData || chainsUTXOData) {
            // 链已存在，返回成功
            return true;
        }else{
            // 添加新链
            const newNetwork = {
                id:'newNetwork',
                chainId:chainIdNum,
                chainName: chainName || `Chain ${chainId}`,
                rpcUrls,
                nativeCurrency: {
                    name: nativeCurrency.name || 'Ether',
                    symbol: nativeCurrency.symbol,
                    decimals: nativeCurrency.decimals
                },
                blockExplorerUrls: blockExplorerUrls || [],
                iconUrls: params.iconUrls || []
            };
            // await indexDbData.putData(newNetwork);
            const popupUrl: any = await showExtensionPopup('/addEthereumChain');
            // 返回一个 Promise，等待用户响应
            return new Promise((resolve, reject) => {
                const handleMessage:any = (message: any) => {
                    console.log(message, "add_ethereumChain");
                    if (message.action === 'add_ethereumChain') {
                        if (message) {
                            resolve(message.result);
                        } else {
                            reject(new Error(message.error || 'User rejected the request'));
                        }
                    }
                };
                chrome.runtime.onMessage.addListener(handleMessage);

                // 设置超时
                setTimeout(() => {
                    chrome.runtime.onMessage.removeListener(handleMessage);
                    reject(new Error('Sign request timeout'));
                }, 300000); // 5分钟超时
            });

        }

    } catch (error) {
        console.error('Error in addEthereumChain:', error);
        
        // 如果已经有 code 则直接抛出
        if (error.code) {
            throw error;
        }
        
        // 其他错误
        const err = new Error(error.message || 'Failed to add chain');
        err.code = -32602; // Invalid params
        throw err;
    }
}