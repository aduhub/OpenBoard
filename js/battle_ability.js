//発動条件判定
function AbilityActive(arg){
	var ret = false;
	var opts = [];
	var fig = Battle.p[arg.bno];
	var o_bno = $r(arg.bno);
	var act, abi;

	switch(arg.type){
	case "abillity":
		opts = fig.opt.concat();
		opts.push(fig.status);
		//Clear
		fig.active = "";
		//Bind
		if(fig.status.match(/_BIND_/)){
			return;
		}
		break;
	case "item":
		opts.push(arg.opt);
		break;
	}

	//active set
	for(var i=0; i<opts.length; i++){
		//Not MapAbility
		if(!(opts[i].match(/^@[0-9A-Z]+@=[0-9]+$/))){
			act = true;
			abi = opts[i].split("!");
			if(abi.length >= 2){
				act = false;
				//ATTACKER
				if(abi[1].match(/^ATK/)){
					if(arg.bno == 0){
						act = true;
					}
				}
				//ST
				if(abi[1].match(/^ST[0-9]+/)){
					var chkst = abi[1].match(/ST([0-9]+)/)[1];
					if(Battle.p[o_bno].stbase >= chkst) act = true;
				}
				//ST ODD
				if(abi[1].match(/^STODD/)){
					var chkst = Math.floor(Battle.p[o_bno].stbase / 10);
					if(chkst % 2 == 1) act = true;
				}
				//ST EVEN
				if(abi[1].match(/^STEVEN/)){
					var chkst = Math.floor(Battle.p[o_bno].stbase / 10);
					if(chkst % 2 == 0) act = true;
				}
				//LF
				if(abi[1].match(/^LF[0-9]+/)){
					var chklf = Number(abi[1].match(/LF([0-9]+)/)[1]);
					if(Battle.p[o_bno].maxlf >= chklf) act = true;
				}
				//LF ODD
				if(abi[1].match(/^LFODD/)){
					var chklf = Math.floor(Battle.p[o_bno].maxlf / 10);
					if(chklf % 2 == 1) act = true;
				}
				//LF EVEN
				if(abi[1].match(/^LFEVEN/)){
					var chklf = Math.floor(Battle.p[o_bno].maxlf / 10);
					if(chklf % 2 == 0) act = true;
				}
				//OPP COLOR
				if(abi[1].match(/^CL[NFWED]+/)){
					var colorno = Card[Battle.p[o_bno].cno].color;
					var colorarr = ["", "N", "F", "W", "E", "D"];
					var tgtcolor = abi[1].match(/CL([NFWED]+)/)[1];
					if(tgtcolor.match(colorarr[colorno])){
						act = true;
					}
				}
				//TERRITORY COLOR
				if(abi[1].match(/^TE[NFWED]+/)){
					var colorno = Board.grid[Battle.gno].color;
					var colorarr = ["", "N", "F", "W", "E", "D"];
					var tgtcolor = abi[1].match(/TE([NFWED]+)/)[1];
					if(tgtcolor.match(colorarr[colorno])){
						act = true;
					}
				}
				//NO ITEM
				if(abi[1].match(/^NOITEM/)){
					var chkcno = Battle.p[o_bno].item;
					if(chkcno == "FIST"){
						act = true;
					}
				}
				//FLYING
				if(abi[1].match(/^FLY/)){
					if(Card.Tool.chkopt({cno:Battle.p[o_bno].cno, tgt:"@FLYING@"})){
						act = true;
					}
				}
				//CURSED
				if(abi[1].match(/^CURSED/)){
					if(Battle.p[1].status != ""){
						act = true;
					}
				}
				//POISON
				if(abi[1].match(/^POISON/)){
					if(Battle.p[o_bno].status == "_POISON_"){
						act = true;
					}
				}
			}
			//Active!!
			if(act){
				if(arg.type == "abillity"){
					//後方優先(opts < status)
					switch(abi[0]){
					case "@SMASH@":
						fig.active = fig.active.replace("@FEAR@", "");
						break;
					case "@FEAR@":
						fig.active = fig.active.replace("@SMASH@", "");
						break;
					case "@FIRST@":
						fig.active = fig.active.replace("@SLOW@", "");
						break;
					case "@SLOW@":
						fig.active = fig.active.replace("@FIRST@", "");
						break;
					}
					//Add
					fig.active += (fig.active == "") ? abi[0] : "," + abi[0];
				}else{
					ret = true;
				}
			}
		}
	}
	if(arg.type == "item"){
		//retun
		return ret;
	}
}
//効果発生 (i_no, i_step)
function BattleAbiAction(arg){
	var msgflg = false;
	var atk = Battle.p[arg.bno];
	var def = Battle.p[$r(arg.bno)];
	var ret = [];
	switch(arg.step){
	case "SELECT1":
		if(atk.active.match("@FORGET@")){
			BattleLog(9, "能力封印");
			for(var i=0; i<=1; i++){
				Battle.p[i].active = "";
			}
		}
		break;
	case "SELECT2":
		if(atk.active.match("@SPY@")){
			var itemcnt = 0;
			for(var i in Player[def.pno].hand){
				if(Card[Player[def.pno].hand[i]].type == "I"){
					itemcnt++;
				}
			}
			if(Board.role == atk.pno){
				BattleLog(arg.bno, Dic("@SPY@")+"["+itemcnt+" 枚]");
			}else{
				BattleLog(arg.bno, Dic("@SPY@"));
			}
		}
		break;
	case "ITEMSTEAL":
		if(atk.active.match(/@OLDSTEAL@/)){
			var cno = def.item;
			if(atk.item == "FIST" && def.item != "FIST"){
				atk.item = cno;
				def.item = "FIST";
				//imgsrc
				Card.Tool.imgset({cvs:"CVS_VSITEM"+arg.bno, cno:cno, zoom:0.5});
				$("#DIV_VSITEM"+$r(arg.bno)).css("display", "none");
				EffectBox({pattern:"itemdestroy", bno:$r(arg.bno), cno:cno});
				//Log
				BattleLog(i, "アイテム奪取");
			}
			break;
		}
		break;
	case "ITEMCLASH":
		if(atk.active.match(/@WEAPONCLASH@/)){
			var defcno = def.item;
			if(def.item != "FIST" && Card[defcno].item && Card[defcno].item == "W"){
				def.item = "FIST";
				EffectBox({pattern:"itemdestroy", bno:$r(arg.bno), cno:defcno});
				$("#DIV_VSITEM"+$r(arg.bno)).css("display", "none");
				BattleLog(i, "アイテム破壊");
			}
			break;
		}
		break;
	case "INIT1":
		if(atk.active.match("@ADAPTATION@")){
			var wkgno = 0;
			var abiswitch = [false, false, false];
			if(Board.grid[Battle.gno].color == 4){
				abiswitch[0] = true
			}
			for(var i=0; i<=3; i++){
				wkgno = Board.grid[Battle.gno].linkarr[i];
				if(wkgno == 0){
					continue;
				}
				if(Battle.from == "M" && Battle.gno_atk == wkgno){
					continue;
				}
				if(Flow.Tool.team(Board.grid[wkgno].owner) == Flow.Tool.team(atk.pno)){
					abiswitch[1] = true;
				}
				if(Board.grid[wkgno].color >= 10 && Board.grid[wkgno].color <= 14){
					abiswitch[2] = true;
				}
			}
			for(var i=0; i<=2; i++){
				if(abiswitch[i]){
					if(i == 0){
						atk.active = atk.active.replace("@SLOW@", "");
					}
					atk.active += ","+["@FIRST@","@CURSEDMG@:30","@HALFSHIELD@"][i];
				}
			}
			BattleLog(arg.bno, Dic("@ADAPTATION@"));
		}
		if(atk.active.match("@DEFBASE@")){
			for(var i=0; i<=3; i++){
				var wkgno = Board.grid[Battle.gno].linkarr[i];
				if(wkgno != 0){
					if(Battle.from == "M" && Battle.gno_atk == wkgno){
					}else{
						if(Flow.Tool.team(Board.grid[wkgno].owner) == Flow.Tool.team(Battle.p[arg.bno].pno)){
							atk.lfplus += 20;
						}
					}
				}
			}
			BattleLog(arg.bno, Dic("@DEFBASE@"));
		}
		if(atk.active.match("@STPLUS@")){
			var matchstr = atk.active.match(/@STPLUS@:([A-Z0-9]+)/);
			atk.st += BtAbilityExNo(arg.bno, matchstr[1]);
			atk.st = Math.max(0, atk.st);
			BattleLog(arg.bno, Dic("@STCHANGE@"));
		}
		if(atk.active.match("@LFPLUS@")){
			var matchstr = atk.active.match(/@LFPLUS@:([A-Z0-9]+)/);
			var chglf = BtAbilityExNo(arg.bno, matchstr[1]);
			atk.lftemp.push(["plus", chglf]);
			atk.lf = Math.max(0, atk.lf + chglf);
			BattleLog(arg.bno, Dic("@LFCHANGE@"));
		}
		if(atk.active.match("@STPLUSNO@")){
			if(Battle.p[arg.bno].item == "FIST"){
				var matchstr = atk.active.match(/@STPLUSNO@:([A-Z0-9]+)/);
				atk.st += BtAbilityExNo(arg.bno, matchstr[1]);
				atk.st = Math.max(0, atk.st);
				BattleLog(arg.bno, Dic("@STCHANGE@"));
			}
		}
		if(atk.active.match("@LFPLUSNO@")){
			if(Battle.p[arg.bno].item == "FIST"){
				var matchstr = atk.active.match(/@LFPLUSNO@:([A-Z0-9]+)/);
				var chglf = BtAbilityExNo(arg.bno, matchstr[1]);
				atk.lftemp.push(["plus", chglf]);
				atk.lf = Math.max(0, atk.lf + chglf);
				BattleLog(arg.bno, Dic("@LFCHANGE@"));
			}
		}
		if(atk.active.match("@STEQUAL@")){
			var matchstr = atk.active.match(/@STEQUAL@:([A-Z0-9]+)/);
			atk.st = BtAbilityExNo(arg.bno, matchstr[1]);
			BattleLog(arg.bno, Dic("@STCHANGE@"));
		}
		if(atk.active.match("@LFEQUAL@")){
			var matchstr = atk.active.match(/@LFEQUAL@:([A-Z0-9]+)/);
			atk.lftemp.push(["plus", atk.lf]);
			atk.lf = BtAbilityExNo(arg.bno, matchstr[1]);
			BattleLog(arg.bno, Dic("@LFCHANGE@"));
		}
		if(atk.active.match("@SPHINX@")){
			if(Board.round % 10 == 0){
				atk.st += 30;
				BattleLog(arg.bno, Dic("@STCHANGE@"));
			}else if(Board.round % 2 == 1){
				atk.lftemp.push(["plus", -30]);
				atk.st += 30;
				atk.lf = Math.max(0, atk.lf - 30);
				BattleLog(arg.bno, Dic("@STCHANGE@"));
				BattleLog(arg.bno, Dic("@LFCHANGE@"));
			}
		}
		if(atk.active.match("@DRUG@")){
			if(atk.item != "FIST" && Card[atk.item].item && Card[atk.item].item == "I"){
				var matchstr = atk.active.match(/@DRUG@:([A-Z0-9]+)/);
				atk.lf += BtAbilityExNo(arg.bno, matchstr[1]);
				BattleLog(arg.bno, Dic("@LFCHANGE@"));
			}
		}
		if(atk.active.match("_GRAVITY_")){
			atk.st = Math.max(0, atk.st - 10);
			atk.lftemp.push(["plus", 10]);
			atk.lf = Math.max(0, atk.lf + 10);
			BattleLog(arg.bno, Dic("@STCHANGE@"));
			BattleLog(arg.bno, Dic("@LFCHANGE@"));
		}
		if(atk.active.match("_UNTIELEMENT_")){
			atk.lfplus = 0;
			BattleLog(arg.bno, Dic("_UNTIELEMENT_"));
		}
		break;
	case "INIT2":
		if(atk.active.match("@FIRST@")){
			atk.speed += 2;
			BattleLog(arg.bno, Dic("@FIRST@"));
		}
		if(atk.active.match("@SLOW@")){
			atk.speed -= 2;
			BattleLog(arg.bno, Dic("@SLOW@"));
		}
		if(atk.active.match("@FLYING@")){
			BattleLog(arg.bno, Dic("@FLYING@"));
		}
		break;
	case "ATTACK":
		if(atk.active.match("@SMASH@")){
			atk.damage = (atk.damage > 0) ? Math.floor(atk.damage * 1.5) : 0;
			BattleLog(arg.bno, Dic("@SMASH@"));
		}
		if(atk.active.match("@WEAPON@")){
			if(atk.item != "FIST" && Card[atk.item].item && Card[atk.item].item == "W"){
				atk.damage = (atk.damage > 0) ? Math.floor(atk.damage * 1.5) : 0;
				BattleLog(arg.bno, Dic("@SMASH@"));
			}
		}
		if(atk.active.match("@FEAR@")){
			atk.damage = (atk.damage > 0) ? Math.floor(atk.damage / 2) : 0;
			BattleLog(arg.bno, Dic("@FEAR@"));
		}
		if(atk.active.match("@DIRECT@")){
			atk.direct = true;
			BattleLog(arg.bno, Dic("@DIRECT@"));
		}
		//def
		if(def.active.match("@FLYING@")){
			if(atk.active.match(/@FLYING@|@SHOOT@/)){
				if(atk.active.match("@SHOOT@")){
					BattleLog(arg.bno, Dic("@SHOOT@"));
				}
			}else{
				atk.damage = 0;
			}
		}
		if(def.active.match(/@HALFSHIELD@|@SPIKESHIELD@/)){
			if(atk.damage > 0){
				atk.damage = Math.ceil(atk.damage / 2);
			}
			if(def.active.match(/@SPIKESHIELD@/)){
				BattleLog($r(arg.bno), Dic("@SPIKESHIELD@"));
			}else{
				BattleLog($r(arg.bno), Dic("@HALFSHIELD@"));
			}
		}
		if(def.active.match(/@PROTECTION@/)){
			atk.damage = 0;
			BattleLog($r(arg.bno), Dic("@PROTECTION@"));
		}
		if(def.active.match(/@AEGIS@/)){
			if(atk.item != "FIST" && (Card[atk.item].type == "I" || (Card[atk.item].type == "C" && !def.active.match(/@BAND@/))) && Card[atk.item].item && Card[atk.item].item == "W"){
				atk.damage = 0;
				BattleLog($r(arg.bno), Dic("@PROTECTION@"));
			}
		}
		break;
	case "DEFFENCE":
		if(def.active.match(/@IRONHEART@/)){
			if(def.lf <= arg.dmglife && def.lf > 1){
				var guard = arg.dmglife - (def.lf - 1);
				ret.push({act:"minus", val:guard});
				BattleLog($r(arg.bno), Dic("@IRONHEART@"));
			}
		}
		if(def.active.match(/@REFLECT@/)){
			if(def.item != "FIST" && Card[def.item].type == "C" && Card[atk.cno].color == Card[def.item].color){
				ret.push({act:"nodamage"});
				ret.push({act:"reflect"});
				BattleLog($r(arg.bno), Dic("@REFLECT@"));
			}
		}
		if(def.active.match(/@SPIKESHIELD@/)){
			ret.push({act:"reflect"});
		}
		if(def.active.match(/@COUNTER@/)){
			ret.push({act:"counter"});
			BattleLog($r(arg.bno), Dic("@COUNTER@"));
		}
		break;
	case "HIT":
		var cno, rndnum;
		if(atk.active.match("@DISCARD@")){
			Player[def.pno].hand.sort();
			for(var i in atk.rnd){
				rndnum = Number(atk.rnd[i]);
				if(Player[def.pno].hand.length > rndnum){
					cno = Player[def.pno].hand[rndnum];
					Player[def.pno].HandDel(cno);
					BattleLog($r(arg.bno), Dic("@DISCARD@"));
					Logprint({msg:"##" + cno + "##を破棄", pno:def.pno});
					if(Board.role == def.pno){
						Deck.Tool.sorthand();
					}
					break;
				}
			}
		}
		if(atk.active.match("@POISON@")){
			if(def.active.match(/@CLEAR@/)){
				BattleLog($r(arg.bno), Dic("@CLEAR@"));
			}else{
				def.active = def.active.replace(/_[0-9A-Z]+_/, "");
				def.active += ",_POISON_";
				def.status = "_POISON_";
				BattleLog($r(arg.bno), Dic("@POISON@"));
			}
		}
		if(atk.active.match("@BIND@")){
			if(def.active.match(/@CLEAR@/)){
				BattleLog($r(arg.bno), Dic("@CLEAR@"));
			}else{
				def.active = def.active.replace(/_[0-9A-Z]+_/, "");
				def.active = "_BIND_";
				def.status = "_BIND_";
				BattleLog($r(arg.bno), Dic("@BIND@"));
			}
		}
		if(atk.active.match(/@DEATH@/)){
			if(atk.item == "FIST" && def.item != "FIST"){
				def.lf = 0;
				BattleLog(arg.bno, Dic("@DEATH@"));
				//ダメージ表示
				BattleBar("LF"+$r(arg.bno), def.lf, def.lfplus);
				//エフェクト
				AttackEffect($r(arg.bno), "cross");
			}
		}
		if(atk.active.match(/@STONE@/)){
			//Check Neutral
			if(Card[def.cno].color == 1){
				def.lf = 0;
				BattleLog(arg.bno, Dic("@STONE@"));
				//ダメージ表示
				BattleBar("LF"+$r(arg.bno), def.lf, def.lfplus);
				//エフェクト
				AttackEffect($r(arg.bno), "cross");
			}
		}
		if(atk.active.match(/@ESCAPE@/)){
			if(def.lf >= 1 && atk.item == "FIST"){
				//破壊判定
				atk.lf = 0;
				atk.status = "escape";
				//手札追加
				if(Player[atk.pno].hand.length < 10){
					Player[atk.pno].hand.push(atk.cno);
					if(Board.role == atk.pno){
						//手札ソート
						Deck.Tool.sorthand();
					}
				}
				//Log
				BattleLog($r(arg.bno), Dic("@ESCAPE@"));
			}
		}
		break;
	case "MISS":
		if(atk.active.match(/@REVDEATH@/)){
			def.lf = 0;
			BattleLog(arg.bno, Dic("@DEATH@"));
			//ダメージ表示
			BattleBar("LF"+$r(arg.bno), def.lf, def.lfplus);
			//エフェクト
			AttackEffect($r(arg.bno), "cross");
		}
		break;
	case "DESTROY":
		if(atk.active.match(/@STICKY@/)){
			for(var i=1; i<=2; i++){
				//手札追加
				if(Player[atk.pno].hand.length < 10){
					Player[atk.pno].hand.push(atk.cno);
					Logprint({msg:"*##" + atk.cno + "##は手札に戻った", pno:atk.pno});
					if(Board.role == atk.pno){
						//手札ソート
						Deck.Tool.sorthand();
					}
				}else{
					Logprint({msg:"*##" + atk.cno + "##を破棄", pno:atk.pno});
				}
			}
			BattleLog(arg.bno, Dic("@STICKY@"));
		}
		break;
	case "RESULT":
		if(atk.active.match(/_POISON_/)){
			if(atk.lf >= 1){
				var dmg = Math.ceil(atk.maxlf * 0.3);
				atk.lf = (atk.lf - dmg <= 0) ? 0 : atk.lf - dmg;
				//dng表示
				$("#DIV_VSDMG"+arg.bno).html(dmg);
				BattleBar("LF"+arg.bno, atk.lf, atk.lfplus);
				//Log
				BattleLog(arg.bno, Dic("_POISON_"));
			}
		}
		if(atk.active.match(/@COLLAPSE@/)){
			if(atk.lf >= 1){
				var dmg = Math.floor(atk.lf / 2);
				atk.lf = (atk.lf - dmg <= 0) ? 0 : atk.lf - dmg;
				//ダメージ表示
				$("#DIV_VSDMG"+arg.bno).html(dmg);
				BattleBar("LF"+arg.bno, atk.lf, atk.lfplus);
				//Log
				BattleLog(arg.bno, Dic("@COLLAPSE@"));
			}
		}
		if(atk.active.match(/@CURSEDMG@/)){
			if(atk.lf >= 1 && def.lf >= 1){
				var dmg = Number(atk.active.match(/@CURSEDMG@:([0-9]+)/)[1]);
				def.lf = (def.lf - dmg <= 0) ? 0 : def.lf - dmg;
				//ダメージ表示
				$("#DIV_VSDMG"+$r(arg.bno)).html(dmg);
				BattleBar("LF"+$r(arg.bno), def.lf, def.lfplus);
				//Log
				BattleLog($r(arg.bno), Dic("@CURSEDMG@"));
			}
		}
		if(atk.active.match(/@REGENE@/)){
			if(atk.lf >= 1){
				atk.lf = atk.maxlf;
				BattleLog(arg.bno, Dic("@REGENE@"));
			}
		}
		if(atk.active.match(/@SWAP@/)){
			if(atk.lf >= 1 && def.lf >= 1){
				var sttmp = def.st;
				def.st = def.maxlf;
				def.maxlf = sttmp;
				if(def.lf > def.maxlf){
					def.lf = def.maxlf;
				}
				//ダメージ表示
				BattleBar("ST"+$r(arg.bno), def.st, def.stplus);
				BattleBar("LF"+$r(arg.bno), def.lf, def.lfplus);
				//Log
				BattleLog($r(arg.bno), Dic("@SWAP@"));
			}
		}
		if(atk.active.match(/@HOMING@/)){
			if(atk.lf >= 1 && atk.lf % 20 >= 10){
				//破壊判定
				atk.lf = 0;
				//手札追加
				if(Player[atk.pno].hand.length < 10){
					Player[atk.pno].hand.push(atk.cno);
					Logprint({msg:"*##" + atk.cno + "##は手札に戻った", pno:atk.pno});
					if(Board.role == atk.pno){
						//手札ソート
						Deck.Tool.sorthand();
					}
				}else{
					Logprint({msg:"*##" + atk.cno + "##を破棄", pno:atk.pno});
				}
				//Log
				BattleLog($r(arg.bno), Dic("@HOMING@"));
			}
		}
		if(atk.active.match(/@BLACKSWAN@/)){
			if(atk.lf >= 1 && def.lf >= 1){
				var wkgold = atk.lf * 10;
				//Status Set
				Player[atk.pno].gold += wkgold;
				//log
				BattleLog(arg.bno, Dic("@BLACKSWAN@"));
				Logprint({msg:"<span class='g'>"+wkgold+"G</span>を得た", pno:atk.pno});
			}
		}
		if(atk.active.match(/@HUNTER@/)){
			if(atk.lf >= 1 && def.lf <= 0){
				if(atk.item != "FIST" && Card[atk.item].item && Card[atk.item].item == "W"){
					var wkgold = Math.min(Player[def.pno].gold, Card[def.cno].cost);
					//Status Set
					Player[atk.pno].gold += wkgold;
					Player[def.pno].gold -= wkgold;
					//log
					BattleLog(arg.bno, Dic("@HUNTER@"));
					Logprint({msg:"<span class='g'>"+wkgold+"G</span>を奪った", pno:atk.pno});
				}
			}
		}
		if(atk.active.match(/@DICE1@/)){
			if(atk.lf >= 1){
				//Status Set
				Player[def.pno].status = "_DICE_:1";
				if(def.pno == Board.turn){
					Player[def.pno].statime = 2;
				}else{
					Player[def.pno].statime = 1;
				}
				//Icon set
				SetPlayerIcon(def.pno, "popp_dice");
				BattleLog(arg.bno, Dic("@DICE1@"));
			}
		}
		if(atk.active.match(/@UROBOROS@/)){
			if(atk.lf <= 0){
				var mincnt = 99;
				for(var i=1; i<=Board.playcnt; i++){
					mincnt = Grid.count({owner:i, maxcnt:mincnt});
				}
				if(mincnt == Grid.count({owner:atk.pno})){
					atk.st = Card[atk.cno].st;
					atk.lf = Card[atk.cno].lf;
					atk.maxlf = Card[atk.cno].lf;
					atk.status = "";
					//Creature表示
					$("#DIV_VSCARD"+arg.bno).css({height:0});
					Card.Tool.imgset({cvs:"CVS_VSCARD"+arg.bno, cno:atk.cno});
					$("#DIV_VSCARD"+arg.bno).animate({height:260}, 2000);
					//Log
					BattleLog(arg.bno, Dic("@UROBOROS@"));
				}
			}
		}
		break;
	case "RESULTCLOSE":
		if(atk.active.match(/@SINK@/)){
			if(arg.bno == 0 && Battle.result == 1){
				//Battle log
				BattleLog(arg.bno, Dic("@SINK@"));

				var wkelement = ["", "無", "火", "水", "地", "風"];
				var wkcolor = Board.grid[Battle.gno].color;
				//設定
				Board.grid[Battle.gno].color = 3;
				//地形表示
				Grid.Img.set(Battle.gno);
				//Log
				Logprint({msg:"(地形変化) "+wkelement[wkcolor]+" > "+wkelement[3], pno:Battle.pno});
			}
		}
		if(atk.active.match(/@REWARD@/)){
			if(arg.bno == 0 && Battle.result == 1){
				if(Board.grid[Battle.gno].level <= 4){
					//Battle log
					BattleLog(arg.bno, Dic("@REWARD@"));

					var wklevel1 = Board.grid[Battle.gno].level;
					var wklevel2 = wklevel1 + 1;
					//設定
					Board.grid[Battle.gno].level = wklevel2;
					//地形表示
					Grid.Img.set(Battle.gno);
					//Log
					Logprint({msg:"(レベルアップ) "+wklevel1+" > "+wklevel2, pno:Battle.pno});
				}
			}
		}
		break;
	}
	return ret;
}
//数字換算
function BtAbilityExNo(i_bno, i_str){
	var retno = 0;
	if(i_str.match(/^[0-9]+$/)){
		retno = Number(i_str);
	}else{
		var atk = Battle.p[i_bno];
		var def = Battle.p[$r(i_bno)];
		switch(true){
		case /4CLR/.test(i_str): //4Color
			var clrcnt = [0, 0, 0, 0, 0, 0];
			for(var i=1; i<Board.grid.length; i++){
				if(Flow.Tool.team(Board.grid[i].owner) == Flow.Tool.team(Battle.p[$r(i_bno)].pno)){
					clrcnt[Board.grid[i].color]++;
				}
			}
			for(var i=2; i<=5; i++){
				if(clrcnt[i] >= 1){
					retno += 20;
				}
			}
			break;
		case /BEE/.test(i_str): // SparkBee * 10
			for(var i=1; i<Board.grid.length; i++){
				if(Board.grid[i].owner >= 1){
					if($T.inarray(Card[Board.grid[i].cno].name, ["スパークビー", "スカウトビー"])){
						retno += 10;
					}
				}
			}
			break;
		case /BRAVE/.test(i_str): //Atk.MaxHp - Def.MaxHp
			if(atk.maxlf <= def.maxlf){
				retno = def.maxlf - atk.maxlf;
			}
			break;
		case /C[NFWED][0-9]+/.test(i_str): //Creature Element
			var terms = i_str.match(/C([NFWED])([0-9]+)/);
			var colorarr = ["", "N", "F", "W", "E", "D"];
			for(var i=1; i<Board.grid.length; i++){
				if(Board.grid[i].cno != ""){
					if(terms[1].match(colorarr[Card[Board.grid[i].cno].color])){
						retno += Number(terms[2]);
					}
				}
			}
			break;
		case /ENCLR[0-9]+/.test(i_str): //Enemy Creature Element
			var terms = i_str.match(/ENCLR([0-9]+)/);
			for(var i=1; i<Board.grid.length; i++){
				if(Board.grid[i].cno != ""){
					if(Card[Board.grid[i].cno].color == Card[def.cno].color){
						retno += Number(terms[1]);
					}
				}
			}
			break;
		case /IFRIT/.test(i_str): //Fire Up Water Down
			var clrcnt = [0, 0];
			for(var i=1; i<Board.grid.length; i++){
				if(Board.grid[i].color == 2 && Flow.Tool.team(Board.grid[i].owner) == Flow.Tool.team(Battle.p[i_bno].pno)){
					clrcnt[0]++;
				}
			}
			retno = $T.shrink((clrcnt[0] * 20), 0, 100);
			break;
		case /LVL[0-9]+/.test(i_str): //Creature Element
			var terms = i_str.match(/LVL([0-9]+)/);
			var level = Board.grid[Battle.gno].level;
			retno = level * Number(terms[1]);
			break;
		case /HANDM[0-9]+/.test(i_str): //HAND MINUS
			var terms = i_str.match(/HANDM([0-9]+)/);
			var hand = Player[atk.pno].hand.length;
			retno = Number(terms[1]) - (hand * 10);
			if(retno < 0){
				retno = 0;
			}
			break;
		case /RDEC/.test(i_str): //Round Decrease
			retno = (Board.round) * -1;
			break;
		case /T[NFWED][0-9]+/.test(i_str): //Territory Element
			var terms = i_str.match(/T([NFWED])([0-9]+)/);
			var colorarr = ["", "N", "F", "W", "E", "D"];
			for(var i=1; i<Board.grid.length; i++){
				var colorno = Board.grid[i].color;
				if(Flow.Tool.team(Board.grid[i].owner) == Flow.Tool.team(Battle.p[i_bno].pno) && terms[1].match(colorarr[colorno])){
					retno += Number(terms[2]);
				}
			}
			break;
		}
	}
	return retno;
}