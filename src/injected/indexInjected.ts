// // injected.ts
export {}
// 将 Person 类和实例暴露到全局作用域
// declare global {
//     interface Window {
//         Person: typeof Person;
//         personInstance: PersonType;
//     }
// }
import { announceProviderInject } from '../utils/EIP6963/EIP6963';
import { windowProvider } from '../utils/provider/window-provider';
// 首先定义 Person 类的类型
// type PersonType = {
//     openPage(): void;
//     openPage01(): void;
//     openPage02(): void;
// };
// // 然后定义 Person 类
// class Person {
//     private static instance: Person | null = null;

//     private constructor() {
//         // 私有构造函数
//     }

//     static getInstance(): Person {
//         if (!Person.instance) {
//             Person.instance = new Person();
//         }
//         return Person.instance;
//     }

//     openPage(): void {
//         console.log('测试数据0010');
//     }

//     openPage01(): void {
//         console.log('测试数据13');
//     }

//     openPage02(): void {
//         window.postMessage("我是主窗口，我接收到消息了", window.location.origin);
//     }
// }
// // 创建一个 Person 实例并赋值给 window
// const personInstance =  Person.getInstance();

// // 将 Person 类和实例赋值给 window
// (window as any).Person = Person;
// (window as any).personInstance = personInstance;

announceProviderInject()
// windowProvider()

console.log('我是biuu');

window.addEventListener('message', function (e) {
    console.log('我是injected听到了contyent',e);
    if (e.data.type === 'chainChanged') {
        window.ethereum.emit('chainChanged', e.data.chainId)
    }
})




// connectProviderBridge()