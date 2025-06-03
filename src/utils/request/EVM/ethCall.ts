import indexDbData from '../../indexDB.js';
import getWeb3Instance from './getWeb3';
// 执行智能合约调用
export default async function eth_call(request: any): Promise<string> {
    try {
        const { params } = request;
        const [callObject, blockTag = 'latest'] = params || [];
        console.log(callObject,"callObject",params);
        

        // 验证必需参数
        if (!callObject || !callObject.to) {
            throw new Error('Missing "to" address parameter');
        }

        // 获取当前网络配置
        const rpc_url = await indexDbData.getData('rpc_url');
        if (!rpc_url?.url) {
            throw new Error('No network selected');
        }

        // // 创建 Web3 实例
        // const web3 = new Web3(new Web3.providers.HttpProvider(rpc_url.url));
        const web3 = await getWeb3Instance()

        // 构建基础交易对象
        const options:any = {
            to: callObject.to,
            from: callObject.from || (await indexDbData.getData('currentWalltAddress'))?.address,
            data: callObject.input || callObject.data,
            gas: callObject.gas,
            gasPrice: callObject.gasPrice,
            value: callObject.value || '0x0',
            nonce: callObject.nonce,
            maxPriorityFeePerGas: callObject.maxPriorityFeePerGas,
            maxFeePerGas: callObject.maxFeePerGas,
            accessList: callObject.accessList,
            chainId: callObject.chainId || rpc_url.CHAIN_ID
        };

        // 处理 blob 交易
        if (callObject.blobs?.length && callObject.blobVersionedHashes?.length) {
            // 只有当确实有 blob 数据时才添加 blob 相关参数
            options.blobs = callObject.blobs;
            options.blobVersionedHashes = callObject.blobVersionedHashes;
            options.maxFeePerBlobGas = callObject.maxFeePerBlobGas || '0x0';
        }

        // 清理空值参数
        Object.keys(options).forEach((key) => {
            if (options[key] === undefined || options[key] === null) {
                delete options[key];
            } else if (key === 'chainId' && typeof options[key] === 'number') {
                options[key] = `0x${options[key].toString(16)}`;
            } else if (
                key === 'gas' ||
                key === 'gasPrice' ||
                key === 'value' ||
                key === 'nonce' ||
                key === 'maxPriorityFeePerGas' ||
                key === 'maxFeePerGas' ||
                key === 'maxFeePerBlobGas'
            ) {
                if (typeof options[key] === 'number') {
                    options[key] = `0x${options[key].toString(16)}`;
                }
            }
        });

        // 如果没有指定gas，使用默认值
        if (!options.gas) {
            const estimateGas = await web3.eth.estimateGas(options);
            options.gas = `0x${estimateGas.toString(16)}`;
        }

        // 如果没有指定gasPrice，使用当前网络的gasPrice
        if (!options.gasPrice) {
            const gasPrice = await web3.eth.getGasPrice();
            options.gasPrice = gasPrice;
        }

        // 执行合约调用
        const result = await web3.eth.call(options, blockTag);
        console.log('Contract call result:', result);

        return result;
    } catch (error) {
        console.error('Error in eth_call:', error);
        throw error;
    }
}