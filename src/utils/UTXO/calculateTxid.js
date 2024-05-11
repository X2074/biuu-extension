import indexDbData from '@/utils/indexDB.js';
// txb.setLockTime(lockTime)
// 将未花费交易对添加到输入中，此处示例是我把全部的未花费交易对都传入了，实际上只需要总额加起来足够支付手续费和转出金额就行，因此如何选取合适的utxo交易对是一个问题，可以其他开源的btc钱包中的这部分计算方案（实际钱包处理这块时，应该不需要每次都重新获取未花费交易对，对弈已有的数据本地应该暂存了，然后每次操作完后更新，移除使用的utxo，加入新的utxo）
//     本地管理的utxo的详细信息 具体有哪几个未花费的还是要根据当前调用那个获取所有的utxo的方法拿到的列表来确定
// 本地存储utxo对应的详细信息是检查一些不必要的重复请求
// 相当于可能本地存了 1 2 3 4 5 6六个utxo ，之后比的地方花掉了1和4产生了7，之后再次交易的话 ，先查询到utxos有 2 3 5 6 7，只需要重新查询7的详情即可
// 2 3 5 6不需要再去查了

// 定义一个函数,用于选择最小先出的 UTXO
export async function selectMinUTXOs(utxos, targetAmount) {
    // 按照金额大小对 UTXO 进行排序
    utxos.sort((a, b) => a.amount - b.amount);
    let selectedUTXOs = [];
    let totalAmount = 0;
    let transferTxids = await indexDbData.getData('transferTxid');
    for (const utxo of utxos) {
        // 如果当前的txid已经交易过了，就不必添加啦
        if (!transferTxids || transferTxids['content'].includes(utxo.txid)) {
            selectedUTXOs.push(utxo);
            totalAmount += utxo.amount;
            if (totalAmount >= targetAmount) {
                return { selectedUTXOs, change: totalAmount - targetAmount };
            }
        }
    }

    return null; // 没有找到足够的 UTXO
}
// 定义一个函数,用于选择最大先出的 UTXO
export async function selectMaxUTXOs(utxos, targetAmount) {
    // 按照金额大小对 UTXO 进行排序
    utxos.sort((a, b) => b.amount - a.amount);
    let selectedUTXOs = [];
    let totalAmount = 0;
    let transferTxids = await indexDbData.getData('transferTxid');
    for (const utxo of utxos) {
        // 如果当前的txid已经交易过了，就不必添加啦
        if (!transferTxids || transferTxids['content'].includes(utxo.txid)) {
            selectedUTXOs.push(utxo);
            totalAmount += utxo.amount;
            if (totalAmount >= targetAmount) {
                return { selectedUTXOs, change: totalAmount - targetAmount };
            }
        }
    }

    return null; // 没有找到足够的 UTXO
}
// 最小可行金额（Minimum Viable Amount）：
// 选择尽可能接近交易金额的 UTXO，这样可以尽量减少找零，可能减少交易的大小，从而降低费用。
export async function selectUtxosMinViable(utxos, targetAmount) {
    // 按照与 targetAmount 的差值绝对值排序
    utxos.sort((a, b) => Math.abs(a.amount - targetAmount) - Math.abs(b.amount - targetAmount));

    const selectedUTXOs = [];
    let total = 0;
    for (const utxo of utxos) {
        selectedUTXOs.push(utxo);
        total += utxo.amount;
        if (total >= targetAmount) {
            break;
        }
    }
    return { selectedUTXOs, change: total - targetAmount };
}
// 分支限界算法（Branch and Bound）：
// 这是一种更复杂但效率高的方法，它试图找到最优的 UTXO 组合以最小化找零的数量和大小。通过这种方法，算法会尝试所有可能的 UTXO 组合，直到找到最佳解
export async function selectUtxosBranchAndBound(utxos, targetAmount) {
    let selectedUTXOs = null;
    let bestExcess = Infinity;

    function search(selected, remaining, total, index) {
        if (total >= targetAmount) {
            const excess = total - targetAmount;
            if (excess < bestExcess) {
                selectedUTXOs = [...selected];
                bestExcess = excess;
            }
            return;
        }
        if (index >= utxos.length) {
            return;
        }
        // 包含当前 UTXO
        selected.push(utxos[index]);
        search(selected, remaining, total + utxos[index].amount, index + 1);
        // 排除当前 UTXO
        selected.pop();
        search(selected, remaining, total, index + 1);
    }

    search([], utxos, 0, 0);
    return { selectedUTXOs };
}