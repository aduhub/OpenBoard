//
function SummonCheck(i_gno){
	//クリア
	Summon.from = "summon";
	Summon.pno = 0;
	Summon.cno = "";
	Summon.hand = 0;
	Summon.gno = 0;
	Summon.status = "";
	//手札再表示
	SortHand();
	//アイコンセット
	for(var i=1; i<=Player[Board.role].HandCount(); i++){
		var cno = Player[Board.role].HandCard(i);
		switch(SummonCost(i_gno, cno)){
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
//コストチェック
function SummonCost(i_gno, i_cno){
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
		var opts = Card[i_cno].opt.concat();
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
		for(var i=0; i<opts.length; i++){
			switch(opts[i]){
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
		if(retitem.length >= 1){
			for(var i=0; i<retitem.length; i++){
				if(retitem[i].act == "jail"){
					chk.invasion = false;
				}
			}
		}
		var retitem = GridAreaAbility({gno:i_gno, time:"SUMMON_CHECK"});
		if(retitem.length >= 1){
			for(var i=0; i<retitem.length; i++){
				if(retitem[i].act == "unique"){
					for(var i2=1; i2<Board.grid.length; i2++){
						if(i_cno == Board.grid[i2].cno){
							chk.unique = false;
							break;
						}
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
							var costcnt = [0, 0, 0, 0, 0, 0];
							for(var i=0; i<Card[i_cno].plus.length; i++){
								costcnt[colorno[Card[i_cno].plus.substr(i, 1)]]++;
							}
							for(var i=1; i<=5; i++){
								if(GridCount(Board.role, i) < costcnt[i]){
									ret = "PLUS";
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
//使用確認
function SummonConfirm(arg){
	//確認なし
	StepSet(41);
	Summon.from = arg.type;
	Summon.pno = Board.role;
	Summon.cno = Player[Board.role].HandCard(arg.hno);
	Summon.hand = arg.hno;
	Summon.gno = (arg.type == "summon") ? Player[Board.role].stand : Territory.gno;
	Summon.status = "";
	//ステップ
	StepSet(42);
	SummonReady();
}
//受信処理
function SummonRecv(){
	var arg = arguments;
	var wkarr = arg[2].split(":");
	//変数設定
	Summon.from = arg[1];
	Summon.pno = arg[0];
	Summon.cno = wkarr[0];
	Summon.hand = 0;
	Summon.gno = Number(wkarr[1]);
	Summon.status = "";
	//スクロール
	BoardScroll(Summon.gno);
	//矢印表示
	DivImg("DIV_GCLICK"+Summon.gno, "arrow2");
	//Step
	StepSet(42);
	//準備設定
	SummonReady();
}
function SummonReady(){
	//ダイアログ非表示
	DispDialog("none");

	//コスト消費
	Player[Summon.pno].gold -= Card[Summon.cno].cost;
	//カード消費
	Player[Summon.pno].HandDel(Summon.cno);
	//交換時手札追加
	if(Summon.from == "change"){
		Player[Summon.pno].HandAdd(Board.grid[Summon.gno].cno);
	}
	//Analytics
	Analytics.costsummon[Summon.pno] += Card[Summon.cno].cost;
	
	if(Board.turn == Board.role){
		//コマンド送信
		Net.send(Summon.from+":"+Summon.cno+":"+Summon.gno);
		//手札再表示
		SortHand();
	}
	//手札再表示
	DispPlayer();

	if(Summon.from == "summon" && Board.grid[Summon.gno].owner != 0){
		//Log
		Logprint({msg:"(侵略召喚)##"+Summon.cno+"##", pno:Summon.pno});
		//戦闘
		Battle.hand = Summon.hand;
		BattleInit("S", Summon.gno, Board.turn, Summon.cno);
	}else{
		//Log
		var summoncomment = (Summon.from == "summon") ? "支配" : "交換";
		Logprint({msg:"("+summoncomment+"召喚)##"+Summon.cno+"##", pno:Summon.pno});
		//ステップ
		StepSet(42);
		//次処理
		setTimeout(function(){SummonGrid();}, 400);			
	}
}
//
function SummonGrid(){
	if(["summon", "change", "territory"].indexOf(Summon.from) >= 0){
		//手札・矢印表示
		if(Board.role == Board.turn){
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("-");
		}else{
			DivImg("DIV_GCLICK"+Summon.gno, "");
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
	GridSetImage(Summon.gno);
	GridSetTax(Summon.gno);
	//再表示
	DispPlayer();
	//エフェクト
	//SummonEffect();
	EffectBox({pattern:"summon", gno:Summon.gno, pno:Summon.pno, cno:Summon.cno});
	EffectBox({pattern:"msgpop", gno:Summon.gno, msg:"Summon"});
	//LogPrint
	if(Summon.from != "change"){
		CustomLog({type:"colorcnt", pno:Summon.pno, color:sgrid.color});
		EffectBox({pattern:"lvlpop", level:sgrid.level, chain:GridCount(Summon.pno, sgrid.color)});
	}
	//back
	if(["summon", "change", "battle"].indexOf(Summon.from) >= 0){
		setTimeout(SummonEnd, 1000);
	}
	if(Summon.from == "territory"){
		setTimeout(TerritoryEnd, 1000);
	}
}
//End
function SummonEnd(){
	//ステップ
	StepSet(50);
	if(Board.role == Board.turn){
		//TurnEnd
		TurnEnd();
	}
}
//#################################################################
//aculoエフェクト
function SummonEffect(){
	//[Disp Animation]
	$("#DIV_GICON"+Summon.gno).css({display:"none", backgroundImage: "url(img/icon/"+Card[Summon.cno].imgsrc.replace(".png", "")+".gif)"});
	$("#DIV_GICON"+Summon.gno).fadeIn(1000);
	
}
