//===================================
// filename : dice.js
// update   : 2007-01-12 adu
//===================================
//########[ ROLL ]########
function DiceRoll(){
	//自分のターン
	if(Board.turn == Board.role){
		if(Board.step == 20 || (Board.step == 30 && Player[Board.turn].dicepass == false)){
			//ステップ（移動開始）
			StepSet(31);
			//hand
			Canvas.clear({id:"CVS_HAND7"});
			//スクロール
			BoardScroll(Player[Board.role].stand);
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
				var btnarr = [["ダイス["+dice1+"]", "DiceRollResult({pow:"+dice1+", roll:false})"], ["ダイス["+dice2+"]", "DiceRollResult({pow:"+dice2+", roll:false})"]];
				//ダイアログ
				DispDialog({msgs:msgarr, btns:btnarr, type:"line2"});
				//中断
				mvresult = false;
			}
			if(mvresult){
				DiceRollResult({pow:dicepow, roll:rollflg});
			}
		}
	}
}
//ダイスロール {pow, roll} | {pno, pow}
function DiceRollResult(arg){
	//自分のターン
	if(Board.turn == Board.role){
		//ダイアログ非表示
		DispDialog("none");
		//ロール
		Dice.pno = Board.role;
		Dice.route = [];
		Dice.Roll(arg.pow, arg.roll);
		//コマンド送信
		var wkcmd = "dice:"+Dice.rest;
		Net.send(wkcmd);
	}else{
		//ステップ（移動開始）
		StepSet(31);
		//スクロール
		BoardScroll(Player[arg.pno].stand);
		//ロール
		Dice.pno = arg.pno;
		Dice.rest = arg.pow;
		Dice.route = [];
	}
	//表示
	$("#DIV_DICE").html(Dice.rest);
	DisplaySet("DIV_DICE", 21);
	//ログ
	Logprint({msg:"ダイス <span class='d'>"+Dice.rest+"</span>", pno:Dice.pno});
	//移動
	setTimeout(function(){DicePieceMove(0);}, 500);
}
//############# No Dice ###############
function NoDiceRoll(){
	if(Board.step == 30){
		//ステップ（移動開始）
		StepSet(31);
		if(Board.turn == Board.role){
			//hand
			Canvas.clear({id:"CVS_HAND7"});
		}
		//スクロール
		BoardScroll(Player[Board.turn].stand);
		//ロール
		Dice.pno = Board.turn;
		Dice.route = [];
		Dice.rest = 0;
		//ルート記憶
		Dice.route.push(Player[Dice.pno].stand);
		//地形チェック
		var stand = Player[Dice.pno].stand;
		if(CastleCheck() == false){
			DiceNextMove();
		}
	}
}
//########[ Move Section ]########
function DicePieceMove(i_mvto){
	//Dice 残りアリ
	if (Dice.rest >= 1){
		var nextgno = 0;
		//表示
		$("#DIV_DICE").html(Dice.rest);
		//コマ最前面
		$("#DIV_PLAYER"+Dice.pno).css({zIndex:140});
		//現在情報
		var standNow = Player[Dice.pno].stand;
		var shadoNow = Player[Dice.pno].shadow;
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
						GridLight("clear");
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
			StepSet(31);
			//歩数残--
			Dice.rest--;
			//セット
			Player[Dice.pno].shadow = standNow;
			Player[Dice.pno].stand = nextgno;
			Player[Dice.pno].foot += 1;
			if(Dice.pno == Board.role){
				//ルート記憶
				Dice.route.push(Player[Dice.pno].stand);
			}
			//表示
			$("#DIV_DICE").html(Dice.rest);
			//Animation & ImageChange
			EffectBox({pattern:"piecemove", pno:Dice.pno, gno:nextgno, msec:msec});

			//##### GridAbi #####
			GridAbility({pno:Dice.pno, gno:nextgno, time:"DICE_PASS_THROUGH"});
			//##### Enchant #####
			Enchant({pno:Dice.pno, gno:nextgno, time:"DICE_PASS_THROUGH"});
			//Bridge
			if(BridgeCheck()){
				waitsec += (Frame.skipchk()) ? 50 : 500;
			}
			//ForceGate
			if(ForceGateCheck(waitsec)){
				waitsec += (Frame.skipchk()) ? 50 : 500;
			}
			//Timeout Next
			setTimeout(function(){
				if(CastleCheck() == false){DiceNextMove();}
			}, waitsec);
		}else{
			//ステップ
			StepSet(32);
			//スクロール
			BoardScroll(Player[Dice.pno].stand);
			if(Dice.pno == Board.role){
				//現在情報
				var standNow = Player[Dice.pno].stand;
				var shadoNow = Player[Dice.pno].shadow;
				var gnoarr = [];
				for(var i=0; i<Board.grid[standNow].linkarr.length; i++){
					if(Board.grid[standNow].linkarr[i] > 0 && shadoNow != Board.grid[standNow].linkarr[i]){
						gnoarr.push(Board.grid[standNow].linkarr[i]);
					}
				}
				//ライト
				GridLight("set_nosave", gnoarr);
				//ChessClock
				$("#DIV_GCLICK"+gnoarr[0]).addClass(Chessclock.set(32, "mousedown"));
			}
		}
	}
}
//橋チェック
function BridgeCheck(arg){
	var ret = false;
	var msec = (Frame.skipchk()) ? 50 : 300;
	//Cross Road
	if(Board.grid[Player[Dice.pno].stand].color == 22){
		var stdgrid, arrowno, mvgno;
		var dirlinks = [0,0,0,0,0]; 
		var revdirno = [0,3,4,1,2];
		//現在情報
		var standNow = Player[Dice.pno].stand;
		var shadoNow = Player[Dice.pno].shadow;
		//分岐なし、影あり
		if(standNow != shadoNow && shadoNow != 0){
			for(var i=0; i<=3; i++){
				arrowno = Number(Board.grid[standNow].arrow.substr(i, 1));
				dirlinks[arrowno] = Board.grid[standNow].linkarr[i];
			}
			Player[Dice.pno].shadow = standNow;
			Player[Dice.pno].stand = dirlinks[revdirno[dirlinks.indexOf(shadoNow)]];
			mvgno = Player[Dice.pno].stand;
			if(Dice.pno == Board.role){
				//ルート記憶
				Dice.route.push(Player[Dice.pno].stand);
			}
			//Animation & ImageChange
			EffectBox({pattern:"piecemove", pno:Dice.pno, gno:mvgno, msec:msec});
			
			//##### GridAbi #####
			GridAbility({pno:Dice.pno, gno:mvgno, time:"DICE_PASS_THROUGH"});
			//##### Enchant #####
			Enchant({pno:Dice.pno, gno:mvgno, time:"DICE_PASS_THROUGH"});
			//
			ret = true;
		}
	}
	return ret;
}
//強制転送チェック
function ForceGateCheck(waitsec){
	var ret = false;
	var msec = (Frame.skipchk()) ? 50 : 300;
	//Cross Road
	if(Board.grid[Player[Dice.pno].stand].color == 24){
		//現在情報
		var standNow = Player[Dice.pno].stand;
		var mvto = Number(Board.grid[standNow].linkx);
		Player[Dice.pno].shadow = standNow;
		Player[Dice.pno].stand = mvto;
		if(Dice.pno == Board.role){
			//ルート記憶
			Dice.route.push(Player[Dice.pno].stand);
		}
		//Animation & ImageChange
		setTimeout(function(){EffectBox({pattern:"piecemove", pno:Dice.pno, gno:mvto, msec:msec})}, waitsec);
		//Scroll
		BoardScroll(Player[Dice.pno].stand);
		//
		ret = true;
	}
	return ret;
}
//通過チェック(color)
function CastleCheck(){
	var retcode = false;
	var color = Board.grid[Player[Dice.pno].stand].color;
	if(color >= 10 && color <= 14){
		var imgsrc = "";
		var nswe = {11:'n',12:'s',13:'w',14:'e'};
		//######## Enchant ########
		var encflg = Enchant({pno:Dice.pno, time:"DICE_CASTLECHECK"});
		if(color == 10){
			//###### castle ######
			//砦規定数通過
			if(encflg[0] == "forgery" || Player[Dice.pno].flag.length == Board.flag.length){
				//周回回復
				for(var i=1; i<Board.grid.length; i++){
					if(Board.grid[i].owner == Dice.pno){
						//20% plus
						Board.grid[i].lf += Board.grid[i].maxlf * 0.2;
						if(Board.grid[i].lf >= Board.grid[i].maxlf){
							Board.grid[i].lf = Board.grid[i].maxlf;
						}
					}
				}
				//周回BONUS
				var abiret;
				var nightmare = [];
				var bonus1p = 0;
				for(var i=1; i<Board.grid.length; i++){
					//##### GridAbi #####
					abiret = GridAbility({time:"CASTLE_BONUS", gno:i, pno:Dice.pno, nightmare:nightmare});
					for(var i2=0; i2<abiret.length; i2++){
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
				var bonus1 = GridCount(Dice.pno) * 20 + bonus1p;
				//var bonus2 = Board.bonus + ((Board.bonus / 10) * (Player[Dice.pno].lap - 1));
				var bonus2 = Board.bonus;
				if(encflg[0] == "forgery"){
					bonus2 = Math.floor(bonus2 * encflg[1] / 100);
				}
				var bonus3 = Player[Dice.pno].foot;
				var bonus9 = bonus1 + bonus2 + bonus3;
				Player[Dice.pno].gold += bonus9;
				Player[Dice.pno].lap ++;
				Player[Dice.pno].flag = "";
				//Icon
				$("#DIV_PLAYER"+Dice.pno).css("backgroundPosition", "0px 0px, 128px 0px, 128px 0px");
				//Log
				var msgarr = [];
				msgarr.push("【 " + Player[Dice.pno].lap + " 周目ボーナス】");
				msgarr.push("帰城ボーナス <span class='g'>" + bonus2 + "G</span>");
				msgarr.push("歩数ボーナス <span class='g'>" + bonus3 + "G</span>");
				msgarr.push("領地ボーナス <span class='g'>" + bonus1 + "G</span>");
				msgarr.push("ボーナス合計 <span class='g'>" + bonus9 + "G</span>");
				msgarr.push("クリーチャー20%回復");
				Logprint({msg:msgarr, pno:Dice.pno, type:"block"});
				//Light
				GridLightFort();
				//Scroll
				BoardScroll(Player[Dice.pno].stand);
				//Animation
				EffectBox({pattern:"fortpuff", img:"gicon_cas", pno:Dice.pno});
				EffectBox({pattern:"msgpop",gno:Player[Dice.pno].stand, msg:bonus9+"G", color:"#ffcc00", player:true});
				//処理有
				retcode = true;
			}
			//目標達成チェック
			if(Board.target <= TotalGold(Dice.pno)){
				//ステップ（終了）
				StepSet(100);
				//Icon
				$("#DIV_PLAYER"+Dice.pno).css("backgroundPosition", "0px 0px, 128px 0px, 128px 0px");
				DisplaySet("DIV_DICE", 0);
				PopBigMsg("目標達成", 9);
				//処理有
				retcode = true;
			}else{
				if(retcode){
					//次の移動
					setTimeout(function(){
						//img
						SetPlayerImg(Dice.pno);
						//next
						DiceNextMove();
					}, 1500);
				}
			}
		}else{
			//###### fort ######
			//今回通過
			if(encflg[0] != "forgery" && Player[Dice.pno].flag.indexOf(nswe[color]) < 0){
				//Log
				Logprint({msg:["砦　ボーナス <span class='g'>" + Board.bonus_f + "G</span>"], pno:Dice.pno, type:"block"});
				Player[Dice.pno].gold += Board.bonus_f;
				Player[Dice.pno].flag += nswe[color];
				imgsrc = "gicon_" + nswe[color];
				//Light
				GridLightFort();
				//Scroll
				BoardScroll(Player[Dice.pno].stand);
				//Animation
				EffectBox({pattern:"fortpuff", img:imgsrc, pno:Dice.pno});
				//msgpop
				EffectBox({pattern:"msgpop",gno:Player[Dice.pno].stand, msg:Board.bonus_f+"G", color:"#ffcc00", player:true});
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
//
function DiceNextMove(){
	var standNow = Player[Dice.pno].stand;
	var shadwNow = Player[Dice.pno].shadow;
	var msec = (Frame.skipchk()) ? 50 : 500;
	//Dice Step End
	if(Dice.rest == 0){
		if(Board.grid[standNow].color == 21){
			//### 転送円 ###
			if(Board.grid[shadwNow].color != 24){
				var mvto = Number(Board.grid[standNow].linkx);
				Player[Dice.pno].shadow = mvto;
				Player[Dice.pno].stand = mvto;
				if(Dice.pno == Board.role){
					//ルート記憶
					Dice.route.push(Player[Dice.pno].stand);
				}
				//Animation & ImageChange
				EffectBox({pattern:"piecemove", pno:Dice.pno, gno:mvto, msec:msec});
				//現在地
				standNow = mvto;
				shadwNow = mvto;
			}
		}else if(Board.grid[standNow].color == 24){
			//### 転送門 ###
			if(standNow == shadwNow){
				var mvto = Number(Board.grid[standNow].linkx);
				Player[Dice.pno].shadow = standNow;
				Player[Dice.pno].stand = mvto;
				if(Dice.pno == Board.role){
					//ルート記憶
					Dice.route.push(Player[Dice.pno].stand);
				}
				//Animation & ImageChange
				EffectBox({pattern:"piecemove", pno:Dice.pno, gno:mvto, msec:msec});
			}
		}
		//祭壇
		if(Board.grid[standNow].color == 23){
			//ドロー
			DiceStepDraw(0);
			//中断
			return;
		}
		//### GridAbility ###
		var abiret = GridAbility({time:"DICE_REST_OVER", gno:Player[Dice.pno].stand});
		for(var i2=0; i2<abiret.length; i2++){
			switch(abiret[i2].act){
			case "teleport":
				DiceStepTeleport({step:0, tgt:abiret[i2].val});
				//中断
				return;
				break;
			}
		}
		//移動終了
		MoveEnd();
	}else{
		//表示次へ
		$("#DIV_DICE").html(Dice.rest);
		DicePieceMove(0);
	}
}
//
function DiceStepTeleport(arg){
	var msec = (Frame.skipchk()) ? 50 : 500;
	switch(arg.step){
	case 0:
		//ステップ
		StepSet(36);
		if(Board.role == Board.turn){
			Dice.teleport = arg.tgt;
			//ライト
			GridLight("set_nosave", arg.tgt);
			//hand
			Canvas.clear({id:"CVS_HAND7"});
			//Dialog
			DispDialog({msgs:["テレポート先を選択してください"], type:"ok"});
		}
		break;
	case 1:
		//Role Player
		if(Board.turn == Board.role){
			//ライト
			GridLight("clear");
			//コマンド送信
			var wkcmd = "dicetele:"+arg.gno;
			//送信
			Net.send(wkcmd);
		}
		Player[Board.turn].shadow = arg.gno;
		Player[Board.turn].stand = arg.gno;
		if(Dice.pno == Board.role){
			//ルート記憶
			Dice.route.push(arg.gno);
		}
		//Animation & ImageChange
		EffectBox({pattern:"piecemove", pno:Board.turn, gno:arg.gno, msec:msec});
		//Log
		Logprint({msg:Player[Board.turn].name+"はテレポートした", pno:Board.turn});
		//移動終了
		MoveEnd();
		break;
	}
}
//
function DiceStepDraw(i_flg){
	if(i_flg == 0){
		//ステップ
		StepSet(34);
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
				btnarr.push(["クリーチャー", "DiceStepDraw("+typeflg["C"]+")"]);
			}else{
				btnarr.push(["クリーチャー", ""]);
			}
			if(typeflg["I"] >= 1){
				btnarr.push(["アイテム", "DiceStepDraw("+typeflg["I"]+")"]);
			}else{
				btnarr.push(["アイテム", ""]);
			}
			if(typeflg["S"] >= 1){
				btnarr.push(["スペル", "DiceStepDraw("+typeflg["S"]+")"]);
			}else{
				btnarr.push(["スペル", ""]);
			}
			//ダイアログ
			DispDialog({msgs:mstarr, btns:btnarr});
		}
	}else{
		//Role Player
		if(Board.turn == Board.role){
			//ダイアログ非表示
			DispDialog("none");
			//コマンド送信
			var wkcmd = "dicedraw:"+i_flg;
			//送信
			Net.send(wkcmd);
		}
		//Animation
		EffectBox({pattern:"fortpuff", img:"gicon_alt", pno:Board.turn});
		//手札追加
		Drawcard({pno:Board.turn, from:"dno", dno:i_flg});
		//Role Player
		if(Board.turn == Board.role){
			SortHand();
		}
		MoveEnd();
	}
}
//########[ Step End ]########
function MoveEnd(){
	//handover chk
	if(Player[Board.turn].HandCount() == 7){
		//ステップ
		StepSet(38);
		//Discard Check
		DiscardInit();
	}else{
		//ステップ（移動終了）
		StepSet(40);
		DisplaySet("DIV_DICE", 0);
		//ZIndex
		SortZIndex("player");
		//スクロール
		BoardScroll(Player[Board.turn].stand);
		//ターンプレイヤー
		if(Board.turn == Board.role){
			//領地指示可能カウント
			var wkarr = new Array();
			if($T.inarray(Board.grid[Player[Board.role].stand].color, [10,11,12,13,14]) || Player[Board.role].status == "_TELEGNOSIS_"){
				for(var i=1; i<Board.grid.length; i++){
					if(Team(Board.grid[i].owner) == Team(Board.turn)){
						wkarr.push(i);
					}
				}
			}else{
				for(var i=0; i<Dice.route.length; i++){
					if(Team(Board.grid[Dice.route[i]].owner) == Team(Board.turn)){
						wkarr.push(Dice.route[i]);
					}
				}
				//TELEPATHY CHECK
				for(var igno=1; igno<Board.grid.length; igno++){
					if(Team(Board.grid[igno].owner) == Team(Board.turn) && Board.grid[igno].status == "_TELEPATHY_"){
						wkarr.push(igno);
					}
				}
			}
			//Territory Set
			Territory.target = wkarr;
			//通過点ライト
			if(wkarr.length >= 1){
				GridLight("set", wkarr);
				GridLight("set_memory");
			}
			//
			SummonCheck(Player[Board.role].stand);
			//ハンド
			Canvas.draw({id:"CVS_HAND7", src:"img/cmd_turnend.gif"});
			//timer
			$("#DIV_HAND7").addClass(Chessclock.set(40));
		}
	}
}
