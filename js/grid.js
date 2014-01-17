//Object
var Grid = {};
//Clear ({pno, gno, all})
Grid.clear = function(arg){
	if(Board.grid[arg.gno].color < 10){
		var pno = (arg.pno || Board.grid[arg.gno].owner);
		Board.grid[arg.gno].flush();
		if(arg.all){
			Board.grid[arg.gno].level = 1;
		}
		UI.CreateJS.GridIcon(arg.gno);
		Grid.Img.set(arg.gno);
		Grid.Img.tax({pno:pno});
	}
}
//Move A to B
Grid.move = function(arg){
	var cno = Board.grid[arg.gno1].cno;
	//Move
	Board.grid[arg.gno2].owner = Board.grid[arg.gno1].owner;
	Board.grid[arg.gno2].cno = Board.grid[arg.gno1].cno;
	Board.grid[arg.gno2].st = Board.grid[arg.gno1].st;
	Board.grid[arg.gno2].lf = Board.grid[arg.gno1].lf;
	Board.grid[arg.gno2].maxlf = Board.grid[arg.gno1].maxlf;
	Board.grid[arg.gno2].status = "";
	Board.grid[arg.gno2].statime = 0;
	//Icon
	UI.CreateJS.GridIcon(arg.gno2);
	Grid.Img.set(arg.gno2);
	//Clear From
	Grid.clear({gno:arg.gno1});
	//Annimation
	if(arg.effect){
		EffectBox({pattern:"invasion", cno:cno, gno1:arg.gno1, gno2:arg.gno2});
		EffectBox({pattern:"msgpop", gno:arg.gno1, msg:"Move"});
	}
}
//Damage ({gno, dmg, [arrow], [scroll]})
Grid.damage = function(arg){
	var target = [].concat(arg.gno);
	var damage = arg.dmg;
	//### Area Ability ###
	var abiarr = GridAreaAbility({time:"MAPDAMAGE"});
	if(abiarr.length >= 1){
		//A=B Damage Reduce
		if($T.search(abiarr, "act", "reduce")){
			damage -= $T.result.val;
		}
	}
	for(var i=0; i<target.length; i++){
		(function(gno){
			var fnc = function(){
				var tgtpno = Board.grid[gno].owner;
				var tgtcno = Board.grid[gno].cno;
				//GridCheck
				var retarr = GridAbility({time:"GRID_DAMAGE", gno:gno});
				if($T.search(retarr, "act", "phantasm")){
					//ログ
					Logprint({msg:Dic("@PHANTASM@")+"能力により無効", pno:Board.grid[gno].owner});
				}else{
					//効果
					Board.grid[gno].lf = Math.max(0, Board.grid[gno].lf - damage);
					//判定
					if(Board.grid[gno].lf == 0){
						//領地クリア
						Grid.clear({gno:gno});
						//Grave
						Board.grave.push(tgtcno);
						//Animation
						EffectBox({pattern:"destroy", gno:gno, cno:tgtcno});
						//ログ
						Logprint({msg:"##"+tgtcno+"##は破壊された", pno:tgtpno});
					}else{
						//msgpop
						EffectBox({pattern:"msgpop", gno:gno, msg:"-HP"+damage, color:"#ff0000"});
						//Animation
						EffectBox({pattern:"impact",gno:gno});
						//ログ
						Logprint({msg:"##"+tgtcno+"##は"+damage+"ダメージ", pno:tgtpno});
					}
				}
				//矢印
				if(arg.arrow){
					UI.Html.setDiv({id:"DIV_GCLICK"+gno, img:"arrow4.gif"});
				}
				//スクロール
				if(arg.scroll){
					UI.Tool.scrollBoard(gno);
				}
			}
			$T.stacktimer({fnc:fnc, msec:100});
		})(target[i]);
	}
}
//Status Change ({gno, status, statime, [arrow], [scroll]})
Grid.setstatus = function (arg){
	var turn;
	var tgt = [].concat(arg.gno);
	for(var i in tgt){
		(function(gno){
			var fnc = function(){
				var clearflg = false;
				//GridCheck
				var retarr = GridAbility({time:"GSTATUS_CHANGE", gno:gno});
				if($T.search(retarr, "act", "clear")){
					clearflg = true;
				}
				//
				if(clearflg){
					//ログ
					Logprint({msg:Dic("@CLEAR@")+"能力により無効", pno:Board.grid[gno].owner});
				}else{
					turn = ($T.inrange(arg.statime, 1, 9)) ? arg.statime * Board.playcnt : 99;
					Board.grid[gno].status = arg.status;
					Board.grid[gno].statime = turn;
					//表示
					Grid.Img.tax({gno:gno});
					//ログ
					Logprint({msg:"##"+Board.grid[gno].cno+"##は呪いを受けた", pno:Board.grid[gno].owner});
					//msgpop
					EffectBox({pattern:"msgpop", gno:gno, msg:"Cursed", color:"#FFFFD4"});
				}
				//矢印
				if(arg.arrow){
					UI.Html.setDiv({id:"DIV_GCLICK"+gno, img:"arrow4.gif"});
				}
				//スクロール
				if(arg.scroll){
					UI.Tool.scrollBoard(gno);
				}
			}
			$T.stacktimer({fnc:fnc, msec:100});
		})(tgt[i]);
	}
}
//Count ({owner, color, maxcnt})
Grid.count = function (arg){
	var retarr = Board.grid.filter(function(val, idx ,arr){
		if(arg.owner && Flow.Tool.team(val.owner) != Flow.Tool.team(arg.owner)) return false;
		if(arg.color && val.color != arg.color) return false;
		if(arg.cno_color && Card[val.cno].color != arg.cno_color) return false;
		return true;
	});
	return Math.min(retarr.length, (arg.maxcnt || 0));
}
//Value (gno)
Grid.value = function (gno){
	var wklevel = [0, 1.0, 2.0, 4.0, 8.0, 16.0];
	var wkchain = [0, 1.0, 1.5, 1.8, 2.0, 2.2];
	var wkret = 0;
	var tgtgrid = Board.grid[gno];
	if(tgtgrid.color <= 10){
		var wkbase = tgtgrid.gold;
		var retarr = GridAbility({time:"GRID_VALUE", gno:gno});
		if($T.search(retarr, "act", "percent")){
			wkbase = Math.floor(wkbase * $T.result.val);
		}
		if(Board.grid[gno].owner == 0 || tgtgrid.color == 1){
			wkret = Math.floor(wkbase * wklevel[tgtgrid.level]);
		}else{
			wkret = Math.floor(wkbase * wklevel[tgtgrid.level] * wkchain[Grid.count({owner:tgtgrid.owner, color:tgtgrid.color, maxcnt:5})]);
		}
	}
	return wkret;
}
//Tax (gno)
Grid.tax = function (gno){
	var wktax = new Array(0, 0.2, 0.3, 0.4, 0.6, 0.8);
	var wkret = 0;
	if(Board.grid[gno].color <= 5){
		wkret = Math.floor(Grid.value(gno) * wktax[Board.grid[gno].level]);
	}
	return wkret;
}
//Light ({arr, load, save, clear})
Grid.light_memory = [];
Grid.light = function (arg){
	if(arg.clear){
		$(".animeGridlight").remove();
	}
	if(arg.arr || arg.load){
		var tgtgrid = (arg.load) ? Grid.light_memory : arg.arr;
		if(arg.save){
			Grid.light_memory = arg.arr;
		}
		for(var i in tgtgrid){
			var divy = Board.grid[tgtgrid[i]].top;
			var divx = Board.grid[tgtgrid[i]].left;
			var lightdiv = $("<div></div>");
			lightdiv.addClass("animeGridlight");
			lightdiv.css({top:divy, left:divx});
			$("#DIV_FRAME").append(lightdiv);
		}
	}
}
Grid.fortlight = function (){
	var nswe = ["n", "s", "w", "e"];
	var nswe2 = ["N", "S", "W", "E"];
	$(".animeFortlight").remove();
	for(var i=0; i<4; i++){
		if(Player[Board.turn].flag.match(nswe[i])){
			tgtarr = Grid.grep({tgt:"TXGF"+nswe2[i]});
			for(var i2=0; i2<tgtarr.length; i2++){
				var divy = Board.grid[tgtarr[i2]].top;
				var divx = Board.grid[tgtarr[i2]].left;
				var lightdiv = $("<div></div>");
				lightdiv.addClass("animeFortlight");
				lightdiv.css({top:divy, left:divx});
				$("#DIV_FRAME").append(lightdiv);
			}
		}
	}
}
//
function GridGuidePop(gno){
	if(Board.step % 10 == 0 || Board.step == 31 || Board.step == 32 || Board.step == 92){
		if(gno == 0){
			$(".CLS_GRIDGUIDE").remove();
		}else{
			GridInfo(0);
			var gene = GridGuideSearch({gno:gno});
			for(var i=1; i<Board.grid.length; i++){
				if(gene.grid[i] != 999){
					var divy = Number(Board.grid[i].top);
					var divx = Number(Board.grid[i].left);
					var msgstr = (gene.grid[i] == 0) ? "★" : gene.grid[i];
					var effdiv = $("<div onmousedown='GridGuidePop(0);' onmouseout='GridGuidePop(0);'>"+msgstr+"</div>");
					effdiv.css({top:divy, left:divx});
					effdiv.addClass("CLS_GRIDGUIDE");
					$("#DIV_FRAME").append(effdiv);
				}
			}
		}
	}
}
function GridGuideSearch(gene){
	if(typeof gene.root == "undefined"){
		gene.root = gene.gno;
		gene.depth = 0;
		gene.grid = [];
		gene.route = [];
		for(var i=1; i<=Board.grid.length; i++){
			gene.grid.push(999);
		}
	}else{
		gene.depth++;
	}
	if(gene.grid[gene.gno] > gene.depth){
		gene.grid[gene.gno] = gene.depth;
		var linkarr = Board.grid[gene.gno].linkarr;
		if(linkarr.length > 0){
			gene.route.push(gene.gno);
			for(var i=0; i<linkarr.length; i++){
				if(linkarr[i] >= 1 && linkarr[i] != gene.root){
					gene.gno = linkarr[i];
					gene = GridGuideSearch(gene);
				}
			}
			gene.route.pop();
		}
	}
	gene.depth--;
	return gene;
}
//Image
Grid.Img = {};
Grid.Img.tax_gsh = 0;
Grid.Img.set = function(gno){
	//Canvas
	UI.CreateJS.Grid(gno);
	//
	if(Board.grid[gno].owner >= 1){
		Grid.Img.tax({pno:Board.grid[gno].owner});
	}else{
		$("#DIV_GCLICK"+gno).html("");
	}
}
Grid.Img.chgnum = function (){
	switch(Grid.Img.tax_gsh){
	case 0: //G
		Grid.Img.tax_gsh = 1;
		break;
	case 1: //ST
		Grid.Img.tax_gsh = 2;
		break;
	case 2: //HP
		Grid.Img.tax_gsh = 0;
		break;
	}
	for(var i=1; i<=4; i++){
		Grid.Img.tax({pno:i});
	}
}
//########################################
//Grep ({pno, tgt, select, ext, all})
Grid.grep = function(arg){
	var colorno = {N:1, F:2, W:3, E:4, D:5};
	var retitem = [];
	var optflg, tgtgrid, protect;
	var clrchk = "";
	var antiprotect = false;
	var tg3 = arg.tgt.substr(0, 3);
	//準備
	if(optstr = arg.tgt.match(/^..G([A-Z0-9]*)$/)[1]){
		//Protect
		if(optstr.match(/ALL|WALK/)){
			antiprotect = true;
		}
		//特殊計算(最大数)
		if(optstr == "MASS"){
			var gcnt = [0,0,0,0,0,0];
			var maxcnt = 0;
			for(var i=1; i<=5; i++){
				gcnt[i] = Grid.count({color:i});
				maxcnt = Math.max(maxcnt, gcnt[i]);
			}
			for(var i=1; i<=5; i++){
				clrchk[i] = (maxcnt == gcnt[i]) ? true : false;
			}
		}
		//指定色
		if(optstr.match(/[NFWED]/)){
			clrchk = colorno[optstr];
		}
	}
	//============= 判定・集計 ===============
	for(var i in Board.grid){
		tgtgrid = Board.grid[i];
		optflg = false;
		protect = false;
		//対象リスト
		if(arg.select && arg.select.indexOf(i) == -1){
			continue;
		}
		//地形チェック
		if(tgtgrid.color < 10){
			//[基本地形]
			//色チェック
			if(clrchk && clrchk != tgtgrid.color){
				continue;
			}
			//所有者チェック
			if(tgtgrid.owner == 0){
				//空き地検索
				if(!(tg3[1].match(/[AS]/))){
					continue;
				}
			}else{
				//領地検索
				if(Card.Tool.chkopt({cno:tgtgrid.cno, tgt:"@PROTECT@"}) || tgtgrid.status == "_PROTECT_"){
					protect = (antiprotect) ? false : true;
				}
				if(tg3[0] == "A" || (tg3[0] == "T" && protect == false)){
					if(tg3[1] == "M"){
						if(Flow.Tool.team(tgtgrid.owner) != Flow.Tool.team(arg.pno)){
							continue;
						}
					}
					if(tg3[1] == "O"){
						if(Flow.Tool.team(tgtgrid.owner) == Flow.Tool.team(arg.pno)){
							continue;
						}
					}
				}
			}
			//[オプションチェック]
			switch(optstr){
			case "HP30":
				optflg = (Board.grid[i].maxlf <= 30);
				break;
			case "WALK":
				if(Board.grid[i].owner == 0){
					optflg = true;
				}else{
					if(Flow.Tool.team(Board.grid[i].owner) != Flow.Tool.team(arg.pno) && Board.grid[i].status != "_JAIL_"){
						optflg = true;
					}
				}
				break;
			case "LIVE":
				if(Board.grid[i].owner >= 1){
					optflg = true;
				}
				break;
			case "STHP": //ST < HP
				optflg = (Board.grid[i].st < Board.grid[i].lf);
				break;
			case "CURSED":
				optflg = (Board.grid[i].status != "");
				break;
			case "GRD":
				if(Board.grid[i].cno != ""){
					if(Board.grid[i].status == "_BIND_"){
						optflg = true;
					}else{
						optflg = (Card[Board.grid[i].cno].opt.indexOf("@FLYING@") == -1);
					}
				}
				break;
			case "FLY":
				if(Board.grid[i].cno != ""){
					if(Board.grid[i].status != "_BIND_"){
						optflg = (Card[Board.grid[i].cno].opt.indexOf("@FLYING@") >= 0);
					}
				}
				break;
			case "L1":
				if(Board.grid[i].level == 1){
					optflg = true;
				}
				break;
			case "SAME":
				if(Board.grid[i].owner >= 1){
					var samegrid = Board.grid[arg.ext[0]];
					if(samegrid.level == Board.grid[i].level && Card[samegrid.cno].color == Card[Board.grid[i].cno].color){
						optflg = true;
					}
				}
				break;
			default:
				optflg = true;
				break;
			}
		}else{
			//[特殊地形]
			//[オプションチェック]
			switch(optstr){
			case "FN":
				optflg = (Board.grid[i].color == 11);
				break;
			case "FS":
				optflg = (Board.grid[i].color == 12);
				break;
			case "FW":
				optflg = (Board.grid[i].color == 13);
				break;
			case "FE":
				optflg = (Board.grid[i].color == 14);
				break;
			default:
				optflg = true;
				break;
			}
		}
		//所有・オプション・色
		if(optflg){
			retitem.push(i);
		}
	}
	//対象外リスト
	if(arg.ext){
		retitem = retitem.filter(function(val,idx,arr){
			return (arg.ext.indexOf(val) == -1);
		});
	}
	return retitem;
}
//最短目標物検索{gno:, flg:, tgt:}(複数対象返却)
function GridNearTgtSearch(arg){
	var tgt = GridTgtSearch({gno:arg.gno, tgt:arg.tgt});
	var retgno = [];
	var distance = 999;
	for(var i=0; i<tgt.get.length; i++){
		var getitem = tgt.get[i].split(":");
		if(distance > getitem[1]){
			distance = Number(getitem[1]);
		}
	}
	for(var i=0; i<tgt.get.length; i++){
		var getitem = tgt.get[i].split(":");
		if(distance == getitem[1]){
			retgno.push(Number(getitem[0]));
		}
	}
	return retgno;
}
//対象物距離検索(複数選択)
function GridTgtSearch(gene){
	if(typeof gene.depth == "undefined"){
		gene.root = gene.gno;
		gene.depth = 1;
		gene.get = [];
		gene.route = [];
		gene.node = [];
	}else{
		gene.depth++;
	}
	var tgtgno = gene.gno;
	var stand = Board.grid[tgtgno];
	var linkarr = [stand.link1, stand.link2, stand.link3, stand.link4];
	for(var i=3; i>=0; i--){
		if(linkarr[i] == "0" || gene.route.indexOf(linkarr[i]) >= 0 || linkarr[i] == gene.root){
			linkarr.splice(i, 1);
		}
	}
	if(linkarr.length > 0){
		var linkGrid, addflg, additem;
		var nswe = {11:"n",12:"s",13:"w",14:"e"};
		gene.route.push(tgtgno);
		for(var i=0; i<linkarr.length; i++){
			addflg = false;
			linkGrid = Board.grid[linkarr[i]];
			switch(gene.tgt){
			case "special":
				addflg = (linkGrid.color >= 10);
				break;
			case "castle":
				additem = (linkGrid.color == 10);
				break;
			case "fort":
				if($T,inrange(linkGrid.color, 11, 14)){
					addflg = (gene.fort.indexOf(nswe[linkGrid.color]) >= 1);
				}
				break;
			case "space":
				addflg = ($T.inrange(linkGrid.color, 1, 5) && linkGrid.owner == 0);
				break;
			}
			if(addflg){
				additem = linkarr[i]+":"+gene.depth;
				if(gene.get.indexOf(additem) == -1){
					gene.get.push(additem);
					gene.node.push(gene.route.join(":"));
				}
			}
			gene.gno = linkarr[i];
			gene = GridTgtSearch(gene);
		}
		gene.route.pop();
	}
	gene.depth--;
	return gene;
}
//####################################
//Grid Infomation
function GridInfo(i_no){
	if(Board.step % 10 == 0 || Board.step == 31 || Board.step == 32 || Board.step == 92){
		if(i_no == 0){
			UI.Html.setDiv({id:'DIV_INFOGRID', hidden:true});
		}else{
			var infoarg = [];
			infoarg.push({type:"gridno", gno:i_no});
			if(Board.grid[i_no].color <= 9){
				infoarg.push({type:"width", px:190});
				infoarg.push({type:"gridhead", color:Board.grid[i_no].color, level:Board.grid[i_no].level});
				infoarg.push({type:"gridvalue", gold:Grid.value(i_no)});
				if(Board.grid[i_no].owner >= 1){
					var cno = Board.grid[i_no].cno;
					infoarg.push({type:"clname", color:Card[cno].color, name:Card[cno].name});
					infoarg.push({type:"clsthp", st:Board.grid[i_no].st, hp:Board.grid[i_no].lf, mhp:Board.grid[i_no].maxlf});
					if(Card[cno].item || Card[cno].walk){
						var item = Card[cno].item || "";
						var walk = Card[cno].walk || "";
						infoarg.push({type:"clitem", item:item, walk:walk});
					}
					if(Card[cno].comment != ""){
						infoarg.push({type:"comment", comment:Card[cno].comment});
					}
					if(Board.grid[i_no].status != ""){
						infoarg.push({type:"gridstatus", status:Board.grid[i_no].status});
					}
					infoarg.push({type:"gridowner", name:Player[Board.grid[i_no].owner].name});
				}
			}else{
				infoarg.push({type:"gridextra", color:Board.grid[i_no].color});
// 				if(Board.grid[i_no].color == 21){
// 					for(var i=0; i<=1; i++){
// 						var gno = [i_no, Board.grid[i_no].linkx][i];
// 						var divy = Number(Board.grid[gno].top);
// 						var divx = Number(Board.grid[gno].left);
// 						var effdiv = $("<div onmousedown='GridGuidePop(0);' onmouseout='GridGuidePop(0);'>"+["●","★"][i]+"</div>");
// 						effdiv.css({top:divy, left:divx});
// 						effdiv.addClass("CLS_GRIDGUIDE");
// 						$("#DIV_FRAME").append(effdiv);
// 					}
// 				}
			}
			//innerHTML
			$("#DIV_INFOGRID").html(Infoblock.block(infoarg));
			//
			UI.Html.setDiv({id:"DIV_INFOGRID", visible:true, zidx:50});
		}
	}else{
		if(i_no == 0 && (Board.step < 51 || Board.step > 59)){
			UI.Html.setDiv({id:'DIV_INFOGRID', hidden:true});
		}
	}
}
//
function GridInfoEscape(){
	if(Board.step < 51 || Board.step > 59){
		if($("#DIV_INFOGRID").css("left") == "590px"){
			$("#DIV_INFOGRID").css("left", "10px");
		}else{
			$("#DIV_INFOGRID").css("left", "590px");
		}
	}
}
//########################################
//Trans
Grid.trans = function(gno){
	if(arguments.length == 0){
		//所持金マイナス
		if(Player[Board.turn].gold < 0){
			Flow.step(92);
			//領地有無
			if(Grid.count({owner:Board.turn}) >= 1){
				//role
				if(Board.turn == Board.role){
					//Target
					var wkarr = Grid.grep({pno:Board.turn, tgt:"TMGALL"});
					//ライト
					Grid.light({arr:wkarr, save:true});
					//Log
					Logprint({msg:"土地売却", pno:Board.turn, ltype:"system"});
				}
			}else{
				if(Board.suddenon){
					Board.step = 100;
					PopBigMsg("枯渇終了", 8);
				}else{
					//【魔力枯渇】
					Flow.Tool.bankrupt();
					//ライト
					Grid.light({clear:true});
					//ターン終了
					setTimeout(function(){Flow.Step.endphase(9);}, 4000);
				}
			}
		}else{
			//【支払い終了】
			//ライト
			Grid.light({clear:true});
			//ターン終了
			setTimeout(function(){Flow.Step.endphase(9);}, 2000);
		}
	}else{
		//【領地売却】
		if(Flow.Tool.team(Board.grid[gno].owner) == Flow.Tool.team(Board.turn)){
			Flow.step(93);
			//Animation
			EffectBox({pattern:"soldout", gno:i_no});
			////コマンド送信
			if(Board.turn == Board.role){
				//送信
				Net.send("trans:"+gno);
			}
			//還元
			var wkvalue = Grid.value(gno);
			Player[Board.turn].gold += wkvalue;
			//領地クリア(レベル1)
			Grid.clear({gno:gno, all:true});
			//msgpop
			EffectBox({pattern:"msgpop",gno:Player[Board.turn].stand, msg:wkvalue+"G", color:"#ffcc00", player:true});
			//log
			Logprint({msg:"土地売却 <span class='g'>"+wkvalue+"G</span>", pno:Board.turn});
			//総魔力表示
			Game.Info.dispPlayerbox();
			//再実行
			Grid.trans();
		}
	}
}
//############################################
//土地(gno, time)
function GridAbility(arg){
	var retitem = [];
	var tgtgrid = Board.grid[arg.gno];
	//所持者あり
	if(tgtgrid.owner >= 1){
		var tgtcno = tgtgrid.cno;
		var ability = [];
		//BINDでない
		if(!tgtgrid.status.match(/_BIND_/)){
			//Option
			ability = Card[tgtcno].opt.concat();
			//Status
			ability.push(tgtgrid.status);
		}
		for(var i=0; i<ability.length; i++){
			//タイミング分岐
			switch(arg.time){
			case "GRID_VALUE":
				switch(true){
				case /^_SWAMP_/.test(ability[i]):
					retitem.push({act:"percent", val:0.7});
					break;
				}
				break;
			case "GSTATUS_CHANGE":
				switch(true){
				case /^@CLEAR@/.test(ability[i]):
					retitem.push({act:"clear"});
					break;
				}
				break;
			case "GRID_DAMAGE":
				switch(true){
				case /^@PHANTASM@/.test(ability[i]):
					retitem.push({act:"phantasm"});
					break;
				}
				break;
			case "DICE_PASS_THROUGH":
				//種別分岐
				switch(true){
				case /^@BALOON@/.test(ability[i]):
					var tgtpno = tgtgrid.owner;
					tgtgrid.maxlf += 10;
					tgtgrid.lf += 10;
					if(tgtgrid.maxlf >= 100){
						//Bonus
						//Player[tgtgrid.owner].gold += 100;
						//Log
						//Logprint({msg:Player[tgtgrid.owner].name+"は<span class='g'>100G</span>を得た", pno:tgtgrid.owner});
						Logprint({msg:"##"+tgtcno+"##は破壊した", pno:tgtgrid.owner});
						//Clear
						tgtgrid.flush();
						UI.CreateJS.GridIcon(arg.gno);
						Grid.Img.set(arg.gno);
						Grid.Img.tax({pno:tgtpno});
						//Animation
						EffectBox({pattern:"destroy", cno:tgtcno, gno:arg.gno});
					}else{
						//msgpop
						EffectBox({pattern:"msgpop",gno:arg.gno, msg:"Ability"});
						//ログ
						Logprint({msg:"##"+tgtcno+"##はMHP+10", pno:tgtgrid.owner});
					}
					break;
				case /^@STEAL@/.test(ability[i]):
					if(Flow.Tool.team(Board.turn) != Flow.Tool.team(tgtgrid.owner)){
						var gold = Math.floor(Player[Board.turn].gold / 10);
						if(Player[Board.turn].gold <= gold){
							gold = Player[Board.turn].gold;
						}
						//Bonus
						Player[tgtgrid.owner].gold += gold;
						Player[Board.turn].gold -= gold;
						//再表示
						Game.Info.dispPlayerbox();
						//Log
						Logprint({msg:Player[Board.turn].name+"から<span class='g'>"+gold+"G</span>奪った", pno:Board.turn});
						//msgpop
						EffectBox({pattern:"msgpop", gno:Player[Board.turn].stand, msg:gold+"G", color:"#ff0000", player:true});
					}
					break;
				case /^@SCOUT@/.test(ability[i]):
					if(Board.turn == tgtgrid.owner && Player[Board.turn].status == ""){
						//status
						Player[Board.turn].status = "_TELEGNOSIS_";
						Player[Board.turn].statime = 1;
						//icon set
						UI.Tool.playerIcon(Board.turn);
						//msgpop
						EffectBox({pattern:"msgpop", gno:Player[Board.turn].stand, msg:"Cursed", color:"#F0D4FF", player:true});
						//log
						Logprint({msg:Player[Board.turn].name+"は呪いを受けた", pno:Board.turn});
					}
					break;
				case /_DISEASE_/.test(ability[i]):
					var tgtpno = tgtgrid.owner;
					tgtgrid.maxlf = Math.max(0, tgtgrid.maxlf - 10);
					tgtgrid.lf = Math.min(tgtgrid.lf, tgtgrid.maxlf);
					tgtgrid.st = Math.max(0, tgtgrid.st - 10);
					if(tgtgrid.lf <= 0){
						//Log
						Logprint({msg:"##"+tgtcno+"##は破壊した", pno:tgtpno});
						//Clear
						tgtgrid.flush();
						UI.CreateJS.GridIcon(arg.gno);
						Grid.Img.set(arg.gno);
						Grid.Img.tax({pno:tgtpno});
						//Animation
						EffectBox({pattern:"destroy", cno:tgtcno, gno:arg.gno});
					}else{
						//msgpop
						EffectBox({pattern:"msgpop",gno:arg.gno, msg:"-ALL10"});
						//ログ
						Logprint({msg:"##"+tgtcno+"##はST&MHP-10", pno:tgtgrid.owner});
					}
					break;
				case /^_QUICKSAND_/.test(ability[i]):
					Dice.rest = 0;
					EffectBox({pno:Board.turn, pattern:"piecespin"});
					//msgpop
					EffectBox({pattern:"msgpop",gno:arg.gno, msg:"Stop"});
					//ログ
					Logprint({msg:"[足止]", pno:tgtgrid.owner});
					//解除
					Board.grid[arg.gno].status = "";
					Board.grid[arg.gno].statime = 0;
					Grid.Img.tax({gno:arg.gno});
					break;
				}
				break;
			case "DICE_REST_OVER":
				//種別分岐
				switch(true){
				case /^_LINKGATE_/.test(ability[i]):
					if(Flow.Tool.team(tgtgrid.owner) == Flow.Tool.team(Board.turn)){
						var wkarr = [];
						for(var igno=1; igno<Board.grid.length; igno++){
							if(Board.grid[igno].owner >= 1 && Board.grid[igno].status == "_LINKGATE_"){
								wkarr.push(igno);
							}
						}
						retitem.push({act:"teleport", val:wkarr});
					}
					break;
				}
				break;
			case "CASTLE_BONUS":
				//種別分岐
				switch(true){
				case /^@WALL@/.test(ability[i]):
					if(tgtgrid.owner == arg.pno){
						retitem.push({act:"bonus", val:40});
					}
					break;
				case /^@NIGHTMARE@/.test(ability[i]):
					if(tgtgrid.owner == arg.pno){
						if(Board.round % 2 == 1){
							Board.grid[arg.gno].st += 10;
							if(Board.grid[arg.gno].st >= 70) Board.grid[arg.gno].st = 70;
							Board.grid[arg.gno].lf += 10;
							Board.grid[arg.gno].maxlf += 10;
							if(Board.grid[arg.gno].lf >= 70) Board.grid[arg.gno].lf = 70;
							if(Board.grid[arg.gno].maxlf >= 70) Board.grid[arg.gno].maxlf = 70;
							//msgpop
							EffectBox({pattern:"msgpop", gno:arg.gno, msg:"+ALL10"});
							//ログ
							Logprint({msg:"##"+tgtcno+"##は成長した", pno:tgtgrid.owner});
						}else{
							if(arg.nightmare.indexOf(arg.gno) == -1){
								//copy
								var cno = Board.grid[arg.gno].cno;
								var summonarr = [];
								for(var ilink=0; ilink<=3; ilink++){
									var linkgno = Number(Board.grid[arg.gno].linkarr[ilink]);
									if(linkgno >= 1 && Board.grid[linkgno].color <= 5 && Board.grid[linkgno].owner == 0){
										summonarr.push(linkgno);
									}
								}
								if(summonarr.length >= 1){
									//damage
									//Board.grid[arg.gno].lf = Math.ceil(Board.grid[arg.gno].lf / 2);
									//copy
									for(var ilink=0; ilink<summonarr.length; ilink++){
										Summon.from = "copy";
										Summon.pno = Board.turn;
										Summon.gno = summonarr[ilink];
										Summon.cno = cno;
										Summon.st = Board.grid[arg.gno].st;
										Summon.lf = Board.grid[arg.gno].lf;
										Summon.maxlf = Board.grid[arg.gno].maxlf;
										//
										Summon.Step.setgrid();
									}
									retitem.push({act:"nightmare", arr:summonarr});
									//Log
									Logprint({msg:"##"+cno+"##は増殖した", pno:arg.pno});
								}else{
									Logprint({msg:"##"+cno+"##対象土地がなかった", pno:arg.pno});
								}
							}
						}
					}
					break;
				}
				break;
			case "SUMMON_CHECK":
				//種別分岐
				switch(true){
				case /_JAIL_/.test(ability[i]):
					retitem.push({act:"jail"});
					break;
				}
				break;
			case "TERRITORY_CLOSE":
				//種別分岐
				switch(true){
				case /_TELEPATHY_/.test(ability[i]):
					//解除
					Board.grid[arg.gno].status = "";
					Board.grid[arg.gno].statime = 0;
					Grid.Img.tax({gno:arg.gno});
					//log
					Logprint({msg:"##"+tgtcno+"##は呪いが解けた", pno:tgtgrid.owner});
					break;
				}
				break;
			case "TURNCLOSE":
				//種別分岐
				switch(true){
				case /_RECONSTRUCT_/.test(ability[i]):
					if(tgtgrid.gold <= 190){
						//設定
						tgtgrid.gold += 10;
						//地形表示
						Grid.Img.set(arg.gno);
						//Log
						Logprint({msg:"地価上昇 "+tgtgrid.gold+"G", pno:tgtgrid.owner});
						//animation
						EffectBox({pattern:"msgpop", gno:arg.gno, msg:tgtgrid.gold+"G"});
					}else{
						//Log
						Logprint({msg:"効果はなかった", pno:tgtgrid.owner});
					}
					break;
				}
				break;
			case "TAXPAYMENT":
				//種別分岐
				switch(true){
				case /^@GREED@/.test(ability[i]):
					retitem.push({act:"greed", val:2.0});
					//ログ
					Logprint({msg:"強欲", pno:tgtgrid.owner});
					break;
				case /_CONTRACT_/.test(ability[i]):
					var tax = 0;
					for(var igno = 1; igno<Board.grid.length; igno++){
						if(Board.grid[igno].owner == tgtgrid.owner){
							tax = Math.max(tax, Grid.tax(igno));
						}
					}
					retitem.push({act:"taxequal", val:tax});
					//ログ
					Logprint({msg:"契約", pno:tgtgrid.owner});
					break;
				case /_JAIL_/.test(ability[i]):
					retitem.push({act:"notax"});
					break;
				}
				break;
			}
		}
	}
	return retitem;
}
//AREA
function GridAreaAbility(arg){
	var retitem = [];
	var ability = [];
	var grid, cno;
	for(var gno=1; gno<Board.grid.length; gno++){
		if(Board.grid[gno].owner >= 1){
			cno = Board.grid[gno].cno;
			if(!Board.grid[gno].status.match(/_BIND_/)){
				ability = Card[cno].opt.concat();
			}
			ability.push(Board.grid[gno].status);
			for(var i=0; i<ability.length; i++){
				//タイミング分岐
				switch(arg.time){
				case "MAPDAMAGE":
					switch(true){
					case /^@MAPDMGREDUCE@/.test(ability[i]):
						if(!($T.search(retitem, "act", "reduce"))){
							retitem.push({act:"reduce", val:10});
							//ログ
							Logprint({msg:"(結界)軽減", pno:Board.grid[gno].owner});
						}
						break;
					}
					break;
				case "SUMMON_CHECK":
					switch(true){
					case /^@MAPUNIQUE@/.test(ability[i]):
						if(!($T.search(retitem, "act", "unique"))){
							retitem.push({act:"unique"});
						}
						break;
					}
					break;
				}
			}
		}
	}
	return retitem;
}
