import indexDbData from '@/utils/indexDB';
/* 修改钱包信息
    parameter:要修改的参数
    query：修改后的参数
    address：要修改的数据地址
*/
export async function editContent(parameter, query, address) {
    console.log(parameter, query, address);
    // 先修改当前用户信息的
    try {
        let currentWalltAddress = await indexDbData.getData('currentWalltAddress')
        let datacurrentWalltAddress = currentWalltAddress;
        datacurrentWalltAddress[parameter] = query;
        console.log(datacurrentWalltAddress, 'datacurrentWalltAddress');
        indexDbData.putData(datacurrentWalltAddress)
        // 修改rpc列表
        let rpc_url = await indexDbData.getData('rpc_url')
        let datarpc_url = rpc_url;
        datarpc_url['walltInfo'].map(item => {
            if (item.address == address) {
                item[parameter] = query;
            }
            return item;
        })
        console.log(datarpc_url, 'datarpc_url');
        indexDbData.putData(datarpc_url)
        // 修改evm utxo
        let EVM = await indexDbData.getData('EVM')
        Object.keys(EVM.content).forEach((item, index) => {
            console.log(item, 'item');
            let data = EVM.content[item].walltInfo.map(info => {
                if (info.address == address) {
                    info[parameter] = query;
                }
                console.log(info, 'info');
                return info;
            })
            item = data;
        })
        console.log(EVM, 'EVM');
        indexDbData.putData(EVM)
        let UTXO = await indexDbData.getData('UTXO')
        Object.keys(UTXO.content).forEach((item, index) => {
            let data = UTXO.content[item].walltInfo.map(info => {
                if (info.address == address) {
                    info[parameter] = query;
                }
                return info;
            })
            item = data;
        })
        console.log(UTXO, 'UTXO');
        indexDbData.putData(UTXO)
        return true;
    } catch {

    }

}