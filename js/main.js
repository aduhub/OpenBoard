var Frame = {
	//【プロパティ】
	loopid:0,
	cmdstack:[],
    _replaycmd:"",
	lastchatter:"",
	//【メソッド】
	//初期処理
	init:function (){
		//main
		Frame.loopid = setTimeout(Frame._main, 5000);
	},
	//
	startset:function(){
		//join 
		switch(sessionStorage.Mode){
		case "join":
            Net.ping();
			break;
		case "gallery":
			wkcmd = "system{}*観戦者が増えました*";
			break;
		}
	},
	//
	stack:function(message){
		switch(message["cmd"]){
		case "send":
    		Frame.cmdstack.push(message);
			break;
        case "ping":
            Net.getCGI();
            break;
		case "chat":
			var chatitem = message.msg.split("{}");
			//Log
			if(Frame.lastchatter != chatitem[0]){
				Frame.lastchatter = chatitem[0];
				Logprint({msg:"<span class='n'>"+chatitem[0]+"</span>", ltype:"chat"});
			}
			Logprint({msg:chatitem[1], ltype:"chat"});
			break;
		}
	},
	//基本ループ
	_main:function (){
		//[Log Play]
		Frame._playlog();
		//TimeKeep
		Chessclock.main();
		//Loop(10fps)
		Frame.loopid = setTimeout(Frame._main, 100);
	},
	//========[ LogPlayer ] ========
	_playlog:function (){
		if(Frame.cmdstack.length > 0){
			var runflg = 0;
			var cmditem = Frame.cmdstack[0];
			var cmddata = cmditem.plog.split(":");
			var logpno = Number(cmditem.pno);
			var logcmd = cmddata.shift();
			var logpara = cmddata.join(":");
			//自分の発行したコマンド
			if(logpno == Board.role && ['room','full','join','ready','chat'].indexOf(logcmd) == -1){
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
					Game.setupBoard();
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
                                //Board.roleセット
								Board.role = role;
								//デッキリスト表示
								Deck.Tool.decklist();
                                //ping
                                Net.ping();
							}
							//全員参加
							if(Board.joincnt == Board.playcnt){
								//デッキ選択可能
								$("#button_deckok").removeAttr("disabled");
							}
						}
						//Log
						Logprint({msg:pinfo[1]+" 参加", ltype:"system"});
						//## PeerJS ##
						if(pinfo[0] != sessionStorage.USERID){
							//PEERJS Connect
							Net.peerjs_conn(pinfo[0]);
						}
					}
					break;
				case "deck":
					runflg = 2;
					var deckinfo = logpara.split(":");
					//Deck情報
					Player[logpno].deckid = deckinfo.shift();
					Player[logpno].deckname = deckinfo.shift();
					//Deck数
					Board.deckcnt += 1;
					//プレイヤーデータセット
					if(Board.playcnt == Board.deckcnt){
						Game.setupPlayer();
					}
					break;
				case "ready":
					if(Board.deckcnt == Board.playcnt){
						runflg = 2;
						//自分以外の初期手札セット
						if(logpno != Board.role){
							Player[logpno].deck = logpara;
							//初期手札
							for(var i=1; i<=5; i++){
								Deck.Tool.draw({pno:logpno, from:"deck", nlog:true});
							}
						}
						//準備完了カウント
						Board.readycnt++;
						if (Board.readycnt == Board.playcnt){
							Flow.set("BOARD_START");
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
						Draw.Step.hand();
					}
					break;
				case "discard":
					if(Board.step == 98){
						runflg = 1;
						//破棄
						Deck.Tool.discard({pno:logpno, cno:logpara});
					}
					break;
				case "spell":
					if(Board.step == 20){
						runflg = 1;
						//スペル
						Spell.Step.recv({cmd:logpara});
					}
					break;
				case "spellplus":
					if(Board.step == 25){
						runflg = 1;
						//セカンドターゲット
						Spell.Step.recv({cmd:logpara, plus:true});
					}
					break;
				case "spellback":
					if(Board.step == 26){
						runflg = 1;
						var dno = Number(logpara);
						//復帰
						Spell.Tool.deckback({step:1, dno:dno});
					}
					break;
				case "dice":
					if($T.inarray(Board.step, [20, 30])){
						runflg = 1;
						var pow = Number(logpara);
						//ダイス
                        Dice.Step.roll({pno:logpno, pow:pow});
					}
					break;
				case "move":
					if(Board.step == 32){
						runflg = 1;
						var gno = Number(logpara);
						//ダイス
                        Dice.Step.move(gno);
					}
					break;
				case "dicedraw":
					if(Board.step == 34){
						runflg = 1;
						//ダイス
                        Dice.Step.draw(logpara);
					}
					break;
				case "dicetele":
					if(Board.step == 36){
						runflg = 1;
						//ダイス
                        Dice.Step.teleport({step:1, gno:Number(logpara)})
					}
					break;
				case "summon":
				case "change":
					if(Board.step == 40){
						runflg = 1;
						//受信処理
						Summon.Step.recv(logpno, logcmd, logpara);
					}
					break;
				case "territory":
					if(Board.step == 40){
						runflg = 1;
						//受信処理
						Territory.Step.recv(logpno, logpara);
					}
					break;
				case "item":
					if(Board.step == 73){
						runflg = 1;
						//受信処理
						Battle.Recv("item", logpno, logpara);
					}
					break;
				case "turn":
					if((Board.step >= 40 && Board.step <= 90 && Board.step % 10 == 0) || Board.round == 0){
						runflg = 1;
						//ターン終了
						Flow.Step.endphase(0, logpno);
					}
					break;
				case "trans":
					if(Board.step == 92){
						runflg = 1;
						//トランス
						Grid.trans(logpara);
					}
					break;
				default:
					runflg = 1;
					break;
				}
			}

			//実行
			if(runflg >= 1){
				//【Log】
				console.log("[play_1]"+logpno+":"+logcmd+":"+logpara);
				var wkstr = Frame.cmdstack.shift();
				if(runflg == 2){
					//再呼び出し
					Frame._playlog();
				}
			}else{
				//console
				console.log("[play_0]"+logpno+":"+logcmd+":"+logpara);
			}
		}
	},
	skipchk:function(){
		switch(sessionStorage.Mode){
		case "gallery":
			//Gallery skip
			if(Board.round > 0 && Frame.cmdstack.length > 5){
				return true;
			}
			break;
		case "replay":
			//switch
			if(Frame._replaycmd == "skip"){
				return true;
			}
			break;
		}
		return false;
	},
	replaycmd:function(cmd){
		Frame._replaycmd = cmd;
	}
}
