//スペルカードチェック
function SpellCheck(){
	//Image再設定
	for(var i in Player[Board.role].hand){
		var cno =  Player[Board.role].hand[i];
		if(Card[cno].type != "S"){
			$("#DIV_HAND"+i).addClass("CLS_HAND_GLAY");
		}else if(Player[Board.role].gold < Card[cno].cost){
			Canvas.draw({id:"CVS_HAND"+i, src:"img/icon_nogold.gif"});
		}
	}
}
//コストチェック
function SpellCost(i_hno){
	var cno = Player[Board.role].hand[i_hno];
	//タイプチェック
	if(Card[cno].type == "S"){
		//コストチェック
		return (Player[Board.role].gold >= Card[cno].cost) ? true : false;
	}else{
		return false;
	}
}
//ターゲットチェック
function SpellTarget(i_hno){
	//Target文字 : [All,Target][Me,Each,Opponent,Space,Xothers][Player,Grid,Deck] AEGMOPT
	var cno = Player[Board.role].hand[i_hno];
	var tgt = Card[cno].tgt.split(",")[0];
	//Spellセット
	Spell.pno = Board.role;
	Spell.cno = cno;
	Spell.check = [];
	Spell.target = [];
	//アイコン表示
	Canvas.draw({id:"CVS_HAND"+i_hno, src:"img/cmd_select.gif", alpha:0.6});
	//ターゲット・対象の～
	if(tgt.match(/^T.*$/)){
		//タイプ
		Spell.tgttype = tgt.substr(2, 1);
		//Player
		if(tgt.match(/^T.P.?$/)){
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("-");
			//Target Player
			SpellTgtPlayer(0);
		}
		//Grid
		if(tgt.match(/^T.G.*$/)){
			Spell.check = GridTgtGrep({pno:Board.turn, tgt:tgt});
			//ライト
			GridLight("clear");
			//ライト
			GridLight("set_nosave", Spell.check);
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("キャンセル");
			//timer cancel set
			$("#BTN_PhaseEnd").addClass(Chessclock.set(21));
		}
		//ターゲット設定
		StepSet(21);
	}
	//ターゲット・全体の～
	if(tgt.match(/^A.*$/)){
		//Player
		if(tgt.match(/^A.P.?$/)){
			for(var i=1; i<=Board.playcnt; i++){
				if((Board.role == i && tgt.match(/^AMP.?$/)) || (Board.role != i && tgt.match(/^AOP.?$/)) || tgt.match(/^AEP.?$/)){
					Spell.tgttype = "P";
					Spell.target.push(i);
				}
			}
		}
		//Grid
		if(tgt.match(/^A.G.*$/)){
			Spell.target = GridTgtGrep({pno:Board.turn, tgt:tgt});
		}
		//ターゲット確定
		StepSet(22);
		//使用確認
		SpellConfirm(0);
	}
}
//ターゲットダイアログ
function SpellTgtPlayer(i_num){
	switch(i_num){
	case 0: //表示
		var btnarr = [];
		var target = Card[Spell.cno].tgt;
		for(var i=1;i<=Board.playcnt;i++){
			if((target.match("E") || (target.match("O") && Board.role != i)) && !(Player[i].status.match(/_BARRIER_/))){
				btnarr.push([Player[i].name, "SpellTgtPlayer("+i+")"]);
			}else{
				btnarr.push([Player[i].name, ""]);
			}
		}
		btnarr.push(["キャンセル", "SpellConfirm(2)", 21]);
		//表示
		DispDialog({btns:btnarr});
		break;
	default: //OK
		//ターゲット追加
		Spell.target.push(i_num);
		//ターゲット確定
		StepSet(22);
		//使用確認
		SpellConfirm(0);
		break;
	}
}
//
function SpellTgtGirdCheck(i_gno){
	if(Card[Spell.cno].tgt.match(/^T.G.*$/) && Spell.check.indexOf(i_gno) >= 0){
		//ターゲット追加
		Spell.target.push(i_gno);
		var tgtarr = Card[Spell.cno].tgt.split(",");
		if(tgtarr.length == Spell.target.length){
			//ターゲット確定
			StepSet(22);
			//使用確認
			SpellConfirm(0);
		}else{
			Spell.check = GridTgtGrep({pno:Board.turn, tgt:tgtarr[Spell.target.length], ext:Spell.target});
			//ライト
			GridLight("clear");
			//ライト
			GridLight("set_nosave", Spell.check);
			//
			DispDialog({msgs:["次のターゲットを選択してください"], dtype:"ok"});
		}
	}
}
//スペル使用確認
function SpellConfirm(i_num){
	//ライト
	GridLight("clear");
	//ダイアログ
	switch(i_num){
	case 0: //表示
		var msgarr = ["["+Card[Spell.cno].name+"]を使用しますか？"];
		var btnarr = ["SpellConfirm(1)", "SpellConfirm(2)"];
		//ダイアログ
		DispDialog({msgs:msgarr, btns:btnarr, dtype:"yesno" ,timer:true});
		break;
	case 1: //OK
		//ダイアログ非表示
		DispDialog("none");
		//コマンド送信
		var wkcmd = "spell:"+Spell.cno+":"+Spell.tgttype+":"+Spell.target.join("_");
		//送信
		Net.send(wkcmd);
		//Spell aculo
		StepSet(23);
		//Animation
		EffectBox({pattern:"spellpuff"});
		//効果実行
		setTimeout(function(){SpellFire(0);}, 1500);
		break;
	case 2: //NO、ターゲットキャンセル
		//ダイアログ非表示
		DispDialog("none");
		//アイコン再表示
		SpellCheck();
		//PHASEENDBUTTON
		$("#BTN_PhaseEnd").html("ダイス");
		//巻き戻し
		StepSet(20);
		break;
	}
}
//##################################################
//スペル受信処理
function SpellRecv(i_flg, i_pno, i_cmd){
	var arg = arguments;
	switch(i_flg){
	case 1: //通常
		var wkarr = i_cmd.split(":");
		Spell.pno = i_pno;
		Spell.cno = wkarr[0];
		Spell.tgttype = wkarr[1];
		Spell.target = wkarr[2].split("_");
		//Spell aculo
		StepSet(23);
		//エフェクト
		EffectBox({pattern:"spellpuff"});
		//効果実行
		setTimeout(function(){SpellFire(0);}, 1500);
		break;
	case 2: //Plus Target
		//ターゲット再設定
		Spell.target = i_cmd.split("_");
		//効果実行
		setTimeout(function(){SpellFire(1);}, 100);
		break;
	}
}
//################# Spell動作 ###################
function SpellFire(i_flg){
	var wait = 0;
	var second = false;
	var cardback = "";
	//初回のみ
	if(i_flg == 0){
		//Log
		Logprint({msg:"スペル##"+Spell.cno+"##", pno:Spell.pno});
		//コスト消費
		Player[Spell.pno].gold -= Card[Spell.cno].cost;
		//カード消費
		Player[Spell.pno].HandDel(Spell.cno);
	}
	//Spell大分岐
	switch(Card[Spell.cno].spell){
	case "MANA":
		var wkgold = Player[Spell.pno].lap * 50;
		Player[Spell.pno].gold += wkgold;
		//msgpop
		EffectBox({pattern:"msgpop", gno:Player[Spell.pno].stand, msg:wkgold+"G", color:"#ffcc00", player:true});
		//Log
		Logprint({msg:"<span class='g'>"+wkgold+"G</span>を得た", pno:Spell.pno});
		//WAIT
		wait = 200;
		break;
	case "FESTIVAL":
		var wkgold = 0;
		var tgtcno;
		for(var i in Player[Spell.pno].hand.length){
			tgtcno = Player[Spell.pno].hand[i];
			if(Card[tgtcno].type == "C"){
				Player[Spell.pno].HandDel(tgtcno);
				Logprint({msg:"##" + tgtcno + "##を破棄", pno:Spell.pno});
				wkgold += Number(Card[Spell.cno].opt[0]);
			}
		}
		Player[Spell.pno].gold += wkgold;
		//msgpop
		EffectBox({pattern:"msgpop", gno:Player[Spell.pno].stand, msg:wkgold+"G", color:"#ffcc00", player:true});
		//Log
		Logprint({msg:"<span class='g'>"+wkgold+"G</span>を得た", pno:Spell.pno});
		//WAIT
		wait = 200;
		break;
	case "BALANCE":
		var wkgold = 0;
		for(var i=0; i<Spell.target.length; i++){
			var tgtpno = Spell.target[i];
			wkgold = PlayerRank(tgtpno, 0) * GridCount(tgtpno) * 20;
			Player[tgtpno].gold += wkgold;
			//msgpop
			EffectBox({pattern:"msgpop", gno:Player[tgtpno].stand, msg:wkgold+"G", color:"#ffcc00", player:true});
			//Log
			Logprint({msg:"<span class='g'>"+wkgold+"G</span>を得た", pno:tgtpno});
		}
		wait = 200;
		break;
	case "SOULCOLECT":
		var wkgold = Board.grave.length * Number(Card[Spell.cno].opt[0]);
		Board.grave = [];
		Player[Spell.pno].gold += wkgold;
		//msgpop
		EffectBox({pattern:"msgpop", gno:Player[Spell.pno].stand, msg:wkgold+"G", color:"#ffcc00", player:true});
		//Log
		Logprint({msg:"<span class='g'>"+wkgold+"G</span>を得た", pno:Spell.pno});
		Logprint({msg:"墓地カウントクリア", ltype:"system"});
		//WAIT
		wait = 200;
		break;
	case "SETSTATUSP":
		var tgtpno = Number(Spell.target[0]);
		//status
		Player[tgtpno].status = Card[Spell.cno].opt[0];
		Player[tgtpno].statime = Card[Spell.cno].opt[1];
		//icon set
		SetPlayerIcon(tgtpno, StatusIcon(Card[Spell.cno].opt[0]));
		//msgpop
		EffectBox({pattern:"msgpop", gno:Player[tgtpno].stand, msg:"Cursed", color:"#F0D4FF", player:true});
		//log
		Logprint({msg:Player[tgtpno].name+"は呪いを受けた", pno:tgtpno});
		//WAIT
		wait = 200;
		break;
	case "MONOPOLY":
		var tgtpno = Number(Spell.target[0]);
		//chk
		for(var i=1; i<=Board.playcnt; i++){
			if(Player[i].status == Card[Spell.cno].opt[0]){
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
		//status
		Player[tgtpno].status = Card[Spell.cno].opt[0];
		Player[tgtpno].statime = Card[Spell.cno].opt[1];
		//icon set
		SetPlayerIcon(tgtpno, StatusIcon(Card[Spell.cno].opt[0]));
		//msgpop
		EffectBox({pattern:"msgpop", gno:Player[tgtpno].stand, msg:"Cursed", color:"#F0D4FF", player:true});
		//log
		Logprint({msg:Player[tgtpno].name+"は呪いを受けた", pno:tgtpno});
		//WAIT
		wait = 200;
		break;
	case "QUEST":
		var tgtpno = Number(Spell.target[0]);
		//status
		Player[tgtpno].status = Card[Spell.cno].opt[0]+":"+Analytics.invasionwin[tgtpno];
		Player[tgtpno].statime = Card[Spell.cno].opt[1];
		//icon set
		SetPlayerIcon(tgtpno, StatusIcon(Card[Spell.cno].opt[0]));
		//msgpop
		EffectBox({pattern:"msgpop", gno:Player[tgtpno].stand, msg:"Cursed", color:"#F0D4FF", player:true});
		//log
		Logprint({msg:Player[tgtpno].name+"は呪いを受けた", pno:tgtpno});
		//WAIT
		wait = 200;
		break;
	case "DRAIN":
		var tgtpno = Number(Spell.target[0]);
		var wkgold = Math.floor(Player[tgtpno].gold * Number(Card[Spell.cno].opt[0]) / 100);
		Player[Spell.pno].gold += wkgold;
		Player[tgtpno].gold -= wkgold;
		//スクロール
		BoardScroll(Player[tgtpno].stand);
		//Animation
		EffectBox({pattern:"piecejump",pno:tgtpno});
		EffectBox({pattern:"msgpop", gno:Player[tgtpno].stand, msg:wkgold+"G", color:"#ff0000", player:true});
		setTimeout(function(){
			//スクロール
			BoardScroll(Player[Spell.pno].stand);
			//msgpop
			EffectBox({pattern:"msgpop", gno:Player[Spell.pno].stand, msg:wkgold+"G", color:"#ffcc00", player:true});
		}, 1500);
		//Log
		Logprint({msg:Player[tgtpno].name+"から<span class='g'>"+wkgold+"G</span>奪った", pno:Spell.pno});
		//WAIT
		wait = 1000;
		break;
	case "TELEPORT":
		var pno = Number(Spell.target[0]);
		var mvto = [];
		if(i_flg == 0){
			switch(Card[Spell.cno].opt[0]){
			case "castle":
				for(var i=1; i<=Board.grid.length - 1; i++){
					if(Board.grid[i].color == 10){
						mvto.push(i);
						break;
					}
				}
				break;
			case "special":
				var gno = Player[pno].stand;
				mvto = GridNearTgtSearch({gno:gno, tgt:"special"});
				break;
			case "escape":
				var gno = Player[pno].stand;
				mvto = GridNearTgtSearch({gno:gno, tgt:"space"});
				break;
			}
		}else{
			mvto.push(Spell.target[1]);
			if(Board.turn == Board.role){
				//ライト
				GridLight("clear");
				//コマンド送信
				var wkcmd = "spellplus:"+Spell.target.join("_");
				//送信
				Net.send(wkcmd);
			}
		}
		if(mvto.length == 0){
			Logprint({msg:"対象がなかった", pno:pno});
		}else if(mvto.length == 1){
			Player[pno].shadow = mvto[0];
			Player[pno].stand = mvto[0];
			Player[pno].dicepass = true;
			//Animation & ImageChange
			EffectBox({pattern:"piecemove", pno:pno, gno:mvto[0], msec:500});
			//Log
			Logprint({msg:Player[pno].name+"はテレポートした", pno:pno});
		}else{
			StepSet(25);
			//Role Player
			if(Board.turn == Board.role){
				Spell.check = mvto;
				//Second
				SpellTgtSecond({step:0});
			}
			//Second Target
			second = true;
		}
		break;
	case "DRAW":
		var diagimg = [];
		var drawcnt = Card[Spell.cno].opt[0];
		//Draw X
		for(var i=1; i<=drawcnt; i++){
			//手札追加
			var cno = Drawcard({pno:Spell.pno, from:"deck"});
			diagimg.push(cno);
		}
		if(Board.turn == Board.role){
			//ダイアログ
			DispDialog({dtype:"ok", cnos:diagimg});
		}
		//msgpop
		EffectBox({pattern:"msgpop", gno:Player[Spell.pno].stand, msg:"Draw", player:true});
		//hand
		if(Board.turn == Board.role) SortHand();
		//ReDisp
		DispPlayer();
		//復帰
		if(Card[Spell.cno].opt[1] == "hand"){
			cardback = "hand";
		}
		//WAIT
		wait = 200;
		break;
	case "REINCARNE":
		//Hand Clear
		var handcnt = Player[Spell.pno].hand.length;
		Player[Spell.pno].hand = [];
		//Draw
		var drawcnt = handcnt + 1;
		for(var i=1; i<=drawcnt; i++){
			Drawcard({pno:Spell.pno, from:"deck"});
		}
		//msgpop
		EffectBox({pattern:"msgpop", gno:Player[Spell.pno].stand, msg:"Draw", player:true});
		//Logprint({msg:drawcnt+"枚ドロー", pno:Spell.pno});
		//hand
		if(Board.turn == Board.role) SortHand();
		//ReDisp
		DispPlayer();
		//WAIT
		wait = 200;
		break;
	case "FLATLINE":
		var rnd, cno, hand;
		if(i_flg == 0){
			StepSet(25);
			Spell.target = [];
			if(Board.turn == Board.role){
				for(var ipno=1; ipno<=Board.playcnt; ipno++){
					if(Player[ipno].hand.length > 4){
						hand = Player[ipno].hand.split(":");
						while(hand.length > 4){
							var rnd = Math.floor(Math.random() * hand.length);
							var cno = hand.splice(rnd, 1);
							Spell.target.push(cno[0]);
						}
					}
				}
				//コマンド送信
				var wkcmd = "spellplus:"+Spell.target.join("_");
				//送信
				Net.send(wkcmd);
				//使用確認
				SpellFire(1);
			}else{
				//Second Target
				second = true;
			}
		}else{
			var orders = Spell.target;
			for(var ipno=1; ipno<=Board.playcnt; ipno++){
				if(Player[ipno].hand.length < 4){
					//{Draw}
					while(Player[ipno].hand.length < 4){
						var cno = Drawcard({pno:ipno, from:"deck"});
					}
					//msgpop
					EffectBox({pattern:"msgpop", gno:Player[ipno].stand, msg:"Draw", player:true});
				}else if(Player[ipno].hand.length > 4){
					//{Dicard}
					while(Player[ipno].hand.length > 4){
						var cno = orders.shift();
						Player[ipno].HandDel(cno);
						Logprint({msg:"##" + cno + "##を破棄", pno:ipno});
					}
					//msgpop
					EffectBox({pattern:"msgpop", gno:Player[ipno].stand, msg:"Discard", player:true});
				}
				//Animation
				EffectBox({pattern:"piecejump",pno:ipno});
				if(ipno == Board.role) SortHand();
			}
			//ReDisp
			DispPlayer();
			//WAIT
			wait = 500;
		}
		break;
	case "FORESIGHT":
		if(i_flg == 0){
			if(Player[Spell.pno].DeckCount() > 0){
				StepSet(25);
				//Role Player
				if(Board.turn == Board.role){
					SpellTgtSecond({step:0});
				}
				//Second Target
				second = true;
			}else{
				Logprint({msg:"対象がなかった", pno:Spell.pno});
				//WAIT
				wait = 200;
			}
		}else{
			var tgttop = Spell.target[1];
			//Role Player
			if(Board.turn == Board.role){
				//コマンド送信
				var wkcmd = "spellplus:"+Spell.target.join("_");
				//送信
				Net.send(wkcmd);
			}
			//手札追加
			Drawcard({pno:Spell.pno, from:"dno", dno:tgttop});
			//msgpop
			EffectBox({pattern:"msgpop", gno:Player[Spell.pno].stand, msg:"Draw", player:true});
			//WAIT
			wait = 200;
		}
		break;
	case "COLORCHANGE":
		var tgtgno = Number(Spell.target[0]);
		var tgtgrid = Board.grid[tgtgno];
		var tgtpno = Board.grid[tgtgno].owner;
		var elestr = new Array("", "無", "火", "水", "地", "風");
		var wkcolor = [Board.grid[tgtgno].color, Card[Spell.cno].opt[0]];
		//設定
		tgtgrid.color = wkcolor[1];
		//地形表示
		GridSetImage(tgtgno);
		//スクロール
		BoardScroll(tgtgno);
		//animation
		EffectBox({pattern:"focusin", gno:tgtgno});
		//矢印
		wait = 1000;
		DivImg("DIV_GCLICK"+tgtgno, "arrow4");
		//Log
		Logprint({msg:"地形変化 "+elestr[wkcolor[0]]+" > "+elestr[wkcolor[1]], pno:tgtpno});
		CustomLog({type:"colorcnt", pno:tgtpno, color:wkcolor});
		EffectBox({pattern:"lvlpop", level:tgtgrid.level, chain:GridCount(tgtpno, tgtgrid.color)});
		break;
	case "INFLUENCE":
		if(i_flg == 0){
			StepSet(25);
			if(Board.turn == Board.role){
				var tgtpno = Board.grid[Number(Spell.target[0])].owner;
				var maxcnt = 0;
				var maxclr = [2, 3, 4, 5];
				for(var i=2; i<=5; i++){
					if(maxcnt < GridCount(tgtpno, i)){
						maxcnt = GridCount(tgtpno, i);
						maxclr = [];
					}
					if(maxcnt == GridCount(tgtpno, i)){
						maxclr.push(i);
					}
				}
				var selclr = maxclr[Math.floor(Math.random() * maxclr.length)];
				Spell.target.push(selclr);
				//コマンド送信
				var wkcmd = "spellplus:"+Spell.target.join("_");
				//送信
				Net.send(wkcmd);
				//使用確認
				SpellFire(1);
			}else{
				//Second Target
				second = true;
			}
		}else{
			var tgtgno = Number(Spell.target[0]);
			var tgtclr = Number(Spell.target[1]);
			var elestr = new Array("", "無", "火", "水", "地", "風");
			var wkcolor = [Board.grid[tgtgno].color, tgtclr];
			//設定
			Board.grid[tgtgno].color = wkcolor[1];
			//地形表示
			GridSetImage(tgtgno);
			//スクロール
			BoardScroll(tgtgno);
			//animation
			EffectBox({pattern:"focusin", gno:tgtgno});
			//矢印
			wait = 1000;
			DivImg("DIV_GCLICK"+tgtgno, "arrow4");
			//Log
			Logprint({msg:"地形変化 "+elestr[wkcolor[0]]+" > "+elestr[wkcolor[1]], pno:Spell.pno});
			CustomLog({type:"colorcnt", pno:Spell.pno, color:wkcolor});
		}
		break;
	case "FRACTURE":
		if(i_flg == 0){
			StepSet(25);
			if(Board.role == Board.turn){
				var tgtgno = Number(Spell.target[0]);
				var extarr = [];
				extarr.push(tgtgno);
				var gridarr = GridTgtGrep({tgt:"AMG", pno:Board.grid[tgtgno].owner, ext:extarr});
				if(gridarr.length == 0){
					Spell.target.push(tgtgno);
				}else{
					Spell.target.push(gridarr[Math.floor(Math.random() * gridarr.length)]);
				}
				//コマンド送信
				var wkcmd = "spellplus:"+Spell.target.join("_");
				//送信
				Net.send(wkcmd);
				//使用確認
				SpellFire(1);
			}else{
				//Second Target
				second = true;
			}
		}else{
			var tgtgno1 = Number(Spell.target[0]);
			var tgtgno2 = Number(Spell.target[1]);
			var baselevel = Number(Board.grid[tgtgno1].level);
			if(baselevel >= 2){
				//設定
				Board.grid[tgtgno1].level = 1;
				//Log
				Logprint({msg:"レベルダウン "+baselevel+" > 1", pno:Board.grid[tgtgno1].owner});
				
				var baselevel2 = Board.grid[tgtgno2].level;
				var upperlevel = baselevel2 + baselevel - 1;
				upperlevel = (upperlevel >= 5) ? 5 : upperlevel;
				Board.grid[tgtgno2].level = upperlevel;
				//Log
				Logprint({msg:"レベルアップ "+baselevel2+" > "+upperlevel, pno:Board.grid[tgtgno2].owner});
				
				//矢印
				DivImg("DIV_GCLICK"+tgtgno1, "arrow4");
				DivImg("DIV_GCLICK"+tgtgno2, "arrow4");
				
				//スクロール
				BoardScroll(tgtgno1);
				//地形表示
				GridSetImage(tgtgno1);
				//animation
				EffectBox({pattern:"levelup", gno:tgtgno1});
				EffectBox({pattern:"msgpop", gno:tgtgno1, msg:"Lv" + baselevel + ">1"});
				setTimeout(function(){
					//スクロール
					BoardScroll(tgtgno2);
					//地形表示
					GridSetImage(tgtgno2);
					//animation
					EffectBox({pattern:"levelup", gno:tgtgno2});
					EffectBox({pattern:"msgpop", gno:tgtgno2, msg:"Lv"+baselevel2+">"+upperlevel});
				}, 1000);
			}
			//矢印
			wait = 2000;
		}
		break;
	case "DAMAGE":
		var tgtgno = Spell.target[0];
		var dmg = Number(Card[Spell.cno].opt[0]);
		//Map Damage
		GridDamage({gno:tgtgno, dmg:dmg, arrow:true, scroll:true});
		wait = 2000;
		break;
	case "AREADMG":
		var dmg = Number(Card[Spell.cno].opt[0]);
		//Map Damage
		GridDamage({target:Spell.target, dmg:dmg, arrow:true});
		wait = 3000;
		break;
	case "EARTHQUAKE":
		var intensity = 1;
		var handcnt = Player[Spell.pno].hand.length;
		//Level
		for(var i=1; i<=handcnt; i++){
			if(Player[Spell.pno].hand[i - 1] == Spell.cno){
				if(intensity <= 2){
					intensity += 1;
				}
			}
		}
		//Discard
		for(var i=1; i<=handcnt; i++){
			Player[Spell.pno].HandDel(Spell.cno);
		}
		if(Board.role == Board.turn){
			SortHand();
		}
		//Damage
		for(var i=0; i<Spell.target.length; i++){
			var tgtgno = Spell.target[i];
			var dmg = 10 * intensity;
			//Map Damage
			GridDamage({gno:tgtgno, dmg:dmg, arrow:true});
		}
		wait = 3000;
		break;
	case "INCINERATE":
		var tgtgno = Spell.target[0];
		var dmg = Number(Card[Spell.cno].opt[0]);
		for(var i=0; i<Board.spelled.length; i++){
			if(Card[Board.spelled[i]].spell == "INCINERATE" && dmg < 40){
				dmg += 10;
			}
		}
		//Map Damage
		GridDamage({gno:tgtgno, dmg:dmg, arrow:true, scroll:true});
		wait = 2000;
		break;
	case "DISTORTION":
		if(i_flg == 0){
			StepSet(25);
			if(Board.role == Board.turn){
				var tgtgno = Number(Spell.target[0]);
				var tgtpno = Board.grid[tgtgno].owner;
				var tgtlist = [];
				for(var i=1; i<=Player[tgtpno].DeckCount(); i++){
					if(Card[Player[tgtpno].DeckCard(i)].type == "C"){
						tgtlist.push(i);
					}
				}
				if(tgtlist.length >= 1){
					tgtlist = $T.rndsort(tgtlist);
					Spell.target.push(tgtlist[0]);
				}else{
					Spell.target.push(0);
				}
				//コマンド送信
				var wkcmd = "spellplus:"+Spell.target.join("_");
				//送信
				Net.send(wkcmd);
				//使用確認
				SpellFire(1);
			}else{
				//Second Target
				second = true;
			}
		}else{
			var tgtgno = Number(Spell.target[0]);
			var tgtdno = Number(Spell.target[1]);
			var tgtpno = Board.grid[tgtgno].owner;
			var tgtcno1 = Board.grid[tgtgno].cno;
			var tgtcno2 = Player[tgtpno].DeckCard(tgtdno);
			//ダメージあり
			if(tgtdno != 0){
				//スクロール
				BoardScroll(tgtgno);
				//グリッドセット
				var tgtgrid = Board.grid[tgtgno];
				tgtgrid.owner = tgtpno;
				tgtgrid.cno = tgtcno2;
				tgtgrid.st = Card[tgtcno2].st;
				tgtgrid.lf = Card[tgtcno2].lf;
				tgtgrid.maxlf = Card[tgtcno2].lf;
				tgtgrid.status = "";
				tgtgrid.statime = 0;
				//地形カラー
				GridSetImage(tgtgno);
				//Animation
				EffectBox({pattern:"summon", gno:tgtgno, pno:tgtpno, cno:tgtcno2});
				EffectBox({pattern:"msgpop", gno:tgtgno, msg:"Unsummon"});
				//DeckBack
				Player[tgtpno].DeckDel(tgtdno);
				Player[tgtpno].DeckInsert(tgtcno1, tgtdno);
				Logprint({msg:"##" + tgtcno1 + "##はデッキに戻った", pno:tgtpno});
				wait = 2000;
			}else{
				Logprint({msg:"対象がなかった", pno:Spell.pno});
			}
		}
		break;
	case "UNSUMMON":
		var tgtgno = Spell.target[0];
		var tgtpno = Board.grid[tgtgno].owner;
		var tgtcno = Board.grid[tgtgno].cno;
		//ダメージあり
		if(Board.grid[tgtgno].lf < Board.grid[tgtgno].maxlf){
			//スクロール
			BoardScroll(tgtgno);
			//クリア
			GridClear({gno:tgtgno});
			//手札追加
			if(Player[tgtpno].hand.length < 10){
				Player[tgtpno].hand.push(tgtcno);
				if(tgtpno == Board.role) SortHand();
				Logprint({msg:"##"+tgtcno+"##は手札に戻った", pno:tgtpno});
			}else{
				Logprint({msg:"##"+tgtcno+"##を破棄", pno:tgtpno});
			}
			//Animation
			EffectBox({pattern:"unsummon", cno:tgtcno, gno:tgtgno});
			EffectBox({pattern:"msgpop", gno:tgtgno, msg:"Unsummon"});
			wait = 2000;
		}else{
			Logprint({msg:"対象がなかった", pno:Spell.pno});
		}
		break;
	case "HEAL":
		var tgtgno = Number(Spell.target[0]);
		//GridCheck
		var retarr = GridAbility({time:"GRID_DAMAGE", gno:tgtgno});
		if($T.search(retarr, "act", "phantasm")){
			//ログ
			Logprint({msg:Dic("@PHANTASM@")+"能力により無効", pno:Board.grid[tgtgno].owner});
		}else{
			Board.grid[tgtgno].lf = Board.grid[tgtgno].maxlf;
		}
		Board.grid[tgtgno].status = "";
		Board.grid[tgtgno].statime = 0;
		//表示
		GridSetTax(tgtgno);
		//スクロール
		BoardScroll(tgtgno);
		//矢印
		DivImg("DIV_GCLICK"+tgtgno, "arrow4");
		//msgpop
		EffectBox({pattern:"msgpop", gno:tgtgno, msg:"Heal", color:"#ccff00"});
		//ログ
		Logprint({msg:"##"+Board.grid[tgtgno].cno+"##は回復した", pno:Board.grid[tgtgno].owner});
		//デッキ復帰
		cardback = "deck";
		wait = 2000;
		break;
	case "FLING":
		var tgtgno = Number(Spell.target[0]);
		var nowgno = Player[Spell.pno].stand;
		Spell.target.push(nowgno);
		if(Board.grid[nowgno].owner == Spell.pno){
			var wkcno = Board.grid[nowgno].cno;
			//Move
			GridMove({gno1:nowgno, gno2:tgtgno, effect:true});
			//矢印
			DivImg("DIV_GCLICK"+nowgno, "arrow4");
			//スクロール
			BoardScroll(tgtgno);
			//ログ
			Logprint({msg:"##"+wkcno+"##は移動した", pno:Spell.pno});
			wait = 2000;
		}else{
			Logprint({msg:"対象がなかった", pno:Spell.pno});
		}
		//デッキ復帰
		cardback = "deck";
		break;
	case "GRAVITY":
		var arrowno, linkgno, linkgno2;
		var tgtgno = Number(Spell.target[0]);
		var tgtcno = Board.grid[tgtgno].cno;
		//移動
		for(var i=0; i<=3; i++){
			linkgno = Board.grid[tgtgno].linkarr[i];
			if(linkgno > 0 && Board.grid[linkgno].color < 10 && Board.grid[linkgno].owner == 0){
				arrowno = Board.grid[tgtgno].GetArrow(linkgno);
				linkgno2 = Board.grid[linkgno].GetLink(arrowno);
				if(linkgno2 > 0 && Board.grid[linkgno2].color < 10 && Board.grid[linkgno2].owner != 0){
					//Move
					GridMove({gno1:linkgno2, gno2:linkgno, effect:true});
				}
			}
		}
		//矢印
		DivImg("DIV_GCLICK"+tgtgno, "arrow4");
		//スクロール
		BoardScroll(tgtgno);
		wait = 2000;
		break;
	case "RELIEF":
		var tgtgno1 = Number(Spell.target[0]);
		var tgtgno2 = Number(Spell.target[1]);
		var tmpgrid = {owner:0, cno:"", st:0, lf:0, maxlf:0};
		var gridfrom = [Board.grid[tgtgno1], Board.grid[tgtgno2], tmpgrid];
		var gridto = [tmpgrid, Board.grid[tgtgno1], Board.grid[tgtgno2]];
		//移動
		for(var i=0; i<=2; i++){
			gridto[i].owner = gridfrom[i].owner;
			gridto[i].cno = gridfrom[i].cno;
			gridto[i].st = gridfrom[i].st;
			gridto[i].lf = gridfrom[i].lf;
			gridto[i].maxlf = gridfrom[i].maxlf;
		}
		Board.grid[tgtgno1].status = "";
		Board.grid[tgtgno2].status = "";
		Board.grid[tgtgno1].statime = 0;
		Board.grid[tgtgno2].statime = 0;
		//表示
		$("#DIV_GICON"+tgtgno1).css("backgroundImage", "url(img/icon/"+Card[Board.grid[tgtgno1].cno].imgsrc.replace(".png", "")+".gif)");
		$("#DIV_GICON"+tgtgno2).css("backgroundImage", "url(img/icon/"+Card[Board.grid[tgtgno2].cno].imgsrc.replace(".png", "")+".gif)");
		GridSetTax(tgtgno1);
		GridSetTax(tgtgno2);
		//矢印
		DivImg("DIV_GCLICK"+tgtgno1, "arrow4");
		DivImg("DIV_GCLICK"+tgtgno2, "arrow4");
		//Annimation
		EffectBox({pattern:"invasion", cno:Board.grid[tgtgno2].cno, gno1:tgtgno1, gno2:tgtgno2});
		EffectBox({pattern:"invasion", cno:Board.grid[tgtgno1].cno, gno1:tgtgno2, gno2:tgtgno1});
		//ログ
		Logprint({msg:"##"+Board.grid[tgtgno2].cno+"##は移動した", pno:Spell.pno});
		Logprint({msg:"##"+Board.grid[tgtgno1].cno+"##は移動した", pno:Spell.pno});
		//デッキ復帰
		cardback = "deck";
		wait = 2000;
		break;
	case "TRADE":
		var tgtgno1 = Number(Spell.target[0]);
		var tgtgno2 = Number(Spell.target[1]);
		var tmpgrid = {owner:0};
		var gridfrom = [Board.grid[tgtgno1], Board.grid[tgtgno2], tmpgrid];
		var gridto = [tmpgrid, Board.grid[tgtgno1], Board.grid[tgtgno2]];
		//交換
		for(var i=0; i<=2; i++){
			gridto[i].owner = gridfrom[i].owner;
		}
		//表示
		GridSetTax(tgtgno1);
		GridSetTax(tgtgno2);
		GridSetImage(tgtgno1);
		GridSetImage(tgtgno2);
		//矢印
		DivImg("DIV_GCLICK"+tgtgno1, "arrow4");
		DivImg("DIV_GCLICK"+tgtgno2, "arrow4");
		//ログ
		Logprint({msg:"##"+Board.grid[tgtgno2].cno+"##は交換された", pno:Board.grid[tgtgno2].owner});
		Logprint({msg:"##"+Board.grid[tgtgno1].cno+"##は交換された", pno:Board.grid[tgtgno1].owner});
		wait = 2000;
		break;
	case "EXCHANGE":
		var tgtgno1 = Number(Spell.target[0]);
		var tgtgno2 = Number(Spell.target[1]);
		//交換
		var starr = [Board.grid[tgtgno1].st, Board.grid[tgtgno2].st];
		Board.grid[tgtgno1].st = starr[1];
		Board.grid[tgtgno2].st = starr[0];
		//表示
		GridSetTax(tgtgno1);
		GridSetTax(tgtgno2);

		//矢印
		DivImg("DIV_GCLICK"+tgtgno1, "arrow4");
		DivImg("DIV_GCLICK"+tgtgno2, "arrow4");
		//スクロール
		BoardScroll(tgtgno1);
		//Animation
		EffectBox({pattern:"impact",gno:tgtgno1});
		EffectBox({pattern:"msgpop",gno:tgtgno1, msg:"ST>"+starr[1]});
		setTimeout(function(){
			//スクロール
			BoardScroll(tgtgno2);
			//Animation
			EffectBox({pattern:"impact",gno:tgtgno2});
			EffectBox({pattern:"msgpop",gno:tgtgno2, msg:"ST>"+starr[0]});
		}, 1000);
		//ログ
		Logprint({msg:"##"+Board.grid[tgtgno1].cno+"## ST="+starr[1], pno:Board.grid[tgtgno1].owner});
		Logprint({msg:"##"+Board.grid[tgtgno2].cno+"## ST="+starr[0], pno:Board.grid[tgtgno2].owner});
		//デッキ復帰
		cardback = "deck";
		wait = 2000;
		break;
	case "CONTRACT":
		var tgtgno = Number(Spell.target[0]);
		var tgtgrid = Board.grid[tgtgno];
		tgtgrid.maxlf = Math.max(0, tgtgrid.maxlf - 20);
		tgtgrid.lf = Math.min(tgtgrid.lf, tgtgrid.maxlf);
		//スクロール
		BoardScroll(tgtgno);
		//msgpop
		EffectBox({pattern:"msgpop",gno:tgtgno, msg:"MHP-20"});
		if(Board.grid[tgtgno].lf > 0){
			//Status
			GridStatusChg({gno:tgtgno, status:"_CONTRACT_", statime:99});
		}else{
			//Grave
			Board.grave.push(tgtgrid.cno);
			//Animation
			EffectBox({pattern:"destroy", gno:tgtgno, cno:tgtgrid.cno});
			//ログ
			Logprint({msg:"##"+tgtgrid.cno+"##は破壊された", pno:tgtgrid.owner});
			//領地クリア
			GridClear({gno:tgtgno});
		}
		wait = 2000;
		break;
	case "SETSTATUSG":
		var tgtgno = Number(Spell.target[0]);
		//Status
		GridStatusChg({gno:tgtgno, status:Card[Spell.cno].opt[0], statime:Card[Spell.cno].opt[1], arrow:true, scroll:true});
		//cantrip
		if(Card[Spell.cno].opt[2] == "draw"){
			var diagimg = [];
			var cno = Drawcard({pno:Spell.pno, from:"deck"});
			diagimg.push(cno);
			if(Board.turn == Board.role){
				//ダイアログ
				setTimeout(function(){DispDialog({dtype:"ok", cnos:diagimg});}, 1000);
			}
			//msgpop
			EffectBox({pattern:"msgpop", gno:Player[Spell.pno].stand, msg:"Draw", player:true});
			//hand
			if(Board.turn == Board.role) SortHand();
			//ReDisp
			DispPlayer();
		}
		//WAIT
		wait = 1500;
		break;
	case "AREASTATUS":
		//Status
		var opt2 = Number(Card[Spell.cno].opt[1]);
		var time = ($T.inrange(opt2, 1, 9)) ? opt2 * Board.playcnt : 99;
		GridStatusChg({target:Spell.target, status:Card[Spell.cno].opt[0], statime:Card[Spell.cno].opt[1]});
		wait = 3000;
		break;
	case "GROUPSTATUS":
		var gridgroup = [];
		var tgtgno = Number(Spell.target[0]);
		//スクロール
		BoardScroll(tgtgno);
		//矢印
		DivImg("DIV_GCLICK"+tgtgno, "arrow4");
		//Search
		for(var i=1; i<Board.grid.length; i++){
			if(Board.grid[i].cno == Board.grid[tgtgno].cno){
				gridgroup.push(i);
			}
		}
		//Status
		GridStatusChg({target:gridgroup, status:Card[Spell.cno].opt[0], statime:Card[Spell.cno].opt[1]});
		wait = 2000;
		break;
	case "LINKGATE":
		if(i_flg == 0){
			StepSet(25);
			//Role Player
			if(Board.turn == Board.role){
				SpellTgtSecond({step:0});
			}
			//Second Target
			second = true;
		}else{
			//Role Player
			if(Board.turn == Board.role){
				//コマンド送信
				var wkcmd = "spellplus:"+Spell.target.join("_");
				//送信
				Net.send(wkcmd);
			}
			//Status
			var tgtstr = "AMG"+["", "N", "F", "W", "E", "D"][Spell.target];
			var tgtarr = GridTgtGrep({pno:Board.turn, tgt:tgtstr});
			GridStatusChg({target:tgtarr, status:Card[Spell.cno].opt[0], statime:Card[Spell.cno].opt[1]});
			wait = 3000;
		}
		break;
	case "INSPECTION":
		for(var i=0; i<Spell.target.length; i++){
			var tgtpno = Spell.target[i];
			var wkgold = 0;
			for(var i2 in Player[tgtpno].hand){
				if(Card[Player[tgtpno].hand[i2]].type == "I"){
					wkgold += 30;
				}
			}
			//Asset over check
			if(Player[tgtpno].gold < wkgold) wkgold = Player[tgtpno].gold;
			//Drain
			Player[Spell.pno].gold += wkgold;
			Player[tgtpno].gold -= wkgold;
			//Animation
			EffectBox({pattern:"piecejump",pno:tgtpno});
			EffectBox({pattern:"msgpop",gno:Player[tgtpno].stand, msg:wkgold+"G", color:"#ff0000", player:true});
			//Log
			Logprint({msg:Player[tgtpno].name+"から<span class='g'>"+wkgold+"G</span>奪った", pno:Spell.pno});
		}
		break;
	case "SHUTTER":
		if(i_flg == 0){
			StepSet(25);
			var tgtpno = Spell.target[0];
			//スクロール
			BoardScroll(Player[tgtpno].stand);
			//Animation
			EffectBox({pattern:"piecejump",pno:tgtpno});
			//Role Player
			if(Board.turn == Board.role){
				SpellTgtSecond({step:0});
			}
			//Second Target
			second = true;
		}else{
			var tgtpno = Spell.target[0];
			var tgtcno = Spell.target[1];
			//Role Player
			if(Board.turn == Board.role){
				//コマンド送信
				var wkcmd = "spellplus:"+Spell.target.join("_");
				//送信
				Net.send(wkcmd);
			}
			//ターゲット有無
			if(tgtcno != "0"){
				//手札追加
				Player[tgtpno].HandDel(tgtcno);
				Logprint({msg:"##" + tgtcno + "##を破棄", pno:tgtpno});
				//Animation
				EffectBox({pattern:"piecejump",pno:tgtpno});
				EffectBox({pattern:"discard", cno:tgtcno});
				//手札再表示
				if(tgtpno == Board.role) SortHand();
				//WAIT
				wait = 400;
			}else{
				Logprint({msg:"対象がなかった", pno:tgtpno});
			}
		}
		break;
	case "RUIN":
		var tgtpno, tgtcno, delflg;
		for(var i=0; i<Spell.target.length; i++){
			tgtpno = Spell.target[i];
			delflg = false;
			for(var i2 in Player[tgtpno].hand){
				tgtcno = Player[tgtpno].hand[i2];
				if(Card[tgtcno].type == "I" && Card[tgtcno].item && Card[tgtcno].item == "I"){
					//手札削除
					Player[tgtpno].HandDel(tgtcno);
					Logprint({msg:"##" + tgtcno + "##を破棄", pno:tgtpno});
					delflg = true;
				}
			}
			if(delflg){
				//Animation
				EffectBox({pattern:"piecejump",pno:tgtpno});
				EffectBox({pattern:"msgpop",gno:Player[tgtpno].stand, msg:"Discard", player:true});
				//手札再表示
				if(tgtpno == Board.role) SortHand();
			}
		}
		break;
	case "MARKET":
		var cardprice = 80;
		if(i_flg == 0){
			StepSet(25);
			//Role Player
			if(Board.turn == Board.role){
				SpellTgtSecond({step:0});
			}
			//Second Target
			second = true;
		}else{
			var tgtpno = Spell.target[0];
			var tgtcno = Spell.target[1];
			if(Board.turn == Board.role){
				//コマンド送信
				var wkcmd = "spellplus:"+tgtpno+"_"+tgtcno;
				//送信
				Net.send(wkcmd);
			}
			//ターゲット有無
			if(tgtpno != "9"){
				if(Player[Spell.pno].gold >= cardprice){
					//スクロール
					BoardScroll(Player[tgtpno].stand);
					//Animation
					EffectBox({pattern:"piecejump",pno:tgtpno});
					//手札削除
					Player[tgtpno].HandDel(tgtcno);
					Player[tgtpno].gold += cardprice;
					//手札追加
					Player[Spell.pno].hand.push(tgtcno);
					Player[Spell.pno].gold -= cardprice;
					//msgpop
					EffectBox({pattern:"msgpop",gno:Player[tgtpno].stand, msg:"+"+cardprice+"G", color:"#ffcc00", player:true});
					Logprint({msg:Player[tgtpno].name+"から##" + tgtcno + "##を買った", pno:Spell.pno});
					//手札再表示
					if(tgtpno == Board.role) SortHand();
					//WAIT
					wait = 400;
				}else{
					Logprint({msg:"対象がなかった", pno:Spell.pno});
				}
			}else{
				Logprint({msg:"対象がなかった", pno:Spell.pno});
			}
		}
		break;
	case "COMPRESSION":
		if(i_flg == 0){
			StepSet(25);
			var tgtpno = Spell.target[0];
			//スクロール
			BoardScroll(Player[tgtpno].stand);
			//Animation
			EffectBox({pattern:"piecejump",pno:tgtpno});
			//Role Player
			if(Board.turn == Board.role){
				SpellTgtSecond({step:0});
			}
			//Second Target
			second = true;
		}else{
			//Role Player
			if(Board.turn == Board.role){
				//コマンド送信
				var wkcmd = "spellplus:"+Spell.target.join("_");
				//送信
				Net.send(wkcmd);
			}
			var tgtpno = Number(Spell.target[0]);
			var tgtdno = Number(Spell.target[1]);
			if(tgtdno >= 1){
				for(var i=1; i<=tgtdno; i++){
					//デッキ削除
					var tgtcno = Player[tgtpno].DeckDel(1);
					Logprint({msg:"##" + tgtcno + "##を破棄", pno:tgtpno});
				}
				//zero chk
				if(Player[tgtpno].DeckCount() == 0){
					//NextSet
					Player[tgtpno].deck = Player[tgtpno].decknext.shift();
					//ログ
					Logprint({msg:"デッキをシャッフル", pno:tgtpno});
					if(Board.role == tgtpno){
						//次を用意
						DeckShuffle({pno:tgtpno, tgt:"next"});
					}
				}
				//msgpop
				EffectBox({pattern:"msgpop",gno:Player[tgtpno].stand, msg:"Drop", player:true});
				//手札再表示
				if(tgtpno == Board.role) SortHand();
			}else{
				Logprint({msg:"対象がなかった", pno:tgtpno});
			}
			//WAIT
			wait = 400;
		}
		break;
	}
	//終了
	if(second == false){
		switch(cardback){
		case "deck":
			setTimeout(SpellDeckBack({step:0}), wait);
			break;
		case "hand":
			setTimeout(SpellHandBack(), wait);
			break;
		default:
			setTimeout(SpellEnd, wait);
			break;
		}
	}
}
//セカンドターゲット=======================================================
function SpellTgtSecond(arg){
	switch(Card[Spell.cno].spell){
	case "SHUTTER":
		switch(arg.step){
		case 0: //表示
			var cno;
			var imgarr = [];
			var tgtpno = Number(Spell.target[0]);
			for(var i in Player[tgtpno].hand){
				cno = Player[tgtpno].hand[i];
				if(Card[cno].type == "I" || Card[cno].type == "S"){
					imgarr.push([cno, "SpellTgtSecond({step:1, cno:'"+cno+"'})"]);
				}
			}
			if(imgarr.length >= 1){
				imgarr.sort();
				//ダイアログ
				DispDialog({imgbtns:imgarr});
			}else{
				Spell.target.push("0");
				//ターゲット確定
				StepSet(24);
				//使用確認
				SpellFire(1);
			}
			break;
		default: //OK
			//ダイアログ非表示
			DispDialog("none");
			//ターゲット追加
			Spell.target.push(arg.cno);
			//ターゲット確定
			StepSet(24);
			//使用確認
			SpellFire(1);
			break;
		}
		break;
	case "FORESIGHT":
		switch(arg.step){
		case 0: //表示
			var cards = [];
			var imgarr = [];
			var tgttop = Number(Card[Spell.cno].opt[0]);
			if(Player[Spell.pno].DeckCount() < tgttop){
				tgttop = Player[Spell.pno].DeckCount();
			}
			for(var i=1; i<=tgttop; i++){
				cards.push(Player[Spell.pno].DeckCard(i));
			}
			if(cards.length >= 1){
				for(var i=1; i<=cards.length; i++){
					imgarr.push([cards[i - 1], "SpellTgtSecond({step:1, dno:"+i+"})"]);
				}
			}
			//ダイアログ
			DispDialog({imgbtns:imgarr});
			break;
		default: //OK
			//ダイアログ非表示
			DispDialog("none");
			//ターゲット追加
			Spell.target.push(arg.dno);
			//ターゲット確定
			StepSet(24);
			//使用確認
			SpellFire(1);
			break;
		}
		break;
	case "MARKET": //AllOppPlayer handSpell
		switch(arg.step){
		case 0: //表示
			var cards = [];
			for(var ip=0; ip<Spell.target.length; ip++){
				var tgtpno = Number(Spell.target[ip]);
				var chkcnt = Player[tgtpno].hand.length;
				var hands = [];
				for(var ic=1; ic<=chkcnt; ic++){
					if(Card[Player[tgtpno].hand[ic - 1]].type == "S"){
						var rnd = Math.floor(Math.random() * 50000) + 10000;
						hands.push([rnd, Player[tgtpno].hand[ic - 1], tgtpno]);
					}
				}
				hands.sort();
				for(var ic=0; ic<hands.length && ic<2; ic++){
					cards.push(hands[ic]);
				}
			}
			cards.sort();

			var imgarr = [];
			if(cards.length >= 1){
				for(var i=0; i<cards.length; i++){
					imgarr.push([cards[i][1], "SpellTgtSecond({step:1, cdat:["+cards[i][2]+",'"+cards[i][1]+"']})"]);
				}
			}
			var btnarr = [["キャンセル", "SpellTgtSecond({step:1, cdat:[9, '']})"]];
			//ダイアログ
			DispDialog({imgbtns:imgarr, btns:btnarr});
			break;
		default: //OK
			//ダイアログ非表示
			DispDialog("none");
			//ターゲット追加
			Spell.target = arg.cdat;
			//ターゲット確定
			StepSet(24);
			//使用確認
			SpellFire(1);
			break;
		}
		break;
	case "COMPRESSION": //
		switch(arg.step){
		case 0: //表示
			var cno;
			var imgarr = [];
			var tgtpno = Number(Spell.target[0]);
			for(var i=1; i<=Math.min(5, Player[tgtpno].DeckCount()); i++){
				cno = Player[tgtpno].DeckCard(i);
				imgarr.push([cno, "SpellTgtSecond({step:1, dno:"+i+"})"]);
			}
			var btnarr = [["キャンセル", "SpellTgtSecond({step:1, dno:0})"]];
			//ダイアログ
			DispDialog({btns:btnarr, imgbtns:imgarr});
			break;
		case 1: //OK
			//ターゲット追加
			Spell.target.push(arg.dno);
			//ダイアログ非表示
			DispDialog("none");
			//ターゲット確定
			StepSet(24);
			//使用確認
			SpellFire(1);
			break;
		}
		break;
	case "TELEPORT":
		//---------------------------------------
		switch(arg.step){
		case 0: //表示
			//ライト
			GridLight("clear");
			//ライト
			GridLight("set_nosave", Spell.check);
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("-");
			break;
		case 1: //OK
			//ライト
			GridLight("clear");
			//ターゲット追加
			Spell.target.push(arg.gno);
			//ターゲット確定
			StepSet(24);
			//使用確認
			SpellFire(1);
			break;
		}
		break;
	case "LINKGATE":
		switch(arg.step){
		case 0: //表示
			var imgtag;
			var btnarr = [];
			var imgname = ["", "mark_n", "mark_r", "mark_b", "mark_g", "mark_y"];
			for(var i=1; i<=5; i++){
				imgtag = "<IMG src='img/"+imgname[i]+".gif' height='26' width='26'>";
				btnarr.push([imgtag, "SpellTgtSecond({step:1, colorno:"+i+"})"]);
			}
			//ダイアログ
			DispDialog({btns:btnarr});
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("-");
			break;
		default:
			//ターゲット追加
			Spell.target = arg.colorno;
			//ダイアログ非表示
			DispDialog("none");
			//ターゲット確定
			StepSet(24);
			//使用確認
			SpellFire(1);
			break;
		}
		break;
	}
}
//=======================================================
function SpellHandBack(){
	//手札追加
	if(Player[Spell.pno].hand.length < 10){
		Player[Spell.pno].hand.push(Spell.cno);
		if(Board.role == Spell.pno){
			//手札ソート
			SortHand();
		}
	}
	//Log
	Logprint({msg:"手札復帰", pno:Spell.pno});
	//エンド
	SpellEnd();
}
function SpellDeckBack(arg){
	switch(arg.step){
	case 0:
		StepSet(26);
		if(Spell.pno == Board.role){
			var selectdno = Math.floor(Math.random() * Player[Spell.pno].DeckCount()) + 1;
			//コマンド送信
			var wkcmd = "spellback:"+selectdno;
			//送信
			Net.send(wkcmd);
			//再実行
			SpellDeckBack({step:1, dno:selectdno});
		}
		break;
	case 1:
		Player[Spell.pno].DeckInsert(Spell.cno, arg.dno);
		Logprint({msg:"デッキ復帰", pno:Spell.pno});
		//エンド
		SpellEnd();
		break;
	}
}
//=======================================================
function SpellEnd(){
	if(Card[Spell.cno].tgt.match(/^..G.*$/)){
		for(var i=0; i<Spell.target.length; i++){
			DivImg("DIV_GCLICK"+Spell.target[i], "");
		}
	}
	if(Board.role == Board.turn){
		//手札ソート
		SortHand();
		if(Player[Spell.pno].dicepass){
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("-");
		}else{
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("ダイス");
		}
	}
	//再表示
	DispPlayer();

	//Stack Trash
	Board.spelled.unshift(Spell.cno);
	//Analytics
	Analytics.spell[Spell.pno]++;
	Analytics.costspell[Spell.pno] += Card[Spell.cno].cost;
	//Spell終了
	StepSet(30);
	//パス
	if(Player[Spell.pno].dicepass){
		setTimeout(NoDiceRoll, 100);
	}
}
//#############################################
//人
function Enchant(arg){
	var retitem = [];
	var tgtpno = arg.tgtpno || Board.turn;
	var enchant = Player[tgtpno].status.split(":");
	if(enchant.length >= 1){
		//タイミング分岐
		switch(arg.time){
		case "TURN_START":
			//種別分岐
			switch(enchant[0]){
			case "_BANK_":
				if(Player[tgtpno].statime == 0){
					var gold = Number(enchant[1]);
					Player[tgtpno].gold += gold;
					//msgpop
					EffectBox({pattern:"msgpop", gno:Player[tgtpno].stand, msg:gold+"G", color:"#ffcc00", player:true});
					//log
					Logprint({msg:Player[tgtpno].name+"は<span class='g'>"+gold+"G</span>を得た", pno:tgtpno});
				}
				break;
			}
			break;
		case "DRAWCARD_BEFORE":
			//種別分岐
			switch(enchant[0]){
			case "_WARCRY_":
				retitem.push({act:"nolog"});
				break;
			}
			break;
		case "DRAWCARD_AFTER":
			//種別分岐
			switch(enchant[0]){
			case "_WARCRY_":
				Logprint({msg:"##" + arg.cno + "##をドロー", pno:arg.pno});
				EffectBox({pattern:"drawcard", cno:arg.cno});
				if(Card[arg.cno].type.match(/[C]/)){
					var gold = Card[arg.cno].cost;
					//Bonus
					Player[arg.pno].gold += gold;
					Logprint({msg:Player[arg.pno].name+"は<span class='g'>"+gold+"G</span>を得た", pno:arg.pno});
					//msgpop
					EffectBox({pattern:"msgpop", gno:Player[arg.pno].stand, msg:gold+"G", color:"#ffcc00", player:true});
				}
				break;
			}
			break;
		case "DICE_STEP": //Board.role Only
			//種別分岐
			switch(enchant[0]){
			case "_DICE_":
				retitem.push({act:"dice", val:Number(enchant[1])});
				break;
			case "_SHORTCUT_":
				retitem.push({act:"plus", val:Number(enchant[1])});
				break;
			case "_NAVIGATE_":
				retitem.push({act:"navigate"});
				break;
			}
			break;
		case "DICE_PASS_THROUGH": //Board.role Only
			//種別分岐
			switch(enchant[0]){
			case "_PLAGUE_":
				if(Board.grid[arg.gno].owner != 0){
					//status set
					GridStatusChg({gno:arg.gno, status:"_POISON_", statime:99});
				}
				break;
			case "_GATHER_":
				if(Board.grid[arg.gno].status != ""){
					var gain = 80;
					//status set
					Player[arg.pno].gold += gain;
					//msgpop
					EffectBox({pattern:"msgpop", gno:Player[arg.pno].stand, msg:gain+"G", color:"#ffcc00", player:true});
					//Log
					Logprint({msg:"<span class='g'>"+gain+"G</span>を得た", pno:arg.pno});
				}
				break;
			}
			break;
		case "DICE_CASTLECHECK":
			//種別分岐
			switch(enchant[0]){
			case "_FORGERY_":
				var tgtgrid = Board.grid[Player[arg.pno].stand];
				if(tgtgrid.color == 10){
					//return
					retitem.push("forgery");
					retitem.push(150);
					//Clear
					Player[arg.pno].status = "";
					Player[arg.pno].statime = 0;
					SetPlayerIcon(tgtpno, "");
					//log
					Logprint({msg:Player[arg.pno].name+"は呪いが解けた", pno:arg.pno});
				}else if(tgtgrid.color >= 11 && tgtgrid.color <= 14){
					//return
					retitem.push("forgery");
				}
				break;
			}
			break;
		case "BATTLE_WIN":
			//種別分岐
			switch(enchant[0]){
			case "_QUEST_":
				var wincount = Analytics.invasionwin[tgtpno] - Number(enchant[1]);
				var wkgold = 200 * wincount;
				Player[tgtpno].gold += wkgold;
				//msgpop
				EffectBox({pattern:"msgpop", gno:Player[tgtpno].stand, msg:wkgold+"G", color:"#ffcc00", player:true});
				//Log
				Logprint({msg:"<span class='g'>"+wkgold+"G</span>を得た", pno:tgtpno});
				if(wincount == 3){
					//Clear
					Player[tgtpno].status = "";
					Player[tgtpno].statime = 0;
					SetPlayerIcon(tgtpno, "");
					//log
					Logprint({msg:Player[tgtpno].name+"は呪いが解けた", pno:tgtpno});
				}else{
					Player[tgtpno].statime = 4;
					Logprint({msg:"呪いは3ターンに延長された", pno:tgtpno});
				}
				break;
			}
			break;
		case "TERRITORY_LVLUP":
			//種別分岐
			switch(enchant[0]){
			case "_PRAYER_":
				//return
				retitem.push({act:"percent", val:0.5});
				break;
			}
			break;
		case "TAXPAYMENT":
			//種別分岐
			switch(enchant[0]){
			case "_MONOPOLY_":
				//return
				retitem.push({act:"monopoly", val:tgtpno});
				//Log
				Logprint({msg:"独占", pno:tgtpno});
				break;
			}
			break;
		}
	}
	//返却
	return(retitem);
}
