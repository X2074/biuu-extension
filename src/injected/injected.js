// 将代码包装在立即执行函数中，避免污染全局作用域
(function () {
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
