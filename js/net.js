var Net = {
	//##############
	//# プロパティ #
	//##############
	Pubnub:null,
	Worker:null,
	_channel:"",
	_sendcmd:[],
	_recvcmd:[],
	_recvhash:[],
	//##############
	//#  メソッド  #
	//##############
	//初期処理
	init:function (){
		//Web Workers
		Net.Worker = new Worker("js/networker.js");
		Net.Worker.onmessage = Net.onWorker;
		Net.Worker.onerror = Net.onWorkerError;
		//pubnub
		Net._channel = "ch_room" + sessionStorage.RoomID;
		Net.pubnub_init();
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
				Frame.startset();
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
				if(Net._recvhash.indexOf(message["hash"]) == -1){
					//Frame
					Frame.stack(message);
					//stock
					Net._recvhash.push(message["hash"]);
				}
				//console
				console.log("pubnub_sub : " + JSON.stringify(message));
			}
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
		var hash = CryptoJS.SHA1(data).toString();
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
	onWorker:function(event){
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
	onWorkerError:function(event){
		//Log
		console.log("### ERROR ###");
	},
	//========[ Get Log ]========
	getCGI:function (sendcmd){
        var pars = "ROOMID=" + sessionStorage.RoomID;
        if(sendcmd != ""){
            pars += "&LOGCMD=" + sendcmd;
        }
        //Worker
        Net.xhr({cgi:"perl/ocnet.cgi", para:pars, fnc:"Net.ongetCGI"});
	},
	ongetCGI:function (recvstr){
		var recvcmd = recvstr.split(",");
		if (recvcmd[0] != "0"){
			for(var i=0; i<recvcmd.length; i++){
				recvcmd[i] = recvcmd[i].replace(/\n/g, '');
                var wkcmd = recvcmd[i].split(":");
                var loghash = recvcmd[i].shift();
                var logpno = Number(recvcmd[i].shift());
                var logcmd = recvcmd[i].join(":");
				if(loghash == "0000" || Net._recvhash.indexOf(loghash) == -1){
                    var message = {"pno":logpno, "cmd":"send", "data":logcmd, "hash":loghash}
                    //Frame
                    Frame.stack(message);
                    //stock
                    Net._recvhash.push(message["hash"]);
				}
			}
			//#### Log ####
			console.log("getCGI:"+recvstr);
		}
	}
}
