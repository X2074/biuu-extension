
    console.log('第一次加载0333')
window.addEventListener("message", function(e)
{
    console.log(e,'content01');
}, true);
  // inject传参给content
  var customEvent = document.createEvent('Event');
  function injectEvent(name,id,data) {//name:事件名称，id：绑定的div，data：传的参数
    customEvent.initEvent(name, true, true);
    hiddenDiv = document.getElementById(id);
    if(!hiddenDiv) {//如果没有这个div就创建一个
      hiddenDiv = document.createElement('div');
      hiddenDiv.id = id;
      hiddenDiv.style.display = 'none';
      document.body.appendChild(hiddenDiv);
    }
    hiddenDiv.innerText = data
    hiddenDiv.dispatchEvent(customEvent);
  }

  window.web3 = function() {
    console.log('第一次加载02')
    injectEvent('test','myCustomEventDiv','dasdasdasdasdas')
    // window.postMessage({"test": '你好！'}, '*');
  }


  // 获取数据
  // function getWeb3Data(){
  //   new Promise((resolve, reject) => {
  //     // 监听content传递过来的数据
  //     window.addEventListener("message", function(e){
  //       resolve(e)
  //       console.log(e,'inject');
  //     }, false);
  //   }) 
  // }
  