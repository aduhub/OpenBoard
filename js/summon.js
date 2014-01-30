var Summon = {};
Summon.Step = {};
Summon.Tool = {};
Summon.from = "";
Summon.pno   = 0;
Summon.gno   = 0;
Summon.cno   = "";
Summon.st    = 0;
Summon.lf    = 0;
Summon.maxlf = 0;
Summon.status = "";
//
Summon.Step.start = function (i_gno){
	//クリア
	Summon.from = "summon";
	Summon.pno = 0;
	Summon.cno = "";
	Summon.gno = 0;
	Summon.status = "";
	//手札再表示
	Deck.Tool.sorthand();
	//アイコンセット
	for(var i in Player[Board.role].hand){
		var cno = Player[Board.role].hand[i];
		if(Card[cno].type != "C"){
			$("#DIV_HAND"+i).addClass("CLS_HAND_GLAY");
		}else{
			switch(Summon.Tool.chkcost(i_gno, cno)){
			case "NG":
				Canvas.draw({id:"CVS_HAND"+i, src:"img/icon_nouse.gif"});
				break;
			case "GOLD":
				Canvas.draw({id:"CVS_HAND"+i, src:"img/icon_nogold.gif"});
				break;
			case "PLUS":
				Canvas.draw({id:"CVS_HAND"+i, src:"img/icon_noplus.gif"});
				break;
			}
		}
	}
}
//使用確認
Summon.Step.confirm = function (arg){
	//確認なし
	Flow.step(41);
	Summon.from = arg.from;
	Summon.pno = Board.role;
	Summon.cno = Player[Board.role].hand[arg.hno];
	Summon.gno = (arg.from == "summon") ? Player[Board.role].stand : Territory.gno;
	Summon.status = "";
	//ステップ
	Flow.step(42);
	Summon.Step.ready();
}
//受信処理
Summon.Step.recv = function (){
	var arg = arguments;
	var wkarr = arg[2].split(":");
	//変数設定
	Summon.from = arg[1];
	Summon.pno = arg[0];
	Summon.cno = wkarr[0];
	Summon.gno = Number(wkarr[1]);
	Summon.status = "";
	//スクロール
	UI.Tool.scrollBoard(Summon.gno);
	//矢印表示
	UI.Html.setDiv({id:"DIV_GCLICK"+Summon.gno, img:"arrow2.gif"});
	//Step
	Flow.step(42);
	//準備設定
	Summon.Step.ready();
}
//
Summon.Step.ready = function (){
	//ダイアログ非表示
	UI.Dialog.close();
	//コスト消費
	Player[Summon.pno].gold -= Card[Summon.cno].cost;
	//カード消費
	Player[Summon.pno].HandDel(Summon.cno);
	//交換時手札追加
	if(Summon.from == "change"){
		Player[Summon.pno].hand.push(Board.grid[Summon.gno].cno);
	}
	//Analytics
	Analytics.costsummon[Summon.pno] += Card[Summon.cno].cost;
	
	if(Board.turn == Board.role){
		//コマンド送信
		Net.send(Summon.from+":"+Summon.cno+":"+Summon.gno);
		//手札再表示
		Deck.Tool.sorthand();
	}
	//手札再表示
	Game.Info.dispPlayerbox();

	if(Summon.from == "summon" && Board.grid[Summon.gno].owner != 0){
		//Log
		Logprint({msg:"(侵略召喚)##"+Summon.cno+"##", pno:Summon.pno});
		//戦闘
		Battle.Step.init("S", Summon.gno, Board.turn, Summon.cno);
	}else{
		//Log
		var summoncomment = (Summon.from == "summon") ? "支配" : "交換";
		Logprint({msg:"("+summoncomment+"召喚)##"+Summon.cno+"##", pno:Summon.pno});
		//ステップ
		Flow.step(42);
		//次処理
		setTimeout(function(){Summon.Step.setgrid();}, 400);
	}
}
//
Summon.Step.setgrid = function (){
	if(["summon","change","territory"].indexOf(Summon.from) >= 0){
		//手札・矢印表示
		if(Board.role == Board.turn){
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("-");
		}else{
			UI.Html.setDiv({id:"DIV_GCLICK"+Summon.gno, clear:true});
		}
	}
	//グリッドセット
	var sgrid = Board.grid[Summon.gno];
	sgrid.owner = Summon.pno;
	sgrid.cno = Summon.cno;
	switch(Summon.from){
	case "summon":
	case "change":
		sgrid.st = Card[Summon.cno].st;
		sgrid.lf = Card[Summon.cno].lf;
		sgrid.maxlf = Card[Summon.cno].lf;
		sgrid.status = "";
		sgrid.statime = 0;
		break;
	case "battle":
		sgrid.st = Summon.st;
		sgrid.lf = Summon.lf;
		sgrid.maxlf = Summon.maxlf;
		sgrid.status = Summon.status;
		sgrid.statime = (Summon.status != "") ? 99 : 0;
		break;
	case "territory":
		sgrid.st = Card[Summon.cno].st;
		sgrid.lf = Card[Summon.cno].lf;
		sgrid.maxlf = Card[Summon.cno].lf;
		sgrid.status = "";
		sgrid.statime = 0;
		break;
	case "copy":
		sgrid.st = Summon.st;
		sgrid.lf = Summon.lf;
		sgrid.maxlf = Summon.maxlf;
		sgrid.status = "";
		sgrid.statime = 0;
		break;
	}
	//地形カラー
	Grid.Img.set(Summon.gno);
	UI.CreateJS.GridTax({gno:Summon.gno});
	//再表示
	Game.Info.dispPlayerbox();
	//エフェクト
	EffectBox({pattern:"summon", gno:Summon.gno, pno:Summon.pno, cno:Summon.cno});
	EffectBox({pattern:"msgpop", gno:Summon.gno, msg:"Summon"});
	//LogPrint
	if(Summon.from != "change"){
		CustomLog({type:"colorcnt", pno:Summon.pno, color:sgrid.color});
		EffectBox({pattern:"lvlpop", level:sgrid.level, chain:Grid.count({owner:Summon.pno, color:sgrid.color})});
	}
	//back
	if(["summon", "change", "battle"].indexOf(Summon.from) >= 0){
		setTimeout(Summon.Step.end, 1000);
	}
	if(Summon.from == "territory"){
		Territory.Step.end(1.0);
	}
}
//End
Summon.Step.end = function (){
	//ステップ
	Flow.step(50);
	if(Board.role == Board.turn){
		//TurnEnd
		Flow.Step.turnend();
	}
}
//--------------------------
//コストチェック
Summon.Tool.chkcost = function (i_gno, i_cno){
	var ret = "NG";
	var colorno = {N:1, F:2, W:3, E:4, D:5};
	var nocolor = ["","N","F","W","E","D"];
	var wkowner = Board.grid[i_gno].owner;
	var wkcolor = Board.grid[i_gno].color;
	//クリーチャーカード
	if(Card[i_cno].type != "C"){
		return ret;
	}
	//通常地形
	if(wkcolor < 10){
		var chk = {walk:true, invasion:true, levelcap:true, unique:true};
		var abinm;
		//##### Walk Able #####
		if(Card[i_cno].walk){
			if(Card[i_cno].walk.match(nocolor[wkcolor])){
				chk.walk = false;
			}
			if(Card[i_cno].walk.match("I")){
				chk.invasion = false;
			}
		}
		//##### CardAbi #####
		for(var i in Card[i_cno].opt){
			switch(Card[i_cno].opt[i]){
				case "@WALL@":
					chk.invasion = false;
					break;
				case "@LEGEND@":
					if(Board.grid[i_gno].level == 1){
						chk.levelcap = false;
					}
					break;
			}
		}
		//##### GridAbi #####
		var retitem = GridAbility({gno:i_gno, time:"SUMMON_CHECK"});
		for(var i in retitem){
			if(retitem[i].act == "jail"){
				chk.invasion = false;
			}
		}
		var retitem = GridAreaAbility({gno:i_gno, time:"SUMMON_CHECK"});
		for(var i in retitem){
			if(retitem[i].act == "unique"){
				for(var i2=1; i2<Board.grid.length; i2++){
					if(i_cno == Board.grid[i2].cno){
						chk.unique = false;
						break;
					}
				}
			}
		}
		//領地条件クリア
		if(wkowner == 0 || (wkowner != Board.role && chk.invasion) || (wkowner == Board.role && Board.step == 53)){
			//タイプチェック
			if(Card[i_cno].type == "C"){
				if(chk.walk && chk.levelcap && chk.unique){
					if(Player[Board.role].gold >= Card[i_cno].cost){
						if(Card[i_cno].plus){
							if($T.typer(Card[i_cno].plus) == "Number"){
								if(Card[i_cno].plus > Player[Board.role].medal){
									ret = "PLUS";
								}
							}else{
								var costcnt = [0, 0, 0, 0, 0, 0];
								for(var i=0; i<Card[i_cno].plus.length; i++){
									costcnt[colorno[Card[i_cno].plus.substr(i, 1)]]++;
								}
								for(var i=1; i<=5; i++){
									if(Grid.count({owner:Board.role, color:i}) < costcnt[i]){
										ret = "PLUS";
									}
								}
							}
							if(ret != "PLUS"){
								ret = "OK";
							}
						}else{
							ret = "OK";
						}
					}else{
						ret = "GOLD";
					}
				}
			}
		}
	}
	return ret;
}

