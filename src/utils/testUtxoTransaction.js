const qitmeer = require("qitmeer-js");
const { getUtxos, getBalance, getUtxo, sendTraction, getTransaction } = require('./meerRpc')

async function testTxSign() {
    // 发送方地址
    const address = 'TnEvLExwzew6LPL13yXmWKnnZxD1c5Lr8Tw'
    // 接收方地址
    const targetAddress = 'TnZuTivMLH246LWXUFB5xrAHeK2UdV6MWxv'

    // 设置网络 mainnet【主网】, testnet【测试】, privnet【私有】
    const network = qitmeer.networks.testnet
    // 私钥
    // const secretKey = '5eaaf82050c1fe96b088ce4397e3201497fc991c744e31edf72e6180b3dce248'
    const secretKey = 'e2ec07936723d6b8c054f1f6bfe2cf1c439733303e5a6f0062d54168d9265b14'
    const keyPair = qitmeer.ec.fromPrivateKey( Buffer.from(secretKey, 'hex') )
    // 获取发送方地址的余额
    const balance1 = (await getBalance('testnet',address)).result/100000000
    console.log('发送方余额：',balance1)
    // 获取接收方地址余额
    const balance2 = (await getBalance('testnet',targetAddress)).result/100000000
    console.log('接收方余额：',balance2)
    // 获取发送方地址的未花费交易对信息（为一个数组，暂不确定返回的长度是否有上限，可以通过转入多个小额交易到指定地址进行测试）
    const utxos = await getUtxos('testnet',address)
    console.log('发送方utxos：',utxos)
    const utxos2 = await getUtxos('testnet',targetAddress)
    console.log('接收方utxos：',utxos2)
    /*
    [
      {
        type: 'normal',
        amount: 70000000,
        txid: 'a7c01b5d7d9f213fa931450576cfbe061d44efae0f3737dfe72aa02b8964785a',
        idx: 1,
        status: 'valid'
      },
      {
        type: 'normal',
        amount: 49900000000,
        txid: '84b3cd69839487dcb18c8d2177433ba6ea137c28c7756ba8faaa5cc49d200290',
        idx: 1,
        status: 'valid'
      },
      {
        type: 'normal',
        amount: 80000000,
        txid: '57a556b34ea21aa32ebbe16f1e5ea0f51123f99174a1bd8e50da19686d3136dc',
        idx: 1,
        status: 'valid'
      }
    ]
     */
    // 构造交易
    const txb = qitmeer.txsign.newSigner( network );
    // 忘记了为什么要设置这个locktime了
    const lockTime = parseInt(new Date().getTime()/1000)
    console.log('lockTime',lockTime)
    txb.setTimestamp(lockTime)
    // txb.setLockTime(lockTime)
    // 将未花费交易对添加到输入中，此处示例是我把全部的未花费交易对都传入了，实际上只需要总额加起来足够支付手续费和转出金额就行，因此如何选取合适的utxo交易对是一个问题，可以其他开源的btc钱包中的这部分计算方案（实际钱包处理这块时，应该不需要每次都重新获取未花费交易对，对弈已有的数据本地应该暂存了，然后每次操作完后更新，移除使用的utxo，加入新的utxo）
    for(const utxo of utxos){
        txb.addInput( utxo.txid,utxo.idx);
        console.log('utxo:',utxo)
        const utxoD = await getUtxo('testnet',utxo.txid,utxo.idx)
        console.log('utxoDetail:',utxoD)
    }
    // 指定转出到特定地址的金额，此处我们从本地转给目标地址0.8MEER（1MEER为100000000个最小单位）
    txb.addOutput( targetAddress, 80000000);
    // 剩余的金额需要设置转回到自己的账户，不然全部会变成手续费。此处我们原本地址的utxo中有500MEER，转出0.8MEER到指定地址，转回499MEER给自己，那么剩下的0.2MEER就会是手续费。手续费过低时交易无法成立，过高时会给用户带来损失，需要多少手续费也需要计算（当然，对于钱包业务来说，除了给矿工的手续费外，我们也可以在这一步对用户收取一定比例的手续费。对于矿工需要多少手续费，我忘记怎么计算了，这块也可以问下兴辉）
    txb.addOutput( address, 10000000000);
    txb.addOutput( address, 9600000000);
    console.log("txb:",txb)
    // 使用前面通过私钥生成的密钥对签署交易
    utxos.map( (v,i) => {
        txb.sign(i, keyPair);
    })
    console.log(txb)
    // 构建交易体
    const newTransaction = txb.build().toBuffer().toString('hex');
    console.log(newTransaction)
    // 发送交易
    // const response = await sendTraction('testnet',newTransaction)
    // console.log(response)
    //
    // try {
    //     const response = await axios.post(url, payload, config);
    //     console.log(response.data)
    // } catch (error) {
    //     console.error('Error:', error);
    // }
}

testTxSign();
