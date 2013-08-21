function FlowSet(){
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
		DispDialog("none");
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
				Graph.data[i].push(TotalGold(i));
			}
			//End check
			if(Board.round == Board.endround){
				Board.step = 100;
				PopBigMsg("期間終了", 8);
				return;
			}else{
				FlowSet("ROUND_START");
				Board.turn = 1;
				if(LastRoundPop()){
					wait = 2000;
				}
			}
		}else{
			Board.turn++;
		}
		if(Board.sudden){
			setTimeout(function(){FlowSet("TRUN_SUDDEN_CHECK")}, wait);
		}else{
			setTimeout(function(){FlowSet("TURN_SETUP")}, wait);
		}
		break;
	case "TRUN_SUDDEN_CHECK":
		var wait = 10;
		//サドンデスチェック
		if(Board.suddenon == false){
			for(var i=1; i<=Board.playcnt; i++){
				if(TotalGold(i) >= Math.floor(Board.target / 2)){
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
		setTimeout(function(){FlowSet("TURN_SETUP")}, wait);
		break;
	case "TURN_SETUP":
		if(Board.step != 100){
			//ターン開始処理
			StepSet(11);
			//Log
			Logprint({msg:Board.turn+" プレイヤーターン", pno:Board.turn, ltype:"system"});
			//BGM
			Audie.bgmchk();
			//.Z-INDEX セット
			SortZIndex("player");
			//スクロール
			BoardScroll(Player[Board.turn].stand);
			//呪いチェック
			TurnStatusCheck();
			//FortLight
			GridLightFort();
			//ロールチェック
			if(Board.turn == Board.role){
				var msgs = [];
				var btns = [];
				msgs.push("あなたのターンです");
				btns.push(["ＯＫ", "DrawStepInit()"]);
				DispDialog({msgs:msgs, btns:btns});
				//Sound Effect
				Audie.seplay("info");
			}
			//##### Debug #####
			if(sessionStorage.Mode == "debug"){
				if(Board.turn != Board.role){
					setTimeout(function(){TurnEndFlow(0);}, 500);
				}
			}
		}
		break;
	}
	//インフォメーション再表示
	DispInfo();
	DispPlayer();
}
//
function StepSet(stepno){
	Board.step = stepno;
	//Info
	DispInfoPlus(stepno);
	//timer
	Chessclock.stepchk();
}
//
function PhaseEnd(){
	if(Board.turn == Board.role){
		switch(Board.step){
			case 20: //Spell
				DiceRoll();
				break;
			case 21: //Spell(Cancel)
				if(Card[Spell.cno].tgt.match(/^T.G.*$/)){
					SpellConfirm(2);
				}
				break;
			case 30: //Dice
				DiceRoll();
				break;
			case 40: //Summon
				TurnEnd();
				break;
			case 52: //Trritory(Move)
			case 53: //Trritory(Summon)
			case 54: //T Ability
				TerritoryDialog(5);
				break;
		}
	}
	if(Battle.p[0].pno == Board.role || Battle.p[1].pno == Board.role){
		switch(Board.step){
		case 72: //Battle(NoItem)
			BattleItem({pno:Board.role, hno:99});
			break;
		}
	}
	//Sound Effect
	Audie.seplay("click");
}
//####################################################
//
function Team(pno){
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
//####################################################
//
function TurnStatusCheck(){
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
			SetPlayerIcon(Board.turn, "");
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
				GridSetTax(i);
				//msgpop
				EffectBox({pattern:"msgpop", gno:i, msg:"Dispel"});
				//log
				Logprint({msg:"##"+tgtcno+"##は呪いが解けた", pno:tgtpno});
			}
		}
	}
}
//
function TurnEnd(){
	if(Board.turn == Board.role){
		if(Board.step >= 40 && Board.step < 90 && Board.step % 10 == 0){
			StepSet(91);
			//send
			Net.send("turn");

			//表示
			DispInfo();
			DispPlayer();
			SortHand();
			//PHASEENDBUTTON
			$("#BTN_PhaseEnd").html("-");
			//GridLightクリア
			GridLight("clear");

			//Close
			TurnEndFlow(0);
		}
	}
}
//終了処理
function TurnEndFlow(step){
	switch(step){
	case 0: //Discard
		//ハンドチェック
		if(Player[Board.turn].hand.length >= 7){
			//ディスカードステップ
			StepSet(98);
			//ダイアログ
			DiscardInit();
		}else{
			TurnEndFlow(1);
		}
		break;
	case 1: //Tax
		StepSet(91);
		//##### GridAbi #####
		var ret = GridAbility({gno:Player[Board.turn].stand, time:"TURNCLOSE"});
		//通行料支払い
		var wait = TaxPayment();
		//再実行
		setTimeout(function(){TurnEndFlow(2);}, wait);
		break;
	case 2: //Trans
		//マイナスチェック
		if(Player[Board.turn].gold < 0){
			if(Board.role == Board.turn){
				if(GridCount(Board.turn) >= 1){
					var msgs = ["売却する土地を選択して下さい"];
					DispDialog({msgs:msgs, dtype:"ok"});
				}
			}
			//トランス
			GridTrans(0);
		}else{
			TurnEndFlow(9);
		}
		break;
	case 9: //Close
		//アップキープ
		TurnUpkeep();
		//Log
		Logprint({msg:"ターンエンド", pno:Board.turn, ltype:"system"});
		//次ターン
		FlowSet("TURN_START", Board.turn);
		break;
	}
}
//アップキープ
function TurnUpkeep(){
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
//##########################################################
//通行料支払い
function TaxPayment(){
	var wkstand = Player[Board.turn].stand;
	var tgtgrid = Board.grid[wkstand];
	var reciptpno = tgtgrid.owner;
	if(Team(tgtgrid.owner) >= 1 && Team(tgtgrid.owner) != Team(Board.turn)){
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
		var wktax = GridTax(wkstand);
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
		DispPlayer();
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
function Bankrupt(){
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
	SetPlayerIcon(Board.turn, "");
	//Info
	DispPlayer();
	//Animation
	EffectBox({pattern:"piecemove", pno:Board.turn, gno:1});
	//Log
	Logprint({msg:"枯渇救済 "+wkgold+"G", pno:Board.turn});
}
//####################################################
function PopBigMsg(i_msg, i_flg){
	$("#DIV_MSG").html("<B>"+i_msg+"</B>");
	//Effect
	EffectBox({pattern:"bigmsgdown"});
	//Log
	Logprint({msg:i_msg, ltype:"pop"});
	//Delay Next
	switch(i_flg){
	case 0:
		setTimeout(function(){FlowSet("TURN_START", 0);}, 4000);
		break;
	case 8:
		setTimeout(function(){EndGame(8);}, 3000);
		break;
	case 9:
		setTimeout(function(){EndGame(9);}, 3000);
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
		fnc = "<span class='c' onmousedown='CardInfo({cno:\""+cno+"\"});' onmouseout='CardInfo();'>";
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
			if($T.inrange(arg.color, 2, 5) && GridCount(arg.pno, arg.color) >= 2){
				msgstr = elestr[arg.color] + " " + GridCount(arg.pno, arg.color) + "連鎖";
				Logprint({msg:msgstr, pno:arg.pno});
			}
		}else{
			if(arg.color[0] != arg.color[1]){
				for(var i=0; i<=1; i++){
					if($T.inrange(arg.color[i], 2, 5) && GridCount(arg.pno, arg.color[i]) >= 2){
						msgstr = elestr[arg.color[i]] + " " + GridCount(arg.pno, arg.color[i]) + "連鎖";
						Logprint({msg:msgstr, pno:arg.pno});
					}
				}
			}
		}
	}
}
//#################################################################
// 全体終了
function EndGame(i_flg){
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
	DispPlayer();

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
			Graph.data[i].push(TotalGold(i));
		}
	}
	//rank order
	for(var irank=1; irank<=Board.playcnt; irank++){
		for(var ipno=1; ipno<=Board.playcnt; ipno++){
			if(PlayerRank(ipno, goalpno) == irank){
				//html
				wkstr += RankLineEdit({no:irank, pno:ipno});
				//Analytics
				Analytics.rank.push({pno:ipno, rank:irank, g:TotalGold(ipno)});
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
	rethtm += "<td class='nm'>"+Player[arg.pno].name+"</td><td class='g'>"+TotalGold(arg.pno)+" G</td></tr>";
	return rethtm;
}
function EndResultOpen(no){
	if(no == 1){
		$("#DIV_RESULT").css("display", "block");
	}else{
		$("#DIV_RESULT").css("display", "none");
	}
	if(no == 2){
		DispPlayer(9);
	}else{
		DispPlayer();
	}
}
