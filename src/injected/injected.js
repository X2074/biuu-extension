// import { announceProviderInject } from "./EIP6963/EIP6963";
// 将代码包装在立即执行函数中，避免污染全局作用域
(async function () {
    // 动态导入 EIP6963 模块
    const EIP6963 = await import('./EIP6963.js');
    // 构造函数 生命的Person用户只有使用new方法才能访问
    class Person {
        constructor() { }
        openPage() {
            console.log('测试数据0010')
        }
        openPage01() {
            console.log('测试数据13')
        }
    }
    // 动态的向Person里面添加函数
    Person.prototype.openPage02 = function () {
        // 使用 window.postMessage 进行页面和扩展之间的通信
        window.postMessage("我是主窗口，我接收到消息了", window.location.origin);
    }

    // 将Person类暴露到全局作用域
    window.Person = Person;

console.log(EIP6963,"EIP6963");
    EIP6963.announceProviderInject();
    let provider;
    console.log(7887885455);

    // window.ethereum = provider;

    // function announceProvider() {
    //     const info = {
    //         uuid: "350670db-19fa-4704-a166-e52e178b59d2",
    //         name: "Example Wallet",
    //         icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
    //         rdns: "com.example.wallet"
    //     };
    //     window.dispatchEvent(
    //         new CustomEvent("eip6963:announceProvider", {
    //             detail: Object.freeze({ info, provider }),
    //         })
    //     );
    // }

    // window.addEventListener(
    //     "eip6963:requestProvider",
    //     (event) => {
    //         announceProvider();
    //     }
    // );

    // announceProvider();
})();
// 可以通过 window.qitmeer 来与您的钱包进行交互
class QitmeerWalletProvider {
    constructor() {

    }
    request(args) {
        console.log('我是' + args)
    }
}

if (!window.qitmeer) {
    window.qitmeer = new QitmeerWalletProvider()
}
