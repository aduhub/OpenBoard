var obNet = {
	//【プロパティ】
	roomid:"",
	logno:0,
	WS:null, //WebSocket
	Worker:null,
	__socket:0,
	__wsbeet:0,
	__loopid:0,
	__status:0, //0:free 1:wait
	__s_cmd:[],
	__r_cmd:[],
	__r_hash:[],
	__l_cmd:"",
	__lastchat:"",
	__replaycmd:"",
	//【メソッド】
	//初期処理
	init:function (){
		//Web Workers
		obNet.Worker = new Worker("js/networker.js");
		obNet.Worker.onmessage = obNet.onworker;
		obNet.Worker.onerror = obNet.onworkererroer;
		//jQuery.ajaxSetup({type:"GET", datatype:"text", cache:false});
		obNet.roomid = sessionStorage.RoomID;
		//=======================
		//Socketapi
		//obNet._socketapi();
		//Puhser
		obNet._pusher();
		//=======================
		obNet.__loopid = setTimeout(obNet._main, 2000);
		obNet.send("");
		//Log
		Logprint({msg:"ROOMID:"+obNet.roomid, type:"system"});
	},
	//基本ループ
	_main:function (){
		//[Send Check]
		obNet._getlog();
		//[Log Play]
		obNet._playlog();
		//TimeKeep
		Chessclock.main();
		//Loop
		obNet.__loopid = setTimeout(obNet._main, 100);
	},
	//Ping > SocketApi
	_socketapi:function (){
		if(sessionStorage.Online == "Y"){
			//ping
			if($T.browser() == "chrome"){
				obNet.WS = new WebSocket('ws://socketapi.com:8090/','api.aduma.0');
			}else{
				obNet.WS = new MozWebSocket('ws://socketapi.com:8090/','api.aduma.0');
			}
			obNet.WS.onopen = function(e) { 
				obNet.__socket = 1;
				obNet.__wsbeet = setInterval(function(){obNet.WS.send('Heartbeat');}, 60000);
				//join 
				if(sessionStorage.Mode == "join"){
					//wkcmd = "system{}*対戦者が参加しました*";
					//obNet.WS.send(JSON.stringify([{room:obNet.roomid, cmd:"chat", msg:wkcmd}]));
					obNet.WS.send(JSON.stringify([{room:obNet.roomid, cmd:"ping", pno:0, hash:"0000"}]));
				}
				//gallery 
				if(sessionStorage.Mode == "gallery"){
					wkcmd = "system{}*観戦者が増えました*";
					obNet.WS.send(JSON.stringify([{room:obNet.roomid, cmd:"chat", msg:wkcmd}]));
				}
				//#debug log#
				console.log("socket:connect");
			}
			obNet.WS.onclose = function() { 
				obNet.__socket = 0;
				clearInterval(obNet.__wsbeet);
				//#debug log#
				console.log("socket:close");
				//Log
				Logprint({msg:"*通信が切断されました*", pno:Board.role, type:"system"});
			}
			obNet.WS.onmessage = function(arg) { 
				var argdata = JSON.parse(arg.data);
				var usermsg = argdata[0][2];
				if(typeof(usermsg.room) != undefined){
					if (usermsg.room == obNet.roomid){
						switch(usermsg.cmd){
						case "send":
							if(Number(usermsg.pno) != Board.role){
								if(obNet.__r_hash.indexOf(usermsg.hash) == -1 && obNet.__r_hash[0] == usermsg.lasthash){
									obNet.__r_cmd.push(usermsg.senddata);
									obNet.__r_hash.unshift(usermsg.hash);
									//#debug log#
									console.log("socket:["+usermsg.hash+"]speedy");
								}
							}
							break;
						case "ping":
							var pno = Number(usermsg.pno);
							if($T.inrange(pno, 1, 4) && pno == Board.role){
								//#debug log#
								console.log("socket:sended");
							}else{
								if(usermsg.hash == "0000" || obNet.__r_hash.indexOf(usermsg.hash) == -1){
									//データ取得用空更新
									obNet.send("");
								}
								//#debug log#
								console.log("socket:recv");
							}
							break;
						case "chat":
							var chatitem = usermsg.msg.split("{}");
							//Log
							if(obNet.__lastchat != chatitem[0]){
								obNet.__lastchat = chatitem[0];
								Logprint({msg:"<span class='n'>"+chatitem[0]+"</span>", type:"chat"});
							}
							Logprint({msg:chatitem[1], type:"chat"});
							break;
						}
					}
				}
			}
		}
	},
	//Ping > Pusher
	_pusher:function (){
		if(sessionStorage.Online == "Y"){
			//Pusher Object
			var pusher = new Pusher('127907cfeaaa3286125f');
			var channel = pusher.subscribe('ch' + obNet.roomid);
			//event
			channel.bind('my_event', function(data) {
				switch(data.cmd){
				case "ping":
					var pno = Number(data.pno);
					if($T.inrange(pno, 1, 4) && pno == Board.role){
						//#### Log ####
						console.log("pusher.sended");
					}else{
						//データ取得用空更新
						obNet.send("");
						//#### Log ####
						console.log("pusher.recv");
					}
					break;
				case "chat":
					var chatitem = data.msg.split("{}");
					//Log
					if(obNet.__lastchat != chatitem[0]){
						obNet.__lastchat = chatitem[0];
						Logprint({msg:"<span class='n'>"+chatitem[0]+"</span>", type:"chat"});
					}
					Logprint({msg:chatitem[1], type:"chat"});
					break;
				}
			});
			//online
			obNet.__socket = 2;
		}
	},
	//----- Web Workers -----
	xhr:function(arr){
		//var url = "/openboard/" + arr.cgi + '?' + arr.para;
		if($T.browser() == "chrome"){
			console.log("[xhr]"+arr.cgi+":"+arr.para);
			obNet.Worker.webkitPostMessage([arr.cgi, arr.para, arr.fnc]);
		}else{
			obNet.Worker.postMessage([arr.cgi, arr.para, arr.fnc]);
		}
	},
	onworker:function(event){
		//返却関数実行
		switch(event.data[1]){
		case "obNet._ongetlog":
			obNet._ongetlog(event.data[0]);
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
	send:function (i_cmd){
		var cmd, ping;
		if(i_cmd == ""){
			cmd = "";
		}else{
			ping = $T.rndstr(4);
			cmd = ping + ":" + i_cmd;
		}
		//受付時間(ms)
		obNet.__s_cmd.push(cmd);
	},
	_getlog:function (){
		var pars, sendcmd;
		var cmds = [];
		var lcmds = [];
		//コマンドあり、送信中なし、最終送信クリア
		if(obNet.__s_cmd.length > 0 && obNet.__status == 0){
			pars =  "ROOMID=" + obNet.roomid + "&LOGNO=" + obNet.logno;
			while(sendcmd = obNet.__s_cmd.shift()){
				if(sendcmd != ""){
					cmds.push(sendcmd);
					//### socketapi ###
					if(obNet.__socket == 1){
						obNet.WS.send(JSON.stringify([{room:obNet.roomid, cmd:"send", pno:Board.role, hash:sendcmd.substr(0, 4), lasthash:obNet.__r_hash[0], senddata:sendcmd}]));	
					}
					//Last Command
					if(!sendcmd.match(/^\w{4}:[0-9]:chat:/)){
						lcmds.push(sendcmd);
					}
					//#### Log ####
					console.log("send:" + sendcmd);
				}else{
					//#### Log ####
					console.log("send:(blank)");
				}
			}
			if(cmds.length > 0){
				pars += "&LOGCMD=" + cmds.join(",");
				//Last Command
				obNet.__l_cmd = lcmds.join(",");
			}
			//$.ajax({url:'perl/ocnet.cgi', data:pars, timeout:5000}).success(obNet._ongetlog).error(obNet._errgetlog);
			//Worker
			obNet.xhr({cgi:"perl/ocnet.cgi", para:pars, fnc:"obNet._ongetlog"});
			//データ取得中
			obNet.__status = 1;
		}
	},
	_ongetlog:function (recvstr){
		var recvcmd = recvstr.split(",");
		if (recvcmd[0] != "0"){
			//受信済みログNOチェック
			if(obNet.logno < Number(recvcmd[0])){
				obNet.logno = Number(recvcmd.shift());
				//最終送信確認
				if(obNet.__l_cmd != ""){
					//### socketapi ###
					if(obNet.__socket == 1){
						obNet.WS.send(JSON.stringify([{room:obNet.roomid, cmd:"ping", pno:Board.role, hash:obNet.__l_cmd.substr(0, 4)}]));	
					}
					//### Pusher ###
					if(obNet.__socket == 2){
						$.post("php/send.php", {room:'ch' + obNet.roomid, cmd:"ping", pno:Board.role, msg:""});	
					}
					//clear
					obNet.__l_cmd = "";
				}
			}
			for(var i=0; i<recvcmd.length; i++){
				recvcmd[i] = recvcmd[i].replace(/\n/g, '');
				var hash = recvcmd[i].substr(0, 4);
				if(hash == "0000" || obNet.__r_hash.indexOf(hash) == -1){
					obNet.__r_cmd.push(recvcmd[i]);
					obNet.__r_hash.unshift(hash);
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
		obNet.__status = 0;
	},
	_errgetlog:function (){
		//最終送信確認
		if(obNet.__l_cmd != ""){
			//再送！
			obNet.__s_cmd.unshift(obNet.__l_cmd);
		}
		//Log
		console.log("###ERROR### GetLogError");
		//ステータスクリア
		obNet.__status = 0;
	},
	//========[ LogPlayer ] ========
	_playlog:function (){
		if(obNet.__r_cmd.length > 0 && obNet.__replaycmd != "stop"){
			var runflg = 0;
			var wkstr = obNet.__r_cmd[0];
			var wkcmd = wkstr.split(":");
			var logping = wkcmd.shift();
			var logpno = Number(wkcmd.shift());
			var logcmd = wkcmd.shift();
			var logpara = wkcmd.join(":");
			var wkforcecmd = ['room','full','join','deck','ready','chat'];
			var wkinterrupt = ['item','shuffle'];
			//自分の発行したコマンド
			if(logpno == Board.role && wkforcecmd.indexOf(logcmd) == -1){
				runflg = 1;
			}else{
				switch(logcmd){
				case "room": //部屋情報
					runflg = 2;
					var mapinfo = logpara.split(":");
					Board.mapno = Number(mapinfo[0]);
					Board.target = Number(mapinfo[1]);
					Board.endround = Number(mapinfo[2]);
					Board.sudden = (mapinfo[9] == "Y") ? true : false;
					Chessclock.use = (mapinfo[4] == "Y") ? true : false;
					Board.playcnt = Number(mapinfo[5]);
					if(Board.playcnt < 4){
						for(var i=Board.playcnt + 1; i<=4; i++){
							mapinfo[3] = mapinfo[3].replace(i, "");
						}
					}
					Board.playorder = mapinfo[3];
					//Mode
					if(mapinfo[8] == "ALLIANCE" || mapinfo[8] == "ALLIANCER"){
						Board.alliance = true;
						Analytics.rankmode = "NONE";
					}else{
						Analytics.rankmode = mapinfo[8];
					}
					//Create Board
					createBoard();
					break;
				case "join": //プレイヤーid
					var role, order1, order2;
					runflg = 2;
					if(Board.joincnt < Board.playcnt){
						var pinfo = logpara.split(":");
						//参加者カウント
						Board.joincnt++;
						if(Board.alliance){
							if(["1","3"].indexOf(Board.playorder.substr(0, 1))){;
								order1 = Board.playorder.replace(/[24]/g, "");
								order2 = Board.playorder.replace(/[13]/g, "");
							}else{
								order1 = Board.playorder.replace(/[13]/g, "");
								order2 = Board.playorder.replace(/[24]/g, "");
							}
							switch(pinfo[4]){
							case "R":
								role = Number(Board.playorder.substr(Board.joincnt - 1, 1));
								break;
							case "A":
								Board.joincntA++;
								role = Number(order1.substr(Board.joincntA - 1, 1));
								break;
							case "B":
								Board.joincntB++;
								role = Number(order2.substr(Board.joincntB - 1, 1));
								break;
							}
						}else{
							role = Number(Board.playorder.substr(Board.joincnt - 1, 1));
						}
						Player[role].id = pinfo[0];
						Player[role].name = pinfo[1];
						Player[role].avatar = pinfo[2];
						Player[role].rate = Number(pinfo[3]);

						//参加者
						if($T.inarray(sessionStorage.Mode, ["join", "debug"])){
							//ロール check
							if(Board.role == 9 && pinfo[0] == sessionStorage.USERID){
								Board.role = role;
								//デッキリスト表示
								DeckList();
							}
							//全員参加
							if(Board.joincnt == Board.playcnt){
								//デッキ選択可能
								$("#button_deckok").removeAttr("disabled");
							}
						}
						//Log
						Logprint({msg:pinfo[1]+" 参加", type:"system"});

						//##### Debug #####
						if(sessionStorage.Mode == "debug"){
							//Player 2-4
							if(Board.playcnt >= 2){
								for(var i=2; i<=Board.playcnt; i++){
									//参加者カウントMAX
									Board.joincnt++;
									//Player セット
									var role = Number(Board.playorder.substr(Board.joincnt - 1, 1));
									var pinfo = logpara.split(":");
									Player[role].id = "CPU"+i;
									Player[role].name = "DEBUG"+i;
									Player[role].avatar = "piece1";
								}
							}
							//デッキ選択可能
							$("#button_deckok").removeAttr("disabled");
						}
					}
					break;
				case "deck":
					runflg = 1;
					var pars = "DECKCMD=DECK&PID="+logpno+"&DECKID="+logpara;
					//$.ajax({url:'perl/ocdeck.cgi', data:pars, timeout:5000}).success(onDeckRecv).error(function(){ alert("err:DevkRcv"); });
					//Worker
					obNet.xhr({cgi:"perl/ocdeck.cgi", para:pars, fnc:"onDeckRecv"});
					//deckid
					Player[logpno].deckid = logpara;
					//削除(Reload用)
					if(Board.role >= 1 && logpno == Board.role){
						$("#DIV_DECK").remove();
					}
					break;
				case "ready":
					if(Board.deckcnt == Board.playcnt){
						runflg = 2;
						//自分以外の初期手札セット
						if(logpno != Board.role){
							Player[logpno].deck = logpara;
							//初期手札
							for(var i=1; i<=4; i++){
								Drawcard({pno:logpno, from:"deck", nlog:true});
							}
						}
						//準備完了カウント
						Board.readycnt++;
						if (Board.readycnt == Board.playcnt){
							FlowSet("BOARD_START");
						}

						//##### Debug #####
						if(sessionStorage.Mode == "debug"){
							//自分以外の初期手札セット
							for(var ipno=1; ipno<=Board.playcnt; ipno++){
								if(ipno != Board.role){
									Player[ipno].deck = Player[Board.role].deck;
									//初期手札
									for(var i=1; i<=4; i++){
										Drawcard({pno:ipno, from:"deck", nlog:true});
									}
								}
							}
							//準備完了カウント
							FlowSet("BOARD_START");
						}
					}
					break;
				case "shuffle":
					//自分以外の次回デッキ
					if(logpno != Board.role){
						runflg = 1;
						Player[logpno].decknext.push(logpara);
					}
					break;
				case "draw":
					if(Board.step == 11){
						runflg = 1;
						//ドロー
						Draw2Hand();
					}
					break;
				case "discard":
					if($T.inarray(Board.step, [18, 28, 38, 58])){
						runflg = 1;
						//破棄
						Discard({pno:logpno, cno:logpara});
					}
					break;
				case "spell":
					if(Board.step == 20){
						runflg = 1;
						//スペル
						SpellRecv(1, logpno, logpara);
					}
					break;
				case "spellplus":
					if(Board.step == 25){
						runflg = 1;
						//セカンドターゲット
						SpellRecv(2, logpno, logpara);
					}
					break;
				case "spellback":
					if(Board.step == 26){
						runflg = 1;
						var dno = Number(logpara);
						//復帰
						SpellDeckBack({step:1, dno:dno});
					}
					break;
				case "dice":
					if($T.inarray(Board.step, [20, 30])){
						runflg = 1;
						var pow = Number(logpara);
						//ダイス
						DiceRollResult({pno:logpno, pow:pow});
					}
					break;
				case "move":
					if(Board.step == 32){
						runflg = 1;
						var gno = Number(logpara);
						//ダイス
						DicePieceMove(gno);
					}
					break;
				case "dicedraw":
					if(Board.step == 34){
						runflg = 1;
						//ダイス
						DiceStepDraw(logpara);
					}
					break;
				case "dicetele":
					if(Board.step == 36){
						runflg = 1;
						//ダイス
						DiceStepTeleport({step:1, gno:Number(logpara)})
					}
					break;
				case "summon":
				case "change":
					if(Board.step == 40){
						runflg = 1;
						//受信処理
						SummonRecv(logpno, logcmd, logpara);
					}
					break;
				case "territory":
					if(Board.step == 40){
						runflg = 1;
						//受信処理
						TerritoryRecv(logpno, logpara);
					}
					break;
				case "item":
					if(Board.step == 73){
						runflg = 1;
						//受信処理
						BattleRecv("item", logpno, logpara);
					}
					break;
				case "turn":
					if((Board.step >= 40 && Board.step <= 90 && Board.step % 10 == 0) || Board.round == 0){
						runflg = 1;
						//ターン終了
						TurnClose(0, logpno);
					}
					break;
				case "trans":
					if(Board.step == 92){
						runflg = 1;
						//トランス
						GridTrans(logpara);
					}
					break;
				case "chat":
					var chatitem = logpara.split("{}");
					//Log
					if(obNet.__lastchat != chatitem[0]){
						obNet.__lastchat = chatitem[0];
						Logprint({msg:"<span class='n'>"+chatitem[0]+"(xhr)</span>", type:"chat"});
					}
					Logprint({msg:chatitem[1], type:"chat"});
					runflg = 1;
					break;
				default:
					runflg = 1;
					break;
				}
			}
			//実行
			if(runflg >= 1){
				//【Log】
				console.log("p:"+logpno+"["+logcmd+":"+logpara+"]");
				var wkstr = obNet.__r_cmd.shift();
				if(runflg == 2){
					//再呼び出し
					obNet._playlog();
				}
			}else{
				//if(logpno != Board.turn && obNet.__r_cmd.length >= 2){
				//	var wkstr = obNet.__r_cmd.shift();
				//	obNet.__r_cmd.splice(1, 0, wkstr);
				//	//【Log】
				//	console.log("i:"+logpno+"["+logcmd+":"+logpara+"]");
				//}
			}
		}
	},
	skipchk:function(){
		switch(sessionStorage.Mode){
		case "gallery":
			//Gallery skip
			if(Board.round > 0 && obNet.__r_cmd.length > 5){
				return true;
			}
			break;
		case "replay":
			//switch
			if(obNet.__replaycmd == "skip"){
				return true;
			}
			break;
		}
		return false;
	},
	replaycmd:function(cmd){
		obNet.__replaycmd = cmd;
	}
}
