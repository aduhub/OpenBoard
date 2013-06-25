//プロパティ
var msgtimer = false;
var lastcmd = "";
var messages = [];
//メッセージ
onmessage = function(event) {
	//予約中・次回送信ocnet
	if(msgtimer && event.data[0] == "perl/ocnet.cgi" && messages[0][0] == "perl/ocnet.cgi"){
		if(event.data[1] != ""){
			//同時送信
			messages[0][1] += "," + event.data[1];
		}
	}else{
		//メッセージ取得
		messages.push(event.data);
		clock();
	}
}
//ループ
function clock(){
	//メッセージ有無
	if(messages.length > 0){
		//ロック
		msgtimer = true;
		//送信
		var fnc = function(){xhrget(messages.shift())};
		//タイマー
		setTimeout(fnc, 1000);
	}else{
		//アンロック
		msgtimer = false;
	}
}
//xhrHttpRequest
function xhrget(arr){
	(function(){
		var xhr = new XMLHttpRequest();
		var url = "/openboard/" + arr[0] + '?' + arr[1];
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4){
				if(xhr.status == 200){
					//メッセージ送信
					var ua = navigator.userAgent.toLowerCase();
					if(ua.indexOf("chrome") != -1){
						webkitPostMessage([xhr.responseText, arr[2]]);
					}else if(ua.indexOf("firefox") != -1){
						postMessage([xhr.responseText, arr[2]]);
					}
				}
				delete xhr;
				//
				clock();
			}
		};
		xhr.send(null);
	})();
}
