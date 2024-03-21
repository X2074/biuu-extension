
import indexDbData from '../utils/indexDB.js';
import Web3 from 'web3'
console.log('后台数据开始启动了', Web3);
indexDbData.getData('rpc_url').then(res => {
    console.log(res, 'indexDBashuju');
})