<template src='./index.html'></template>
<script lang="ts">
export default {
    name: "importPrivate",
};
</script>
<script lang='ts' setup>
import { ref } from "vue";
import qitmeer from "qitmeer-js";
import indexDbData from "@/utils/indexDB.js";
import bus from "@/utils/bus.js";
import { v4 as uuidv4 } from "uuid";
import Web3 from "web3";
import { Encrypt } from "@/utils/index.js";
import md5 from "js-md5";
// 预制网络
import { netWork } from "@/utils/defaultNetwork.js";
let loading = ref(false);
let moduleType = ref("evm"); //选中的模块
let privatePhrase: any = ref(null);
let privatePhraseErr = ref("");
let passKey = ref(""); //密码
// 获取设置的密码
indexDbData
    .getData(md5("secret"))
    .then((res: any) => {
        passKey.value = res.secret;
    })
    .catch((err: any) => {
        console.log(err);
    });
// 确认
const privatePrivateConfirm = async () => {
    privatePhraseErr.value = "";
    if (!privatePhrase.value) {
        privatePhraseErr.value = "请输入私钥";
        return;
    }
    var regex = /^[a-zA-Z0-9]*$/; // 只允许输入数字和字母
    if (!regex.test(privatePhrase.value)) {
        privatePhraseErr.value = "无效的输入，请再试一次。";
        return;
    }
    let keyName = uuidv4();
    await saveKey(keyName);
    loading.value = true;
    // 创建evm
    if (moduleType.value == "evm") {
        await isValidPrivateKey(keyName);
    } else {
        await generateUTXOWallet(keyName);
    }
    loading.value = false;
    bus.emit("promptModalSuccess", "导入成功");
    setTimeout(() => {
        bus.emit("nextPage", "homePage");
    }, 500);
};
// evm私钥生成钱包
const isValidPrivateKey = async (keyName: any) => {
    try {
        const web3 = new Web3();
        const account: any = web3.eth.accounts.privateKeyToAccount(
            privatePhrase.value
        );
        console.log(account, "account");

        if (account && account.address) {
            account["keyStore"] = keyName;
            account["netWorkType"] = "evm";
            evmNetwork(account);
            return true;
        } else {
            privatePhraseErr.value = "无效的输入，请再试一次。";
            return false;
        }
    } catch (error) {
        privatePhraseErr.value = "无效的输入，请再试一次。";
        return false;
    }
};
// 通过私钥生成 UTXO 钱包
const generateUTXOWallet = async (keyName: any) => {
    const testNetwork = qitmeer.networks.testnet;
    const mainNetwork = qitmeer.networks.mainnet;
    let utxoAddressTest;
    let utxoAddressMain;
    let keyPair;
    // 生成公钥
    try {
        keyPair = await qitmeer.ec.fromPrivateKey(
            Buffer.from(privatePhrase.value, "hex")
        );
        console.log(keyPair.publicKey.toString("hex"), "publicKey");
    } catch (error) {
        privatePhraseErr.value = "无效的输入，请再试一次。";
        return;
    }
    const hash160 = qitmeer.hash.hash160(keyPair.publicKey);
    // 测试环境地址
    try {
        utxoAddressTest = await qitmeer.address.toBase58Check(
            hash160,
            testNetwork.pubKeyHashAddrId
        );
    } catch (error) {
        privatePhraseErr.value = "无效的输入，请再试一次。";
        return;
    }
    // 正式环境地址
    try {
        utxoAddressMain = await qitmeer.address.toBase58Check(
            hash160,
            mainNetwork.pubKeyHashAddrId
        );
    } catch (error) {
        privatePhraseErr.value = "无效的输入，请再试一次。";
        return;
    }
    if (!utxoAddressTest || !utxoAddressMain) return;
    let account = {
        netWorkType: "utxo",
        privateKey: privatePhrase.value,
        utxoAddressTest: utxoAddressTest, //UTXO测试网地址
        utxoAddressMain: utxoAddressMain, //UTXO正式网地址
        keyStore: keyName,
    };
    utxoNetwork(account);
};
// 907fd84538e3ac1caebdbbd35b00cad93986ee9ae34785e99e62843020c98f72
const evmNetwork = (walltInfo: any) => {
    indexDbData.getData("EVM").then((res: any) => {
        console.log(res, "resresres");
        let data: any = {};
        // 提取数据库存储的网络 chainid
        if (!res) {
            //如果是第一次创建，rpc和current数据就初始化
            data["content"] = netWork.EVM;
            data["id"] = "EVM";
            data["NoIndex"] = 1;
            let content = {
                address: walltInfo.address,
                userName: "Wallt 01",
                userUrl: "",
                keyStoreType: "privateKey",
                keyStore: walltInfo.keyStore,
            };
            indexDbData.putData(
                Object.assign({ id: "currentWalltAddress" }, content)
            );
            let info: any = {
                id: "rpc_url",
                unit: "Meer",
                netName: "Qitmeer Testnet",
                CHAIN_ID: 8131,
                keyStore: walltInfo.keyStore,
                type: "EVM",
                url: "https://testnet-qng.rpc.qitmeer.io",
                walltInfo: [],
            };
            info["walltInfo"].push(content);
            indexDbData.putData(info);
        } else {
            data = res;
            data["NoIndex"] = data["NoIndex"] + 1;
        }
        let chainId = Object.keys(data.content);
        Object.keys(netWork.EVM).forEach((item) => {
            if (!chainId.includes(item)) {
                //如果数据库没有这个网络
                let netWorkType: any = netWork.EVM;
                data.content[item] = netWorkType[item];
            }
        });
        Object.keys(data.content).forEach((item) => {
            // 如果有同名的钱包地址，直接return；
            let walltAccount = data.content[item].walltInfo.filter(
                (item: any) => {
                    return item.address == walltInfo.address;
                }
            );
            if (walltAccount && walltAccount.length) {
                bus.emit("promptModalErr", "重复的钱包地址");
                return;
            }
            data.content[item].walltInfo.push({
                address: walltInfo.address, //当前用户地址
                userName:
                    "Wallt" +
                    (!data["NoIndex"]
                        ? "01"
                        : data["NoIndex"] + 1 > 10
                        ? data["NoIndex"] + 1
                        : "0" + (data["NoIndex"] + 1)),
                userUrl: "",
                NoIndex: data["NoIndex"], //当前创建的第几个
                keyStoreType: "privateKey",
                keyStore: walltInfo.keyStore,
            });
        });
        data.netWorkType = "evm";
        indexDbData.putData(data);
        console.log(data, 1111111);
        createRpc();
    });
};
const utxoNetwork = (walltInfo: any) => {
    indexDbData.getData("UTXO").then((res: any) => {
        let data: any = {};
        if (!res) {
            // 新增默认utxo网络
            data["content"] = netWork["UTXO"];
            data["id"] = "UTXO";
            data["NoIndex"] = 1;
        } else {
            data = res;
            data["NoIndex"] = data["NoIndex"] + 1;
        }
        // 提取数据库存储的网络 chainid
        let chainId = Object.keys(data.content);
        Object.keys(netWork.UTXO).forEach((item) => {
            if (!chainId.includes(item)) {
                //如果数据库没有这个网络
                let netWorkType: any = netWork.EVM;
                data.content[item] = netWorkType[item];
            }
        });
        Object.keys(data.content).forEach((item) => {
            let walltAccount = data.content[item].walltInfo.filter(
                (item: any) => {
                    return item.address == walltInfo.address;
                }
            );
            if (walltAccount && walltAccount.length) {
                bus.emit("promptModalErr", "重复的钱包地址");
                return;
            }
            data.content[item].walltInfo.push({
                utxoAddressTest: walltInfo.utxoAddressTest, //当前用户测试地址
                address: walltInfo.utxoAddressMain, //当前用户地址
                userName:
                    "Wallt" +
                    (!data["NoIndex"]
                        ? "01"
                        : data["NoIndex"] + 1 > 10
                        ? data["NoIndex"] + 1
                        : "0" + (data["NoIndex"] + 1)),
                userUrl: "",
                NoIndex: data["NoIndex"], //当前创建的第几个
                keyStoreType: "privateKey",
                keyStore: walltInfo.keyStore,
            });
        });
        data.netWorkType = "utxo";
        indexDbData.putData(data);
        createRpc();
    });
};
// rpc数据保存
const createRpc = async () => {
    // 获取是evm、utxo钱包
    let data = await indexDbData.getData("rpc_url");
    let wallt = await indexDbData.getData(data.netWorkType.toUpperCase());
    console.log(wallt, "wallt", Object.keys(wallt["content"]));
    // 获取当前网络下第一个对象
    let info = wallt["content"][data["CHAIN_ID"]];
    console.log(info, "info");

    info["id"] = "rpc_url";
    info["type"] = data.type;
    info["netWorkType"] = data.netWorkType;
    // 更新rpc
    indexDbData.putData(info);
    // 更新当前钱包数据
    let index = info["walltInfo"].length;
    let currentWallt = info["walltInfo"][index - 1];
    currentWallt["id"] = "currentWalltAddress";
    currentWallt["netWorkType"] = data.netWorkType;
    indexDbData.putData(currentWallt);
};

const saveKey = async (keyName: any) => {
    // 私钥加密
    let ciphertext = await Encrypt(privatePhrase.value, passKey.value);
    // 保存加密数据
    let getKeyStore = await indexDbData.getData("keyStore");
    let info: any = {};
    info[keyName] = ciphertext;
    console.log(info, "新的key");
    // 合并后的key
    let keyData: any = {};
    if (!getKeyStore) {
        keyData = info;
    } else {
        keyData = Object.assign(getKeyStore.secret, info);
    }
    // 保存key
    indexDbData.putData({
        id: "keyStore",
        secret: keyData,
    });
};
</script>
<style lang='scss'>
@import "../privatePhrase.scss";
</style>