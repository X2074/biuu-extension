function openPagea(){
    // let createData = {
    //       url:'chrome-extension://bjogegnhblmapbajppakikonghmglkkb/userContentPage.html',//打开的网页地址（即'http://www.google.com'，不是'www.google.com'）
    //       left:0,//新视窗相对于屏幕的左边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个    有焦点的视窗自然偏移。
    //       top:0,//新视窗相对于屏幕的上边缘的位置的像素值。如果没有指定，那么新的视窗从最后一个有焦点的视窗自然偏移。
    //       width:560,//新视窗的像素宽度。如果没有指定，默认为自然宽度。
    //       height:500,//新视窗的像素高度。如果没有指定，默认为自然高度。
    //       type:"popup",// ( optional enumerated string ["normal", "popup"]可选，枚举字符串["normal", "popup"] ) 指定新建浏览器视窗的类型。
    //     }
    //     //打开一个background页面，只能在content，popup和background部分使用该方法
    //     // chrome.windows.create(createData, ()=>{
    //     //   window.close();
    //     //   console.log('打开新页面')
    //     // })
    
}

// 监听来自web页面的通信
window.addEventListener('message', function (e)	{
    // 将通信信息暴露给background页面，将消息过滤，获取属于自己的消息数据
    if(e.data == '我是主窗口，我接收到消息了'){
        chrome.runtime.sendMessage({
            action:'toPopop' , 
            payload:'i come form  popop'
          })
    }
}, true);
// content不能与当前页面js共享，但是可以共享页面的dom，插入window对象需要js注入的方式
var script = document.createElement("script");
script.innerHTML = 'var _alert = window.alert;window.alert = function(){console.log(arguments);_alert(arguments);}'
document.head.appendChild(script)
console.log(openPagea,'openPagea');
function Person(){
    return {
        openPagea,
        a:'452415465'
    }
    
}
