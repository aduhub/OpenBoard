var Net = {
	//##############
	//# プロパティ #
	//##############
	Pubnub:null,
	Worker:null,
	_status:0,
	_channel:"",
	_sendcmd:[],
	_recvcmd:[],
	_recvhash:[],
	_lastcmd:"",
	_lastchatter:"",
	//##############
	//#  メソッド  #
	//##############
	//初期処理
	init:function (){
		//Web Workers
		Net.Worker = new Worker("js/networker.js");
		Net.Worker.onmessage = Net.onworker;
		Net.Worker.onerror = Net.onworkererroer;
		//pubnub
		Net._channel = "ch_room" + sessionStorage.RoomID;
		Net.pubnub_init();
		//map info get
		Net.getCGI("");
		//Log
		Logprint({msg:"ROOMID:"+sessionStorage.RoomID, type:"system"});
	},
	//=====[ Pubnub ]=====
	pubnub_init:function(){
		Net.Pubnub = PUBNUB({
			publish_key   : 'pub-c-e8a48c09-801b-4762-8fe7-a3099e169938',
			subscribe_key : 'sub-c-6d638320-da31-11e2-9d3d-02ee2ddab7fe',
			ssl           : false,
			origin        : 'pubsub.pubnub.com'
		});
		Pubnub.subscribe({
			restore : true,
			channel : Net._channel,
			connect : function(){
				//join 
				switch(sessionStorage.Mode){
				case "join":
					//Net.WS.send(JSON.stringify([{room:sessionStorage.RoomID, cmd:"ping", pno:0, hash:"0000"}]));
					break;
				case "gallery":
					wkcmd = "system{}*観戦者が増えました*";
					//Net.WS.send(JSON.stringify([{room:sessionStorage.RoomID, cmd:"chat", msg:wkcmd}]));
					break;
				}
				//console
				console.log("pubnub Connect");
			},
			disconnect : function(){
				//Log
				Logprint({msg:"*通信が切断されました*", pno:Board.role, type:"system"});
				//console
				console.log("pubnub Disconnect");
			},
			callback : function(message) {
				Frame.stack(message);
				//console
				console.log("pubnub_sub : " + JSON.stringify(message));
			},
		});
	},
	pubnub_send:function(message){
		Pubnub.publish({
			channel  : Net._channel,
			message  : message,
			callback : function(info) {
				console.log("pubnub_pub:" + JSON.stringify(info));
			}
		});
	},
	//=====[ 送信 ]=====
	send:function (data){
		var hash = CryptoJS.SHA1(data);
		var message = {"pno":Board.role, "cmd":"send", "data":data, "hash":hash}
		// pubnub send
		Net.pubnub_send(message);
		//send log
		Net._sendcmd.push(data);
	},
	//=====[ Web Workers ]=====
	xhr:function(arr){
		if($T.browser() == "chrome"){
			console.log("[xhr]"+arr.cgi+":"+arr.para);
			Net.Worker.webkitPostMessage([arr.cgi, arr.para, arr.fnc]);
		}else{
			Net.Worker.postMessage([arr.cgi, arr.para, arr.fnc]);
		}
	},
	onworker:function(event){
		//返却関数実行
		switch(event.data[1]){
		case "Net.ongetCGI":
			Net.ongetCGI(event.data[0]);
			break;
		case "onDeckList":
			onDeckList(event.data[0]);
			break;
		case "onDeckRecv":
			onDeckRecv(event.data[0]);
			break;
		case "onDeckImport":
			onDeckImport(event.data[0]);
			break;
		}
	},
	onworkererroer:function(event){
		//Log
		console.log("### ERROR ###");
	},
	//========[ Get Log ]========
	getCGI:function (){
		var pars, sendcmd;
		var cmds = [];
		var lcmds = [];
		//コマンドあり、送信中なし、最終送信クリア
		if(Net._sendcmd.length > 0 && Net._status == 0){
			pars =  "ROOMID=" + sessionStorage.RoomID + "&LOGNO=" + Net.logno;
			while(sendcmd = Net._sendcmd.shift()){
				if(sendcmd != ""){
					cmds.push(sendcmd);
					//### socketapi ###
					if(Net.__socket == 1){
						Net.WS.send(JSON.stringify([{room:sessionStorage.RoomID, cmd:"send", pno:Board.role, hash:sendcmd.substr(0, 4), lasthash:Net._recvhash[0], senddata:sendcmd}]));	
					}
					//Last Command
					if(!sendcmd.match(/^\w{4}:[0-9]:chat:/)){
						lcmds.push(sendcmd);
					}
					//#### Log ####
					console.log("send:" + sendcmd);
				}
			}
			if(cmds.length > 0){
				pars += "&LOGCMD=" + cmds.join(",");
				//Last Command
				Net._lastcmd = lcmds.join(",");
			}
			//Worker
			Net.xhr({cgi:"perl/ocnet.cgi", para:pars, fnc:"Net.ongetCGI"});
			//データ取得中
			Net._status = 1;
		}
	},
	ongetCGI:function (recvstr){
		var recvcmd = recvstr.split(",");
		if (recvcmd[0] != "0"){
			//受信済みログNOチェック
			if(Net.logno < Number(recvcmd[0])){
				Net.logno = Number(recvcmd.shift());
				//最終送信確認
				if(Net._lastcmd != ""){
					//clear
					Net._lastcmd = "";
				}
			}
			for(var i=0; i<recvcmd.length; i++){
				recvcmd[i] = recvcmd[i].replace(/\n/g, '');
				var hash = recvcmd[i].substr(0, 4);
				if(hash == "0000" || Net._recvhash.indexOf(hash) == -1){
					Net._recvcmd.push(recvcmd[i]);
					Net._recvhash.unshift(hash);
					//
					$T._rndlog.push(hash);
					//#### Log ####
					console.log("["+hash+"]perl:getlog");
				}
			}
			//#### Log ####
			console.log("recv:"+recvstr);
		}
		//ステータスクリア
		Net._status = 0;
	},
	errgetCGI:function (){
		//最終送信確認
		if(Net._lastcmd != ""){
			//再送！
			Net._sendcmd.unshift(Net._lastcmd);
		}
		//Log
		console.log("###ERROR### GetLogError");
		//ステータスクリア
		Net._status = 0;
	}
}
