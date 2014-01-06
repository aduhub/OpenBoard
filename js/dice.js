var Dice = {};
Dice.Step = {};
Dice.Tool = {};
Dice.rest  = 0;
Dice.route = [];
Dice.teleport = [];
//########[ STEP ]########
//start
Dice.Step.start = function (){
	//自分のターン
	if(Board.turn == Board.role){
		if(Board.step == 20 || (Board.step == 30 && Player[Board.turn].dicepass == false)){
			//ステップ（移動開始）
			Flow.step(31);
			//PHASEENDBUTTON
			$("#BTN_Phaseend").html("-");
			//スクロール
			UI.Tool.scrollBoard(Player[Board.role].stand);
			//初期値
			var dicepow = Board.dice;
			var rollflg = true;
			var mvresult = true;
			//##### Enchant #####
			var encret = Enchant({time:"DICE_STEP"});
			if($T.search(encret, "act", "dice")){
				rollflg = false; //Not Random
				dicepow = $T.result.val;
			}
			if($T.search(encret, "act", "plus")){
				dicepow += $T.result.val;
			}
			if($T.search(encret, "act", "navigate")){
				var dice1 = (Math.floor(Math.random() * dicepow) + 1);
				var dice2 = (Math.floor(Math.random() * dicepow) + 1);
				var msgarr = ["どちらの結果を使用しますか？"];
				var btnarr = [["ダイス["+dice1+"]", "Dice.Step.roll({pow:"+dice1+", roll:false})"], ["ダイス["+dice2+"]", "Dice.Step.roll({pow:"+dice2+", roll:false})"]];
				//ダイアログ
				DispDialog({msgs:msgarr, btns:btnarr, dtype:"line2"});
				//中断
				mvresult = false;
			}
			if(mvresult){
                Dice.Step.roll({pow:dicepow, roll:rollflg});
			}
		}
	}
}
//roll {pow, roll} | {pno, pow}
Dice.Step.roll = function (arg){
	//自分のターン
	if(Board.turn == Board.role){
		//ダイアログ非表示
		DispDialog("none");
		//ロール
		Dice.route = [];
		Dice.rest = (arg.roll) ? Math.floor(Math.random() * arg.pow) + 1 : arg.pow;
		//コマンド送信
		var wkcmd = "dice:"+Dice.rest;
		Net.send(wkcmd);
	}else{
		//ステップ（移動開始）
		Flow.step(31);
		//スクロール
		UI.Tool.scrollBoard(Player[arg.pno].stand);
		//ロール
		Dice.rest = arg.pow;
		Dice.route = [];
	}
	//表示
	$("#DIV_DICE").html(Dice.rest);
	UI.Html.setDiv({id:"DIV_DICE", visible:true, zidx:21});
	//ログ
	Logprint({msg:"ダイス <span class='d'>"+Dice.rest+"</span>", pno:Board.turn});
	//移動
	setTimeout(function(){Dice.Step.move(0);}, 500);
}
//rollskip
Dice.Step.rollskip = function (){
	if(Board.step == 30){
		//ステップ（移動開始）
		Flow.step(31);
		if(Board.turn == Board.role){
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("-");
		}
		//スクロール
		UI.Tool.scrollBoard(Player[Board.turn].stand);
		//ロール
		Dice.route = [];
		Dice.rest = 0;
		//ルート記憶
		Dice.route.push(Player[Board.turn].stand);
		//地形チェック
		var stand = Player[Board.turn].stand;
		if(Dice.Tool.chkCastle() == false){
            Dice.Step.next();
		}
	}
}
//move
Dice.Step.move = function (i_mvto){
	//Dice 残りアリ
	if (Dice.rest >= 1){
		var nextgno = 0;
		//表示
		$("#DIV_DICE").html(Dice.rest);
		//コマ最前面
		$("#DIV_PLAYER"+Board.turn).css({zIndex:140});
		//現在情報
		var standNow = Player[Board.turn].stand;
		var shadoNow = Player[Board.turn].shadow;
		//番号指定無し
		if(i_mvto == 0){
			//分岐なし
			if(Board.grid[standNow].link3 == 0){
				if(Board.grid[standNow].link2 == 0){
					nextgno = Board.grid[standNow].link1;
				}else{
					//影あり
					if(standNow != shadoNow){
						if(shadoNow != 0){
							if(Board.grid[standNow].link1 == shadoNow){
								nextgno = Board.grid[standNow].link2;
							}else if(Board.grid[standNow].link2 == shadoNow){
								nextgno = Board.grid[standNow].link1;
							}
						}
					}
				}
			}
		}else{
			//分岐あり または 立＝影
			if(Board.grid[standNow].link3 > 0 || standNow == shadoNow || (Board.grid[standNow].link1 != shadoNow && Board.grid[standNow].link2 != shadoNow)){
				if(i_mvto != shadoNow && $T.inarray(i_mvto, Board.grid[standNow].linkarr)){
					nextgno = i_mvto;
					if(Board.turn == Board.role){
						//クリア
						Grid.light({clear:true});
						//コマンド送信
						var wkcmd = "move:"+nextgno;
						Net.send(wkcmd);
					}
				}
			}
		}
		//[ 正常移動 ]
		if(nextgno >= 1){
			var waitsec = (Frame.skipchk()) ? 50 : 150;
			var msec = (Frame.skipchk()) ? 30 : 140;
			//ステップ
			Flow.step(31);
			//歩数残--
			Dice.rest--;
			//セット
			Player[Board.turn].shadow = standNow;
			Player[Board.turn].stand = nextgno;
			Player[Board.turn].foot += 1;
			if(Board.turn == Board.role){
				//ルート記憶
				Dice.route.push(Player[Board.turn].stand);
			}
			//表示
			$("#DIV_DICE").html(Dice.rest);
			//Animation & ImageChange
			EffectBox({pattern:"piecemove", pno:Board.turn, gno:nextgno, msec:msec});

			//##### GridAbi #####
			GridAbility({pno:Board.turn, gno:nextgno, time:"DICE_PASS_THROUGH"});
			//##### Enchant #####
			Enchant({pno:Board.turn, gno:nextgno, time:"DICE_PASS_THROUGH"});
			//Bridge
			if(Dice.Tool.chkBridge()){
				waitsec += (Frame.skipchk()) ? 50 : 500;
			}
			//ForceGate
			if(Dice.Tool.chkGate(waitsec)){
				waitsec += (Frame.skipchk()) ? 50 : 500;
			}
			//Timeout Next
			setTimeout(function(){
				if(Dice.Tool.chkCastle() == false){
                    Dice.Step.nextDice.Step.next();
                }
			}, waitsec);
		}else{
			//ステップ
			Flow.step(32);
			//スクロール
			UI.Tool.scrollBoard(Player[Board.turn].stand);
			if(Board.turn == Board.role){
				//現在情報
				var standNow = Player[Board.turn].stand;
				var shadoNow = Player[Board.turn].shadow;
				var gnoarr = [];
				for(var i=0; i<Board.grid[standNow].linkarr.length; i++){
					if(Board.grid[standNow].linkarr[i] > 0 && shadoNow != Board.grid[standNow].linkarr[i]){
						gnoarr.push(Board.grid[standNow].linkarr[i]);
					}
				}
				//ライト
				Grid.light({arr:gnoarr});
				//ChessClock
				$("#DIV_GCLICK"+gnoarr[0]).addClass(Chessclock.set(32, "mousedown"));
			}
		}
	}
}
//next
Dice.Step.next = function (){
    var standNow = Player[Board.turn].stand;
    var shadwNow = Player[Board.turn].shadow;
    var msec = (Frame.skipchk()) ? 50 : 500;
    //Dice Step End
    if(Dice.rest == 0){
        if(Board.grid[standNow].color == 21){
            //### 転送円 ###
            if(Board.grid[shadwNow].color != 24){
                var mvto = Number(Board.grid[standNow].linkx);
                Player[Board.turn].shadow = mvto;
                Player[Board.turn].stand = mvto;
                if(Board.turn == Board.role){
                    //ルート記憶
                    Dice.route.push(Player[Board.turn].stand);
                }
                //Animation & ImageChange
                EffectBox({pattern:"piecemove", pno:Board.turn, gno:mvto, msec:msec});
                //現在地
                standNow = mvto;
                shadwNow = mvto;
            }
        }else if(Board.grid[standNow].color == 24){
            //### 転送門 ###
            if(standNow == shadwNow){
                var mvto = Number(Board.grid[standNow].linkx);
                Player[Board.turn].shadow = standNow;
                Player[Board.turn].stand = mvto;
                if(Board.turn == Board.role){
                    //ルート記憶
                    Dice.route.push(Player[Board.turn].stand);
                }
                //Animation & ImageChange
                EffectBox({pattern:"piecemove", pno:Board.turn, gno:mvto, msec:msec});
            }
        }
        //祭壇
        if(Board.grid[standNow].color == 23){
            //ドロー
            Dice.Step.draw();
            //中断
            return;
        }
        //### GridAbility ###
        var abiret = GridAbility({time:"DICE_REST_OVER", gno:Player[Board.turn].stand});
        for(var i2=0; i2<abiret.length; i2++){
            switch(abiret[i2].act){
                case "teleport":
                    Dice.Step.teleport({step:0, tgt:abiret[i2].val});
                    //中断
                    return;
                    break;
            }
        }
        //移動終了
        Dice.Step.end();
    }else{
        //表示次へ
        $("#DIV_DICE").html(Dice.rest);
        Dice.Step.move(0);
    }
}
//end
Dice.Step.end = function (){
    //ステップ（移動終了）
	Flow.step(40);
	UI.Html.setDiv({id:"DIV_DICE", hidden:true});
    //ZIndex
	UI.Html.sortZindex("player");
    //スクロール
	UI.Tool.scrollBoard(Player[Board.turn].stand);
    //ターンプレイヤー
    if(Board.turn == Board.role){
        //領地指示可能カウント
        var wkarr = new Array();
        if($T.inarray(Board.grid[Player[Board.role].stand].color, [10,11,12,13,14]) || Player[Board.role].status == "_TELEGNOSIS_"){
            for(var i=1; i<Board.grid.length; i++){
                if(Flow.Tool.team(Board.grid[i].owner) == Flow.Tool.team(Board.turn)){
                    wkarr.push(i);
                }
            }
        }else{
            for(var i=0; i<Dice.route.length; i++){
                if(Flow.Tool.team(Board.grid[Dice.route[i]].owner) == Flow.Tool.team(Board.turn)){
                    wkarr.push(Dice.route[i]);
                }
            }
            //TELEPATHY CHECK
            for(var igno=1; igno<Board.grid.length; igno++){
                if(Flow.Tool.team(Board.grid[igno].owner) == Flow.Tool.team(Board.turn) && Board.grid[igno].status == "_TELEPATHY_"){
                    wkarr.push(igno);
                }
            }
        }
        //Territory Set
        Territory.target = wkarr;
        //通過点ライト
        if(wkarr.length >= 1){
            Grid.light({arr:wkarr, save:true});
        }
        //
	    Summon.Step.start(Player[Board.role].stand);

        //PHASEENDBUTTON
        $("#BTN_PhaseEnd").html("ターンエンド");
        //timer
        $("#BTN_PhaseEnd").addClass(Chessclock.set(40));
    }
}
//teleport
Dice.Step.teleport = function (arg){
    var msec = (Frame.skipchk()) ? 50 : 500;
    switch(arg.step){
        case 0:
            //ステップ
	        Flow.step(36);
            if(Board.role == Board.turn){
                Dice.teleport = arg.tgt;
                //ライト
                Grid.light({arr:arg.tgt});

                //Dialog
                DispDialog({msgs:["テレポート先を選択してください"], dtype:"ok"});
            }
            break;
        case 1:
            //Role Player
            if(Board.turn == Board.role){
                //ライト
                Grid.light({clear:true});
                //コマンド送信
                var wkcmd = "dicetele:"+arg.gno;
                //送信
                Net.send(wkcmd);
            }
            Player[Board.turn].shadow = arg.gno;
            Player[Board.turn].stand = arg.gno;
            if(Board.turn == Board.role){
                //ルート記憶
                Dice.route.push(arg.gno);
            }
            //Animation & ImageChange
            EffectBox({pattern:"piecemove", pno:Board.turn, gno:arg.gno, msec:msec});
            //Log
            Logprint({msg:Player[Board.turn].name+"はテレポートした", pno:Board.turn});
            //移動終了
            Dice.Step.end();
            break;
    }
}
//plus draw
Dice.Step.draw = function (){
    if(arguments.length == 0){
        //ステップ
	    Flow.step(34);
        if(Board.role == Board.turn){
            var typeflg = {C:0, I:0, S:0};
            var Plyr = Player[Board.turn];
            for(var i=1; i<=Plyr.DeckCount(); i++){
                if(typeflg[Card[Plyr.DeckCard(i)].type] == 0){
                    typeflg[Card[Plyr.DeckCard(i)].type] = i;
                }
            }
            var mstarr = ["デッキから引くカードを選択してください"];
            var btnarr = [];
            if(typeflg["C"] >= 1){
                btnarr.push(["クリーチャー", "Dice.Step.draw("+typeflg["C"]+")"]);
            }else{
                btnarr.push(["クリーチャー", ""]);
            }
            if(typeflg["I"] >= 1){
                btnarr.push(["アイテム", "Dice.Step.draw("+typeflg["I"]+")"]);
            }else{
                btnarr.push(["アイテム", ""]);
            }
            if(typeflg["S"] >= 1){
                btnarr.push(["スペル", "Dice.Step.draw("+typeflg["S"]+")"]);
            }else{
                btnarr.push(["スペル", ""]);
            }
            //ダイアログ
            DispDialog({msgs:mstarr, btns:btnarr});
        }
    }else{
        var arg = arguments;
        //Role Player
        if(Board.turn == Board.role){
            //ダイアログ非表示
            DispDialog("none");
            //コマンド送信
            var wkcmd = "dicedraw:"+arg[0];
            //送信
            Net.send(wkcmd);
        }
        //Animation
        EffectBox({pattern:"fortpuff", img:"gicon_alt", pno:Board.turn});
        //手札追加
	    Deck.Tool.draw({pno:Board.turn, from:"dno", dno:arg[0]});
        //Role Player
        if(Board.turn == Board.role){
	        Deck.Tool.sorthand();
        }
        Dice.Step.end();
    }
}
//########[ TOOL ]########
//橋チェック
Dice.Tool.chkBridge = function (arg){
	var ret = false;
	var msec = (Frame.skipchk()) ? 50 : 300;
	//Cross Road
	if(Board.grid[Player[Board.turn].stand].color == 22){
		var stdgrid, arrowno, mvgno;
		var dirlinks = [0,0,0,0,0]; 
		var revdirno = [0,3,4,1,2];
		//現在情報
		var standNow = Player[Board.turn].stand;
		var shadoNow = Player[Board.turn].shadow;
		//分岐なし、影あり
		if(standNow != shadoNow && shadoNow != 0){
			for(var i=0; i<=3; i++){
				arrowno = Number(Board.grid[standNow].arrow.substr(i, 1));
				dirlinks[arrowno] = Board.grid[standNow].linkarr[i];
			}
			Player[Board.turn].shadow = standNow;
			Player[Board.turn].stand = dirlinks[revdirno[dirlinks.indexOf(shadoNow)]];
			mvgno = Player[Board.turn].stand;
			if(Board.turn == Board.role){
				//ルート記憶
				Dice.route.push(Player[Board.turn].stand);
			}
			//Animation & ImageChange
			EffectBox({pattern:"piecemove", pno:Board.turn, gno:mvgno, msec:msec});
			
			//##### GridAbi #####
			GridAbility({pno:Board.turn, gno:mvgno, time:"DICE_PASS_THROUGH"});
			//##### Enchant #####
			Enchant({pno:Board.turn, gno:mvgno, time:"DICE_PASS_THROUGH"});
			//
			ret = true;
		}
	}
	return ret;
}
//強制転送チェック
Dice.Tool.chkGate = function (waitsec){
	var ret = false;
	var msec = (Frame.skipchk()) ? 50 : 300;
	//Cross Road
	if(Board.grid[Player[Board.turn].stand].color == 24){
		//現在情報
		var standNow = Player[Board.turn].stand;
		var mvto = Number(Board.grid[standNow].linkx);
		Player[Board.turn].shadow = standNow;
		Player[Board.turn].stand = mvto;
		if(Board.turn == Board.role){
			//ルート記憶
			Dice.route.push(Player[Board.turn].stand);
		}
		//Animation & ImageChange
		setTimeout(function(){EffectBox({pattern:"piecemove", pno:Board.turn, gno:mvto, msec:msec})}, waitsec);
		//Scroll
		UI.Tool.scrollBoard(Player[Board.turn].stand);
		//
		ret = true;
	}
	return ret;
}
//通過チェック(color)
Dice.Tool.chkCastle = function (){
	var retcode = false;
	var flg = {spellflg:false}
	var color = Board.grid[Player[Board.turn].stand].color;
	if(color >= 10 && color <= 14){
		var imgsrc = "";
		var nswe = {11:'n',12:'s',13:'w',14:'e'};

		//Enchant
		var encflg = Enchant({pno:Board.turn, time:"DICE_CASTLECHECK"});
		for(var i in encflg){
			if(encflg[i] == "forgery"){
				flg.spellflg = true;
			}
		}

		if(color == 10){
			//###### castle ######
			//砦規定数通過
			if(flg.spellflg || Player[Board.turn].flag.length == Board.flag.length){
				var msgarr = [];
				//周回回復
				for(var i=1; i<Board.grid.length; i++){
					if(Board.grid[i].owner == Board.turn){
						//20% plus
						Board.grid[i].lf += Board.grid[i].maxlf * 0.2;
						Board.grid[i].lf = Math.min(Board.grid[i].maxlf, Board.grid[i].lf)
					}
				}
				//メダル
				if(!flg.spellflg && Player[Board.turn].medal <= 2){
					Player[Board.turn].medal += 1;
					msgarr.push("メダルを獲得");
				}
				//周回BONUS
				var abiret;
				var nightmare = [];
				var bonus1p = 0;
				for(var i=1; i<Board.grid.length; i++){
					//##### GridAbi #####
					abiret = GridAbility({time:"CASTLE_BONUS", gno:i, pno:Board.turn, nightmare:nightmare});
					for(var i2 in abiret){
						switch(abiret[i2].act){
						case "bonus":
							bonus1p += abiret[i2].val;
							break;
						case "nightmare":
							nightmare = nightmare.concat(abiret[i2].arr);
							break;
						}
					}
				}
				var bonus1 = Grid.count({owner:Board.turn}) * 20 + bonus1p;
				var bonus2 = Board.bonus + (Player[Board.turn].medal * 100);
				var bonus9 = bonus1 + bonus2;
				Player[Board.turn].gold += bonus9;
				Player[Board.turn].lap ++;
				Player[Board.turn].flag = "";
				//Icon
				$("#DIV_PLAYER"+Board.turn).css("backgroundPosition", "0px 0px, 128px 0px, 128px 0px");
				//Log
				msgarr.push("【 " + Player[Board.turn].lap + " 周目ボーナス】");
				msgarr.push("周回ボーナス <span class='g'>" + bonus2 + "G</span>");
				msgarr.push("領地ボーナス <span class='g'>" + bonus1 + "G</span>");
				msgarr.push("ボーナス合計 <span class='g'>" + bonus9 + "G</span>");
				msgarr.push("クリーチャー20%回復");
				Logprint({msg:msgarr, pno:Board.turn, ltype:"block"});
				//Light
				Grid.fortlight();
				//Scroll
				UI.Tool.scrollBoard(Player[Board.turn].stand);
				//Animation
				EffectBox({pattern:"fortpuff", img:"gicon_cas", pno:Board.turn});
				EffectBox({pattern:"msgpop",gno:Player[Board.turn].stand, msg:bonus9+"G", color:"#ffcc00", player:true});
				//処理有
				retcode = true;
			}
			//目標達成チェック
			if(Board.target <= TotalGold(Board.turn)){
				//ステップ（終了）
				Flow.step(100);
				//Icon
				$("#DIV_PLAYER"+Board.turn).css("backgroundPosition", "0px 0px, 128px 0px, 128px 0px");
				UI.Html.setDiv({id:"DIV_DICE", hidden:true});
				PopBigMsg("目標達成", 9);
				//処理有
				retcode = true;
			}else{
				if(retcode){
					//次の移動
					setTimeout(function(){
						//imgsrc
						SetPlayerImg(Board.turn);
						//next
						DiceNextMove();
					}, 1500);
				}
			}
		}else{
			//###### fort ######
			//今回通過
			if(!flg.spellflg && Player[Board.turn].flag.indexOf(nswe[color]) < 0){
				//Log
				Logprint({msg:["砦　ボーナス <span class='g'>" + Board.bonus_f + "G</span>"], pno:Board.turn, ltype:"block"});
				Player[Board.turn].gold += Board.bonus_f;
				Player[Board.turn].flag += nswe[color];
				imgsrc = "gicon_" + nswe[color];
				//Light
				Grid.fortlight();
				//Scroll
				UI.Tool.scrollBoard(Player[Board.turn].stand);
				//Animation
				EffectBox({pattern:"fortpuff", img:imgsrc, pno:Board.turn});
				//msgpop
				EffectBox({pattern:"msgpop",gno:Player[Board.turn].stand, msg:Board.bonus_f+"G", color:"#ffcc00", player:true});
				//次の移動
				setTimeout(function(){DiceNextMove();}, 400);
				//処理有
				retcode = true;
			}
		}
		//再表示
		DispPlayer();
	}
	return retcode;
}
