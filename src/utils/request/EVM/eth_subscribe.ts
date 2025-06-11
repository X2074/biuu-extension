
import getEthersProvider from './getEthers';
/* import indexDbData from '../../indexDB.js';*/
import { ethers } from 'ethers';
// 订阅事件
export default async function eth_subscribe(request: any) {
    console.log(request, 'eth_subscribe');
    /*    try {
           // 使用 WebSocket 提供者
           const provider = new ethers.providers.WebSocketProvider(
               '', // 替换为你的 WebSocket 提供者 URL
           );
   
           // 监听新区块
           provider.on('block', (blockNumber) => {
               console.log('新区块号:', blockNumber);
           });
   
           // 监听特定合约事件
           let contractAddress = ''; // 替换为你的合约地址
           let abi = ''
           const contract = new ethers.Contract(contractAddress, abi, provider);
           contract.on('EventName', (arg1, arg2, event) => {
               console.log('事件触发:', arg1, arg2, event);
           });
       } catch (error) {
           console.error('Error in eth_subscribe:', error);
           throw error;
       } */
}