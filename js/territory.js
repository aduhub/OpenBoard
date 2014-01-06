var Territory = {};
Territory.Step = {};
Territory.Tool = {};
Territory.check = [];
Territory.target = [];
Territory.gno  = 0;
Territory.gno2 = 0;
Territory.cno  = "";
Territory.ability = "";
//########################################
Territory.Step.start = function (i_gno){
	if(Flow.Tool.team(Board.grid[i_gno].owner) == Flow.Tool.team(Board.turn)){
		//領地指示可能
		if(Territory.target.indexOf(i_gno) >= 0){
			var wkarr = [];
			//ライト
			wkarr.push(i_gno);
			Grid.light({clear:true, arr:wkarr});
			//領地INIT
			Flow.step(51);
			Territory.gno = i_gno;
			Territory.gno2 = 0;
			Territory.ability = "";
			//dialog init
			Territory.Step.dialog(0);
		}
	}
}
//
Territory.Step.dialog = function (i_mode){
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
			cmdflg = Territory.Tool.chkcmd({cmdno:0});
			var cost = Number(hits[2]);
			if(cmdflg && Player[Board.turn].gold >= cost){
				btncmd = "onclick='Territory.Step.ability(0)'";
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
			cmdflg = Territory.Tool.chkcmd({cmdno:i});
			btnstr = ["", "レベルアップ", "地形変化", "クリチャ移動", "クリチャ交換", "キャンセル"];
			btncmd = (cmdflg) ? "onclick='Territory.Step.dialog("+i+")'" : "disabled";
			if(i <= 4){
				panels += Infoblock.line({m:btnstr[i], b:btncmd});
			}else{
				panels += Infoblock.line({m:btnstr[i], b:btncmd, cls:Chessclock.set(51)});
			}
		}
		//
		UI.Html.setDiv({id:"DIV_INFOGRID", visible:true, zidx:50});
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
					panels += Infoblock.line({m:"Lv"+i+" "+wkvalue+"G", b:"onclick='Territory.Step.level("+i+")'"});
				}else{
					panels += Infoblock.line({m:"Lv"+i+" "+wkvalue+"G", b:"disabled"});
				}
			}
		}
		panels += Infoblock.line({m:"キャンセル", b:"onclick='Territory.Step.dialog(9)'", cls:Chessclock.set(51)});
		//
		UI.Html.setDiv({id:"DIV_INFOGRID", visible:true, zidx:50});
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
					panels += Infoblock.line({m:btnsrc, b:"onclick='Territory.Step.color("+i+")'"});
				}else{
					panels += Infoblock.line({m:btnsrc, b:"disabled"});
				}
			}
		}
		panels += Infoblock.line({m:"キャンセル", b:"onclick='Territory.Step.dialog(9)'", cls:Chessclock.set(51)});
		//
		UI.Html.setDiv({id:"DIV_INFOGRID", visible:true, zidx:50});
		//innerHTML
		$("#DIV_INFOGRID").html(panels);
		break;
	case 3:
		//[MoveCreature]
		var linkgrid;
		var tgtgrid = Board.grid[Territory.gno];
		var nocolor = ["","N","F","W","E","D"];
		Territory.check = [];
		for(var i=0; i<=3; i++){
			if(tgtgrid.linkarr[i] >= 1){
				linkgrid = Board.grid[tgtgrid.linkarr[i]];
				if(linkgrid.color < 10 && Flow.Tool.team(linkgrid.owner) != Flow.Tool.team(tgtgrid.owner)){
					var walk = Card[tgtgrid.cno].walk || "";
					if(!walk.match(nocolor[linkgrid.color]) && !(walk.match("I") && linkgrid.owner >= 1)){
						if(linkgrid.status != "_JAIL_"){
							Territory.check.push(tgtgrid.linkarr[i]);
						}
					}
				}
			}
		}
		if(tgtgrid.status == "_SPIRITWALK_"){
			var tgtgrids = Grid.grep({tgt:"TSG"});
			for(var i = 0; i<tgtgrids.length; i++){
				if($T.inarray(tgtgrids[i], Territory.check) == false){
					Territory.check.push(tgtgrids[i]);
				}
			}
		}
		if(Territory.check.length >= 1){
			//ライト
			Grid.light({clear:true, arr:Territory.check});
			//移動先入力
			Flow.step(52);
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("キャンセル");
			//timer cancel set
			$("#BTN_PhaseEnd").addClass(Chessclock.set(52));
			//ウィンドウクローズ
			UI.Html.setDiv({id:"DIV_INFOGRID", hidden:true});
		}
		break;
	case 4:
		//[CreatureChange]
		//ライト
		Grid.light({clear:true, arr:[Territory.gno]});
		//交換カード選択
		Flow.step(53);
		//PHASEENDBUTTON
		$("#BTN_PhaseEnd").html("キャンセル");
		//timer cancel set
		$("#BTN_PhaseEnd").addClass(Chessclock.set(53));
		//ウィンドウクローズ
		UI.Html.setDiv({id:"DIV_INFOGRID", hidden:true});
		//カードチェック
		Summon.Step.start(Territory.gno);
		break;
	case 9:
		//クリア
		Territory.ability = "";
		//ライト
		Grid.light({clear:true, load:true});
		//キャンセル
		Flow.step(40);
		//PHASEENDBUTTON
		$("#BTN_PhaseEnd").html("ターンエンド");
		UI.Html.setDiv({id:"DIV_INFOGRID", hidden:true});
		break;
	}
}
//
Territory.Step.recv = function (){
	var arg = arguments;
	var wkarr = arg[1].split(":");
	Territory.gno = wkarr[0];
	//領地開始
	Flow.step(51);
	//スクロール
	UI.Tool.scrollBoard(Territory.gno);
	//矢印表示
	UI.Html.setDiv({id:"DIV_GCLICK"+Territory.gno, img:"arrow2.gif"});
	//領地コマンド
	switch(wkarr[1]){
	case "level":
		Territory.Step.level(wkarr[2]);
		break;
	case "color":
		Territory.Step.color(wkarr[2]);
		break;
	case "move":
		Territory.Step.move(wkarr[2], 0);
		break;
	case "ability":
		Territory.ability = wkarr[2];
		//能力
		Territory.Step.ability(wkarr[3]);
		break;
	}
}
//========================================/
Territory.Step.level = function (i_level){
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
	if(Player[Board.turn].gold >= wkvalue){
		if(Board.turn == Board.role){
			//ウィンドウ消去
			UI.Html.setDiv({id:"DIV_INFOGRID", hidden:true});
			//コマンド送信
			var wkcmd = "territory:"+Territory.gno+":level:"+i_level;
			//送信
			Net.send(wkcmd);
		}
		//設定
		tgtgrid.level = Number(i_level);
		//消費
		Player[Board.turn].gold -= wkvalue;
		//地形表示
		Grid.Img.set(Territory.gno);
		//Log
		Logprint({msg:"(レベルアップ) "+wklevel+" > "+i_level, pno:Board.turn});
		//animation
		EffectBox({pattern:"levelup", gno:Territory.gno});
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Lv" + wklevel + ">" + i_level});
		EffectBox({pattern:"lvlpop", level:tgtgrid.level, chain:Grid.count({owner:Board.turn, color:tgtgrid.color})});
		//領地終了
		Territory.Step.end(1.5);
	}
}
//
Territory.Step.color = function (i_color){
	var tgtgrid = Board.grid[Territory.gno];
	var wkelement = ["", "無", "火", "水", "地", "風"];
	var wkcolor = tgtgrid.color;
	var wkvalue = (wkcolor != 1) ? 200 : 0;
	wkvalue += tgtgrid.level * 100;
	if(Player[Board.turn].gold >= wkvalue){
		if(Board.turn == Board.role){
			//ウィンドウ消去
			UI.Html.setDiv({id:"DIV_INFOGRID", hidden:true});
			//コマンド送信
			var wkcmd = "territory:"+Territory.gno+":color:"+i_color;
			//送信
			Net.send(wkcmd);
		}
		//設定
		tgtgrid.color = i_color;
		//消費
		Player[Board.turn].gold -= wkvalue;
		//地形表示
		Grid.Img.set(Territory.gno);
		//Log
		Logprint({msg:"(地形変化) "+wkelement[wkcolor]+" > "+wkelement[i_color], pno:Board.turn});
		CustomLog({type:"colorcnt", pno:Board.turn, color:[wkcolor, i_color]});
		//animation
		EffectBox({pattern:"focusin", gno:Territory.gno});
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Change"});
		EffectBox({pattern:"lvlpop", level:tgtgrid.level, chain:Grid.count({owner:Board.turn, color:tgtgrid.color})});
		//領地終了
		Territory.Step.end(1.5);
	}
}
//
Territory.Step.move = function (i_gno, i_flg){
	var mvflg = 1;
	var wkcno = Board.grid[Territory.gno].cno;
	Territory.gno2 = i_gno;
	if(Board.turn == Board.role){
		mvflg = 0;
		//移動可
		for(var i=0; i<=Territory.check.length - 1; i++){
			if(Territory.check[i] == i_gno){
				mvflg = 1;
				break;
			}
		}
	}
	if(mvflg == 1){
		Flow.step(53);
		if(Board.turn == Board.role && i_flg == 0){
			//コマンド送信
			var wkcmd = "territory:"+Territory.gno+":move:"+i_gno;
			//送信
			Net.send(wkcmd);
		}
		if(Board.grid[i_gno].owner == 0){
			//Move
			Grid.move({gno1:Territory.gno, gno2:i_gno, effect:true});
			//Log
			Logprint({msg:"(領地移動)", pno:Board.turn});
			var color = [Board.grid[Territory.gno].color, Board.grid[i_gno].color];
			CustomLog({type:"colorcnt", pno:Board.turn, color:color});
			EffectBox({pattern:"lvlpop", level:Board.grid[i_gno].level, chain:Grid.count({owner:Board.turn, color:Board.grid[i_gno].color})});
			//領地終了
			Territory.Step.end(1.0);
		}else{
			//Log
			Logprint({msg:"(移動侵略)", pno:Board.turn});
			//矢印表示
			UI.Html.setDiv({id:"DIV_GCLICK"+i_gno, img:"arrow3.gif"});
			//Annimation
			EffectBox({pattern:"invasion", cno:wkcno, gno1:Territory.gno, gno2:i_gno});
			EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Move"});
			//【戦闘】
			Battle.gno_atk = Territory.gno;
			var wkcmd = function(){BattleInit("M", i_gno, Board.turn, wkcno);};
			var id = setTimeout(wkcmd, 1500);
		}
	}
}
//
Territory.Step.ability = function (i_flg){
	if(Board.turn == Board.role){
		//ウィンドウクローズ
		UI.Html.setDiv({id:"DIV_INFOGRID", hidden:true});
	}
	//abbilitys
	switch(Territory.ability){
	case "@DIVING@":
		if(i_flg == 0){
			//検索
			Territory.check = Grid.grep({tgt:"TSGW"});
			//ライト
			Territory.Tool.targetGrid();
		}else{
			//コスト支払い
			Territory.Tool.paycost(i_flg);
			//【移動】
			Territory.Step.move(i_flg, 1);
		}
		break;
	case "@TOUR@":
		if(i_flg == 0){
			//検索
			Territory.check = Grid.grep({tgt:"TSGD"});
			//ライト
			Territory.Tool.targetGrid();
		}else{
			//コスト支払い
			Territory.Tool.paycost(i_flg);
			//【移動】
			Territory.Step.move(i_flg, 1);
		}
		break;
	case "@GLIDE@":
		if(i_flg == 0){
			var extarr = [];
			//検索
			extarr.push(Territory.gno);
			Territory.check = Grid.grep({pno:Board.turn, tgt:"TOGL1", ext:extarr});
			//ライト
			Territory.Tool.targetGrid();
		}else{
			//コスト支払い
			Territory.Tool.paycost(i_flg);
			//【移動】
			Territory.Step.move(i_flg, 1);
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
			UI.Html.setDiv({id:"DIV_GCLICK"+Territory.gno, clear:true});
		}
		//コスト支払い・送信
		Territory.Tool.paycost(selectdno);

		//##### 還    元 #####
		var wkvalue = Grid.value(Territory.gno);
		Player[Board.turn].gold += wkvalue;
		//領地クリア(レベル1)
		Grid.clear({gno:Territory.gno, all:true});
		//##### 火属性変更 #####
		if(colorno != 2){
			Board.grid[Territory.gno].color = 2;
			//地形表示
			Grid.Img.set(Territory.gno);
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
		Logprint({msg:"土地売却 <span class='g'>"+wkvalue+"G</span>", pno:Board.turn});
		if(colorno != 2){
			Logprint({msg:"(地形変化) "+wkelement[colorno]+" > "+wkelement[2], pno:Board.turn});
		}
		Logprint({msg:"デッキ復帰", pno:Board.turn});

		//総魔力表示
		DispPlayer();
		//領地終了
		Territory.Step.end(2.5);
		break;
	case "@FIREBALL@":
		if(i_flg == 0){
			//検索
			Territory.check = Grid.grep({pno:Board.turn, tgt:"TOG"});
			//ライト
			Territory.Tool.targetGrid();
		}else{
			//コスト支払い
			Territory.Tool.paycost(i_flg);
			Territory.gno2 = i_flg;
			//msgpop
			EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
			//Map Damage
			Grid.damage({gno:[Territory.gno, i_flg], dmg:20, arrow:true, scroll:true});
			//領地終了
			Territory.Step.end(3.0);
		}
		break;
	case "@UNTIELEMENT@":
		if(i_flg == 0){
			//検索(Oppo)
			Territory.check = Grid.grep({pno:Board.turn, tgt:"TOG"});
			//ライト
			Territory.Tool.targetGrid();
		}else{
			//コスト支払い
			Territory.Tool.paycost(i_flg);
			Territory.gno2 = i_flg;
			//Status
			Grid.setstatus({gno:i_flg, status:"_UNTIELEMENT_", statime:99, arrow:true, scroll:true});
			//領地終了
			Territory.Step.end(2.5);
		}
		break;
	case "@REMOVE@":
		if(i_flg == 0){
			//検索
			Territory.check = Grid.grep({pno:Board.turn, tgt:"TEGALL"});
			//ライト
			Territory.Tool.targetGrid();
		}else{
			//コスト支払い
			Territory.Tool.paycost(i_flg);
			Territory.gno2 = i_flg;
			var tgtcno = Board.grid[i_flg].cno;
			var tgtpno = Board.grid[i_flg].owner;
			//ステータスクリア
			Board.grid[i_flg].status = "";
			Board.grid[i_flg].statime = 0;
			//表示
			Grid.Img.tax({gno:i_flg});
			//矢印
			UI.Html.setDiv({id:"DIV_GCLICK"+i_flg, img:"arrow4.gif"});
			//スクロール
			UI.Tool.scrollBoard(i_flg);
			//msgpop
			EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
			//Log
			Logprint({msg:"##"+tgtcno+"##は呪いが解けた", pno:tgtpno});
			//領地終了
			Territory.Step.end(2.5);
		}
		break;
	case "@PUSH@":
		if(i_flg == 0){
			if(Board.role == Board.turn){
				//隣接取得(生物)
				var gnos = Board.grid[Territory.gno].linkarr;
				Territory.check = Grid.grep({tgt:"TEGLIVE", pno:Board.turn, select:gnos});
				//ライト
				Territory.Tool.targetGrid();
			}
		}else{
			//コスト支払い
			Territory.Tool.paycost(i_flg);
			//
			var arrow = Board.grid[Territory.gno].GetArrow(i_flg);
			var tgtgno2 = Board.grid[i_flg].GetLink(arrow);
			//Move
			if(tgtgno2 > 0 && Board.grid[tgtgno2].color < 10 && Board.grid[tgtgno2].owner == 0){
				Grid.move({gno1:i_flg, gno2:tgtgno2, effect:true});
			}else{
				Logprint({msg:"効果がなかった", pno:ipno});
			}
			//領地終了
			Territory.Step.end(2.5);
		}
		break;
	case "@QUICKSAND@":
		//コスト支払い
		Territory.Tool.paycost();
		//Status
		Grid.setstatus({gno:Territory.gno, status:"_QUICKSAND_", statime:99, scroll:true});
		//msgpop
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
		//Log
		Logprint({msg:"##"+Board.grid[Territory.gno].cno+"##は呪いを受けた", pno:Board.turn});
		//領地終了
		Territory.Step.end(2.5);
		break;
	case "@LEVELUP@":
		//効果実行
		if(Board.grid[Territory.gno].level <= 4){
			//コスト支払い
			Territory.Tool.paycost();
			//設定
			Board.grid[Territory.gno].level++;
			//地形表示
			Grid.Img.set(Territory.gno);
			//animation
			EffectBox({pattern:"levelup", gno:Territory.gno});
			EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
			//領地終了
			Territory.Step.end(2.5);
		}
		break;
	case "@DRAWCARD@":
		var diagimg = [];
		//コスト支払い
		Territory.Tool.paycost();
		//手札追加
		var cno = Deck.Tool.draw({pno:Board.turn, from:"deck"});
		if(Board.turn == Board.role){
			diagimg.push(cno);
			//ダイアログ
			DispDialog({dtype:"ok", cnos:diagimg});
			Deck.Tool.sorthand();
		}
		//msgpop
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
		EffectBox({pattern:"msgpop", gno:Player[Board.turn].stand, msg:"Draw", player:true});
		//ReDisp
		DispPlayer();
		//領地終了
		Territory.Step.end(2.0);
		break;
	case "@DISPEL@":
		var diagimg = [];
		//コスト支払い
		Territory.Tool.paycost();
		for(var i=1; i<=Board.playcnt; i++){
			if(Player[i].status != ""){
				//Clear
				Player[i].status = "";
				Player[i].statime = 0;
				//Icon
				UI.Tool.playerIcon(i);
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
		//領地終了
		Territory.Step.end(2.0);
		break;
	case "@DRAIN@":
		if(i_flg == 0){
			Flow.step(54);
			var btnarr = [];
			for(var i=1; i<=Board.playcnt; i++){
				if(Board.role != i && !(Player[i].status.match(/_BARRIER_/))){
					btnarr.push([Player[i].name, "Territory.Step.ability("+i+")"]);
				}
			}
			btnarr.push(["キャンセル", "Territory.Step.ability(9)"]);
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
				Territory.Tool.paycost(i_flg);
				//効果
				var wkgold = Math.floor(Player[tgtpno].gold * 0.2);
				Player[Board.turn].gold += wkgold;
				Player[tgtpno].gold -= wkgold;
				//スクロール
				UI.Tool.scrollBoard(Player[tgtpno].stand);
				//Animation
				EffectBox({pattern:"piecejump",pno:tgtpno});
				EffectBox({pattern:"msgpop", gno:Player[tgtpno].stand, msg:wkgold+"G", color:"#ff0000", player:true});
				EffectBox({pattern:"msgpop", gno:Player[Board.turn].stand, msg:wkgold+"G", color:"#ffcc00", player:true});
				EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
				//Log
				Logprint({msg:Player[tgtpno].name+"から<span class='g'>"+wkgold+"G</span>奪った", pno:Board.turn});
				//領地終了
				Territory.Step.end(2.5);
			}else{
				//キャンセル
				Flow.step(40);
			}
		}
		break;
	case "@RITUAL@":
		var rndgno;
		var tgtgno = 0;
		if(Board.role == Board.turn){
			var tgtgrids = Grid.grep({tgt:"TSG"});
			if(tgtgrids.length >= 1){
				rndgno = Math.floor(Math.random() * tgtgrids.length);
				tgtgno = tgtgrids[rndgno];
			}
		}else{
			tgtgno = i_flg;
			//矢印表示
			UI.Html.setDiv({id:"DIV_GCLICK"+Territory.gno, clear:true});
		}
		//コスト支払い
		Territory.Tool.paycost(tgtgno);
		//msgpop
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
		//効果
		if(tgtgno >= 1){
			var tgtcno = Board.grid[Territory.gno].cno;
			//スクロール
			UI.Tool.scrollBoard(tgtgno);
			//変数設定
			Summon.from = "territory";
			Summon.pno = Board.turn;
			Summon.cno = "C106";
			Summon.gno = tgtgno;
			//Log
			Logprint({msg:"(能力召喚)##C106##", pno:Board.turn});
			//
			setTimeout(function(){Summon.Step.setgrid();}, 1500);
		}else{
			Logprint({msg:"空き土地がなかった", pno:Board.turn});
			//再表示
			DispPlayer();
			//領地終了
			Territory.Step.end(1.5);
		}
		break;
	case "@DIVISION@":
		if(i_flg == 0){
			if(Board.role == Board.turn){
				//隣接検索(侵略)
				var gnos = Board.grid[Territory.gno].linkarr;
				Territory.check = Grid.grep({tgt:"TAGWALK", pno:Board.turn, select:gnos});
				//ライト
				Territory.Tool.targetGrid();
			}
		}else{
			var cno = Board.grid[Territory.gno].cno;
			//コスト支払い
			Territory.Tool.paycost(i_flg);
			//msgpop
			EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
			//矢印表示
			UI.Html.setDiv({id:"DIV_GCLICK"+Territory.gno, clear:true});
			//スクロール
			UI.Tool.scrollBoard(i_flg);
			//Log
			Logprint({msg:"(能力召喚)##"+cno+"##", pno:Board.turn});
			if(Board.grid[i_flg].owner != 0){
				//Annimation
				EffectBox({pattern:"invasion", cno:cno, gno1:Territory.gno, gno2:i_flg});
				//【戦闘】
				Battle.hand = cno;
				var wkcmd = function(){BattleInit("S", i_flg, Board.turn, cno);};
				var id = setTimeout(wkcmd, 1500);
			}else{
				//変数設定
				Summon.from = "territory";
				Summon.pno = Board.turn;
				Summon.cno = cno;
				Summon.gno = i_flg;
				//
				setTimeout(function(){Summon.Step.setgrid();}, 1500);
			}
		}
		break;
	case "@ALCHEMY@":
		//コスト支払い
		Territory.Tool.paycost();
		//スクロール
		UI.Tool.scrollBoard(Territory.gno);
		//msgpop
		EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
		//効果
		if(Board.spelled.length >= 1){
			var cno = Board.spelled[0];
			Player[Board.turn].hand.push(cno);
			Logprint({msg:"##"+cno+"##を錬成した", pno:Board.turn});
		}else{
			Logprint({msg:"対象がなかった", pno:Board.turn});
		}
		if(Board.role == Board.turn){
			//手札再表示
			Deck.Tool.sorthand();
		}
		//領地終了
		Territory.Step.end(2.5);
		break;
	case "@ALCHEMY_OLD@":
		if(i_flg == 0){
			Flow.step(54);
			var cno;
			var imgarr = [];
			var btnarr = [];
			for(var i in Player[Board.turn].hand){
				cno = Player[Board.turn].hand[i];
				imgarr.push([cno, "Territory.Step.ability('"+cno+"')"]);
			}
			btnarr.push(["キャンセル", "Territory.Step.ability('Cancel')"]);
			//表示
			DispDialog({imgbtns:imgarr, btns:btnarr});
		}else{
			if(i_flg == "Cancel"){
				//キャンセル
				Flow.step(40);
				//ダイアログ非表示
				DispDialog("none");
			}else{
				if(Board.role == Board.turn){
					//ダイアログ非表示
					DispDialog("none");
				}
				//コスト支払い
				Territory.Tool.paycost(i_flg);
				Player[Board.turn].HandDel(i_flg);
				Logprint({msg:"##" + i_flg + "##を破棄", pno:Board.turn});
				//スクロール
				UI.Tool.scrollBoard(Territory.gno);
				//msgpop
				EffectBox({pattern:"msgpop", gno:Territory.gno, msg:"Ability"});
				//効果
				if(Board.spelled.length >= 1){
					var cno = Board.spelled[0];
					Player[Board.turn].hand.push(cno);
					Logprint({msg:"##"+cno+"##を錬成した", pno:Board.turn});
				}else{
					Logprint({msg:"対象がなかった", pno:Board.turn});
				}
				if(Board.role == Board.turn){
					//手札再表示
					Deck.Tool.sorthand();
				}
				//領地終了
				Territory.Step.end(1.5);
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
		Territory.Tool.paycost(tgtresult.join("G"));
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
				if(ipno == Board.role) Deck.Tool.sorthand();
				break;
			}
		}
		//領地終了
		Territory.Step.end(2.5);
		break;
	}
}
//========================================
Territory.Step.end = function (){
	if(arguments.length >= 1){
		if(Board.turn == Board.role){
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("-");
		}
		var msec = arguments[0] * 1000;
		//ウェイト
		var id = setTimeout(function(){Territory.Step.end();}, msec);
	}else{
		//### GridAbility ###
		GridAbility({gno:Territory.gno, time:"TERRITORY_CLOSE"});
		//矢印表示
		UI.Html.setDiv({id:"DIV_GCLICK"+Territory.gno, clear:true});
		if(Territory.gno2 >= 1){
			UI.Html.setDiv({id:"DIV_GCLICK"+Territory.gno2, clear:true});
		}
		//再表示
		DispPlayer();
		//Territory終了
		Flow.step(60);
		if(Board.role == Board.turn){
			//手札ソート
			Deck.Tool.sorthand();
			//TurnEnd
			Flow.Step.turnend();
		}
	}
}
//########################################
//コマンド使用可不可
Territory.Tool.chkcmd = function (arg){
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
			if(Card.Tool.chkopt({gno:Territory.gno, tgt:/@LEVELUP@/}) && tgtgrid.level == 5){
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
//
Territory.Tool.targetGrid = function (){
	//Step
	Flow.step(54);
	//ライト
	Grid.light({clear:true, arr:Territory.check});
	//PHASEENDBUTTON
	$("#BTN_PhaseEnd").html("キャンセル");
}
//
Territory.Tool.paycost = function (opt){
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
	Player[Board.turn].gold -= cost;
	//Log
	Logprint({msg:"(領地能力)"+Dic(Territory.ability), pno:Board.turn});
}
