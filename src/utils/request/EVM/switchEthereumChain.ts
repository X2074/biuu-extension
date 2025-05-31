import indexDbData from '../../indexDB.js';
// 钱包切换到指定的以太坊链
export default async function switchEthereumChain(request: any) {
    const [chainId] = request.params || [];
    let numChainId = Number(chainId['chainId']);
    console.log(numChainId, 'chainId'); // 输出: "0x1fc3"
    // 获取当前所有的链
    let chainsEVM = await indexDbData.getData('EVM');
    let chainsUTXO = await indexDbData.getData('UTXO');
    let chainsEVMData = chainsEVM['content'][numChainId];
    let chainsUTXOData = chainsUTXO['content'][numChainId];
    return new Promise((resolve, reject) => {
        if (chainsEVMData || chainsUTXOData) {
            // 当前要切换的网络
            let checkChain = chainsEVMData || chainsUTXOData;
            checkChain['netWorkType'] = chainsEVMData ? 'EVM' : 'UTXO';
            // 存储选中的网络数据
            indexDbData.putData(
                Object.assign(
                    {
                        id: 'rpc_url'
                    },
                    checkChain
                )
            );
            // 当前用户信息
            let currentWalltAddress = checkChain['walltInfo'][0];
            currentWalltAddress['id'] = 'currentWalltAddress';
            currentWalltAddress['netWorkType'] = checkChain['netWorkType'];
            indexDbData.putData(currentWalltAddress);
            resolve(true);
        } else {
            let err = {
                code: 4902,
                message: `Unrecognized chain ID \"${chainId['chainId']}\". Try adding the chain using wallet_addEthereumChain first.`
            };
            reject(err);
        }
    });
}
