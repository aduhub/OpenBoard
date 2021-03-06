var Flow = {};
Flow.Step = {};
Flow.Tool = {};
Flow.set = function (){
	var arg = arguments;
	switch(arg[0]){
	case "BOARD_START":
		//時間取得
		var now = new Date();
		var hh = (now.getHours() < 10) ? "0"+now.getHours() : now.getHours();
		var mm = (now.getMinutes() < 10) ? "0"+now.getMinutes() : now.getMinutes();
		Analytics.hhmm[0] = hh+":"+mm;
		//初期化
		Board.round = 0;
		Board.turn = 0;
		//ダイアログ
		UI.Dialog.close();
		//メッセージダイアログ
		PopBigMsg("対戦開始", 0);
		//BGM
		Audie.play("map");
		break;
	case "ROUND_START":
		Board.round++;
		//Log
		Logprint({msg:Board.round+" ラウンド", ltype:"round"});
		break;
	case "TURN_START":
		var wait = 10;
		//ターン変更
		if(Board.turn % Board.playcnt == 0){
			//集計
			Graph.data[0] = Board.round;
			for(var i=1; i<=Board.playcnt; i++){
				Graph.data[i].push(Game.Tool.calcTotalGold(i));
			}
			//End check
			if(Board.round == Board.endround){
				Board.step = 100;
				PopBigMsg("期間終了", 8);
				return;
			}else{
				Flow.set("ROUND_START");
				Board.turn = 1;
				if(LastRoundPop()){
					wait = 2000;
				}
			}
		}else{
			Board.turn++;
		}
		if(Board.sudden){
			setTimeout(function(){Flow.set("TRUN_SUDDEN_CHECK")}, wait);
		}else{
			setTimeout(function(){Flow.set("TURN_SETUP")}, wait);
		}
		break;
	case "TRUN_SUDDEN_CHECK":
		var wait = 10;
		//サドンデスチェック
		if(Board.suddenon == false){
			for(var i=1; i<=Board.playcnt; i++){
				if(Game.Tool.calcTotalGold(i) >= Math.floor(Board.target / 2)){
					//Mssage Pop
					$("#DIV_MSG2").html("サドンデス");
					EffectBox({pattern:"roundmsgpop"});
					//Mssage Pop
					Logprint({msg:"サドンデス", ltype:"round"});
					Board.suddenon = true;
					wait = 2000;
					break;
				}
			}
		}
		setTimeout(function(){Flow.set("TURN_SETUP")}, wait);
		break;
	case "TURN_SETUP":
		if(Board.step != 100){
			//ターン開始処理
			Flow.step(11);
			//Log
			Logprint({msg:Board.turn+" プレイヤーターン", pno:Board.turn, ltype:"system"});
			//BGM
			Audie.bgmchk();
			//.Z-INDEX セット
			UI.Html.sortZindex("player");
			//スクロール
			UI.Tool.scrollBoard(Player[Board.turn].stand);
			//呪いチェック
			Flow.Tool.chkstatus();
			//FortLight
			Grid.fortlight();
			//ロールチェック
			if(Board.turn == Board.role){
				var msgs = [];
				var btns = [];
				msgs.push("あなたのターンです");
				btns.push(["ＯＫ", "Draw.Step.start()"]);
				UI.Dialog.show({msgs:msgs, btns:btns});
				//Sound Effect
				Audie.seplay("info");
			}
			//##### Debug #####
			if(sessionStorage.Mode == "debug"){
				if(Board.turn != Board.role){
					setTimeout(function(){Flow.Step.endphase(0);}, 500);
				}
			}
		}
		break;
	}
	//インフォメーション再表示
	if(Board.round >= 1){
		$("#DIV_INFO").html(Board.round);
		$("#DIV_INFO").css("color", pcolor[Board.turn]);
	}
	Game.Info.dispPlayerbox();
}
//
Flow.step = function (stepno){
	var msgstr = "";
	Board.step = stepno;
	//Info
	if(Board.step >= 11 && Board.step <= 19){
		msgstr = "カードドロー";
	}
	if(Board.step >= 20 && Board.step <= 29){
		msgstr = "スペル・ダイス";
	}
	if(Board.step >= 30 && Board.step <= 39){
		msgstr = "ダイス・移動";
	}
	if(Board.step >= 40 && Board.step <= 59){
		msgstr = "召喚・領地指示";
	}
	if(Board.step >= 71 && Board.step <= 79){
		msgstr = "戦闘";
	}
	if(Board.step >= 90 && Board.step <= 91){
		msgstr = "ターン終了";
	}
	if(Board.step >= 92 && Board.step <= 93){
		msgstr = "領地売却";
	}
	$("#DIV_INFOPLUS").html(msgstr);
	//timer
	Chessclock.stepchk();
}
//
Flow.endPhase = function (){
	if(Board.turn == Board.role){
		switch(Board.step){
			case 20: //Spell
                Dice.Step.start();
				break;
			case 21: //Spell(Cancel)
				if(Card[Spell.cno].tgt.match(/^T.G.*$/)){
					Spell.Step.confirm(9);
				}
				break;
			case 30: //Dice
                Dice.Step.start();
				break;
			case 40: //Summon
				Flow.Step.turnend();
				break;
			case 52: //Trritory(Move)
			case 53: //Trritory(Summon)
			case 54: //T Ability
				//cancel
				Territory.Step.dialog(9);
				break;
		}
	}
	if(Battle.p[0].pno == Board.role || Battle.p[1].pno == Board.role){
		switch(Board.step){
		case 72: //Battle(NoItem)
			Battle.Step.setitem({pno:Board.role, hno:99});
			break;
		}
	}
	//Sound Effect
	Audie.seplay("click");
}
//ターン終了
Flow.Step.turnend = function (){
	if(Board.turn == Board.role){
		if(Board.step >= 40 && Board.step < 90 && Board.step % 10 == 0){
			Flow.step(91);
			//send
			Net.send("turn");

			//表示
			Game.Info.dispPlayerbox();
			Deck.Tool.sorthand();
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("-");
			//GridLightクリア
			Grid.light();

			//Close
			Flow.Step.endphase(0);
		}
	}
}
//ターン終了処理
Flow.Step.endphase = function (step){
	switch(step){
	case 0: //Discard
		//ハンドチェック
		if(Player[Board.turn].hand.length >= 7){
			//ディスカードステップ
			Flow.step(98);
			//ダイアログ
			if(Board.role == Board.turn){
				//step
				Board.discardstep = 1;
				//ダイアログ表示
				UI.Dialog.show({msgs:["破棄するカード選択してください"]});
			}else{
				//step
				Board.discardstep = 9;
				//ダイアログ表示
				UI.Dialog.show({msgs:["破棄カード選択中・・・"]});
			}
		}else{
			Flow.Step.endphase(1);
		}
		break;
	case 1: //Tax
		Flow.step(91);
		//##### GridAbi #####
		var ret = GridAbility({gno:Player[Board.turn].stand, time:"TURNCLOSE"});
		//通行料支払い
		var wait = Flow.Tool.taxpay();
		//再実行
		setTimeout(function(){Flow.Step.endphase(2);}, wait);
		break;
	case 2: //Trans
		//マイナスチェック
		if(Player[Board.turn].gold < 0){
			if(Board.role == Board.turn){
				if(Grid.count({owner:Board.turn}) >= 1){
					var msgs = ["売却する土地を選択して下さい"];
					UI.Dialog.show({msgs:msgs, dtype:"ok"});
				}
			}
			//トランス
			Grid.trans();
		}else{
			Flow.Step.endphase(9);
		}
		break;
	case 9: //Close
		//アップキープ
		Flow.Tool.upkeep();
		//Log
		Logprint({msg:"ターンエンド", pno:Board.turn, ltype:"system"});
		//次ターン
		Flow.set("TURN_START", Board.turn);
		break;
	}
}
//全体終了
Flow.Step.endgame = function (i_flg){
	var now = new Date();
	var hh, mm;
	var wkstr = "";
	var goalpno = 0;
	var prate = [null, [], [], [], []];
	var prank = [0, 0, 0, 0, 0];

	//非表示
	$("#DIV_HANDFRAME").remove();
	$("#DIV_TIMEKEEP ").remove();

	//表示
	Game.Info.dispPlayerbox();

	//BGM Stop
	Audie.stop("map");
	Audie.play("goal");

	//順位計算
	wkstr = "<table border='0' cellspacing='0' cellpadding='2'>";
	//目標達成時
	if(i_flg == 9){
		goalpno = Board.turn;
		Graph.data[0] = Board.round;
		for(var i=1; i<=Board.playcnt; i++){
			Graph.data[i].push(Game.Tool.calcTotalGold(i));
		}
	}
	//rank order
	for(var irank=1; irank<=Board.playcnt; irank++){
		for(var ipno=1; ipno<=Board.playcnt; ipno++){
			if(Game.Tool.calcRank(ipno, goalpno) == irank){
				//html
				wkstr += RankLineEdit({no:irank, pno:ipno});
				//Analytics
				Analytics.rank.push({pno:ipno, rank:irank, g:Game.Tool.calcTotalGold(ipno)});
				//rate
				prank[ipno] = irank;
				prate[irank].push(Player[ipno].rate);
			}
		}
	}
	//Rate
	var chgpoint = RateCalc(prank, prate);
	//時間取得
	hh = (now.getHours() < 10) ? "0"+now.getHours() : now.getHours();
	mm = (now.getMinutes() < 10) ? "0"+now.getMinutes() : now.getMinutes();
	Analytics.hhmm[1] = hh+":"+mm;
	//footer
	wkstr += "<tr><td colspan='3'>終了ラウンド "+Board.round+" R</td></tr>";
	wkstr += "<tr><td colspan='3'>経過時間 "+Analytics.hhmm[0]+" ～ "+Analytics.hhmm[1]+"</td></tr>";
	wkstr += "</table>";
	//表示
	$("#DIV_RESULT_DETAIL").html(wkstr);
	Graph.target = Board.target;
	Graph.BaseInit();
	Graph.Draw();
	$("#DIV_RESULT").css("display", "block");
	$("#DIV_RESULTBTN").css("display", "block");

	//終了確認送信
	if(Board.role >= 1 && Board.role <= 4){
		//result send
		$T.search(Analytics.rank, "pno", Board.role);
		Net.send("gameend:"+$T.result.rank+":"+$T.result.g);

		//rate update
		if((Board.playcnt == 4 && !Board.alliance) || sessionStorage.Mode == "debug"){
			var newrate;
			if(prank[Board.role] == 1){
				newrate = Player[Board.role].rate + chgpoint[Board.role];
			}else{
				newrate = Player[Board.role].rate - chgpoint[Board.role];
			}
			if(Analytics.rankmode == "YOSEN"){
				sessionStorage.USERRATE2 = newrate;
				var pars = "LOGCMD=UPDATE&USERID=" + sessionStorage.USERID + "&RATE2=" + newrate;
			}else{
				sessionStorage.USERRATE = newrate;
				var pars = "LOGCMD=UPDATE&USERID=" + sessionStorage.USERID + "&RATE=" + newrate;
			}
			if(sessionStorage.Mode == "join"){
				$.ajax({url:'perl/oclogin.cgi', data:pars, timeout:5000});
			}
			//
			EffectBox({pattern:"ratepop", rate:newrate});
		}
	}
}
//######################################
//チーム番号
Flow.Tool.team = function (pno){
	var teamno = 0;
	if(Board.alliance){
		switch(Number(pno)){
			case 1:
				teamno = 1;
				break;
			case 2:
				teamno = 2;
				break;
			case 3:
				teamno = 1;
				break;
			case 4:
				teamno = 2;
				break;
		}
	}else{
		teamno = pno;
	}
	return teamno;
}
//アップキープ
Flow.Tool.upkeep = function (){
	if(Board.turn >= 1){
		//呪い経過(プレイヤー)
		if(Player[Board.turn].status != ""){
			//9以下は時間判定
			if(Player[Board.turn].statime <= 9){
				Player[Board.turn].statime--;
			}
		}
		for(var i=1; i<Board.grid.length; i++){
			if(Board.grid[i].status != ""){
				//9以下は時間判定
				if(Board.grid[i].statime <= (9 * Board.playcnt)){
					Board.grid[i].statime--;
				}
			}
		}
	}
}
//呪い継続
Flow.Tool.chkstatus = function (){
	var tgtcno, tgtpno;
	//初期化
	Player[Board.turn].dicepass = false;
	//呪い(プレイヤー)
	if(Player[Board.turn].status != ""){
		//Enchat
		Enchant({time:"TURN_START"});
		//終了判定
		if(Player[Board.turn].statime == 0){
			//Clear
			Player[Board.turn].status = "";
			Player[Board.turn].statime = 0;
			//Icon
			UI.Tool.playerIcon(Board.turn);
			//msgpop
			EffectBox({pattern:"msgpop", gno:Player[Board.turn].stand, msg:"Dispel", player:true});
			//log
			Logprint({msg:Player[Board.turn].name+"は呪いが解けた", pno:Board.turn});
		}
	}
	for(var i=1; i<Board.grid.length; i++){
		if(Board.grid[i].status != ""){
			//終了判定
			if(Board.grid[i].statime == 0){
				tgtcno = Board.grid[i].cno;
				tgtpno = Board.grid[i].owner;
				//Clear
				Board.grid[i].status = "";
				Board.grid[i].statime = 0;
				//Icon
				UI.CreateJS.GridTax({gno:i});
				//msgpop
				EffectBox({pattern:"msgpop", gno:i, msg:"Dispel"});
				//log
				Logprint({msg:"##"+tgtcno+"##は呪いが解けた", pno:tgtpno});
			}
		}
	}
}
//通行料支払い
Flow.Tool.taxpay = function (){
	var wkstand = Player[Board.turn].stand;
	var tgtgrid = Board.grid[wkstand];
	var reciptpno = tgtgrid.owner;
	if(Flow.Tool.team(tgtgrid.owner) >= 1 && Flow.Tool.team(tgtgrid.owner) != Flow.Tool.team(Board.turn)){
		//##### Enchat #####
		var encarr = [];
		for(var i=1; i<=Board.playcnt; i++){
			encarr = encarr.concat(Enchant({time:"TAXPAYMENT", tgtpno:i}));
		}
		for(var i=0; i<encarr.length; i++){
			switch(encarr[i].act){
			case "monopoly":
				reciptpno = encarr[i].val;
				break;
			}
		}
		//##### GridAbi #####
		var wkadd = GridAbility({gno:wkstand, time:"TAXPAYMENT"});
		var wktax = Grid.tax(wkstand);
		for(var i=0; i<wkadd.length; i++){
			switch(wkadd[i].act){
			case "taxequal":
				wktax = wkadd[i].val;
				break;
			case "notax":
				wktax = 0;
				break;
			}
		}
		for(var i=0; i<wkadd.length; i++){
			switch(wkadd[i].act){
			case "greed":
				wktax = Math.ceil(wktax * wkadd[i].val);
				break;
			}
		}
		//支払い
		Player[Board.turn].gold -= wktax;
		Player[reciptpno].gold += wktax;
		//Analytics
		Analytics.paycnt[Board.turn]++;
		Analytics.paygold[Board.turn] += wktax;
		Analytics.takecnt[reciptpno]++;
		Analytics.takegold[reciptpno] += wktax;
		//Log
		Logprint({msg:"通行料 <span class='g'>"+wktax+"G</span> > "+Player[reciptpno].name, pno:Board.turn});
		//Effect
		EffectBox({pattern:"taxjump", pno:Board.turn, tax:wktax});
		//Info再表示
		Game.Info.dispPlayerbox();
		//ret wait
		var retcnt = 0;
		if(wktax <= 480){
			retcnt = 500;
		}else if(wktax <= 960){
			retcnt = 800;
		}else{
			retcnt = 1500;
		}
		return retcnt;
	}else{
		return 0;
	}
}
//魔力枯渇
Flow.Tool.bankrupt = function (){
	//Mssage Pop
	PopBigMsg("魔力枯渇", 1);
	//ReStart
	var wkgold = Math.ceil((Board.bonus + ((Board.bonus / 10) * (Player[Board.turn].lap - 1))) * 1.5);
	Player[Board.turn].gold = wkgold;
	Player[Board.turn].stand = 1;
	Player[Board.turn].shadow = 1;
	Player[Board.turn].flag = "";
	Player[Board.turn].status = "";
	Player[Board.turn].statime = 0;
	//Icon
	UI.Tool.playerIcon(Board.turn);
	//Info
	Game.Info.dispPlayerbox();
	//Animation
	EffectBox({pattern:"piecemove", pno:Board.turn, gno:1});
	//Log
	Logprint({msg:"枯渇救済 "+wkgold+"G", pno:Board.turn});
}
//######################################
function PopBigMsg(i_msg, i_flg){
	$("#DIV_MSG").html("<B>"+i_msg+"</B>");
	//Effect
	EffectBox({pattern:"bigmsgdown"});
	//Log
	Logprint({msg:i_msg, ltype:"pop"});
	//Delay Next
	switch(i_flg){
	case 0:
		setTimeout(function(){Flow.set("TURN_START", 0);}, 4000);
		break;
	case 8:
		setTimeout(function(){Flow.Step.endgame(8);}, 3000);
		break;
	case 9:
		setTimeout(function(){Flow.Step.endgame(9);}, 3000);
		break;
	}
}
function LastRoundPop(){
	if(Board.turn == 1 && (Board.endround - 4) <= Board.round){
		var lastr = Board.endround - Board.round + 1;
		if(lastr == 1){
			$("#DIV_MSG2").html("ファイナルラウンド");
		}else{
			$("#DIV_MSG2").html("ラスト "+lastr+"ラウンド");
		}
		//Effect
		EffectBox({pattern:"roundmsgpop"});
		return true;
	}else{
		return false;
	}
}
//LOG
function Logprint(arg){
	var wkstr = "";
	var wkdiv = "DIV_LOG1";
	var style = "";
	var rgb = ["","#ff0000","#0000ff","#00cc00","#ffcc00"];
	var msg = LogChkCard(arg.msg);
	if(arg.pno){
		style = "style='border-left:solid 4px "+rgb[arg.pno]+";'";
	}
	if(arg.ltype){
		switch(arg.ltype){
		case "pop":
			wkstr = "<div class='pop'>" + msg + "</div>";
			break;
		case "round":
			wkstr = "<div class='round'>" + msg + "</div>";
			break;
		case "block":
			wkstr = "<div class='block' "+style+">";
			for(var i=0; i<msg.length; i++){
				wkstr += (i > 0) ? "<br>" : "";
				wkstr += msg[i];
			}
			wkstr += "</div>";
			break;
		case "system":
			wkstr = "<div "+style+"><span class='color0'>"+msg+"</span></div>";
			break;
		case "error":
			wkstr = "<div><span class='color9'>"+msg+"</span></div>";
			break;
		case "chat":
			wkstr = "<div>" + msg + "</div>";
			wkdiv = "DIV_LOG2";
			break;
		}
	}else{
		wkstr = "<div "+ style + ">" + msg + "</div>";
	}
	$("#"+wkdiv).append(wkstr);
	$("#"+wkdiv).scrollTop($("#"+wkdiv).prop("scrollHeight"));
}
function LogChkCard(msg){
	var ret, cno, fnc;
	if(String(msg).match(/##[CIS][0-9]{3}##/)){
		cno = String(msg).match(/##[CIS][0-9]{3}##/);
		cno = String(cno).replace(/##/g, "");
		fnc = "<span class='c' onmousedown='Card.Tool.info({cno:\""+cno+"\"});' onmouseout='Card.Tool.info();'>";
		fnc += Card[cno].name;
		fnc += "</span>";
		ret = String(msg).replace(/##[CIS][0-9]{3}##/, fnc);
	}else{
		ret = msg;
	}
	return ret;
}
function CustomLog(arg){
	var elestr = ["", "無属性", "火属性", "水属性", "地属性", "風属性"];
	var msgstr = "";
	switch(arg.ltype){
	case "colorcnt":
		if($T.typer(arg.color) == "Number"){
			if($T.inrange(arg.color, 2, 5) && Grid.count({owner:arg.pno, color:arg.color}) >= 2){
				msgstr = elestr[arg.color] + " " + Grid.count({owner:arg.pno, color:arg.color}) + "連鎖";
				Logprint({msg:msgstr, pno:arg.pno});
			}
		}else{
			if(arg.color[0] != arg.color[1]){
				for(var i=0; i<=1; i++){
					if($T.inrange(arg.color[i], 2, 5) && Grid.count({owner:arg.pno, color:arg.color[i]}) >= 2){
						msgstr = elestr[arg.color[i]] + " " + Grid.count({owner:arg.pno, color:arg.color[i]}) + "連鎖";
						Logprint({msg:msgstr, pno:arg.pno});
					}
				}
			}
		}
	}
}
//#################################################################
function RateCalc(rankarr, ratearr){
	var winpoint = 0;
	var winnum = 0;
	var chgarr = [0,0,0,0,0];
	for(var ipno=1; ipno<=4; ipno++){
		if(rankarr[ipno] == 1){
			winnum++;
		}else{
			var rmagic = [4, 8, 16][rankarr[ipno] - 2];
			var diff = Player[ipno].rate - $T.average(ratearr[1]);
			chgarr[ipno] = $T.shrink(Math.floor(rmagic + diff * 0.04), 1, 32);
			winpoint += chgarr[ipno];
		}
	}
	for(var ipno=1; ipno<=4; ipno++){
		if(rankarr[ipno] == 1){
			chgarr[ipno] = Math.floor(winpoint / winnum);
		}
	}
	return chgarr;
}
function RankLineEdit(arg){
	var numstr = ["","Winner","2nd","3rd","4th"];
	var rethtm = "<tr>";
	if(arg.no == 1){
		rethtm += "<td class='n1'>Winner</td>";
	}else{
		rethtm += "<td class='n0'>"+numstr[arg.no]+"</td>";
	}
	rethtm += "<td class='nm'>"+Player[arg.pno].name+"</td><td class='g'>"+Game.Tool.calcTotalGold(arg.pno)+" G</td></tr>";
	return rethtm;
}
function EndResultOpen(no){
	if(no == 1){
		$("#DIV_RESULT").css("display", "block");
	}else{
		$("#DIV_RESULT").css("display", "none");
	}
	if(no == 2){
		Game.Info.dispPlayerbox(9);
	}else{
		Game.Info.dispPlayerbox();
	}
}
