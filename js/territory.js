//########################################
function TerritoryInit(i_gno){
	if(Team(Board.grid[i_gno].owner) == Team(Board.turn)){
		//領地指示可能
		if(Territory.target.indexOf(i_gno) >= 0){
			var wkarr = [];
			//ライト
			GridLight("clear");
			//ライト
			wkarr.push(i_gno);
			GridLight("set_nosave", wkarr);
			//領地INIT
			StepSet(51);
			Territory.pno = Board.role;
			Territory.gno = i_gno;
			Territory.gno2 = 0;
			Territory.ability = "";
			TerritoryDialog(0);
		}
	}
}
//
function TerritoryDialog(i_mode){
	var panels = "";
	var imgname = ["", "mark_n", "mark_r", "mark_b", "mark_g", "mark_y"];
	var imgsrc = "<IMG src='img/"+imgname[Board.grid[Territory.gno].color]+".gif' height='26' width='26'>";
	panels += Infoblock.line({m:["基本", imgsrc, "レベル"+Board.grid[Territory.gno].level], w:[50, 30, 100]});
	panels += Infoblock.line({m:[Card[Board.grid[Territory.gno].cno].name], w:[180]});
	//
	switch(i_mode){
	case 0:
		//Ability Command
		var cno = Board.grid[Territory.gno].cno;
		var opts = Card[cno].opt.join(",");
		var cmdflg, btnstr, btncmd;
		//MapSkill
		var hits = opts.match(/(@[A-Z]+@)[:0-9A-Z]*=([0-9]+)/);
		if(hits != null){
			//Check
			cmdflg = TerritoryCheck({cmdno:0});
			var cost = Number(hits[2]);
			if(cmdflg && Player[Board.turn].gold >= cost){
				btncmd = "onclick='TerritoryAbility(0)'";
			}else{
				btncmd = "disabled";
			}
			panels += Infoblock.line({m:Dic(hits[1])+cost+"G", b:btncmd});
			//Ability
			Territory.ability = hits[1];
		}
		//Basic Command
		for(var i=1; i<=5; i++){
			//Check
			cmdflg = TerritoryCheck({cmdno:i});
			btnstr = ["", "レベルアップ", "地形変化", "クリチャ移動", "クリチャ交換", "キャンセル"];
			btncmd = (cmdflg) ? "onclick='TerritoryDialog("+i+")'" : "disabled";
			if(i <= 4){
				panels += Infoblock.line({m:btnstr[i], b:btncmd});
			}else{
				panels += Infoblock.line({m:btnstr[i], b:btncmd, cls:Chessclock.set(51)});
			}
		}
		//
		DisplaySet("DIV_INFOGRID", 50);
		//innerHTML
		$("#DIV_INFOGRID").html(panels);
		break;
	case 1:
		//[LevelUp]
		var tgtgrid = Board.grid[Territory.gno];
		for(var i=2; i<=5; i++){
			if(tgtgrid.level >= i){
				panels += Infoblock.line({m:"Lv"+i+" ---G", b:"disabled"});
			}else{
				var wkbase = tgtgrid.gold;
				//GridStatus
				var retarr = GridAbility({time:"GRID_VALUE", gno:Territory.gno});
				if($T.search(retarr, "act", "percent")){
					wkbase = Math.floor(wkbase * $T.result.val);
				}
				var wkvalue = (wkbase * Math.pow(2, (i - 1))) - (wkbase * Math.pow(2, (tgtgrid.level - 1)));
				//Enchant
				var retarr = Enchant({time:"TERRITORY_LVLUP", pno:Board.turn});
				if($T.search(retarr, "act", "percent")){
					wkvalue = Math.floor(wkvalue * $T.result.val);
				}
				if(Player[Board.role].gold >= wkvalue){
					panels += Infoblock.line({m:"Lv"+i+" "+wkvalue+"G", b:"onclick='TerritoryLevel("+i+")'"});
				}else{
					panels += Infoblock.line({m:"Lv"+i+" "+wkvalue+"G", b:"disabled"});
				}
			}
		}
		panels += Infoblock.line({m:"キャンセル", b:"onclick='TerritoryDialog(5)'", cls:Chessclock.set(51)});
		//
		DisplaySet("DIV_INFOGRID", 50);
		//innerHTML
		$("#DIV_INFOGRID").html(panels);
		break;
	case 2:
		//[ColorChange]
		var tgtgrid = Board.grid[Territory.gno];
		for(var i=2; i<=5; i++){
			if(tgtgrid.color == i){
				panels += Infoblock.line({m:"<IMG src='img/"+imgname[i]+".gif' height='26' width='26'>   0G", b:"disabled'"});
			}else{
				var wkvalue = (tgtgrid.color != 1) ? 200 : 0;
				wkvalue += (tgtgrid.level * 100);
				var btnsrc = "<IMG src='img/"+imgname[i]+".gif' height='26' width='26'> "+wkvalue+"G";
				if(Player[Board.role].gold >= wkvalue){
					panels += Infoblock.line({m:btnsrc, b:"onclick='TerritoryColor("+i+")'"});
				}else{
					panels += Infoblock.line({m:btnsrc, b:"disabled"});
				}
			}
		}
		panels += Infoblock.line({m:"キャンセル", b:"onclick='TerritoryDialog(5)'", cls:Chessclock.set(51)});
		//
		DisplaySet("DIV_INFOGRID", 50);
		//innerHTML
		$("#DIV_INFOGRID").html(panels);
		break;
	case 3:
		//[MoveCreature]
		var linkgrid;
		var tgtgrid = Board.grid[Territory.gno];
		var nocolor = ["","N","F","W","E","D"];
		Territory.mvgno = [];
		for(var i=0; i<=3; i++){
			if(tgtgrid.linkarr[i] >= 1){
				linkgrid = Board.grid[tgtgrid.linkarr[i]];
				if(linkgrid.color < 10 && Team(linkgrid.owner) != Team(tgtgrid.owner)){
					var walk = Card[tgtgrid.cno].walk || "";
					if(!walk.match(nocolor[linkgrid.color]) && !(walk.match("I") && linkgrid.owner >= 1)){
						if(linkgrid.status != "_JAIL_"){
							Territory.mvgno.push(tgtgrid.linkarr[i]);
						}
					}
				}
			}
		}
		if(tgtgrid.status == "_SPIRITWALK_"){
			var tgtgrids = GridTgtGrep({tgt:"TSG"});
			for(var i = 0; i<tgtgrids.length; i++){
				if($T.inarray(tgtgrids[i], Territory.mvgno) == false){
					Territory.mvgno.push(tgtgrids[i]);
				}
			}
		}
		if(Territory.mvgno.length >= 1){
			//ライト
			GridLight("clear");
			GridLight("set_nosave", Territory.mvgno);
			//移動先入力
			StepSet(52);
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("キャンセル");
			//timer cancel set
			$("#BTN_PhaseEnd").addClass(Chessclock.set(52));
			//ウィンドウクローズ
			DisplaySet("DIV_INFOGRID", 0);
		}
		break;
	case 4:
		//[CreatureChange]
		//ライト
		GridLight("clear");
		//ライト
		GridLight("set_nosave", [Territory.gno]);
		//交換カード選択
		StepSet(53);
		//PHASEENDBUTTON
		$("#BTN_PhaseEnd").html("キャンセル");
		//timer cancel set
		$("#BTN_PhaseEnd").addClass(Chessclock.set(53));
		//ウィンドウクローズ
		DisplaySet("DIV_INFOGRID", 0);
		//カードチェック
		SummonCheck(Territory.gno);
		break;
	case 5:
		//クリア
		Territory.ability = "";
		//ライト
		GridLight("clear");
		//ライト
		GridLight("set_memory");
		//キャンセル
		StepSet(40);
		//PHASEENDBUTTON
		$("#BTN_PhaseEnd").html("ターンエンド");
		DisplaySet("DIV_INFOGRID", 0);
		break;
	}
}
//コマンド使用可不可
function TerritoryCheck(arg){
	var ret = true;
	var mapactive = "";
	var tgtgrid = Board.grid[Territory.gno];
	//MapAbilitySearch
	for(var i=1; i<Board.grid.length; i++){
		if(Board.grid[i].owner >= 1 && !(Board.grid[i].status.match(/_BIND_/))){
			var opts = Card[Board.grid[i].cno].opt.concat();
			for(var i2 in opts){
				if(opts[i2].match(/^@MAP[A-Z0-9]+@/)){
					mapactive += "," + opts[i2];
				}
			}
		}
	}
	switch(arg.cmdno){
	case 0:
		if(tgtgrid.status.match(/_BIND_/)){
			ret = false;
		}
		if(CardOptCheck({gno:Territory.gno, tgt:/@LEVELUP@/}) && tgtgrid.level == 5){
			ret = false;
		}
		break;
	case 1: //Level
		if(tgtgrid.level == 5){
			ret = false;
		}
		if(tgtgrid.status.match(/_JAIL_/)){
			ret = false;
		}
		break;
	case 2: //Color
		if(tgtgrid.status.match(/_JAIL_/)){
			ret = false;
		}
		break;
	case 3: //Move
		if(tgtgrid.status.match(/_SPIRITWALK_/)){
		}else{
			if(Card[tgtgrid.cno].walk && Card[tgtgrid.cno].walk.match("T")){
				ret = false;
			}
			if(mapactive.match(/@MAPTERRITORYLOCK@/)){
				ret = false;
			}
		}
		if(tgtgrid.status.match(/_GRAVITY_/)){
			ret = false;
		}
		break;
	case 4: //Change
		if(mapactive.match(/@MAPNOCHANGE@/)){
			ret = false;
		}
		break;
	}
	return ret;
}
//######################################################
function TerritoryRecv(){
	var arg = arguments;
	var wkarr = arg[1].split(":");
	Territory.pno = arg[0];
	Territory.gno = wkarr[0];
	//領地開始
	StepSet(51);
	//スクロール
	BoardScroll(Territory.gno);
	//矢印表示
	DivImg("DIV_GCLICK"+Territory.gno, "arrow2");
	//領地コマンド
	switch(wkarr[1]){
	case "level":
		TerritoryLevel(wkarr[2]);
		break;
	case "color":
		TerritoryColor(wkarr[2]);
		break;
	case "move":
		TerritoryMove(wkarr[2], 0);
		break;
	case "ability":
		Territory.ability = wkarr[2];
		//能力
		TerritoryAbility(wkarr[3]);
		break;
	}
}
//######################################################
function TerritoryLevel(i_level){
	var tgtgrid = Board.grid[Territory.gno];
	var wklevel = tgtgrid.level;
	var wkbase = tgtgrid.gold;
	var retarr = GridAbility({time:"GRID_VALUE", gno:Territory.gno});
	if($T.search(retarr, "act", "percent")){
		wkbase = Math.floor(wkbase * $T.result.val);
	}
	var wkvalue = (wkbase * Math.pow(2, (i_level - 1))) - (wkbase * Math.pow(2, (tgtgrid.level - 1)));
	//Enchant
	var retarr = Enchant({time:"TERRITORY_LVLUP", pno:Board.turn});
	if($T.search(retarr, "act", "percent")){
		wkvalue = Math.floor(wkvalue * $T.result.val);
	}
	if(Player[Territory.pno].gold >= wkvalue){
		if(Board.turn == Board.role){
			//ウィンドウ消去
			DisplaySet("DIV_INFOGRID", 0);
			//コマンド送信
			var wkcmd = "territory:"+Territory.gno+":level:"+i_level;
			//送信
			Net.send(wkcmd);
		}
		//設定
		tgtgrid.level = Number(i_level);
		//消費
		Player[Territory.pno].gold -= wkvalue;
		//地形表示
		GridSetImage(Territory.gno);
		//Log
		Logprint({msg:"(レベルアップ) "+wklevel+" > "+i_level, pno:Territory.pno});
		//animation
		EffectBox({pattern:"levelup", gno:Territory.gno});
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Lv" + wklevel + ">" + i_level});
		EffectBox({pattern:"lvlpop", level:tgtgrid.level, chain:GridCount(Territory.pno, tgtgrid.color)});
		//ウェイト
		Board.wait = 1.5;
		//領地終了
		TerritoryEnd();
	}
}
//
function TerritoryColor(i_color){
	var tgtgrid = Board.grid[Territory.gno];
	var wkelement = ["", "無", "火", "水", "地", "風"];
	var wkcolor = tgtgrid.color;
	var wkvalue = (wkcolor != 1) ? 200 : 0;
	wkvalue += tgtgrid.level * 100;
	if(Player[Territory.pno].gold >= wkvalue){
		if(Board.turn == Board.role){
			//ウィンドウ消去
			DisplaySet("DIV_INFOGRID", 0);
			//コマンド送信
			var wkcmd = "territory:"+Territory.gno+":color:"+i_color;
			//送信
			Net.send(wkcmd);
		}
		//設定
		tgtgrid.color = i_color;
		//消費
		Player[Territory.pno].gold -= wkvalue;
		//地形表示
		GridSetImage(Territory.gno);
		//Log
		Logprint({msg:"(地形変化) "+wkelement[wkcolor]+" > "+wkelement[i_color], pno:Territory.pno});
		CustomLog({type:"colorcnt", pno:Territory.pno, color:[wkcolor, i_color]});
		//animation
		EffectBox({pattern:"focusin", gno:Territory.gno});
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Change"});
		EffectBox({pattern:"lvlpop", level:tgtgrid.level, chain:GridCount(Territory.pno, tgtgrid.color)});
		//ウェイト
		Board.wait = 1.5;
		//領地終了
		TerritoryEnd();
	}
}
//
function TerritoryMove(i_gno, i_flg){
	var mvflg = 1;
	var wkcno = Board.grid[Territory.gno].cno;
	Territory.gno2 = i_gno;
	if(Board.turn == Board.role){
		mvflg = 0;
		//移動可
		for(var i=0; i<=Territory.mvgno.length - 1; i++){
			if(Territory.mvgno[i] == i_gno){
				mvflg = 1;
				break;
			}
		}
	}
	if(mvflg == 1){
		StepSet(53);
		if(Board.turn == Board.role && i_flg == 0){
			//コマンド送信
			var wkcmd = "territory:"+Territory.gno+":move:"+i_gno;
			//送信
			Net.send(wkcmd);
		}
		if(Board.grid[i_gno].owner == 0){
			//Move
			GridMove({gno1:Territory.gno, gno2:i_gno, effect:true});
			//Log
			Logprint({msg:"(領地移動)", pno:Territory.pno});
			var color = [Board.grid[Territory.gno].color, Board.grid[i_gno].color];
			CustomLog({type:"colorcnt", pno:Territory.pno, color:color});
			EffectBox({pattern:"lvlpop", level:Board.grid[i_gno].level, chain:GridCount(Territory.pno, Board.grid[i_gno].color)});
			//ウェイト
			Board.wait = 1.0;
			//領地終了
			TerritoryEnd();
		}else{
			//Log
			Logprint({msg:"(移動侵略)", pno:Territory.pno});
			//矢印表示
			DivImg("DIV_GCLICK"+i_gno, "arrow3");
			//Annimation
			EffectBox({pattern:"invasion", cno:wkcno, gno1:Territory.gno, gno2:i_gno});
			EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Move"});
			//【戦闘】
			Battle.gno_atk = Territory.gno;
			var wkcmd = function(){BattleInit("M", i_gno, Territory.pno, wkcno);};
			var id = setTimeout(wkcmd, 1500);
		}
	}
}
//=======================================
function TerritoryAbility(i_flg){
	var sendcmd;
	if(Board.role == Board.turn){
		//ウィンドウクローズ
		DisplaySet("DIV_INFOGRID", 0);
	}
	switch(Territory.ability){
	case "@DIVING@":
		if(i_flg == 0){
			//検索
			Territory.mvgno = GridTgtGrep({tgt:"TSGW"});
			//ライト
			TerritoryAbiTarget("grid");
		}else{
			//効果実行
			if(TerritoryAbiTgtChk(i_flg)){
				//コスト支払い
				TerritoryAbiPaySend(i_flg);
				//【移動】
				TerritoryMove(i_flg, 1);
			}
		}
		break;
	case "@TOUR@":
		if(i_flg == 0){
			//検索
			Territory.mvgno = GridTgtGrep({tgt:"TSGD"});
			//ライト
			TerritoryAbiTarget("grid");
		}else{
			//効果実行
			if(TerritoryAbiTgtChk(i_flg)){
				//コスト支払い
				TerritoryAbiPaySend(i_flg);
				//【移動】
				TerritoryMove(i_flg, 1);
			}
		}
		break;
	case "@GLIDE@":
		if(i_flg == 0){
			var extarr = [];
			//障害物検索
			//var gene = GridLineStopSearch({flg:"init", gno:Territory.gno});
			//Territory.mvgno = gene.get;
			//検索
			extarr.push(Territory.gno);
			Territory.mvgno = GridTgtGrep({tgt:"TUGL1", ext:extarr});
			//ライト
			TerritoryAbiTarget("grid");
		}else{
			//効果実行
			if(TerritoryAbiTgtChk(i_flg)){
				//コスト支払い
				TerritoryAbiPaySend(i_flg);
				//【移動】
				TerritoryMove(i_flg, 1);
			}
		}
		break;
	case "@FENIX@":
		var wkelement = ["", "無", "火", "水", "地", "風"];
		var selectdno = 0;
		var tgtcno = Board.grid[Territory.gno].cno;
		var colorno = Board.grid[Territory.gno].color;

		if(Board.role == Board.turn){
			//デッキ復帰位置
			selectdno = Math.floor(Math.random() * Player[Board.turn].DeckCount()) + 1;
		}else{
			selectdno = i_flg;
			//矢印表示
			DivImg("DIV_GCLICK"+Territory.gno, "");
		}
		//コスト支払い・送信
		TerritoryAbiPaySend(selectdno);

		//##### 還    元 #####
		var wkvalue = GridValue(Territory.gno);
		Player[Board.turn].gold += wkvalue;
		//領地クリア(レベル1)
		GridClear({gno:Territory.gno, all:true});
		//##### 火属性変更 #####
		if(colorno != 2){
			Board.grid[Territory.gno].color = 2;
			//地形表示
			GridSetImage(Territory.gno);
		}
		//##### デッキ復帰 #####
		Player[Board.turn].DeckInsert(tgtcno, selectdno);

		//animation
		EffectBox({pattern:"soldout", gno:Territory.gno});
		EffectBox({pattern:"focusin", gno:Territory.gno});
		//msgpop
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
		EffectBox({pattern:"msgpop", gno:Player[Board.turn].stand, msg:wkvalue+"G", color:"#ffcc00", player:true});
		//Log
		Logprint({msg:"土地売却 <span class='g'>"+wkvalue+"G</span>", pno:Territory.pno});
		if(colorno != 2){
			Logprint({msg:"(地形変化) "+wkelement[colorno]+" > "+wkelement[2], pno:Territory.pno});
		}
		Logprint({msg:"デッキ復帰", pno:Board.turn});

		//総魔力表示
		DispPlayer();
		//ウェイト
		Board.wait = 2.5;
		//領地終了
		TerritoryEnd();
		break;
	case "@FIREBALL@":
		if(i_flg == 0){
			//検索
			Territory.mvgno = GridTgtGrep({pno:Board.turn, tgt:"TOG"});
			//ライト
			TerritoryAbiTarget("grid");
		}else{
			//効果実行
			if(TerritoryAbiTgtChk(i_flg)){
				//コスト支払い
				TerritoryAbiPaySend(i_flg);
				Territory.gno2 = i_flg;
				//msgpop
				EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
				//Map Damage
				GridDamage({target:[Territory.gno, i_flg], dmg:20, arrow:true, scroll:true});
				//ウェイト
				Board.wait = 3.0;
				//領地終了
				TerritoryEnd();
			}
		}
		break;
	case "@UNTIELEMENT@":
		if(i_flg == 0){
			//検索(Oppo)
			Territory.mvgno = GridTgtGrep({pno:Board.turn, tgt:"TOG"});
			//ライト
			TerritoryAbiTarget("grid");
		}else{
			//効果実行
			if(TerritoryAbiTgtChk(i_flg)){
				//コスト支払い
				TerritoryAbiPaySend(i_flg);
				Territory.gno2 = i_flg;
				//Status
				GridStatusChg({gno:i_flg, status:"_UNTIELEMENT_", statime:99, arrow:true, scroll:true});
				//ウェイト
				Board.wait = 2.5;
				//領地終了
				TerritoryEnd();
			}
		}
		break;
	case "@REMOVE@":
		if(i_flg == 0){
			//検索
			Territory.mvgno = GridTgtGrep({pno:Board.turn, tgt:"TEGALL"});
			//ライト
			TerritoryAbiTarget("grid");
		}else{
			//効果実行
			if(TerritoryAbiTgtChk(i_flg)){
				//コスト支払い
				TerritoryAbiPaySend(i_flg);
				Territory.gno2 = i_flg;
				var tgtcno = Board.grid[i_flg].cno;
				var tgtpno = Board.grid[i_flg].owner;
				//ステータスクリア
				Board.grid[i_flg].status = "";
				Board.grid[i_flg].statime = 0;
				//表示
				GridSetTax(i_flg);
				//矢印
				DivImg("DIV_GCLICK"+i_flg, "arrow4");
				//スクロール
				BoardScroll(i_flg);
				//msgpop
				EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
				//Log
				Logprint({msg:"##"+tgtcno+"##は呪いが解けた", pno:tgtpno});
				//ウェイト
				Board.wait = 2.5;
				//領地終了
				TerritoryEnd();
			}
		}
		break;
	case "@PUSH@":
		if(i_flg == 0){
			if(Board.role == Board.turn){
				//隣接取得(生物)
				var gnos = Board.grid[Territory.gno].linkarr;
				Territory.mvgno = GridTgtGrep({tgt:"TEGLIVE", pno:Board.turn, select:gnos});
				//ライト
				TerritoryAbiTarget("grid");
			}
		}else{
			//効果実行
			if(TerritoryAbiTgtChk(i_flg)){
				//コスト支払い
				TerritoryAbiPaySend(i_flg);
				//
				var arrow = Board.grid[Territory.gno].GetArrow(i_flg);
				var tgtgno2 = Board.grid[i_flg].GetLink(arrow);
				//Move
				if(tgtgno2 > 0 && Board.grid[tgtgno2].color < 10 && Board.grid[tgtgno2].owner == 0){
					GridMove({gno1:i_flg, gno2:tgtgno2, effect:true});
				}else{
					Logprint({msg:"効果がなかった", pno:ipno});
				}
				//ウェイト
				Board.wait = 2.5;
				//領地終了
				TerritoryEnd();
			}
		}
		break;
	case "@QUICKSAND@":
		//コスト支払い
		TerritoryAbiPaySend();
		//Status
		GridStatusChg({gno:Territory.gno, status:"_QUICKSAND_", statime:99, scroll:true});
		//msgpop
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
		//Log
		Logprint({msg:"##"+Board.grid[Territory.gno].cno+"##は呪いを受けた", pno:Territory.pno});
		//ウェイト
		Board.wait = 2.5;
		//領地終了
		TerritoryEnd();
		break;
	case "@LEVELUP@":
		//効果実行
		if(Board.grid[Territory.gno].level <= 4){
			//コスト支払い
			TerritoryAbiPaySend();
			//設定
			Board.grid[Territory.gno].level++;
			//地形表示
			GridSetImage(Territory.gno);
			//animation
			EffectBox({pattern:"levelup", gno:Territory.gno});
			EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
			//ウェイト
			Board.wait = 2.5;
			//領地終了
			TerritoryEnd();
		}
		break;
	case "@DRAWCARD@":
		var diagimg = [];
		//コスト支払い
		TerritoryAbiPaySend();
		//手札追加
		var cno = Drawcard({pno:Board.turn, from:"deck"});
		if(Board.turn == Board.role){
			diagimg.push(cno);
			//ダイアログ
			DispDialog({dtype:"ok", cnos:diagimg});
			SortHand();
		}
		//msgpop
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
		EffectBox({pattern:"msgpop", gno:Player[Board.turn].stand, msg:"Draw", player:true});
		//ReDisp
		DispPlayer();
		//ウェイト
		Board.wait = 2.0;
		//領地終了
		TerritoryEnd();
		break;
	case "@DISPEL@":
		var diagimg = [];
		//コスト支払い
		TerritoryAbiPaySend();
		for(var i=1; i<=Board.playcnt; i++){
			if(Player[i].status != ""){
				//Clear
				Player[i].status = "";
				Player[i].statime = 0;
				//Icon
				SetPlayerIcon(i, "");
				//msgpop
				EffectBox({pattern:"msgpop", gno:Player[i].stand, msg:"Dispel", player:true});
				//log
				Logprint({msg:Player[i].name+"は呪いが解けた", pno:i});
			}
		}
		//msgpop
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
		//ReDisp
		DispPlayer();
		//ウェイト
		Board.wait = 2.0;
		//領地終了
		TerritoryEnd();
		break;
	case "@DRAIN@":
		if(i_flg == 0){
			StepSet(54);
			var btnarr = [];
			for(var i=1; i<=Board.playcnt; i++){
				if(Board.role != i && !(Player[i].status.match(/_BARRIER_/))){
					btnarr.push([Player[i].name, "TerritoryAbility("+i+")"]);
				}
			}
			btnarr.push(["キャンセル", "TerritoryAbility(9)"]);
			//表示
			DispDialog({btns:btnarr});
		}else{
			if(Board.role == Board.turn){
				//ダイアログ非表示
				DispDialog("none");
			}
			if(i_flg <= 4){
				var tgtpno = i_flg;
				//コスト支払い
				TerritoryAbiPaySend(i_flg);
				//効果
				var wkgold = Math.floor(Player[tgtpno].gold * 0.2);
				Player[Territory.pno].gold += wkgold;
				Player[tgtpno].gold -= wkgold;
				//スクロール
				BoardScroll(Player[tgtpno].stand);
				//Animation
				EffectBox({pattern:"piecejump",pno:tgtpno});
				EffectBox({pattern:"msgpop", gno:Player[tgtpno].stand, msg:wkgold+"G", color:"#ff0000", player:true});
				EffectBox({pattern:"msgpop", gno:Player[Territory.pno].stand, msg:wkgold+"G", color:"#ffcc00", player:true});
				EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
				//Log
				Logprint({msg:Player[tgtpno].name+"から<span class='g'>"+wkgold+"G</span>奪った", pno:Territory.pno});
				//ウェイト
				Board.wait = 2.5;
				//領地終了
				TerritoryEnd();
			}else{
				//キャンセル
				StepSet(40);
			}
		}
		break;
	case "@RITUAL@":
		var rndgno;
		var tgtgno = 0;
		if(Board.role == Board.turn){
			var tgtgrids = GridTgtGrep({tgt:"TSG"});
			if(tgtgrids.length >= 1){
				rndgno = Math.floor(Math.random() * tgtgrids.length);
				tgtgno = tgtgrids[rndgno];
			}
		}else{
			tgtgno = i_flg;
			//矢印表示
			DivImg("DIV_GCLICK"+Territory.gno, "");
		}
		//コスト支払い
		TerritoryAbiPaySend(tgtgno);
		//msgpop
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
		//効果
		if(tgtgno >= 1){
			var tgtcno = Board.grid[Territory.gno].cno;
			//スクロール
			BoardScroll(tgtgno);
			//変数設定
			Summon.from = "territory";
			Summon.pno = Territory.pno;
			Summon.cno = "C106";
			Summon.gno = tgtgno;
			//Log
			Logprint({msg:"(能力召喚)##C106##", pno:Territory.pno});
			//
			setTimeout(function(){SummonGrid();}, 1500);
		}else{
			Logprint({msg:"空き土地がなかった", pno:Territory.pno});
			//再表示
			DispPlayer();
			//ウェイト
			Board.wait = 1.5;
			//領地終了
			TerritoryEnd();
		}
		break;
	case "@DIVISION@":
		if(i_flg == 0){
			if(Board.role == Board.turn){
				//隣接検索(侵略)
				var gnos = Board.grid[Territory.gno].linkarr;
				Territory.mvgno = GridTgtGrep({tgt:"TAGWALK", pno:Board.turn, select:gnos});
				//ライト
				TerritoryAbiTarget("grid");
			}
		}else{
			if(TerritoryAbiTgtChk(i_flg)){
				var cno = Board.grid[Territory.gno].cno;
				//コスト支払い
				TerritoryAbiPaySend(i_flg);
				//msgpop
				EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
				//矢印表示
				DivImg("DIV_GCLICK"+Territory.gno, "");
				//スクロール
				BoardScroll(i_flg);
				//Log
				Logprint({msg:"(能力召喚)##"+cno+"##", pno:Territory.pno});
				if(Board.grid[i_flg].owner != 0){
					//Annimation
					EffectBox({pattern:"invasion", cno:cno, gno1:Territory.gno, gno2:i_flg});
					//【戦闘】
					Battle.hand = cno;
					var wkcmd = function(){BattleInit("S", i_flg, Territory.pno, cno);};
					var id = setTimeout(wkcmd, 1500);
				}else{
					//変数設定
					Summon.from = "territory";
					Summon.pno = Territory.pno;
					Summon.cno = cno;
					Summon.gno = i_flg;
					//
					setTimeout(function(){SummonGrid();}, 1500);
				}
			}
		}
		break;
	case "@ALCHEMY@":
		//コスト支払い
		TerritoryAbiPaySend();
		//スクロール
		BoardScroll(Territory.gno);
		//msgpop
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
		//効果
		if(Board.spelled.length >= 1){
			var cno = Board.spelled[0];
			Player[Territory.pno].hand.push(cno);
			Logprint({msg:"##"+cno+"##を錬成した", pno:Territory.pno});
		}else{
			Logprint({msg:"対象がなかった", pno:Territory.pno});
		}
		if(Board.role == Board.turn){
			//手札再表示
			SortHand();
		}
		//ウェイト
		Board.wait = 2.5;
		//領地終了
		TerritoryEnd();
		break;
	case "@ALCHEMY_OLD@":
		if(i_flg == 0){
			StepSet(54);
			var cno;
			var imgarr = [];
			var btnarr = [];
			for(var i in Player[Territory.pno].hand){
				cno = Player[Territory.pno].hand[i];
				imgarr.push([cno, "TerritoryAbility('"+cno+"')"]);
			}
			btnarr.push(["キャンセル", "TerritoryAbility('N')"]);
			//表示
			DispDialog({imgbtns:imgarr, btns:btnarr});
		}else{
			if(i_flg == "N"){
				//キャンセル
				StepSet(40);
				//ダイアログ非表示
				DispDialog("none");
			}else{
				if(Board.role == Board.turn){
					//ダイアログ非表示
					DispDialog("none");
				}
				//コスト支払い
				TerritoryAbiPaySend(i_flg);
				Player[Territory.pno].HandDel(i_flg);
				Logprint({msg:"##" + i_flg + "##を破棄", pno:Territory.pno});
				//スクロール
				BoardScroll(Territory.gno);
				//msgpop
				EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
				//効果
				if(Board.spelled.length >= 1){
					var cno = Board.spelled[0];
					Player[Territory.pno].hand.push(cno);
					Logprint({msg:"##"+cno+"##を錬成した", pno:Territory.pno});
				}else{
					Logprint({msg:"対象がなかった", pno:Territory.pno});
				}
				if(Board.role == Board.turn){
					//手札再表示
					SortHand();
				}
				//ウェイト
				Board.wait = 1.5;
				//領地終了
				TerritoryEnd();
			}
		}
		break;
	case "@RUST@":
		//Target
		var tgtresult = [], tgthand, rndhno;
		if(Board.role == Board.turn){
			for(var i=1; i<=Board.playcnt; i++){
				tgthand = [];
				if(Board.role != i){
					for(var i2 in Player[i].hand){
						cno = Player[i].hand[i2];
						if(Card[cno].type == "I" && Card[cno].item && Card[cno].item == "W"){
							tgthand.push(cno);
						}
					}
					if(tgthand.length >= 1){
						rndhno = Math.floor(Math.random() * tgthand.length);
						tgtresult.push(tgthand[rndhno]);
					}else{
						tgtresult.push("NONE");
					}
				}else{
					tgtresult.push("ROLE");
				}
			}
		}else{
			tgtresult = i_flg.split("G");
		}
		//コスト支払い
		TerritoryAbiPaySend(tgtresult.join("G"));
		//Shutter
		for(var ipno=1; ipno<=Board.playcnt; ipno++){
			//ターゲット有無
			switch(tgtresult[ipno - 1]){
			case "ROLE":
				break;
			case "NONE":
				Logprint({msg:"対象がなかった", pno:ipno});
				break;
			default:
				//手札追加
				Player[ipno].HandDel(tgtresult[ipno - 1]);
				Logprint({msg:"##" + tgtresult[ipno - 1] + "##を破棄", pno:ipno});
				//Animation
				EffectBox({pattern:"piecejump",pno:ipno});
				//msgpop
				EffectBox({pattern:"msgpop", gno:Player[ipno].stand, msg:"Discard", player:true});
				//手札再表示
				if(ipno == Board.role) SortHand();
				break;
			}
		}
		//ウェイト
		Board.wait = 2.5;
		//領地終了
		TerritoryEnd();
		break;
	}
}
function TerritoryAbiTarget(tgttype){
	switch(tgttype){
	case "grid":
		StepSet(54);
		//ライト
		GridLight("clear");
		//ライト
		GridLight("set_nosave", Territory.mvgno);
		//PHASEENDBUTTON
		$("#BTN_PhaseEnd").html("キャンセル");
		break;
	}
}
function TerritoryAbiTgtChk(gno){
	if(Board.role == Board.turn){
		if(Territory.mvgno.indexOf(gno) >= 0){
			return true;
		}else{
			return false;
		}
	}else{
		return true;
	}
}
function TerritoryAbiPaySend(opt){
	if(Board.turn == Board.role){
		//Command
		var wkcmd = "territory:"+Territory.gno+":ability:"+Territory.ability;
		if(opt){
			wkcmd += ":" + opt;
		}
		//Stack
		Net.send(wkcmd);
	}
	//Pay Cost
	var reg = new RegExp(Territory.ability+"=([0-9]+)");
	var opts = Card[Board.grid[Territory.gno].cno].opt.concat();
	var cost = Number(opts.join(",").match(reg)[1]);
	Player[Territory.pno].gold -= cost;
	//Log
	Logprint({msg:"(領地能力)"+Dic(Territory.ability), pno:Territory.pno});
}
//===================================================
function TerritoryEnd(){
	if(Board.wait > 0){
		if(Territory.pno == Board.role){
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("-");
		}
		var msec = Board.wait * 1000;
		Board.wait = 0;
		//ウェイト
		var id = setTimeout(function(){TerritoryEnd();}, msec);
	}else{
		//### GridAbility ###
		GridAbility({gno:Territory.gno, time:"TERRITORY_CLOSE"});
		//矢印表示
		DivImg("DIV_GCLICK"+Territory.gno, "");
		if(Territory.gno2 >= 1){
			DivImg("DIV_GCLICK"+Territory.gno2, "");
		}
		//再表示
		DispPlayer();
		//Territory終了
		StepSet(60);
		if(Board.role == Board.turn){
			//手札ソート
			SortHand();
			//TurnEnd
			TurnEnd();
		}
	}
}