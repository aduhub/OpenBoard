var Draw = {};
var Deck = {};
Draw.Step = {};
Card.Tool = {};
Deck.Tool = {};
//####################################
//カードドロー
Draw.Step.start = function (){
	//ターンプレイヤー
	if(Board.turn == Board.role){
		//ドロー・クリック待ち
		Flow.step(12);
		//dialog off
		DispDialog("none");
		//draw
		var cno = Player[Board.turn].DeckCard(1);
		var termfnc = function(){
			$("#DIV_DRAW").css("display", "block");
			//timer
			$("#DIV_DRAW").addClass(Chessclock.set());
		}
		Card.Tool.imgset({cvs:"CVS_DRAW", cno:cno, fnc:termfnc});
	}
}
//手札追加
Draw.Step.hand = function (){
	var encret, nlog = false;
	//ドロー
	Flow.step(13);
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
	var cno = Deck.Tool.draw({pno:Board.turn, from:"top", nlog:nlog});
	Player[Board.turn].draw = cno;
	if(Board.turn == Board.role){
		//手札ソート
		Deck.Tool.sorthand();
	}
	//msgpop
	EffectBox({pattern:"msgpop",gno:Player[Board.turn].stand, msg:"Draw", player:true});
	//##### Enchant #####
	encret = Enchant({time:"DRAWCARD_AFTER", cno:cno, pno:Board.turn});
	//手札枚数再表示
	DispPlayer();
	//ドロー終了
	Draw.Step.end();
}
//ドロー終了
Draw.Step.end = function (){
	//ドロー終了
	Flow.step(20);
	if(Board.role == Board.turn){
		//スペルチェック
		Spell.Tool.chkHand();
		//PHASEENDBUTTON
		$("#BTN_PhaseEnd").html("ダイス");
		//timer
		$("#BTN_PhaseEnd").addClass(Chessclock.set(20));
	}
}
//####################################
//デッキシャッフル
Deck.Tool.shuffle = function (arg){
	if(arg.pno == Board.role){
		var deckarr = Player[arg.pno].deckdata.split(":");
		var sortarr = $T.rndsort(deckarr);
		if(arg.puttop){
			$T.arrconflict(sortarr, arg.puttop);
			sortarr = arg.puttop.concat(sortarr);
		}
		var deckstr = sortarr.join(":");
		switch(arg.tgt){
		case "deck": //初回(ready)
			Player[arg.pno].deck = deckstr;
			break;
		case "next": //準備のみ
			Player[arg.pno].decknext.push(deckstr);
			//送信
			Net.send("shuffle:"+deckstr);
			break;
		}
	}
}
//手札並び替え
Deck.Tool.sorthand = function (){
	var handcnt = Player[Board.role].hand.length;

	//Clear
	$(".CLS_HAND").remove();
	// Hand Frame Check
	for(var i=1; i<=handcnt; i++){
		Maker.addHand();
	}

	//Hand Image
	if(handcnt >= 1){
		var marginpix = "2px";
		//Sort
		Player[Board.role].hand.sort();
		//Margin
		switch(handcnt){
		case 6:
			marginpix = "-2px";
			break;
		case 7:
			marginpix = "-8px";
			break;
		case 8:
			marginpix = "-13px";
			break;
		case 9:
			marginpix = "-17px";
			break;
		case 10:
			marginpix = "-20px";
			break;
		}
		$(".CLS_HAND").css({marginLeft:marginpix, marginRight:marginpix});
		//再表示
		for(var i=0; i<handcnt; i++){
			Card.Tool.imgset({hno:i});
		}
		//グレイ戻し
		$(".CLS_HAND").removeClass("CLS_HAND_GLAY");
	}
}
//Hand add {pno:, from:, [dno:], [nlog:]}
Deck.Tool.draw = function (arg){
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
	//手札追加(10枚まで)
	if(Player[arg.pno].hand.length < 10){
		Player[arg.pno].hand.push(cno);
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
	//Deck枚数チェック
	if(Player[arg.pno].DeckCount() == 0){
		//NextSet
		Player[arg.pno].deck = Player[arg.pno].decknext.shift();
		//ログ
		Logprint({msg:"デッキをシャッフル", pno:arg.pno});
		if(Board.role == arg.pno){
			//次を用意
			Deck.Tool.shuffle({pno:arg.pno, tgt:"next"});
		}
	}
	return cno;
}
//手札破棄 (pno, hno | pno, cno)
Deck.Tool.discard = function (arg){
	var tgtcno;
	//ダイアログ非表示
	DispDialog("none");
	//ターンプレイヤー
	if(Board.role == arg.pno){
		tgtcno = Player[Board.role].hand[arg.hno];
		//送信
		Net.send("discard:" + tgtcno);
	}else{
		tgtcno = arg.cno;
	}
	//手札破棄
	Player[arg.pno].HandDel(tgtcno);
	//Animation
	EffectBox({pattern:"discard", cno:tgtcno});
	//ログ
	Logprint({msg:"##" + tgtcno + "##を破棄", pno:arg.pno});
	//手札枚数再表示
	DispPlayer();
	if(Board.role == arg.pno){
		//手札ソート
		Deck.Tool.sorthand();
	}
	//Step 処理
	Flow.Step.endphase(1);
}
//リスト表示
Deck.Tool.decklist = function (){
	UI.Html.setDiv({id:"DIV_DECK", visible:true, zidx:40});
    //IDクリア
    Player[Board.role].deckid = "";
	//DECK LIST READ
	var pars = "DECKCMD=LIST&USERID="+sessionStorage.USERID;
	//Worker
	Net.xhr({cgi:"perl/ocdeck.cgi", para:pars, fnc:"Deck.onList"});
}
//DECKデータ表示
Deck.Tool.deckcard = function (deckstr){
	//Clear
	if(Player[Board.role].deckid != ""){
		$("#BTN_DECK" + Player[Board.role].deckid).css("backgroundColor", "");
	}
	//Set
	var palet = {"C1":"DDDDDD","C2":"FFCCCC","C3":"CCCCFF","C4":"CCFFCC","C5":"FFFFCC","I":"EEEEEE","S":"EEDDFF"};
	var deckdat = deckstr.split(":");
    //ID保持
    Player[Board.role].deckid = deckdat.shift();
    Player[Board.role].deckname = deckdat.shift();
    Player[Board.role].deckdata = deckdat.join(":");
	if(Player[Board.role].deckid != ""){
		$("#BTN_DECK" + Player[Board.role].deckid).css("backgroundColor", "#FF6600");
	}
	//Clear
	$("#SEL_DECKSET button").remove();
	if(deckdat.length > 0){
        deckdat.sort();
		for(var i=0; i<deckdat.length; i++){
			var clrno = Card[deckdat[i]].type;
			if(clrno == "C") clrno += Card[deckdat[i]].color;
			var button = "<button oncontextmenu='Card.Tool.info({cno:\""+deckdat[i]+"\"});return false;' style='background-color:#"+palet[clrno]+";'>" + Card[deckdat[i]].name + "</button>";
			$("#SEL_DECKSET").append(button);
		}
	}
}
//DECK決定
Deck.Tool.deckok = function (){
	if(Player[Board.role].deckid != ""){
		//表示DIV削除
		$("#DIV_DECK").remove();
		//送信
		var cmd = "deck:"+Player[Board.role].deckid+":"+ Player[Board.role].deckname;
		Net.send(cmd);
		//Deck数
		Board.deckcnt += 1;
		//プレイヤーデータセット
		if(Board.playcnt == Board.deckcnt){
			PlayerSetup();
		}
		//##### Debug #####
		if(sessionStorage.Mode == "debug"){
			for(var i=1; i<=4; i++){
			    //全員同データ
			    Player[i].deckid = Player[Board.role].deckid;
			    Player[i].deckname = Player[Board.role].deckname;
			    Player[i].deckdata = Player[Board.role].deckdata;
			}
			//デッキセレクトカウント
			Board.deckcnt = 4;
			//プレイヤーデータセット
			PlayerSetup();
		}
	}
}
//------------------------------------
//リスト取得値セット
Deck.onList = function (recvstr){
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
			button = "<button onclick='Deck.Tool.deckcard(\"" + recvcmd[i] + "\")' id='BTN_DECK" + wkdeck[0] + "' "+clsnm+">" + deckname + "</button>";
			$("#SEL_DECKLIST").append(button);
		}
	}
}
//DECK受信
Deck.onRecv = function (recvstr){
	var recvcmd = recvstr.split(",");
	if(Board.deckcnt <= 3){
		if(recvcmd[0] != "0"){
			//デッキセレクトカウント
			Board.deckcnt++
			//デッキ設定
			var deckinfo = recvcmd[2].split(":");
			Player[Number(recvcmd[1])].deckname = deckinfo.shift();
			Player[Number(recvcmd[1])].deckdata = deckinfo.join(":");
			if(Board.deckcnt == 4){
				//プレイヤーデータセット
				PlayerSetup()
			}
			//【Log】
			Logprint("DeckRecv:"+recvcmd[1], "debug");
		}else{
			//【Log】
			Logprint("DeckRecv:Error", "debug");
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
function onDeckImport(recvstr){
	DispDialog({dtype:"ok", msgs:["インポートしました。"]});
}
//####################################
//Option Check
Card.Tool.chkopt = function (arg){
	var opts = [];
	var tgt = [].concat(arg.tgt);
	//Card No
	if(arg.cno){
		if(Card[arg.cno].opt){
			opts = Card[arg.cno].opt.concat();
		}
	}
	//Grid No
	if(arg.gno){
		if(Board.grid[arg.gno].status != "_BIND_"){
			if(Card[Board.grid[arg.gno].cno].opt){
				opts = Card[Board.grid[arg.gno].cno].opt.concat();
				opts.push(Board.grid[arg.gno].status);
			}
		}
	}
	//Check
	for(var i in opts){
		for(var j in tgt){
			if(opts[i].match(tgt[j])){
				return true;
			}
		}
	}
	return false;
}
//Card表示
Card.Tool.imgset = function (arg){
	var cno, cvs;
	var card_src, frame_src, imgtype;
	if(arg.cno){
		cno = arg.cno;
		cvs = arg.cvs || arg.id;
	}else{
		cno = Player[Board.role].hand[arg.hno];
		cvs = "CVS_HAND" + arg.hno;
		arg.zoom = 0.5;
	}
	imgtype = (Card[cno].imgsrc.match(/.png$/)) ? "" : ".gif";
	card_src = "img/card/"+Card[cno].imgsrc+imgtype;
	frame_src = "CARDFRAME"+Card[cno].type;
	frame_src += (Card[cno].type == "C") ? Card[cno].color : "";
	var para = {id:cvs, src:[card_src, frame_src]}
	if(arg.zoom){
		para.zoom = arg.zoom;
	}
	if(arg.fnc){
		para.fnc = arg.fnc;
	}
	Canvas.draw(para);
}
//
Card.Tool.info = function (arg){
	if(Board.step >= 1){
		if(!arg){
			UI.Html.setDiv({id:'DIV_INFOCARD', hidden:true});
		}else{
			var cno = arg.cno || Player[Board.role].hand[arg.hno];
			if(cno != ""){
				//image set
				Card.Tool.imgset({cvs:"CVS_INFOCARD", cno:cno});
				//ifomation set
				Card.Tool.createinfo({tgt:"#DIV_INFOCARD_RIGHT", cno:cno});
				//display
				UI.Html.setDiv({id:"DIV_INFOCARD", visible:true, zidx:60});
			}
		}
	}
}
//
Card.Tool.createinfo = function (arg){
	if(arg.cno != ""){
		//detail
		var infoarg = [];
		infoarg.push({type:"width", px:190});
		switch(Card[arg.cno].type){
		case "C":
			infoarg.push({type:"clname", color:Card[arg.cno].color, name:Card[arg.cno].name});
			infoarg.push({type:"cost", cost:Card[arg.cno].cost, plus:Card[arg.cno].plus});
			infoarg.push({type:"clsthp", st:Card[arg.cno].st, hp:Card[arg.cno].lf});
			if(Card[arg.cno].item || Card[arg.cno].walk){
				var item = Card[arg.cno].item || "";
				var walk = Card[arg.cno].walk || "";
				infoarg.push({type:"clitem", item:item, walk:walk});
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
			infoarg.push({type:"comment", comment:Card[arg.cno].comment});
			break;
		}
		$(arg.tgt).html(Infoblock.block(infoarg));
	}
}
