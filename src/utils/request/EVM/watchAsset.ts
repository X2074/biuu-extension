
import indexDbData from '@/utils/indexDB.js';
import bus from '@/utils/bus.js';
// watchAsset.ts
export async function watchAsset(request: any): Promise<boolean> {
   
}
// 同步修改indexDB数据
export async function changeAssetIndexDB(data: any,address:string): Promise<boolean> { 
    let chain;
    let currentWalltAddress = await indexDbData.getData('currentWalltAddress');
    // 获取当前网络作为默认值
    await indexDbData.getData('rpc_url').then(async (res:any) => {
        chain = res.CHAIN_ID;
        res.walltInfo.forEach((element:any) => {
            element = filterAssset(element,currentWalltAddress,address)
        });
        console.log(res,"element");
        
        indexDbData.putData(res);
    });
    // EVM
    await indexDbData.getData('EVM').then(async (res:any) => {
        res.content[chain].walltInfo.forEach((element:any) => {
            element = filterAssset(element,currentWalltAddress,address)
        });
        console.log(res,"element");
        
        indexDbData.putData(res);
    })
}


function filterAssset (element:any,currentWalltAddress:any,address:string){
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
    } else {
        element.asset = null;
    }
    return element;
}
