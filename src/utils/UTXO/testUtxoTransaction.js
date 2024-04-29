
import qitmeer from "qitmeer-js";
import { getUtxos, getUTXOBalance, getUtxo, sendTraction } from './meerRpc.js'

export async function testTxSign(data) {
  const targetAddress = 'TnEvLExwzew6LPL13yXmWKnnZxD1c5Lr8Tw'
  const address = 'TnZuTivMLH246LWXUFB5xrAHeK2UdV6MWxv'
  // 设置网络 mainnet【主网】, testnet【测试】, privnet【私有】
  const network = qitmeer.networks.testnet
  // 私钥
  const secretKey = '5eaaf82050c1fe96b088ce4397e3201497fc991c744e31edf72e6180b3dce248'
  const keyPair = qitmeer.ec.fromPrivateKey(Buffer.from(secretKey, 'hex'))
  // 获取发送方地址的余额
  const balance1 = await getUTXOBalance(data.url, address)
  console.log(balance1, 'balance1')
  // 获取接收方地址余额
  const balance2 = await getUTXOBalance(data.url, targetAddress)
  console.log(balance2, 'balance2')
  // 获取发送方地址的未花费交易对信息（为一个数组，暂不确定返回的长度是否有上限，可以通过转入多个小额交易到指定地址进行测试）
  const utxos = await getUtxos(data.url, address)
  console.log('发送方utxos：', utxos)
  const utxos2 = await getUtxos(data.url, targetAddress)
  console.log('接收方utxos：', utxos2)
  // 构造交易
  const txb = qitmeer.txsign.newSigner(network);
  // 忘记了为什么要设置这个locktime了
  // lockTime 是指交易的锁定时间，它表示交易在区块链上的生效时间。通常情况下，如果您不需要特别设置锁定时间，可以将其设置为 0。
  const lockTime = parseInt(new Date().getTime() / 1000)
  txb.setTimestamp(lockTime)
  // txb.setLockTime(lockTime)
  // 将未花费交易对添加到输入中，此处示例是我把全部的未花费交易对都传入了，实际上只需要总额加起来足够支付手续费和转出金额就行，因此如何选取合适的utxo交易对是一个问题，可以其他开源的btc钱包中的这部分计算方案（实际钱包处理这块时，应该不需要每次都重新获取未花费交易对，对弈已有的数据本地应该暂存了，然后每次操作完后更新，移除使用的utxo，加入新的utxo）
  for (let utxo of utxos) {
    txb.addInput(utxo.txid, utxo.idx);
    const utxoD = await getUtxo(data.url, utxo.txid, utxo.idx)
    console.log('utxoDetail:', utxoD)
  }
  txb.addOutput(address, 19800000000);
  txb.addOutput(targetAddress, 80000000);
  console.log("txb:", txb)
  // 使用前面通过私钥生成的密钥对签署交易
  utxos.map((v, i) => {
    txb.sign(i, keyPair);
  })
  // 构建交易体
  const newTransaction = txb.build().toBuffer().toString('hex');
  console.log(newTransaction, 'newTransaction')
  // 发送交易
  const response = await sendTraction(data.url, newTransaction)
  console.log(response, 'response')
}

// testTxSign();
