//初期設定
function initCard(){
	var cd = CardDataSet();
	//配列設定
	for(i in cd){
		Card[cd[i].id] = new clsCard();
		Card[cd[i].id].type = cd[i].type;
		Card[cd[i].id].name = cd[i].name;
		Card[cd[i].id].cost = cd[i].cost;
		Card[cd[i].id].plus = (cd[i].plus) ? cd[i].plus : "";
		Card[cd[i].id].color = (cd[i].color) ? cd[i].color : 0;
		Card[cd[i].id].st = (cd[i].st) ? cd[i].st : 0;
		Card[cd[i].id].lf = (cd[i].lf) ? cd[i].lf : 0;
		Card[cd[i].id].item = (cd[i].item) ? cd[i].item : "";
		Card[cd[i].id].walk = (cd[i].walk) ? cd[i].walk : "";
		Card[cd[i].id].spell = (cd[i].spell) ? cd[i].spell : "";
		Card[cd[i].id].target = (cd[i].tgt) ? cd[i].tgt : "";
		Card[cd[i].id].opt1 = (cd[i].opt1) ? cd[i].opt1 : "";
		Card[cd[i].id].opt2 = (cd[i].opt2) ? cd[i].opt2 : "";
		Card[cd[i].id].opt3 = (cd[i].opt3) ? cd[i].opt3 : "";
		Card[cd[i].id].imgsrc = (cd[i].img) ? cd[i].img : "";
		Card[cd[i].id].atkani = (cd[i].ani) ? cd[i].ani : "";
		Card[cd[i].id].artist = (cd[i].art) ? cd[i].art : "";
		Card[cd[i].id].comment = (cd[i].com) ? cd[i].com : "";
	}
}
//
function CardOptCheck(arg){
	var ret = false;
	if(arg.cno){
		var opts = Card[arg.cno].opts();
		for(var i=0; i<opts.length; i++){
			if(opts[i].match(arg.tgt)){
				ret = true;
				break;
			}
		}
	}else if(arg.gno){
		if(Board.grid[arg.gno].status != "_BIND_"){
			var opts = Card[Board.grid[arg.gno].cno].opts();
			opts.push(Board.grid[arg.gno].status);
			for(var i=0; i<opts.length; i++){
				if(opts[i].match(arg.tgt)){
					ret = true;
					break;
				}
			}
		}
	}
	return ret;
}
//###################################################################
//カードドロー
function DrawStepInit(){
	//ターンプレイヤー
	if(Board.turn == Board.role){
		//ドロー・クリック待ち
		StepSet(12);
		//dialog off
		DispDialog("none");
		//draw
		var cno = Player[Board.turn].DeckCard(1);
		var termfnc = function(){
			$("#DIV_DRAW").css("display", "block");
			//timer
			$("#DIV_DRAW").addClass(Chessclock.set());
		}
		CardImgSet({cvs:"CVS_DRAW", cno:cno, fnc:termfnc});
	}
}
//手札追加
function Draw2Hand(){
	var encret, nlog = false;
	//ドロー
	StepSet(13);
	if(Board.turn == Board.role){
		//コマンド
		Net.send("draw");
		//非表示
		$("#DIV_DRAW").css("display", "none");
	}
	//##### Enchant #####
	encret = Enchant({time:"DRAWCARD_BEFORE"});
	if($T.search(encret, "act", "nolog")){
		nlog = true;
	}
	//Draw
	var cno = Drawcard({pno:Board.turn, from:"top", nlog:nlog});
	Player[Board.turn].draw = cno;
	if(Board.turn == Board.role){
		//手札ソート
		SortHand();
	}
	//msgpop
	EffectBox({pattern:"msgpop",gno:Player[Board.turn].stand, msg:"Draw", player:true});
	//##### Enchant #####
	encret = Enchant({time:"DRAWCARD_AFTER", cno:cno, pno:Board.turn});
	//手札枚数再表示
	DispPlayer();
	//ドロー終了
	DrawStepEnd();
}
//ドロー終了
function DrawStepEnd(){
	//手札上限チェック
	if(Player[Board.turn].HandCount() == 7){
		//ディスカードステップ
		StepSet(18);
		//ダイアログ
		DiscardInit();
	}else{
		//ドロー終了
		StepSet(20);
		if(Board.role == Board.turn){
			//スペルチェック
			SpellCheck();
			//ダイスマーク
			Canvas.draw({id:"CVS_HAND7", src:"img/cmd_diceroll.gif"});
			//timer
			$("#DIV_HAND7").addClass(Chessclock.set(20));
		}
	}
}
//###############################################################
//デッキシャッフル
function DeckShuffle(i_pno, i_flg){
	if(i_pno == Board.role){
		var wkdata = Player[i_pno].deckdata.split(":");
		var wknext = "";
		var wkcnt = wkdata.length;
		while(wkcnt >= 1){
			var wkrnd = Math.floor(Math.random() * wkcnt);
			wknext += (wknext == "") ? wkdata[wkrnd] : ":" + wkdata[wkrnd];
			wkdata.splice(wkrnd, 1);
			wkcnt--;
		}
		switch(i_flg){
		case 0: //初回(ready)
			Player[i_pno].deck = wknext;
			break;
		case 1: //準備のみ
			Player[i_pno].decknext.push(wknext);
			//送信
			Net.send("shuffle:"+wknext);
			break;
		}
	}
}
//手札並び替え
function SortHand(){
	var pno = Board.role;
	var handnum = Player[pno].HandCount();
	if(handnum >= 1){
		var sortwork = [];
		var handwork = Player[pno].hand.split(":");
		//ソートワーク
		for(var i=1; i<=handnum; i++){
			var cno = handwork.shift();
			var wkstr = Card[cno].type + ":" + Card[cno].color + ":" + cno;
			sortwork.push(wkstr);
		}
		//配列ソート
		sortwork.sort();
		//手札クリア
		Player[pno].hand = "";
		for(var i=1; i<=handnum; i++){
			var wkstr = sortwork.shift();
			var wkarr = wkstr.split(":");
			Player[pno].HandAdd(wkarr[2]);
		}
	}
	//手札再表示
	oldHandset = [];
	for(var i=1; i<=7; i++){
		HandImgSet(i);
	}
}
//###################################################################
//Hand add {pno:, from:, [dno:], [nlog:]}
function Drawcard(arg){
	var cno = "";
	switch(arg.from){
	case "dno": //deck top no
		cno = Player[arg.pno].DeckCard(arg.dno);
		Player[arg.pno].DeckDel(arg.dno);
		break;
	default:
		cno = Player[arg.pno].DeckShift();
		break;
	}
	//手札追加
	if(Player[arg.pno].HandCount() == 6 && Board.turn != arg.pno){
		if(!(arg.nlog)){
			Logprint({msg:"##" + cno + "##を破棄", pno:arg.pno});
		}
	}else if(Player[arg.pno].HandCount() <= 6){
		Player[arg.pno].HandAdd(cno);
		if(Board.role == arg.pno){
			if(!(arg.nlog)){
				Logprint({msg:"##" + cno + "##をドロー", pno:arg.pno});
			}
		}else{
			if(!(arg.nlog)){
				Logprint({msg:"ドロー", pno:arg.pno});
			}
		}
	}else{
		if(!(arg.nlog)){
			Logprint({msg:"##" + cno + "##を破棄", pno:arg.pno});
		}
	}
	//zero chk
	if(Player[arg.pno].DeckCount() == 0){
		//NextSet
		Player[arg.pno].deck = Player[arg.pno].decknext.shift();
		//ログ
		Logprint({msg:"デッキをシャッフル", pno:arg.pno});
		if(Board.role == arg.pno){
			//次を用意
			DeckShuffle(arg.pno, 1);
		}
	}
	return cno;
}
//###################################################################
function DiscardInit(){
	if(Board.role == Board.turn){
		//step
		Board.discardstep = 1;
		//ダイアログ表示
		DispDialog({msgs:["破棄するカード選択してください"]});
	}else{
		//step
		Board.discardstep = 9;
		//ダイアログ表示
		DispDialog({msgs:["破棄カード選択中・・・"]});
	}
}
function DiscardConfirm(arg){
	switch(arg.step){
	case 0: //表示
		Board.discardstep = 2;
		var cno = Player[Board.role].HandCard(arg.hno);
		var msgarr = [Card[cno].name+"を破棄しますか？"];
		var btnarr = ["DiscardConfirm({step:1, hno:"+arg.hno+"})", "DiscardConfirm({step:2})"];
		//ダイアログ表示
		DispDialog({msgs:msgarr, btns:btnarr, type:"yesno", timer:true});
		break;
	case 1: //YES
		Discard({pno:Board.role, hno:arg.hno});
		break;
	case 2: //NO
		//ダイアログ
		DiscardInit();
		break;
	}
}
//手札破棄 (pno, hno | pno, cno)
function Discard(arg){
	var tgtcno;
	//ダイアログ非表示
	DispDialog("none");
	//ターンプレイヤー
	if(Board.role == arg.pno){
		tgtcno = Player[Board.role].HandCard(arg.hno);
		//送信
		Net.send("discard:" + tgtcno);
	}else{
		tgtcno = arg.cno;
	}
	//手札破棄
	Player[arg.pno].HandDel(tgtcno);
	//msgpop
	//EffectBox({pattern:"msgpop", gno:Player[arg.pno].stand, msg:"Dicard", player:true});
	//Animation
	EffectBox({pattern:"discard", cno:tgtcno});
	//ログ
	Logprint({msg:"##" + tgtcno + "##を破棄", pno:arg.pno});
	//手札枚数再表示
	DispPlayer();
	if(Board.role == arg.pno){
		//手札ソート
		SortHand();
	}
	//Step 処理
	switch(Board.step){
	case 18:
		//ドロー終了
		DrawStepEnd();
		break;
	case 28:
		//Spell End
		SpellEnd();
		break;
	case 38:
		MoveEnd();
		break;
	case 58:
		//Territory End
		TerritoryEnd();
		break;
	}
}
//#######################################################################
//手札表示
function HandImgSet(i_num){
	if(Player[Board.role].HandCount() >= i_num){
		CardImgSet({cvs:"CVS_HAND"+i_num, cno:Player[Board.role].HandCard(i_num), zoom:0.5});
	}else{
		Canvas.clear({id:"CVS_HAND"+i_num});
	}
}
//
function CardImgSet(arg){
	var frameid = "CARDFRAME"+Card[arg.cno].type;
	frameid += (Card[arg.cno].type == "C") ? Card[arg.cno].color : "";
	var imgtype = (Card[arg.cno].imgsrc.match(/.png$/)) ? "" : ".gif";
	var imgsrc = "img/card/"+Card[arg.cno].imgsrc+imgtype;
	var para = {id:arg.cvs, src:[imgsrc, frameid]}
	if(arg.zoom){
		para.zoom = arg.zoom;
	}
	if(arg.fnc){
		para.fnc = arg.fnc;
	}
	Canvas.draw(para);
}
//##############################################################
var deckselectid = "";
//リスト表示
function DeckList(){
	DisplaySet("DIV_DECK", 40);
	//DECK LIST READ
	var pars = "DECKCMD=LIST&USERID="+sessionStorage.USERID;
	//Worker
	Net.xhr({cgi:"perl/ocdeck.cgi", para:pars, fnc:"onDeckList"});
}
//リスト取得値セット
function onDeckList(recvstr){
	var wkdeck, button, deckname, clsnm, wkarr;
	var recvcmd = recvstr.split(",");
	if (recvcmd[0] != "0"){
		for(var i=1; i<=Number(recvcmd[0]); i++){
			wkdeck = recvcmd[i].split(":");
			if(wkdeck[1].match(/\([0-9]+\)$/)){
				wkarr = wkdeck[1].match(/^(.*)\(([0-9]+)\)$/);
				deckname = wkarr[1];
				clsnm = "class='DeckColor" + wkarr[2] + "'";
			}else{
				deckname = wkdeck[1];
				clsnm = "";
			}
			button = "<button onclick='DeckSelect(\"" + recvcmd[i] + "\")' id='BTN_DECK" + wkdeck[0] + "' "+clsnm+">" + deckname + "</button>";
			$("#SEL_DECKLIST").append(button);
		}
	}
}
//DECKデータ表示
function DeckSelect(deckstr){
	if(deckstr != null){
		//Clear
		if(deckselectid != ""){
			$("#BTN_DECK" + deckselectid).css("backgroundColor", "");
		}
		//Set
		var palet = {"C1":"DDDDDD","C2":"FFCCCC","C3":"CCCCFF","C4":"CCFFCC","C5":"FFFFCC","I":"EEEEEE","S":"EEDDFF"};
		var deckdata = [];
		var deckdat = deckstr.split(":");
		deckselectid = deckdat.shift();
		var seldecknm = deckdat.shift();
		for(var i=0; i<deckdat.length; i++){
			deckdata.push(deckdat[i]);
		}
		if(deckselectid != ""){
			$("#BTN_DECK" + deckselectid).css("backgroundColor", "#FF6600");
		}
		deckdata.sort();
		//Clear
		$("#SEL_DECKSET button").remove();
		if(deckdata.length > 0){
			for(var i=0; i<deckdata.length; i++){
				var clrno = Card[deckdata[i]].type;
				if(clrno == "C") clrno += Card[deckdata[i]].color;
				var button = "<button oncontextmenu='CardInfo(\""+deckdata[i]+"\");return false;' style='background-color:#"+palet[clrno]+";'>" + Card[deckdata[i]].name + "</button>";
				$("#SEL_DECKSET").append(button);
			}
		}
	}
}
//選択DECK送信
function DeckSend(){
	if(deckselectid != ""){
		//削除
		$("#DIV_DECK").remove();
		//送信
		Net.send("deck:" + deckselectid);
	}
}
//DECK受信
function onDeckRecv(recvstr){
	var recvcmd = recvstr.split(",");
	if(Board.deckcnt < Board.playcnt){
		if(recvcmd[0] != "0"){
			//デッキ設定
			var deckinfo = recvcmd[2].split(":");
			var deckname = deckinfo.shift();
			var deckdata = deckinfo.join(":");
			if(deckname.match(/\([0-9]+\)$/)){
				deckname = deckname.match(/^(.*)\([0-9]+\)$/)[1];
			}
			Player[Number(recvcmd[1])].deckname = deckname;
			Player[Number(recvcmd[1])].deckdata = deckdata;
			//デッキセレクトカウント
			Board.deckcnt++;
			if (Board.deckcnt == Board.playcnt){
				//プレイヤーデータセット
				PlayerSetup();
			}
			
			//##### Debug #####
			if(sessionStorage.Mode == "debug"){
				for(var i=1; i<=4; i++){
					//全員同データ
					Player[i].deckname = deckname;
					Player[i].deckdata = deckdata;
				}
				//デッキセレクトカウント
				Board.deckcnt = 4;
				//プレイヤーデータセット
				PlayerSetup();
			}
			//【Log】
			console.log("DeckRecv:"+recvcmd[1]);
		}else{
			//【Log】
			console.log("DeckRecv:Error");
		}
	}
}
// ######[ インポート ]######
function DeckImport(deckno){
	if(deckno != ""){
		if(!deckno.match(/^DT[0-9]{4}$/)){
			return;
		}
		//DECK LIST READ
		var pars = "DECKCMD=IMPORT&USERID="+sessionStorage.USERID+"&DECKID="+deckno;
		//Worker
		Net.xhr({cgi:"perl/ocdeck.cgi", para:pars, fnc:"onDeckImport"});
	}
}
//
function onDeckImport(recvstr){
	DispDialog({type:"ok", msgs:["インポートしました。"]});
}
//#########################################################
//
function CardInfo(i_no){
	if(Board.step >= 1){
		if(i_no == 0){
			DisplaySet('DIV_INFOCARD', 0);
		}else{
			var cno = (String(i_no).match(/^[CIS][0-9]+$/)) ? i_no : Player[Board.role].HandCard(i_no);
			if(cno != ""){
				//image set
				CardImgSet({cvs:"CVS_INFOCARD", cno:cno});
				//ifomation set
				var cardhtml = CardInfoSet({tgt:"#DIV_INFOCARD_RIGHT", cno:cno});
				//display
				DisplaySet("DIV_INFOCARD", 60);
			}
		}
	}
}
//
function CardInfoSet(arg){
	if(arg.cno != ""){
		//detail
		var infoarg = [];
		infoarg.push({type:"width", px:190});
		switch(Card[arg.cno].type){
		case "C":
			infoarg.push({type:"clname", color:Card[arg.cno].color, name:Card[arg.cno].name});
			infoarg.push({type:"cost", cost:Card[arg.cno].cost, plus:Card[arg.cno].plus});
			infoarg.push({type:"clsthp", st:Card[arg.cno].st, hp:Card[arg.cno].lf});
			if(Card[arg.cno].item != "" || Card[arg.cno].walk != ""){
				infoarg.push({type:"clitem", item:Card[arg.cno].item, walk:Card[arg.cno].walk});
			}
			if(Card[arg.cno].comment != ""){
				infoarg.push({type:"comment", comment:Card[arg.cno].comment});
			}
			break;
		case "I":
			infoarg.push({type:"itname", item:Card[arg.cno].item, name:Card[arg.cno].name});
			infoarg.push({type:"cost", cost:Card[arg.cno].cost, plus:Card[arg.cno].plus});
			infoarg.push({type:"comment", comment:Card[arg.cno].comment});
			break;
		case "S":
			infoarg.push({type:"spname", name:Card[arg.cno].name});
			infoarg.push({type:"cost", cost:Card[arg.cno].cost, plus:Card[arg.cno].plus});
			//infoarg.push({type:"sptarget", target:Card[cno].target});
			infoarg.push({type:"comment", comment:Card[arg.cno].comment});
			break;
		}
		$(arg.tgt).html(Infoblock.block(infoarg));
	}
}
