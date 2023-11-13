// 暴露出来的方法，可以在任意网页的控制台打印该方法
function openPage02(){
    // let createData = {
    //       url:'chrome-extension://bjogegnhblmapbajppakikonghmglkkb/userContentPage.html',//打开的网页地址（即'http://www.google.com'，不是'www.google.com'）
    //       left:0,//新视窗相对于屏幕的左边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个    有焦点的视窗自然偏移。
    //       top:0,//新视窗相对于屏幕的上边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个有焦点的视窗自然偏移。
    //       width:560,//新视窗的像素宽度。如果没有指定，默认为自然宽度。
    //       height:500,//新视窗的像素高度。如果没有指定，默认为自然高度。
    //       type:"popup",// ( optional enumerated string ["normal", "popup"]可选，枚举字符串["normal", "popup"] ) 指定新建浏览器视窗的类型。
    //     }
    //     //打开一个浏览器
    //     // chrome.windows.create(createData, ()=>{
    //     //   window.close();
    //     //   console.log('打开新页面')
    //     // })
    //     window.open('chrome-extension://bjogegnhblmapbajppakikonghmglkkb/background.html')
    // chrome.runtime.sendMessage({ message: "Hello from content script!" });
    console.log(chrome);
    window.top.postMessage('handsome', '*')
    
}
// 构造函数 生命的Person用户只有使用new方法才能访问
class Person {
    constructor(){}
    openPage(){
        console.log('测试数据0010')
    }
    openPage01(){
        console.log('测试数据13')
    }
}
// 动态的向Person里面添加函数
Person.prototype.openPage02 = function() {
    console.log('测试数据42');
}


