//Option Check
function CardOptCheck(arg){
	var opts = [];
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
		if($T.typer(arg.tgt) == "Array"){
			for(var ii in arg.tgt){
				if(opts[i].match(arg.tgt[ii])){
					return true;
				}
			}
		}else{
			if(opts[i].match(arg.tgt)){
				return true;
			}
		}
	}
	return false;
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
	//ドロー終了
	StepSet(20);
	if(Board.role == Board.turn){
		//スペルチェック
		SpellCheck();
		//PHASEENDBUTTON
		$("#BTN_PhaseEnd").html("ダイス");
		//timer
		$("#BTN_PhaseEnd").addClass(Chessclock.set(20));
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
	var framecnt = $(".CLS_HAND").length;
	var handcnt = Player[Board.role].HandCount();

	// Hand Frame Check
	if(framecnt - handcnt < 0){
		for(var i=1; i<=handcnt - framecnt; i++){
			Maker.addHand();
		}
	}
	if(framecnt - handcnt > 0){
		for(var i=1; i<=framecnt - handcnt; i++){
			Maker.remHand();
		}
	}

	//Hand Image
	if(handcnt >= 1){
		var marginpix = "2px";
		//Sort
		var sortwork = Player[Board.role].hand.split(":");
		sortwork.sort();
		Player[Board.role].hand = sortwork.join(":");
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
		for(var i=1; i<=handcnt; i++){
			CardImgSet({hno:i});
		}
		//グレイ戻し
		$(".CLS_HAND").removeClass("CLS_HAND_GLAY");
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
	//手札追加(10枚まで)
	if(Player[arg.pno].HandCount() < 10){
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
	//Deck枚数チェック
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
	TurnEndFlow(1);
}
//#######################################################################
//Card表示
function CardImgSet(arg){
	var cno, cvs;
	var card_src, frame_src, imgtype;
	if(arg.hno){
		cno = Player[Board.role].HandCard(arg.hno);
		cvs = "CVS_HAND" + arg.hno;
		arg.zoom = 0.5;
	}else{
		cno = arg.cno;
		cvs = arg.cvs || arg.id;
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
//##############################################################
//リスト表示
function DeckList(){
	DisplaySet("DIV_DECK", 40);
    //IDクリア
    Player[Board.role].deckid = "";
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
		if(Player[Board.role].deckid != ""){
			$("#BTN_DECK" + deckselectid).css("backgroundColor", "");
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
				var button = "<button oncontextmenu='CardInfo(\""+deckdat[i]+"\");return false;' style='background-color:#"+palet[clrno]+";'>" + Card[deckdat[i]].name + "</button>";
				$("#SEL_DECKSET").append(button);
			}
		}
	}
}
//DECK決定
function DeckSend(){
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
	DispDialog({dtype:"ok", msgs:["インポートしました。"]});
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
