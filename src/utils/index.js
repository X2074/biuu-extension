export function getCookie(cookieName) {
	const strCookie = document.cookie
	const cookieList = strCookie.split('; ')
	var cookieValue = 'false';
	for (let i = 0; i < cookieList.length; i++) {
		const arr = cookieList[i].split('=')
		if (cookieName === arr[0]) {
			cookieValue = arr[1];
		}
	}

	return cookieValue;
}

export function setCookie(name, value) {
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
	document.cookie = name + '=' + escape(value) + ';expires=' + exp.toUTCString() + ';path=/;';
}
//清除所有cookie函数
export function clearAllCookie() {
	var keys = document.cookie.match(/[^ =;]+(?=)/g);
	if (keys) {
		for (var i = keys.length; i--;) {
			if (keys[i] != 'local') {
				setCookie(keys[i], '');
				// document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
			}
		}	
	}
}
//   获取浏览器参数，判断当前如何显示
  export function getQueryParams () {
	var url = document.location.toString()
	// 如果url中有特殊字符则需要进行一下解码
	url = decodeURI(url)
	var arr1 = url.split('?');
	var obj = {}
	if (arr1.length > 1) {
	  var arr2 = arr1[1].split('&');
	  for (var i = 0; i < arr2.length; i++) {
		var curArr = arr2[i].split('=');
		obj[curArr[0]] = decodeURIComponent(curArr[1])
	  }
	}
	return obj
  }
  export function formatDate (millinSeconds) {
	let date = new Date(millinSeconds);
	let monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Spt', 'Oct', 'Nov', 'Dec'];
	let suffix = ['st', 'nd', 'rd', 'th'];
	
	let year = date.getFullYear(); //年
	let month = monthArr[date.getMonth()]; //月
	let ddate = date.getDate(); //日
	let hours = date.getHours();
	let minute = date.getMinutes();
	 
	if (ddate % 10 < 1 || ddate % 10 > 3) {
		ddate = ddate + suffix[3];
	} else if (ddate % 10 == 1) {
		ddate = ddate + suffix[0];
	} else if (ddate % 10 == 2) {
		ddate = ddate + suffix[1];
	} else {
		ddate = ddate + suffix[2];
	}
	return month + ' ' + ddate;
}