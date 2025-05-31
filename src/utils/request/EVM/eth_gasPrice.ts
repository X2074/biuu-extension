import indexDbData from '../../indexDB.js';
import getEthersProvider from './getEthers';
export default async function eth_gasPrice(request: any) {
    console.log(request, 'requesteth_gasPrice');
    debugger;
    const provider = await getEthersProvider()

    const gasPriceWei = await provider.getGasPrice(); // 返回 BigNumber 对象（wei）
    const gasPriceHex = gasPriceWei.toHexString(); // 转为 0x 开头的 16 进制字符串
    console.log('Gas Price (Hex):', gasPriceHex); // 例如 "0x12a05f200"
    /* const gasPriceGwei = ethers.utils.formatUnits(gasPriceWei, "gwei"); // 转为 Gwei
  console.log(`当前 Gas 价格: ${gasPriceGwei} Gwei ,${gasPriceWei}`) */ return gasPriceHex;
}