var Net = {
	//##############
	//# プロパティ #
	//##############
	Pubnub:null,
	Worker:null,
	_channel:"",
	_sendcmd:[],
	_recvcmd:[],
	_hashlist:[],
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
		Net.Pubnub.subscribe({
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
				if(Net._hashlist.indexOf(message["hash"]) == -1){
					//Frame
					Frame.stack(message);
					//stock
					Net._hashlist.push(message["hash"]);
                    //console
                    console.log("[pub_get]" + JSON.stringify(message));
				}
			}
		});
	},
	pubnub_send:function(message){
		Net.Pubnub.publish({
			channel  : Net._channel,
			message  : message
			//,callback : function(info) {
			//	console.log("pubnub_status:" + JSON.stringify(info));
			//}
		});
        //console
        console.log("[pub_send]" + JSON.stringify(message));
	},
	//=====[ 送信 ]=====
	send:function (recv){
		var message = {"cmd":"send", "pno":Board.role, "plog":recv, "hash":Net.hashkit()}
		// pubnub send
		Net.pubnub_send(message);
	},
    ping:function (){
        var hash = Net.hashkit();
        var message = {"cmd":"ping", "hash":hash}
        // pubnub send
        Net.pubnub_send(message);
        // stock
        Net._hashlist.push(hash);
    },
    hashkit:function(){
        var timenow = new Date();
        var hashseed = $T.rndstr(16);
        hashseed += timenow.toString();
        var rethash = CryptoJS.SHA1(hashseed).toString();
        return rethash;
    },
	//=====[ Web Workers ]=====
	xhr:function(arr){
    	Net.Worker.postMessage([arr.cgi, arr.para, arr.fnc]);
        //console
        console.log("[xhr]"+arr.cgi+":"+arr.para);
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
        if(sendcmd != null && sendcmd != ""){
            pars += "&LOGCMD=" + sendcmd;
        }
        //Worker
        Net.xhr({cgi:"perl/ocnet.cgi", para:pars, fnc:"Net.ongetCGI"});
	},
	ongetCGI:function (recv){
        var recvstr = recv.replace(/\n/g, '');
		var recvcmds = recvstr.split(",");
		if (recvcmds[0] != "0"){
			for(var i=1; i<recvcmds.length; i++){
                var cmdarr = recvcmds[i].split(":");
                var loghash = cmdarr.shift();
                var logpno = Number(cmdarr.shift());
                var logcmd = cmdarr.join(":");
				if(Net._hashlist.indexOf(loghash) == -1){
                    var message = {"cmd":"send", "pno":logpno, "plog":logcmd, "hash":loghash}
                    //Frame
                    Frame.stack(message);
                    //stock
                    Net._hashlist.push(loghash);
				}
			}
			//#### Log ####
			console.log("[ongetCGI]"+recvstr);
		}
	}
}
