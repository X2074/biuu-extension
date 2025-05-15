
// 向钱包添加以太坊链 (EIP-3085)
export default async function addEthereumChain(request: any): Promise<null> {
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

        // 验证 chainId 数值范围
        try {
            const chainIdNum = parseInt(chainId, 16);
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

        // 获取当前网络配置
        const currentNetworks = (await indexDbData.getData('networks')) || {};
        
        // 检查链是否已存在
        if (currentNetworks[chainId]) {
            // 链已存在，返回成功
            return null;
        }

        // 添加新链
        const newNetwork = {
            chainId,
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

        // 保存到 IndexedDB
        // currentNetworks[chainId] = newNetwork;
        // await indexDbData.putData('networks', currentNetworks);

        // 返回 null 表示成功（EIP-3085 规范）
        return null;

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