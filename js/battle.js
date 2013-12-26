//初期処理
//[引数] 0,タイプ 1,GridNo 2,pno(Off) 3,cno(Off)
function BattleInit(){
	var arg = arguments;
	//戦闘初期処理
	StepSet(71);

	//変数設定
	Battle.result = 0;
	Battle.check = [];
	Battle.from = arg[0];
	Battle.gno = arg[1];
	Battle.p[0].pno = arg[2];
	Battle.p[0].cno = arg[3];
	Battle.p[1].pno = Board.grid[Battle.gno].owner;
	Battle.p[1].cno = Board.grid[Battle.gno].cno;
	for(var i=0; i<=1; i++){
		Battle.p[i].item = "";
		Battle.p[i].speed = 4 - i;
		Battle.p[i].attack = 0;
		Battle.p[i].active = "";
		Battle.p[i].direct = false;
	}
	Battle.wait = 0;
	Battle.log = [];

	//再表示
	DispPlayer();
	GridInfo(0);
	//BGM CHANGE
	Audie.stop("map");
	Audie.play("battle");
	//Back Image TEST
	$("#DIV_VSBACK").css("backgroundImage", "url(img/back/battle"+Board.grid[Battle.gno].color+".gif)");

	//矢印クリア
	DivImg("DIV_GCLICK"+Battle.gno, "");
	if(Battle.from == "M"){
		DivImg("DIV_GCLICK"+Territory.gno, "");
	}
	//表示
	$("#DIV_VSLOG").html("");
	for(var i=0; i<=1; i++){
		$("#DIV_VSCARD" + i).css({top:"", opacity:""});
		Canvas.clear({id:"CVS_VSCARD" + i, w:200, h:260});
		Canvas.clear({id:"CVS_VSITEM" + i});
		$("#DIV_VSITEM"+i).css("display", "block");
		BattleBar("ST" + i, 0, 0);
		BattleBar("LF" + i, 0, 0);
		$("#DIV_VSDMG" + i).html("");
	}
	$("#DIV_VSNAME0").css("background-image", "url(img/bticon_sword"+Battle.p[0].pno+".gif)");
	$("#DIV_VSNAME1").css("background-image", "url(img/bticon_shield"+Battle.p[1].pno+".gif)");
	DisplaySet("DIV_VSBACK", 40);

	//数値・取得
	//【攻撃側】
	if(Battle.from == "M"){
		Battle.p[0].st = Board.grid[Battle.gno_atk].st;
		Battle.p[0].lf = Board.grid[Battle.gno_atk].lf;
		Battle.p[0].maxlf = Board.grid[Battle.gno_atk].maxlf;
	}else{
		Battle.p[0].st = Number(Card[Battle.p[0].cno].st);
		Battle.p[0].lf = Number(Card[Battle.p[0].cno].lf);
		Battle.p[0].maxlf = Number(Card[Battle.p[0].cno].lf);
	}
	Battle.p[0].stplus = BattleStPlus(0);
	Battle.p[0].lfplus = 0;
	Battle.p[0].stbase = Battle.p[0].st;
	Battle.p[0].lfbase = Battle.p[0].lf;
	Battle.p[0].lftemp = [];
	Battle.p[0].opt = Card[Battle.p[0].cno].opt.concat();
	Battle.p[0].status = "";
	//【防衛側】
	Battle.p[1].st = Number(Board.grid[Battle.gno].st);
	Battle.p[1].lf = Number(Board.grid[Battle.gno].lf);
	Battle.p[1].maxlf = Number(Board.grid[Battle.gno].maxlf);
	Battle.p[1].stplus = BattleStPlus(1);
	Battle.p[1].lfplus = BattleLfPlus(Battle.gno);
	Battle.p[1].stbase = Battle.p[1].st;
	Battle.p[1].lfbase = Battle.p[1].lf;
	Battle.p[1].lftemp = [];
	Battle.p[1].opt = Card[Battle.p[1].cno].opt.concat();
	Battle.p[1].status = Board.grid[Battle.gno].status;

	//移動侵略
	if(Battle.from == "M"){
		//領地クリア
		Board.grid[Battle.gno_atk].flush();
		//ステータスクリア
		//Battle.p[0].status = "attack";
		//Battle.p[0].statime = 0;
	}

	//Creature表示
	$("#DIV_VSCARD0").css({height:0});
	$("#DIV_VSCARD1").css({height:0});
	CardInfoSet({tgt:"#DIV_VSCARDINFO0", cno: Battle.p[0].cno});
	CardInfoSet({tgt:"#DIV_VSCARDINFO1", cno: Battle.p[1].cno});
	var fnc0 = function(){
		$("#DIV_VSCARD0").animate({height:260}, 2000);
	}
	var fnc1 = function(){
		$("#DIV_VSCARD1").animate({height:260}, 2000);
	}
	CardImgSet({cvs:"CVS_VSCARD0", cno:Battle.p[0].cno, fnc:fnc0});
	CardImgSet({cvs:"CVS_VSCARD1", cno:Battle.p[1].cno, fnc:fnc1});
	//数値表示
	BattleBar("ST0", Battle.p[0].st, Battle.p[0].stplus);
	BattleBar("LF0", Battle.p[0].lf, Battle.p[0].lfplus);
	BattleBar("ST1", Battle.p[1].st, Battle.p[1].stplus);
	BattleBar("LF1", Battle.p[1].lf, Battle.p[1].lfplus);
	//名前
	$("#DIV_VSNAME0").html(Player[Battle.p[0].pno].name);
	$("#DIV_VSNAME1").html(Player[Battle.p[1].pno].name);

	//条件チェック
	AbilityActive({type:"abillity", bno:0});
	AbilityActive({type:"abillity", bno:1});

	// ===[ 能力封印(ステータス) ]===
	if(Battle.p[1].status.match(/_FORGET_/)){
		BattleLog(9, "能力封印");
		for(var i=0; i<=1; i++){
			Battle.p[i].active = "";
		}
	}
	//効果適用
	BattleAbiAction({bno:0, step:"SELECT1"});
	BattleAbiAction({bno:1, step:"SELECT1"});
	//効果適用
	BattleAbiAction({bno:0, step:"SELECT2"});
	BattleAbiAction({bno:1, step:"SELECT2"});
	//ItemSelect
	if(Battle.p[0].pno == Board.role || Battle.p[1].pno == Board.role){
		//再表示
		SortHand();
		//PHASEENDBUTTON
		$("#BTN_PhaseEnd").html("キャンセル");
		//使用可能チェック
		setTimeout(ItemCheck, 500);
	}else{
		//結果待ち
		StepSet(73);
	}
}
//アイテムチェック
function ItemCheck(){
	var chkflg, handcno, opts;
	var fig = (Battle.p[0].pno == Board.role) ? Battle.p[0] : Battle.p[1];
	//Item選択
	StepSet(72);
	//CardCheck
	for(var i in Player[Board.role].hand){
		chkflg = "";
		handcno = Player[Board.role].hand[i];
		//判定
		if(fig.status.match(/_BIND_/)){
			chkflg = "CLOSE";
		}else{
			if(Card[handcno].type == "I"){
				if(Card[fig.cno].item && Card[fig.cno].item.match(Card[handcno].item)){
					chkflg = "LIMIT";
				}else if(Player[Board.role].gold < Card[handcno].cost){
					chkflg = "GOLD";
				}
			}else if(Card[handcno].type == "C"){
				if(fig.active.match(/@BAND@|@REFLECT@/)){
					if(Player[Board.role].gold < Card[handcno].cost){
						chkflg = "GOLD";
					}
				}else if($T.inarray("@AID@", Card[handcno].opt)){
					if(Card[fig.cno].item && Card[fig.cno].item.match("W")){
						chkflg = "LIMIT";
					}else if(Player[Board.role].gold < Card[handcno].cost){
						chkflg = "GOLD";
					}
				}else{
					chkflg = "CLOSE";
				}
			}else{
				chkflg = "CLOSE";
			}
		}
		//表示・追加
		switch(chkflg){
		case "CLOSE":
			Canvas.rect("CVS_HAND"+i, {rgb:[0,0,0], alpha:0.6, x:0, y:0, w:100, h:130});
			break;
		case "LIMIT":
			Canvas.draw({id:"CVS_HAND"+i, src:"img/icon_limit.gif"});
			break;
		case "GOLD":
			Canvas.draw({id:"CVS_HAND"+i, src:"img/icon_nogold.gif"});
			break;
		default:
			Battle.check.push(handcno);
			break;
		}
	}
}
//Itemセット
function BattleItem(arg){
	for(var i=0; i<=1; i++){
		if(Battle.p[i].pno == arg.pno && Battle.p[i].item == ""){
			if(arg.pno == Board.role && Board.step == 72){
				//結果待ち
				StepSet(73);
				//PHASEENDBUTTON
				$("#BTN_PhaseEnd").html("-");
				//アイコン設定
				if(arg.hno < 10){
					Canvas.draw({id:"CVS_HAND"+arg.hno, src:"img/cmd_select.gif", alpha:0.6});
				}
				//コマンド送信
				var cno = (arg.hno == 99) ? "FIST" : Player[Board.role].hand[arg.hno];
				var rnd = $T.rndsort([0,1,2,3,4,5,6,7,8,9]).join("");
				var wkcmd = "item:"+cno+":"+rnd;
				//送信
				Net.send(wkcmd);
				//Itemセット
				Battle.p[i].item = cno;
				Battle.p[i].rnd = rnd;
			}else{
				//Itemセット
				Battle.p[i].item = arg.cno;
				Battle.p[i].rnd = arg.rnd;
			}
		}
	}
	//両者セット完了
	if(Battle.p[0].item != "" && Battle.p[1].item != ""){
		//メイン処理開始
		if(sessionStorage.Mode == "gallery"){
			setTimeout(BattleFight, 1000);
		}else{
			BattleFight();
		}
	}
}
//######################[ MAIN ]#######################
function BattleFight(){
	Battle.wait = 1000;
	StepSet(74);
	//########## Item ##########
	for(var i=0; i<=1; i++){
		if(Battle.p[i].item == "FIST"){
			Canvas.clear({id:"CVS_VSITEM"+i});
		}else{
			var wkcno = Battle.p[i].item;
			//コスト
			Player[Battle.p[i].pno].gold -= Card[wkcno].cost;
			//カード消費
			Player[Battle.p[i].pno].HandDel(wkcno);
			CardImgSet({cvs:"CVS_VSITEM"+i, cno:wkcno, zoom:0.5});
			//Effect
			EffectBox({pattern:"itemopen", bno:i})
		}
	}
	DispPlayer();
	//Next
	setTimeout(BattleFightReady1, Battle.wait);
}
function BattleFightReady1(){
	Battle.wait = 0;
	// ===[ アイテム奪取 ]===
	for(var i=0; i<=1; i++){
		//効果適用
		BattleAbiAction({bno:i, step:"ITEMSTEAL"});
	}
	// ===[ アイテム破壊(アイテム) ]===
	for(var i=0; i<=1; i++){
		var cno = [Battle.p[i].item, Battle.p[$r(i)].item];
		//No FIST
		if(cno[0] != "FIST" && Card[cno[0]].type == "I"){
			for(var i2 in Card[cno[0]].opt){
				if(AbilityActive({type:"item", bno:i, opt:Card[cno[0]].opt[i2]})){
					var itemsts = Card[cno[0]].opt[i2].split(":");
					switch(itemsts[0]){
					case "HOLYSTONE":
						if(cno[1] != "FIST"){
							Battle.p[$r(i)].item = "FIST";
							EffectBox({pattern:"itemdestroy", bno:$r(i), cno:cno[1]})
							$("#DIV_VSITEM"+$r(i)).css("display", "none");
							BattleLog(i, "アイテム破壊");
						}
						break;
					}
				}
			}
		}
	}
	// ===[ アイテム破壊(クリーチャー) ]===
	for(var i=0; i<=1; i++){
		//効果適用
		BattleAbiAction({bno:i, step:"ITEMCLASH"});
	}
	// ===[ 能力封印(アイテム) ]===
	for(var i=0; i<=1; i++){
		var cno = Battle.p[i].item;
		//No FIST
		if(cno != "FIST" && Card[cno].type == "I"){
			for(var i2 in Card[cno].opt){
				if(AbilityActive({type:"item", bno:i, opt:Card[cno].opt[i2]})){
					var itemsts = Card[cno].opt[i2].split(":");
					switch(itemsts[0]){
					case "EVILSTONE":
						Battle.p[$r(i)].active = "";
						BattleLog(i, "能力封印");
						break;
					}
				}
			}
		}
	}
	//Next
	setTimeout(BattleFightReady2, Battle.wait);
}
function BattleFightReady2(){
	//Map Enchant
	BattleMapAbiAction();
	//効果適用
	BattleAbiAction({bno:0, step:"INIT1"});
	BattleAbiAction({bno:1, step:"INIT1"});
	//2nd
	for(var i=0; i<=1; i++){
		var wkcno = Battle.p[i].item;
		//No FIST
		if(wkcno != "FIST"){
			//効果
			if(Card[wkcno].type == "I"){
				for(var i2 in Card[wkcno].opt){
					if(AbilityActive({type:"item", bno:i, opt:Card[wkcno].opt[i2]})){
						var itemsts = Card[wkcno].opt[i2].split("!")[0].split(":");
						switch(itemsts[0]){
						case "STPLUS":
							var stvar = BtAbilityExNo(i2, itemsts[1])
							Battle.p[i].st = Math.max(0, Battle.p[i].st + stvar);
							BattleLog(i, "ST変動");
							break;
						case "STMINUS":
							Battle.p[i].st = Math.max(0, Battle.p[i].st - Number(itemsts[1]));
							BattleLog(i, "ST変動");
							break;
						case "STEQUAL":
							Battle.p[i].st = Number(itemsts[1]);
							BattleLog(i, "ST変動");
							break;
						case "LFPLUS":
							Battle.p[i].lf = Math.max(0, Battle.p[i].lf + Number(itemsts[1]));
							BattleLog(i, "LF変動");
							break;
						case "LFEQUAL":
							Battle.p[i].lf = Number(itemsts[1]);
							BattleLog(i, "LF変動");
							break;
						case "JUGGLE":
							var oldst = Battle.p[i].st;
							var oldlf = Battle.p[i].lf;
							Battle.p[i].st = oldlf;
							Battle.p[i].lf = oldst;
							BattleLog(i, "STLF変動");
							break;
						case "FIRST":
							Battle.p[i].active = Battle.p[i].active.replace("@SLOW@", "");
							Battle.p[i].active += ",@FIRST@";
							break;
						case "SLOW":
							Battle.p[i].active = Battle.p[i].active.replace("@FIRST@", "");
							Battle.p[i].active += ",@SLOW@";
							break;
						case "SMASH":
							Battle.p[i].active += ",@SMASH@";
							break;
						case "SHOOT":
							Battle.p[i].active += ",@SHOOT@";
							break;
						case "IRONHEART":
							Battle.p[i].active += ",@IRONHEART@";
							break;
						case "DIVINESTONE":
							var atkcno = Battle.p[i].cno;
							var defcno = Battle.p[$r(i)].cno;
							Battle.p[i].active += ",@SPIKESHIELD@";
							break;
						case "BLACKSWAN":
							Battle.p[i].active += ",@BLACKSWAN@";
							break;
						case "REVDEATH":
							Battle.p[i].active += ",@REVDEATH@";
							break;
						case "AEGIS":
							Battle.p[i].active += ",@AEGIS@";
							break;
						}
					}
				}
			}else if(Card[wkcno].type == "C"){
				if(Battle.p[i].active.match(/@BAND@/)){
					//援護
					Battle.p[i].st += Card[wkcno].st;
					Battle.p[i].lf += Card[wkcno].lf;
					BattleLog(i, Dic("@BAND@"));
				}else if($T.inarray("@AID@", Card[wkcno].opt)){
					//加勢
					Battle.p[i].st += Card[wkcno].st;
					Battle.p[i].lf += Card[wkcno].lf;
					BattleLog(i, "STLF変動");
				}
			}
			BattleBar("ST"+i, Battle.p[i].st, Battle.p[i].stplus);
			BattleBar("LF"+i, Battle.p[i].lf, Battle.p[i].lfplus);
		}
	}
	//効果適用(速度計算)
	BattleAbiAction({bno:0, step:"INIT2"});
	BattleAbiAction({bno:1, step:"INIT2"});
	//数値表示
	BattleBar("ST0", Battle.p[0].st, Battle.p[0].stplus);
	BattleBar("LF0", Battle.p[0].lf, Battle.p[0].lfplus);
	BattleBar("ST1", Battle.p[1].st, Battle.p[1].stplus);
	BattleBar("LF1", Battle.p[1].lf, Battle.p[1].lfplus);
	//攻撃開始
	var id = setTimeout(BattleAttackBefore, Battle.wait);
}
//--------- Attack -----------
function BattleAttackBefore(){
	var fastbno, atkbno, atkstatus = ["", ""];
	for(var i=0; i<=1; i++){
		if(Battle.p[0].lf >= 1 && Battle.p[1].lf >= 1 && Battle.p[i].attack == 0 && !(Battle.p[i].status.match(/_BIND_/))){
			atkstatus[i] = "ready";
		}else{
			atkstatus[i] = "moved";
		}
	}
	if(atkstatus[0] == "ready" || atkstatus[1] == "ready"){
		//速度計算
		fastbno = (Battle.p[0].speed >= Battle.p[1].speed) ? 0 : 1;
		if(atkstatus[fastbno] == "ready"){
			atkbno = fastbno;
		}else{
			atkbno = $r(fastbno);
		}
		//Attack
		BattleAttack(atkbno);
	}else{
		//result
		BattleResult();
	}
}
function BattleAttack(i_bno){
	var dmg_through, dmg_land, dmg_life, dmg_hit = true;
	var atkno = i_bno;
	var defno = $r(i_bno);
	var atk = Battle.p[atkno];
	var def = Battle.p[defno];
	//wait clear
	Battle.wait = 800;
	//base damage
	for(var i=0; i<=1; i++){
		Battle.p[i].damage = Number(Battle.p[i].st) + Number(Battle.p[i].stplus);
	}
	//Log
	BattleLog(atkno, "攻撃");
	//Action
	BattleAbiAction({bno:atkno, step:"ATTACK"});
	//Damage
	if(atk.direct){
		dmg_land = 0;
		dmg_life = (atk.damage >= def.lf) ? def.lf : atk.damage;
	}else{
		dmg_through = atk.damage - def.lfplus;
		dmg_land = (def.lfplus <= atk.damage) ? Number(def.lfplus) : atk.damage;
		dmg_life = (atk.damage > def.lfplus) ? (dmg_through >= def.lf) ? def.lf : dmg_through : 0;
	}
	//Action
	var defabi = BattleAbiAction({bno:atkno, step:"DEFFENCE", dmg:atk.damage, dmglife:dmg_life});
	//===軽減===
	if($T.search(defabi, "act", "minus")){
		dmg_life -= $T.result.val;
	}
	//===無効===
	if($T.search(defabi, "act", "nodamage")){
		dmg_hit = false;
	}
	if(dmg_hit){
		//Math
		def.lf -= dmg_life;
		def.lfplus -= dmg_land;
	}
	//ダメージ表示
	$("#DIV_VSDMG"+defno).html(atk.damage);
	BattleBar("LF"+defno, def.lf, def.lfplus);
	//Hit!
	if(dmg_hit && atk.damage > 0){
		//エフェクト
		AttackEffect(defno, Card[atk.cno].atkani);
		//Action
		BattleAbiAction({bno:atkno, step:"HIT"});
	}else{
		//Action
		BattleAbiAction({bno:atkno, step:"MISS"});
	}
	//攻撃終了
	atk.attack = 1;

	//===反射===
	if($T.search(defabi, "act", "reflect") || ($T.search(defabi, "act", "counter") && def.lf >= 1)){
		dmg_through = atk.damage - atk.lfplus;
		dmg_land = (atk.lfplus < atk.damage) ? Number(atk.lfplus) : atk.damage;
		dmg_life = (atk.lfplus < atk.damage) ? (dmg_through >= atk.lf) ? atk.lf : dmg_through : 0;
		//反射攻撃
		setTimeout(function(){BattleAttackReflect(i_bno, dmg_life, dmg_land);}, Battle.wait);
	}else{
		//破壊判定
		setTimeout(function(){BattleAttackAfter(i_bno);}, Battle.wait);
	}
}
function BattleAttackReflect(i_bno, dmg_life, dmg_land){
	var def = Battle.p[i_bno];
	//base wait
	Battle.wait = 800;
	//Math
	def.lf -= dmg_life;
	def.lfplus -= dmg_land;
	//ダメージ表示
	$("#DIV_VSDMG"+i_bno).html(def.damage);
	BattleBar("LF"+i_bno, def.lf, def.lfplus);
	//Hit!
	if(def.damage > 0){
		//エフェクト
		AttackEffect(i_bno, Card[def.cno].atkani);
	}
	//破壊判定
	setTimeout(function(){BattleAttackAfter(i_bno);}, Battle.wait);
}
function BattleAttackAfter(i_bno){
	var atkno = i_bno;
	var defno = $r(i_bno);
	var atk = Battle.p[atkno];
	var def = Battle.p[defno];
	//wait clear
	Battle.wait = 0;
	//破壊判定
	if(atk.lf == 0 && atk.status != "escape"){
		Battle.wait += 800;
		//Grave
		Board.grave.push(atk.cno);
		//Log
		BattleLog(atkno, "破壊");
		//Action
		BattleAbiAction({bno:atkno, step:"DESTROY"});
	}
	if(def.lf == 0 && def.status != "escape"){
		Battle.wait += 800;
		//Grave
		Board.grave.push(def.cno);
		//Log
		BattleLog(defno, "破壊");
		//Action
		BattleAbiAction({bno:defno, step:"DESTROY"});
	}
	//結果
	setTimeout(BattleAttackBefore, Battle.wait);
}
//---------------------------------
//結果判定
function BattleResult(){
	//クリア
	Battle.wait = 0;
	//後処理
	for(var i=0; i<=1; i++){
		var cmd, atk = Battle.p[i];
		if(atk.lf >= 1){
			//Tempback
			while(cmd = atk.lftemp.pop()){
				switch(cmd[0]){
				case "plus":
					if(cmd[1] >= 0){
						if(atk.lfbase < atk.lf){
							atk.lf = Math.max(atk.lfbase, atk.lf - cmd[1]);
						}
					}else{
						atk.lf = Math.min(atk.lfbase, atk.lf - cmd[1]);
					}
					break;
				case "equal":
					if(cmd[1] < atk.lf){
						atk.lf = cmd[1];
					}
					break;
				}
			}
			//Max、Baseセット
			Battle.p[i].st = Battle.p[i].stbase
			Battle.p[i].lf = Math.min(Battle.p[i].lf, Battle.p[i].maxlf);
			Battle.p[i].lf = Math.min(Battle.p[i].lf, Battle.p[i].lfbase);
			BattleBar("ST"+i, Battle.p[i].st, Battle.p[i].stplus);
			BattleBar("LF"+i, Battle.p[i].lf, Battle.p[i].lfplus);
		}
	}
	//
	for(var i=0; i<=1; i++){
		//Abillity
		BattleAbiAction({bno:i, step:"RESULT"});
		BattleBar("LF"+i, Battle.p[i].lf, Battle.p[i].lfplus);
	}
	//Result Item
	for(var i=0; i<=1; i++){
		if(Battle.p[i].lf >= 1 && Battle.p[i].item != "FIST"){
			for(var i2 in Card[Battle.p[i].item].opt){
				switch(Card[Battle.p[i].item].opt[i2]){
				case "BACKHAND":
					//手札追加
					if(Player[Battle.p[i].pno].hand.length < 10){
						Player[Battle.p[i].pno].hand.push(Battle.p[i].item);
						if(Board.role == Battle.p[i].pno){
							//手札ソート
							SortHand();
						}
						//Log
						BattleLog(i, "手札復帰");
					}
					break;
				case "UPDOWN":
					//Opponent Life
					if(Battle.p[$r(i)].lf >= 1){
						Battle.p[i].maxlf = Math.max(0, Battle.p[i].maxlf - 10);
						Battle.p[i].lf = Math.min(Battle.p[i].lf, Battle.p[i].maxlf);
					}else{
						Battle.p[i].maxlf = Math.min(80, Battle.p[i].maxlf + 10);
						Battle.p[i].lf = Math.min(80, Battle.p[i].lf + 10);
					}
					//Log
					BattleLog(i, "MHP変動");
					break;
				}
			}
			BattleBar("LF"+i, Battle.p[i].lf, Battle.p[i].lfplus);
		}
	}
	//
	for(var i=0; i<=1; i++){
		if(Battle.p[i].lf == 0){
			//aculo(落下消失)
			$("#DIV_VSCARD"+i).animate({top:400, opacity:0.0}, 1000);
			//se
			Audie.seplay("bt_die");
		}
	}
	//結果
	switch(true){
	case (Battle.p[0].lf == 0 && Battle.p[1].lf == 0):
		BattleLog(9, "全滅");
		Battle.result = 0;
		//クリア
		Grid.clear({gno:Battle.gno});
		//Animation
		EffectBox({pattern:"destroy", cno:Battle.p[1].cno, gno:Battle.gno});
		//クリア(移動元)
		if(Battle.from == "M"){
			//クリア
			Grid.clear({gno:Battle.gno_atk, pno:Battle.p[0].pno});
			//Animation
			EffectBox({pattern:"destroy", cno:Battle.p[0].cno, gno:Battle.gno_atk});
		}
		break;
	case (Battle.p[0].lf >= 1 && Battle.p[1].lf == 0):
		BattleLog(9, "制圧");
		Battle.result = 1;
		//クリア
		Board.grid[Battle.gno].flush();
		Grid.Img.tax({pno:Battle.p[1].pno});
		//移動時
		if(Battle.from == "M"){
			//クリア
			Grid.clear({gno:Battle.gno_atk, pno:Battle.p[0].pno});
		}
		//召還
		Summon.from = "battle";
		Summon.pno = Battle.p[0].pno;
		Summon.cno = Battle.p[0].cno;
		Summon.hand = 0;
		Summon.gno = Battle.gno;
		Summon.st = Battle.p[0].st;
		Summon.lf = Battle.p[0].lf;
		Summon.maxlf = Battle.p[0].maxlf;
		Summon.status = Battle.p[0].status;
		break;
	case (Battle.p[1].lf >= 1):
		BattleLog(9, "防衛");
		Battle.result = 2;
		//ダメージ・変動反映
		Board.grid[Battle.gno].st = Battle.p[1].st;
		Board.grid[Battle.gno].lf = Battle.p[1].lf;
		Board.grid[Battle.gno].maxlf = Battle.p[1].maxlf;
		if(Board.grid[Battle.gno].status != Battle.p[1].status){
			if(Battle.p[1].status == ""){
				Board.grid[Battle.gno].status = "";
				Board.grid[Battle.gno].statime = "";
			}else{
				Board.grid[Battle.gno].status = Battle.p[1].status;
				Board.grid[Battle.gno].statime = Board.Round+":"+Board.turn;
			}
			//イメージ再設定
			Grid.Img.tax({gno:Battle.gno});
		}
		//攻撃側生存
		if(Battle.p[0].lf >= 1){
			//召還侵略
			if(Battle.from == "S"){
				//手札追加
				if(Player[Battle.p[0].pno].hand.length < 10){
					Player[Battle.p[0].pno].hand.push(Battle.p[0].cno);
					//手札枚数再表示
					if(Battle.p[0].pno == Board.role) SortHand();
					DispPlayer();
				}
			}
			//移動侵略
			if(Battle.from == "M"){
				//ダメージ反映・ステータスクリア
				Board.grid[Battle.gno_atk].owner = Battle.p[0].pno;
				Board.grid[Battle.gno_atk].cno = Battle.p[0].cno;
				Board.grid[Battle.gno_atk].st = Battle.p[0].st;
				Board.grid[Battle.gno_atk].lf = Battle.p[0].lf;
				Board.grid[Battle.gno_atk].maxlf = Battle.p[0].maxlf;
				Board.grid[Battle.gno_atk].status = "";
				Board.grid[Battle.gno_atk].statime = "";
				//イメージ再設定
				GridSetTax(Battle.gno_atk);
			}
		}else{
			//移動時
			if(Battle.from == "M"){
				//クリア
				Grid.clear({gno:Battle.gno_atk, pno:Battle.p[0].pno});
			}
		}
		break;
	}
	for(var i=0; i<=1; i++){
		//Abillity
		BattleAbiAction({bno:i, step:"RESULTCLOSE"});
	}
	//ウェイト
	var waitsec = (Battle.wait >= 2400) ? Battle.wait : 2400;
	var id = setTimeout(BattleClose, waitsec);
}
function BattleClose(){
	//表示
	DisplaySet("DIV_VSBACK", 0);
	//数値表示クリア
	BattleBar("ST0", 0, 0);
	BattleBar("LF0", 0, 0);
	BattleBar("ST1", 0, 0);
	BattleBar("LF1", 0, 0);

	//BGM CHANGE
	Audie.stop("battle");
	setTimeout(function(){Audie.play("map");}, 2000);

	//Analytics
	Analytics.invasion[Battle.p[0].pno]++;
	Analytics.guard[Battle.p[1].pno]++;
	switch(Battle.result){
	case 1:
		Analytics.invasionwin[Battle.p[0].pno]++;
		//##### Enchant #####
		Enchant({time:"BATTLE_WIN"});
		break;
	case 2:
		Analytics.guardwin[Battle.p[1].pno]++;
		break;
	}

	if(Battle.p[0].pno == Board.role || Battle.p[1].pno == Board.role){
		//手札ソート
		SortHand();
	}
	if(Battle.result == 1){
		//次処理
		SummonGrid();
	}else{
		//ターン終了
		StepSet(80);
		if(Board.role == Board.turn){
			//TurnEnd
			TurnEnd();
		}
	}
}
//#######################################################
//受信処理
function BattleRecv(i_cmd, i_pno, i_para){
	var wkarr = i_para.split(":");
	switch(i_cmd){
	case "item": //アイテムセット
		BattleItem({pno:i_pno, cno:wkarr[0], rnd:wkarr[1]});
		break;
	}
}
//######################################################################
//支援効果
function BattleStPlus(i_bno){
	var wkret = 0, gno = 0;
	for(var i=0; i<=3; i++){
		gno = Board.grid[Battle.gno].linkarr[i];
		if(gno != 0){
			if(Battle.from == "M" && Battle.gno_atk == gno){
			}else{
				if(Team(Board.grid[gno].owner) == Team(Battle.p[i_bno].pno)){
					wkret += 10;
				}
			}
		}
	}
	return wkret;
}
//地形効果
function BattleLfPlus(i_gno){
	var tgtgrid = Board.grid[i_gno];
	var wkret = (tgtgrid.color >= 2 && tgtgrid.color == Card[Battle.p[1].cno].color) ? tgtgrid.level * 10 : 0;
	return wkret;
}
//応援効果
function BattleMapAbiAction(){
	var mapactive = "";
	//Search
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
	if(mapactive.match(/@MAPBTINVALID@/)){
		var point = Number(mapactive.match(/@MAPBTINVALID@:([A-Z0-9]+)/)[1]);
		for(var i=0; i<=1; i++){
			if(Battle.p[i].st <= point){
				Battle.p[i].st = 0;
			}
		}
		BattleLog(9, Dic("@MAPBTINVALID@"));
	}
	if(mapactive.match(/@MAPBTSTPLUS@/)){
		var point = Number(mapactive.match(/@MAPBTSTPLUS@:([A-Z0-9]+)/)[1]);
		Battle.p[0].st += point;
		BattleLog(9, Dic("@MAPBTSTPLUS@"));
	}
	if(mapactive.match(/@MAPBTLFPLUSN@/)){
		var point = Number(mapactive.match(/@MAPBTLFPLUSN@:([A-Z0-9]+)/)[1]);
		for(var i=0; i<=1; i++){
			if(Card[Battle.p[i].cno].color == 1){
				Battle.p[i].lf += point;
			}
		}
		BattleLog(9, Dic("@MAPBTLFPLUSN@"));
	}
	if(mapactive.match(/@MAPBTFLYING@/)){
		for(var i=0; i<=1; i++){
			if(Battle.p[i].active.match(/@FLYING@/)){
				Battle.p[i].st += 10;
				Battle.p[i].lf += 10;
			}
		}
		BattleLog(9, Dic("@MAPBTFLYING@"));
	}
}
//#######################################################
//ゲージ表示
function BattleBar(i_str, i_point, i_plus){
	var wk_point = i_point >= 80 ? 200 : Math.floor(i_point * 2.5);
	var wk_plus = i_plus >= 80 ? 200 : Math.floor(i_plus * 2.5);
	if(wk_point + wk_plus >= 200){
		wk_plus = 200 - wk_point;
	}
	$("#DIV_VSN"+i_str).html((i_plus > 0) ? i_point + "+" + i_plus : i_point);
	$("#DIV_VS"+i_str+"1").css("width", wk_point+"px");
	$("#DIV_VS"+i_str+"2").css("width", wk_plus+"px");
}
//ログ
function BattleLog(i_css, i_msg){
	(function(i_css, i_msg){
		var fnc = function(){
			var div = $("<div>"+i_msg+"</div>");
			div.addClass("CLS_VSLOG" + i_css + " animeVsLog");
			$("#DIV_VSLOG").append(div);
			//loglist
			Battle.log.push(i_msg);
			if(Battle.log.length >= 12){
				$("#DIV_VSLOG div:first").remove();
			}
		}
		$T.stacktimer({fnc:fnc, msec:500});
	})(i_css, i_msg);
	//wait
	Battle.wait += 500;
}
//0:1:2 > 1:0:1 
function $r(i_no){
	return ((i_no + 1) % 2);
}
//####################################################################################
//Effect
function AttackEffect(i_cvsno, i_effect){
	var soundnm = "";
	var anime = [];
	var aniid = "attack" + i_cvsno;
	var canvas = "CVS_VSCARD" + i_cvsno;
	//Effect Select
	switch(i_effect){
	case "ball":
		//Anime
		var rndx = [0, 0, 0];
		var rndy = [0, 0, 0];
		for(var i=0; i<=2; i++){  
			rndx[i] = Math.floor(Math.random() * 120) + 40;
			rndy[i] = Math.floor(Math.random() * 180) + 40;
		}
		var copystr = "composite:'destination-out'";
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr+",x:"+rndx[0]+",y:"+rndy[0]+",arc:48})");
		anime.push("group");
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr+",x:"+rndx[0]+",y:"+rndy[0]+",arc:50})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:"+rndx[1]+",y:"+rndy[1]+",arc:42})");
		anime.push("group");
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr+",x:"+rndx[1]+",y:"+rndy[1]+",arc:44})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:"+rndx[2]+",y:"+rndy[2]+",arc:34})");
		anime.push("group");
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr+",x:"+rndx[2]+",y:"+rndy[2]+",arc:36})");
		anime.push("group");
		//SE
		soundnm = "bt_ball";
		break;
	case "slash1":
		var copystr = "r:330,rx:100,ry:130,composite:'destination-out'";
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[100,105,100,95],y:[-20,-5,10,-5]})");
		anime.push("group");
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[105,100,95],y:[-5,160,-5]})");
		anime.push("group");
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[105,100,95],y:[-5,330,-5]})");
		anime.push("group");
		//SE
		soundnm = "bt_slash1";
		break;
	case "bite":
		var copystr = "composite:'destination-out'";
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[90,100,90,80],y:[75,80,90,80]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[80,90,80,70],y:[75,80,90,80],rx:100,ry:200,r:355})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[70,80,70,60],y:[75,80,100,80],rx:100,ry:200,r:350})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[110,120,110,100],y:[75,80,90,80]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[120,130,120,110],y:[75,80,90,80],rx:100,ry:200,r:5})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[130,140,130,120],y:[75,80,100,80],rx:100,ry:200,r:10})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[90,100,90,80],y:[185,180,170,180]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[80,90,80,70],y:[185,180,170,180],rx:100,ry:60,r:5})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[70,80,70,60],y:[185,180,160,180],rx:100,ry:60,r:10})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[110,120,110,100],y:[185,180,170,180]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[120,130,120,110],y:[185,180,170,180],rx:100,ry:60,r:355})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[130,140,130,120],y:[185,180,160,180],rx:100,ry:60,r:350})");
		anime.push("group");
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[90,100,100,90,80,80],y:[75,80,100,110,100,80]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[80,90,90,80,70,70],y:[75,80,100,110,100,80],rx:100,ry:200,r:355})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[70,80,80,70,60,60],y:[75,80,100,120,100,80],rx:100,ry:200,r:350})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[110,120,120,110,100,100],y:[75,80,100,110,100,80]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[120,130,130,120,110,110],y:[75,80,100,110,100,80],rx:100,ry:200,r:5})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[130,140,140,130,120,120],y:[75,80,100,120,100,80],rx:100,ry:200,r:10})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[90,100,100,90,80,80],y:[185,180,160,150,160,180]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[80,90,90,80,70,70],y:[185,180,160,150,160,180],rx:100,ry:60,r:5})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[70,80,80,70,60,60],y:[185,180,160,140,160,180],rx:100,ry:60,r:10})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[110,120,120,110,100,100],y:[185,180,160,150,160,180]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[120,130,130,120,110,110],y:[185,180,160,150,160,180],rx:100,ry:60,r:355})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[130,140,140,130,120,120],y:[185,180,160,140,160,180],rx:100,ry:60,r:350})");
		anime.push("group");
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[90,100,100,90,80,80],y:[75,80,120,130,120,80]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[80,90,90,80,70,70],y:[75,80,120,130,120,80],rx:100,ry:200,r:355})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[70,80,80,70,60,60],y:[75,80,120,140,120,80],rx:100,ry:200,r:350})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[110,120,120,110,100,100],y:[75,80,120,130,120,80]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[120,130,130,120,110,110],y:[75,80,120,130,120,80],rx:100,ry:200,r:5})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[130,140,140,130,120,120],y:[75,80,120,140,120,80],rx:100,ry:200,r:10})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[90,100,100,90,80,80],y:[185,180,140,130,140,180]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[80,90,90,80,70,70],y:[185,180,140,130,140,180],rx:100,ry:60,r:5})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[70,80,80,70,60,60],y:[185,180,140,120,140,180],rx:100,ry:60,r:10})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[110,120,120,110,100,100],y:[185,180,140,130,140,180]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[120,130,130,120,110,110],y:[185,180,140,130,140,180],rx:100,ry:60,r:355})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[130,140,140,130,120,120],y:[185,180,140,120,140,180],rx:100,ry:60,r:350})");
		anime.push("group");
		//SE
		soundnm = "bt_bite";
		break;
	case "cross":
		var copystr1 = "r:330,rx:100,ry:130,composite:'destination-out'";
		var copystr2 = "r:30,rx:100,ry:130,composite:'destination-out'";
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr1+",x:[100,105,100,95],y:[-20,-5,10,-5]})");
		anime.push("fill('"+canvas+"', {"+copystr2+",x:[100,105,100,95],y:[-20,-5,10,-5]})");
		anime.push("group");
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr1+",x:[105,100,95],y:[-5,160,-5]})");
		anime.push("fill('"+canvas+"', {"+copystr2+",x:[105,100,95],y:[-5,160,-5]})");
		anime.push("group");
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr1+",x:[105,100,95],y:[-5,330,-5]})");
		anime.push("fill('"+canvas+"', {"+copystr2+",x:[105,100,95],y:[-5,330,-5]})");
		anime.push("group");
		break;
	default: //[Slash3]
		var copystr = "r:30,rx:100,ry:130,composite:'destination-out'";
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[70,80,70,60],y:[40,60,70,60]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[100,110,100,90],y:[40,60,70,60]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[130,140,130,120],y:[40,60,70,60]})");
		anime.push("group");
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[80,70,60],y:[60,120,60]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[110,100,90],y:[60,120,60]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[140,130,120],y:[60,120,60]})");
		anime.push("group");
		anime.push("group");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[80,70,60],y:[60,220,60]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[110,100,90],y:[60,220,60]})");
		anime.push("fill('"+canvas+"', {"+copystr+",x:[140,130,120],y:[60,220,60]})");
		anime.push("group");
		//SE
		soundnm = "bt_slash3";
		break;
	}
	//Start
	Canvas.start({id:aniid, interval:0.1, times:1, items:anime});
	//Sound Effect
	if(soundnm != "") Audie.seplay(soundnm);
}
