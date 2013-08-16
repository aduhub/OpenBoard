//===================================
// filename : board.js
// update   : 2007-01-12 adu
//===================================
//ボード生成
function initBoard(){
	//中断確認
	window.onbeforeunload = function(event){
		event = event || window.event; 
		return event.returnValue = '移動します。';
	}
	//wait Info
	var divwait = $("<div id='waitdiv'>wait...</div>");
	divwait.css({position:"absolute", top:0, left:0, width:800, height:600, opacity:0.8, zIndex:40, backgroundColor:"black", color:"white", fontSize:"20px"});
	$("body").append(divwait);

	//Canvas取り込み
	LoadImage();

	//Volume設定
	if(localStorage.ob_volume_bgm){
		$("#bgmvolume").val(Number(localStorage.ob_volume_bgm));
		Audie.volchg("bgm");
	}
	if(localStorage.ob_volume_se){
		$("#sevolume").val(Number(localStorage.ob_volume_se));
		Audie.volchg("se");
	}
	//観戦
	if($T.inarray(sessionStorage.Mode, ["gallery", "replay"])){
		//削除
		$("#DIV_DECK").remove();
		$("#DIV_HANDFRAME").remove();
	}
	//リプレイコントロール
	if(sessionStorage.Mode == "replay"){
		$("#DIV_REPLAYCONTROL").css("display", "block");
	}else{
		$("#DIV_REPLAYCONTROL").remove();
	}

	//通信開始
	Net.init();
    Net.getCGI("");
    //main
    Frame.init();
}
function createBoard(){
	//wait Info
	$("#waitdiv").remove();
	//マップデータ
	var Mapdata = MapDataSet(Board.mapno);
	var Mapinfo = Mapdata[0].split(":");
	Board.dice = Number(Mapinfo[1]);
	Board.flag = Mapinfo[2];
	Board.bonus = Number(Mapinfo[3]);
	Board.bonus_f = Number(Mapinfo[4]);
	for(i in Mapdata){
		if(Mapdata[i].match(/^[0-9]+:/)){
			var Mapgrid = Mapdata[i].split(":");
			var gno = Number(Mapgrid[0]);
			Board.grid[gno] = new clsGrid();
			Board.grid[gno].color = Number(Mapgrid[1]);
			Board.grid[gno].top   = Number(Mapgrid[2]);
			Board.grid[gno].left  = Number(Mapgrid[3]);
			Board.grid[gno].link1 = Number(Mapgrid[4]);
			Board.grid[gno].link2 = Number(Mapgrid[5]);
			Board.grid[gno].link3 = Number(Mapgrid[6]);
			Board.grid[gno].link4 = Number(Mapgrid[7]);
			Board.grid[gno].linkarr = [Number(Mapgrid[4]), Number(Mapgrid[5]), Number(Mapgrid[6]), Number(Mapgrid[7])];
			Board.grid[gno].arrow = Mapgrid[8];
			Board.grid[gno].gold  = Number(Mapgrid[9]);
			Board.grid[gno].owner = 0;
			Board.grid[gno].level = 1;
			if(Mapgrid[1] == "21" || Mapgrid[1] == "24"){
				Board.grid[gno].linkx = Mapgrid[10];
			}
		}
	}
	//Log
	var msgarr = [];
	msgarr.push("「"+Mapinfo[0]+"」");
	msgarr.push("目標Ｇ："+Board.target);
	msgarr.push("終了Ｒ："+Board.endround);
	msgarr.push("ダイス："+Board.dice);
	Logprint({msg:msgarr, ltype:"block"});
	//MAP背景
	$("#DIV_BACK").css("backgroundImage", "url(img/mapdefault.gif)");

	//easeljs
	//var stage = new createjs.Stage("CVS_BACK");
	//var imgname = {GRID0:"img/grid0.gif",GRID1:"img/grid1.gif",GRID2:"img/grid2.gif",GRID3:"img/grid3.gif",GRID4:"img/grid4.gif",GRID5:"img/grid5.gif",GRIDT:"img/gicon_tele.gif",GRIDF:"img/gicon_drop.gif"}

	//グリッド生成
	for(var i in Board.grid){
		if(Board.grid[i].color != 0){
			var wkimgid, wkicon, wkcomposite;
			if(Board.grid[i].color >= 10 && Board.grid[i].color <= 14){
				var icosrc = {"10":"gicon_cas","11":'gicon_n',"12":'gicon_s',"13":'gicon_w',"14":'gicon_e'};
				wkicon = icosrc[Board.grid[i].color];
				wkimgid = "GRID0";
				wkcomposite = "source-over"; //上に描く
			}else if(Board.grid[i].color == 21){
				wkicon = "";
				wkimgid = "GRIDT";
				wkcomposite = "source-over"; //上に描く
			}else if(Board.grid[i].color == 22){
				wkicon = "gicon_brd";
				wkimgid = "GRID0";
				wkcomposite = "source-over"; //上に描く
			}else if(Board.grid[i].color == 23){
				wkicon = "gicon_alt";
				wkimgid = "GRID0";
				wkcomposite = "source-over"; //上に描く
			}else if(Board.grid[i].color == 24){
				wkicon = "";
				wkimgid = "GRIDF";
				wkcomposite = "source-over"; //上に描く
			}else{
				wkicon = "";
				wkimgid = "GRID"+Board.grid[i].color;
				wkcomposite = "destination-over"; //下に描く
			}
			//CANVAS
			var pos = {x:Number(Board.grid[i].left), y:Number(Board.grid[i].top)};
			Canvas.draw({id:"CVS_BACK", src:wkimgid, x:pos.x, y:pos.y, composite:wkcomposite});

			//easeljs
			//var bitmap = new createjs.Bitmap(imgname[wkimgid]);
			//bitmap.x = pos.x;
			//bitmap.y = pos.y;
			//stage.addChild(bitmap);

			//GRID
			CreateLay({id:"DIV_GICON"+i, w:128, h:90, l:pos.x, t:pos.y - 26, z:10, opt:"img", imgsrc:wkicon});
			CreateLay({id:"DIV_GCLICK"+i, w:64, h:64, l:pos.x + 32, t:pos.y, z:150, opt:"click", gno:i});
		}
	}
	//easeljs
	//stage.update();

	//ソート
	SortZIndex("map");

	//スクロール
	BoardScroll(1);
	//役(観戦)
	Board.role = 9;
	//ドラッグ処理
	DragInit();
}
//プレイヤー初期化
function PlayerSetup(){
	//ダイアログ
	DispDialog({msgs:["プレイヤー情報設定中・・・"]});
	//初期化
	for(var i=1; i<=Board.playcnt; i++){
		var imgsrc = [];
		Player[i].lap = 1;
		Player[i].stand = 1;
		Player[i].shadow = 1;
		Player[i].gold = Board.bonus;
		//ICON
		CreateLay({id:"DIV_PLAYER"+i, w:128, h:128, l:Number(Board.grid[1].left), t:Number(Board.grid[1].top) - 64, z:11});
		//$("#DIV_PLAYER"+i).html("<div id='DIV_PNO"+i+"'>"+i+"P</div>");
		PlayerImgSetup(i);
	}
	//##### Alliance #####
	if(Board.alliance){
		$("#DIV_POINT3").css("border-color", "#FF0000");
		$("#DIV_POINT4").css("border-color", "#0000CC");
		$("#DIV_PLAYER3").css("color", "#FF0000");
		$("#DIV_PLAYER4").css("color", "#0000CC");
	}
	//魔力ウィンドウ
	DispPlayer();
	for(var i=1; i<=Board.playcnt; i++){
		(function(i){
			var fnc = function(){ $("#DIV_POINT" + i).addClass("animePointdrop").css("display", "block"); }
			$T.stacktimer({fnc:fnc, msec:1000});
		})(i);
	}
	var fnc = function(){
		for(var i=1; i<=Board.playcnt; i++){
			$("#DIV_POINT" + i).removeClass("animePointdrop");
		}
		//デッキ準備(参加者)
		if($T.inarray(sessionStorage.Mode, ["join", "debug"])){
			PlayerHandSetup(0);
		}
	}
	$T.stacktimer({fnc:fnc, msec:0});
}
function PlayerImgSetup(pno){
	var imgsrc = [];
	//ICON
	for (var i2=0; i2<=2; i2++){
		imgsrc.push("url("+GifURI(Player[pno].avatar, pno, i2)+")");
	}
	$("#DIV_PLAYER"+pno).css("backgroundImage", imgsrc.join(","));
	$("#DIV_PLAYER"+pno).css("backgroundPosition", "0px 0px, 128px 0px, 128px 0px");
}
function PlayerHandSetup(i_flg){
	//ハンドセット
	StepSet(1);
	if(i_flg == 0){
		//マリガンクリア
		Temp.mariganHno = [];
		Temp.mariganCno = [];
	}
	if(i_flg == 0 || i_flg == 1){
		//デッキシャッフル(残し)
		DeckShuffle({pno:Board.role, tgt:"deck", puttop:Temp.marigan});
		//初期手札(5draw)
		Player[Board.role].hand = "";
		for(var i=1; i<=5; i++){
			Drawcard({pno:Board.role, from:"deck", nlog:true});
		}
		//手札ソート
		SortHand();
	}
	if(i_flg == 0){
		//ダイアログ
		var msgarr = ["手札を引き直しますか？"];
		var btnarr;
		btnarr = ["PlayerHandSetup(1)", "PlayerHandSetup(2)"];
		DispDialog({dtype:"yesno", msgs:msgarr, btns:btnarr});
	}
	if(i_flg == 1 || i_flg == 2){
		//ダイアログ
		DispDialog({msgs:["準備完了", "他のプレイヤーを待っています・・・"]});
		//送信
		var deck = Player[Board.role].hand + ":" + Player[Board.role].deck;
		Net.send("ready:" + deck);
		//次を用意
		DeckShuffle({pno:Board.role, tgt:"next"});
	}
}
//マリガン
function HandMarigan(hno){
	var idx = Temp.mariganHno.indexOf(hno.toString());
	if(idx >= 0){
		$T.arrconflict(Temp.mariganHno, [hno.toString()]);
	}else{
		Temp.mariganHno.push(hno.toString());
		Temp.mariganCno.push(Player[Board.role].)
	}
}
//======================================================================
//z-Index操作
function SortZIndex(flg){
	var yarr = [];
	var yzarr = [];
	for(var i=1; i<Board.grid.length; i++){
		if(yarr.indexOf(Board.grid[i].top) == -1){
			yarr.push(Board.grid[i].top);
		}
	}
	yarr.sort();
	for(var i=0; i<yarr.length; i++){
		yzarr[yarr[i]] = 22 + (i * 3);
	}
	if(flg == "map"){
		for(var i=1; i<Board.grid.length; i++){
			if(Board.grid[i].color < 10){
				$("#DIV_GICON"+i).css({zIndex:yzarr[Board.grid[i].top]});
			}
		}
	}else{
		for(var i=1; i<=Board.playcnt; i++){
			var zidx = yzarr[Board.grid[Player[i].stand].top];
			if(Board.turn == i){
				zidx -= 1;
			}else{
				zidx -= 2;
			}
			$("#DIV_PLAYER"+i).css({zIndex:zidx});
		}
		SetPlayerImg(0);
	}
}
//順位関数(pno, [pno(top)])
function PlayerRank(pno, toppno){
	var arg = arguments;
	var rank = 1;
	var gold = TotalGold(arg[0]);
	//pno = top
	if(pno == toppno){
		return 1;
	}
	if(Board.alliance){
		//### Alliance ###
		var teamarr = [];
		for(var i=1; i<=Board.playcnt; i++){
			if(Team(pno) != Team(i) && teamarr.indexOf(Team(i)) == -1){
				if(Team(toppno) == Team(i) || gold < TotalGold(i)){
					rank++;
				}
				teamarr.push(Team(i));
			}
		}
	}else{
		for(var i=1; i<=Board.playcnt; i++){
			if(toppno == i || gold < TotalGold(i)){
				rank++;
			}
		}
	}
	return rank;
}
//総計
function TotalGold(pno){
	var wktotal = 0;
	if(Board.alliance){
		for(var i=1; i<=Board.playcnt; i++){
			if(Team(pno) == Team(i)){
				wktotal += Player[i].gold;
			}
		}
	}else{
		wktotal = Player[pno].gold;
	}
	for(var i=1; i<Board.grid.length; i++){
		if([1, 2, 3, 4, 5].indexOf(Number(Board.grid[i].color)) >= 0){
			if(Team(Board.grid[i].owner) == Team(pno)){
				wktotal += GridValue(i);
			}
		}
	}
	return wktotal;
}
//################[ クリック判定 ]#################
//情報クリック判定
function InfoMouseover(i_no){
	if(Board.round >= 1){
		if(i_no == 0){
			DispInfoMap(false);
		}else{
			//non battle
			if(Board.step <= 70 || (Board.step >= 80 && Board.step < 100)){
				//情報表示
				DispInfoMap(true);
			}
		}
	}
}
function PlayerClick(i_no){
	if(Board.round >= 1){
		if(i_no >= 0){
			//non battle
			if(Board.step <= 70 || (Board.step >= 80 && Board.step < 100)){
				//スクロール
				BoardScroll(Player[i_no].stand);
				//情報表示
				DispPlayer(i_no);
			}
		}
	}
}
//グリッドクリック判定
function GridClick(i_no){
	if(Board.turn == Board.role){
		switch(Board.step){
		case 21:
			SpellTgtGirdCheck(i_no);
			break;
		case 25:
			if(Spell.check.indexOf(i_no) >= 0){
				//使用確認
				SpellTgtSecond({step:1, gno:i_no});
			}
			break;
		case 32:
			//移動先決定
			DicePieceMove(i_no);
			break;
		case 36:
			if(Dice.teleport.indexOf(i_no) >= 0){
				DiceStepTeleport({step:1, gno:i_no});
			}
			break;
		case 40:
			//スクロール
			BoardScroll(i_no);
			//領地選択
			TerritoryInit(i_no);
			break;
		case 52:
			//移動先決定
			TerritoryMove(i_no, 0);
			break;
		case 54:
			//領地選択
			TerritoryAbility(i_no);
			break;
		case 92:
			GridTrans(i_no);
			break;
		default:
			if(sessionStorage.iPhone == "Y"){
				return false;
			}
			//スクロール
			BoardScroll(i_no);
			break;
		}
	}else{
		if(sessionStorage.iPhone == "Y"){
			return false;
		}
		//スクロール
		BoardScroll(i_no);
	}
	//Sound Effect
	Audie.seplay("click");

	//###### Debug ######
	if(sessionStorage.Mode == "debug"){
		if(Board.step == 20){
			DebugGridInfo(i_no);
		}
	}
}
//ハンドクリック判定
function HandClick(i_no){
	if(Board.turn == Board.role){
		switch(Board.step){
		case 1:
			HandMarigan(i_no);
			break;
		case 20:
			if(i_no <= Player[Board.role].HandCount()){
				//コストチェック
				if(SpellCost(i_no)){
					SpellTarget(i_no);
				}
			}
			break;
		case 40: //Summon
			if(i_no <= Player[Board.role].HandCount()){
				//コストチェック
				if(SummonCost(Player[Board.role].stand, Player[Board.role].HandCard(i_no)) == "OK"){
					SummonConfirm({type:"summon", step:0, hno:i_no});
				}
			}
			break;
		case 53: //Trritory(Summon)
			if(i_no <= Player[Board.role].HandCount()){
				//コストチェック
				if(SummonCost(Territory.gno, Player[Board.role].HandCard(i_no)) == "OK"){
					SummonConfirm({type:"change", step:0, hno:i_no});
				}
			}
			break;
		case 98: //Dicard(TurnEnd)
			if(Board.discardstep == 1){
				//DiscardConfirm({step:0, hno:i_no});
				Discard({pno:Board.role, hno:i_no});
			}
			break;
		}
	}
	if(Battle.p[0].pno == Board.role || Battle.p[1].pno == Board.role){
		switch(Board.step){
		case 72:
			if(i_no <= Player[Board.role].HandCount()){
				var cno = Player[Board.role].HandCard(i_no);
				//コストチェック
				if(Battle.check.indexOf(cno) >= 0){
					BattleItem(Board.role, i_no);
				}
			}
			break;
		}
	}
	//Sound Effect
	Audie.seplay("click");
}
//=====================================================================
//ウィンドウスクロール
function BoardScroll(i_no){
	//ドラッグストップ
	dragObject = null;
	var def_t, def_x;
	def_t = 300; //600
	def_x = 340; //800
	if(!$("#DIV_FRAME").hasClass("CLS_AREAMAP")){
		//スクロール
		var wk_y = Board.grid[i_no].top - def_t;
		var wk_x = Board.grid[i_no].left - def_x;
		$("#DIV_FRAME").animate({scrollTop:wk_y, scrollLeft:wk_x}, 400, 'swing');

	}
}
//ドラッグスクロール
function DragInit(){
	if(sessionStorage.iPhone != "Y"){
		$("BODY").mouseup(DragMouseUp);
		$("BODY").mousemove(DragMouseMove);
		$("#DIV_BACK").mousedown(DragmouseDown);
		$("#DIV_BACK").bind("mousewheel", MouseWheel);
	}else{
		$("BODY").bind("touchmove", function(){event.preventDefault();});
		$("#DIV_BACK").bind("touchstart", DragTouchStart);
		$("#DIV_BACK").bind("touchmove", DragTouchMove);
		$("#DIV_BACK").bind("touchend", DragTouchEnd);
	}
}
function DragmouseDown(e){
	//縮小クリア
	if($("#DIV_FRAME").hasClass("CLS_AREAMAP")){
		$("#DIV_FRAME").removeClass("CLS_AREAMAP");
		$("#DIV_FRAME").css({width:"", height:""});
		$("#DIV_FRAME").scrollTop(300);
		$("#DIV_FRAME").scrollLeft(400);
	}
	dragObject = this;
	dragOffset = {x:e.clientX, y:e.clientY};
	return false;
}
function DragMouseUp(e){
	dragObject = null;
}
function DragMouseMove(e){
	if(!dragObject) return;
	var mousePos = {x:e.clientX, y:e.clientY};
	if(mousePos.x < 0 || mousePos.x > 800 || mousePos.y < 0 || mousePos.y > 600){
		dragObject = null;
		return;
	}
	var y = $("#DIV_FRAME").scrollTop() - (mousePos.y - dragOffset.y);
	var x = $("#DIV_FRAME").scrollLeft() - (mousePos.x - dragOffset.x);
	$("#DIV_FRAME").scrollTop(y);
	$("#DIV_FRAME").scrollLeft(x);
	dragOffset = mousePos;
}
function DragTouchStart(){
	event.preventDefault();
	if(event.touches.length == 1){
		dragOffset = {x:event.touches[0].clientX, y:event.touches[0].clientY};
	}
	return false;
}
function DragTouchMove(){
	event.preventDefault();
	if(event.touches.length == 1){
		var touchpos = {x:event.touches[0].clientX, y:event.touches[0].clientY};
		if(touchpos.x < 0 || touchpos.x > 640 || touchpos.y < 0 || touchpos.y > 480){
			return;
		}
		var y = $("#DIV_FRAME").scrollTop() - (touchpos.y - dragOffset.y);
		var x = $("#DIV_FRAME").scrollLeft() - (touchpos.x - dragOffset.x);
		$("#DIV_FRAME").scrollTop(y);
		$("#DIV_FRAME").scrollLeft(x);
		dragOffset = touchpos;
	}
}
function DragTouchEnd(){
	event.preventDefault();
}
function ChangeBoardSize(sizeflg){
	switch(sizeflg){
	case 0:
		//クリア
		if($("#DIV_FRAME").hasClass("CLS_AREAMAP")){
			$("#DIV_FRAME").removeClass("CLS_AREAMAP");
			$("#DIV_FRAME").css({width:"", height:""});
			$("#DIV_FRAME").scrollTop(300);
			$("#DIV_FRAME").scrollLeft(400);
		}
		break;
	case 1:
		//縮小
		if(!$("#DIV_FRAME").hasClass("CLS_AREAMAP")){
			$("#DIV_FRAME").addClass("CLS_AREAMAP");
			$("#DIV_FRAME").css({width:"1600px", height:"1200px"});
		}
		break;
	default:
		if($("#DIV_FRAME").hasClass("CLS_AREAMAP")){
			$("#DIV_FRAME").removeClass("CLS_AREAMAP");
			$("#DIV_FRAME").css({width:"", height:""});
			$("#DIV_FRAME").scrollTop(300);
			$("#DIV_FRAME").scrollLeft(400);
		}else{
			$("#DIV_FRAME").addClass("CLS_AREAMAP");
			$("#DIV_FRAME").css({width:"1600px", height:"1200px"});
		}
		break;
	}
}
function MouseWheel(e){
	var e = e || window.event;
	var delta = 0;
	delta = e.wheelDelta;
	if (delta){
		if (delta < 0){
			ChangeBoardSize(1);
		}else{
			ChangeBoardSize(0);
		}
	}
	if (event.preventDefault) {
		event.preventDefault();
	}
	event.returnValue = false;
}
function OptionOpen(no){
	if(no == 0){
		$("#DIV_LOG1").css({top:"", height:""});
		$("#DIV_CONTROLBTN").css("display", "");
		$("#DIV_LOG1").scrollTop($("#DIV_LOG1").prop("scrollHeight"));
	}else{
		$("#DIV_LOG1").css({top:"0px", height:"835px"});
		$("#DIV_CONTROLBTN").css("display", "block");
	}
	event.preventDefault();
}
function BrouserBack(){
	if(confirm("戻ってよろしいですか？")){
		window.location.href = "index_i.htm";
	}
}
//##########################################################
function DispInfo(){
	if(Board.round >= 1){
		$("#DIV_INFO").html(Board.round);
		$("#DIV_INFO").css("color", pcolor[Board.turn]);
	}
}
function DispInfoPlus(){
	var msgstr = "";
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
}
function DispInfoMap(flg){
	var html = "";
	var colorimg = ["", "mark_n", "mark_r", "mark_b", "mark_g", "mark_y"];
	if(flg){
		html += "<div>領地</div>";
		for(var i=1; i<=5; i++){
			html += "<div><img src='img/"+colorimg[i]+".gif' height='26' width='26'>";
			html += "x" + GridCount(9, i) + "</div>";
		}
		html += "<div>召還</div>";
		for(var i=1; i<=5; i++){
			html += "<div><img src='img/"+colorimg[i]+".gif' height='26' width='26'>";
			html += "x" + GridCnoCount(9, i) + "</div>";
		}
		$("#DIV_INFOMAP").html(html);
		$("#DIV_INFOMAP").toggle();
	}else{
		$("#DIV_INFOMAP").css({"display":"none"});
	}
}
//
function DispPlayer(i_pno){
	var dispstr = "";
	var imgsrc = "";
	var msgstr = "";
	var wknswe = new Array("n", "s", "w", "e");
	var wkwidth = new Array("15", "15", "20", "14");
	var iplus = (sessionStorage.iPhone == "Y") ? -10 : 0;
	var iplus2 = (sessionStorage.iPhone == "Y") ? -5 : 0;
	for(var i=1; i<=Board.playcnt; i++){
		//目標到達
		if(TotalGold(i) >= Board.target && i_pno != 9){
			$("#DIV_POINT"+i).addClass("animeAlert"+Team(i));
		}else{
			$("#DIV_POINT"+i).removeClass("animeAlert"+Team(i));
		}
		if(Board.turn == i){
			$("#DIV_POINT"+i).addClass("TURNPLAYERPOP");
		}else{
			$("#DIV_POINT"+i).removeClass("TURNPLAYERPOP");
		}
		dispstr = "";
		//NAME,G
		dispstr += Infoblock.line({cls:"point", m:[PlayerRank(i, 0),Player[i].name], w:[26, 144 + iplus], pd:[0,4], ta:["c",""], sp:["bw","w"]});
		dispstr += Infoblock.line({cls:"point", m:[Player[i].gold,TotalGold(i)], w:[85 + iplus2, 85 + iplus2], pd:[4,4], ta:["r","r"], bg:"#FEFEFE"});
		//NSWE
		msgstr = "";
		for(var i2=0; i2<=3; i2++){
			imgsrc = "img/nswe" + wknswe[i2];
			if(Board.flag.indexOf(wknswe[i2]) >= 0){
				if(Player[i].flag.indexOf(wknswe[i2]) >= 0){
					imgsrc += "2";
				}else{
					imgsrc += "1";
				}
			}else{
				imgsrc += "0";
			}
			msgstr += "<IMG src='"+imgsrc+".gif' height='20' width='"+wkwidth[i2]+"'>";
		}
		//Hand
		for(var i2=1; i2<=Player[i].HandCount(); i2++){
			if(sessionStorage.iPhone == "Y"){
				msgstr += "<IMG src='img/icon_card_i.gif' height='20' width='12'>";
			}else{
				msgstr += "<IMG src='img/icon_card.gif' height='20' width='14'>";
			}
		}
		dispstr += Infoblock.line({cls:"point2", m:[msgstr], w:[170 + iplus], pd:[4], bg:"#FEFEFE"});
		
		//##### Option表示 #####
		if(i_pno == i || i_pno == 9){
			if($("#DIV_POINT"+i).hasClass("windowopened")){
				$("#DIV_POINT"+i).removeClass("windowopened");
			}else{
				var wkpno = i;
				//Territories
				var imgname = new Array("", "mark_n", "mark_r", "mark_b", "mark_g", "mark_y");
				for(var i2=1; i2<=5; i2++){
					var wkgold = 0;
					for(var i3=1; i3<Board.grid.length; i3++){
						if(Team(Board.grid[i3].owner) == Team(wkpno) && Board.grid[i3].color == i2){
							wkgold += GridValue(i3);
						}
					}
					msgstr = "<IMG src='img/"+imgname[i2]+".gif' height='26' width='26'>";
					dispstr += Infoblock.line({m:[msgstr, "x"+GridCount(wkpno,i2), wkgold], w:[34, 56, 80 + iplus], pd:[4,4,4], ta:["","r","r"], bd:true, bg:"FEFEFE"});
				}
				//Book
				msgstr = Player[wkpno].DeckCount() + "/" + Player[wkpno].DeckAllCount();
				dispstr += Infoblock.line({m:["デッキ", msgstr], w:[100, 70 + iplus], pd:[4, 4], ta:["", "r"], bd:true, bg:"FEFEFE"});
				//lap
				dispstr += Infoblock.line({m:["周回", Player[wkpno].lap], w:[100, 70 + iplus], pd:[4, 4], ta:["", "r"], bg:"FEFEFE"});
				if(i_pno != 9){
					//status
					if(Player[wkpno].status != ""){
						var iconsrc = StatusIcon(Player[wkpno].status);
						var namestr = Dic(Player[wkpno].status)+"呪い";
						if(Player[wkpno].statime <= 9){
							namestr += " " + Player[wkpno].statime + "R";
						}
						dispstr += Infoblock.line({m:["<img src='img/"+iconsrc+"'>", namestr], w:[40, 130 + iplus], h:26, pd:[4,4], bg:"FEFEFE"});
					}
				}else{
					//spell
					dispstr += Infoblock.line({m:["スペル", Analytics.spell[wkpno]], w:[100, 70 + iplus], pd:[4, 4], ta:["", "r"], bg:"FEFEFE"});
					//battle
					msgstr = Analytics.invasion[wkpno] +"(" + Analytics.invasionwin[wkpno] + ")";
					dispstr += Infoblock.line({m:["侵略", msgstr], w:[100, 70 + iplus], pd:[4, 4], ta:["", "r"], bg:"FEFEFE", bd:true});
					msgstr = Analytics.guard[wkpno] +"(" + Analytics.guardwin[wkpno] + ")";
					dispstr += Infoblock.line({m:["防衛", msgstr], w:[100, 70 + iplus], pd:[4, 4], ta:["", "r"], bg:"FEFEFE"});
					//take
					dispstr += Infoblock.line({m:["収入回数", Analytics.takecnt[wkpno]], w:[100, 70 + iplus], pd:[4, 4], ta:["", "r"], bg:"FEFEFE", bd:true});
					dispstr += Infoblock.line({m:["収入魔力", Analytics.takegold[wkpno]], w:[100, 70 + iplus], pd:[4, 4], ta:["", "r"], bg:"FEFEFE"});
					//pay
					dispstr += Infoblock.line({m:["支払回数", Analytics.paycnt[wkpno]], w:[100, 70 + iplus], pd:[4, 4], ta:["", "r"], bg:"FEFEFE"});
					dispstr += Infoblock.line({m:["支払魔力", Analytics.paygold[wkpno]], w:[100, 70 + iplus], pd:[4, 4], ta:["", "r"], bg:"FEFEFE"});
					//take
					dispstr += Infoblock.line({m:["スペルＧ", Analytics.costspell[wkpno]], w:[100, 70 + iplus], pd:[4, 4], ta:["", "r"], bg:"FEFEFE", bd:true});
					dispstr += Infoblock.line({m:["召還Ｇ", Analytics.costsummon[wkpno]], w:[100, 70 + iplus], pd:[4, 4], ta:["", "r"], bg:"FEFEFE"});
					//deck
					if(Board.role != wkpno){
						msgstr = "<a href='javascript:DeckImport(\"" + Player[wkpno].deckid + "\");'>" + Player[wkpno].deckname + "</a>";
					}else{
						msgstr = Player[wkpno].deckname;
					}
					dispstr += Infoblock.line({m:[msgstr], w:[170 + iplus], pd:[4], bg:"FEFEFE", bd:true});
				}
				//Size
				$("#DIV_POINT"+i).addClass("windowopened");
			}
		}else{
			$("#DIV_POINT"+i).removeClass("windowopened");
		}
		//innerHTML
		$("#DIV_POINT"+i).html(dispstr);

		//############## DEBUG ##############
		//手札並び替え
		DebugHandDisp(i);
		//デバッグフロント
		DebugFront();
	}
}
//DIV表示設定
function DisplaySet(){
	var arg = arguments;
	var divid = "#"+arg[0];
	if(arg[1] == 0){
		var cssObj = {backgrounImage:"", visibility:"hidden", zIndex:0}
		$(divid).css(cssObj);
	}else{
		if(arg[2] != undefined){
			if(arg[0].substr(0, 3) == "IMG"){
				$(divid).attr("src", "img/"+arg[2]+".gif");
			}else{
				$(divid).css("backgroundImage", "url(img/"+arg[2]+".gif)");
			}
		}
		$(divid).css({visibility:"visible", zIndex:arg[1]});
	}
}
//DIVタグbackgroundImage変更の空状態をなくす。
function DivImg(i_id, i_src){
	if(i_src != ""){
		$("#"+i_id).css("backgroundImage", "url(img/"+i_src+".gif)");
	}else{
		$("#"+i_id).css("backgroundImage", "");
	}
}
function SetPlayerImg(pno){
	var css = {};
	var cssP = {};
	var transform = "";
	var transformP = "";
	var stands = [];
	var groups = [];
	var mvx, mvpx, grpnum;
	var cssbg = "";

	//stand work
	for(var i=1; i<=Board.playcnt; i++){
		if(Board.turn != i){
			stands.push(Player[i].stand);
		}
	}

	for(var i=1; i<=Board.playcnt; i++){
		css = {};
		cssP = {};
		transform = "";
		transformP = "";

		//image position
		cssbg = "0px 0px, 128px 0px, 128px 0px";
		if($T.inrange(Player[i].direction, 1, 2)){
			cssbg = "128px 0px, 0px 0px, 128px 0px";
		}
		if($T.inrange(Player[i].direction, 3, 4)){
			cssbg = "128px 0px, 128px 0px, 0px 0px";
		}
		css["background-position"] = cssbg;

		//group
		if(Board.turn == i){
			if($T.inarray(Player[i].direction, [1, 4])){
				transform = "scale(-1, 1)";
				transformP = "scale(-1, 1)";
			}else{
				transform = "";
				transformP = "";
			}
		}else{
			grpnum = $T.countarray(Player[i].stand, stands);
			//立ち位置重複
			if(grpnum >= 2){
				if($T.inarray(Player[i].direction, [1, 4])){
					transform = "scale(-0.8, 0.8)";
					transformP = "scale(-1, 1)";
				}else{
					transform = "scale(0.8, 0.8)";
					transformP = "";
				}
				mvpx = (grpnum == 2) ? 24 : 12;
				mvx = $T.countarray(Player[i].stand, groups) * mvpx - 12;
				transform += " translate("+mvx+"px, 0px)";
				groups.push(Player[i].stand);
			}else{
				if($T.inarray(Player[i].direction, [1, 4])){
					transform = "scale(-1, 1)";
					transformP = "scale(-1, 1)";
				}else{
					transform = "";
					transformP = "";
				}
			}
		}
		if(pno == 0 || pno == i){
			css["transform"] = transform;
			cssP["transform"] = transformP;
			$("#DIV_PLAYER"+i).css(css);
			$("#DIV_PNO"+i+",#DIV_PICON"+i ).css(cssP);
		}
	}
}
//################## ダイアログ表示 ####################
function DispDialog(param){
	if(param == "none"){
		$("#DIV_FRAME").css({webkitFilter:""});
		$("#DIV_DIALOG_BACK").css({display:"none"});
		$("#DIV_DIALOG").html("");
	}else{
		var html = "", action = "", cls = "";
		var size = "390px";
		if(param.cnos){
			for(var i=0; i<param.cnos.length; i++){
				html += "<canvas id='CVS_DIALOG"+i+"' width='100' height='130'></canvas>";
			}
		}
		if(param.msgs){
			for(var i=0; i<param.msgs.length; i++){
				if(html != "") html += "<BR>";
				html += param.msgs[i];
			}
		}
		if(param.imgbtns){
			if(param.imgbtns.length >= 4){
				size = "640px";
			}
			for(var i=0; i<param.imgbtns.length; i++){
				html += "<a href=\"javascript:"+param.imgbtns[i][1]+"\" oncontextmenu=\"CardInfo('"+param.imgbtns[i][0]+"');return false;\">";
				html += "<canvas id='CVS_DIALOG"+i+"' width='100' height='130'></canvas></a>";
			}
		}
		if(param.btns){
			if(param.dtype == "yesno"){
				if(html != "") html += "<br>";
				for(var i=0; i<=1; i++){
					cls = (i == 1 && param.timer) ? " class='"+Chessclock.set()+"'" : "";
					html += "<button onclick=\""+param.btns[i]+"\" style='width:120px' "+cls+">"+["はい","いいえ"][i]+"</button>";
				}
			}else{
				for(var i=0; i<param.btns.length; i++){
					if(html != "") html += "<BR>";
					html += "<button style='width:160px'";
					if(param.btns[i][1] == ""){
						html += " disabled";
					}else{
						html += " onclick=\""+param.btns[i][1]+"\"";
					}
					if(param.btns[i][2]){
						html += " class='"+Chessclock.set(param.btns[i][2])+"'";
					}
					html += ">" + param.btns[i][0] + "</button>";
				}
			}
		}else{
			if(param.dtype == "ok"){
				html += "<br><button onclick=\"DispDialog('none')\" style='width:160px'>閉じる</button>";
			}
		}
		$("#DIV_DIALOG").css({width:size});
		$("#DIV_DIALOG").html(html);
		$("#DIV_DIALOG_BACK").css({display:"block"});
		$("#DIV_FRAME").css({webkitFilter:"blur(3px)"});
		//インフォ非表示
		GridInfo(0);
		//canvas
		if(param.cnos != undefined){
			for(var i=0; i<param.cnos.length; i++){
				CardImgSet({cvs:"CVS_DIALOG"+i, cno:param.cnos[i], zoom:0.5});
			}
		}
		if(param.imgbtns != undefined){
			for(var i=0; i<param.imgbtns.length; i++){
				CardImgSet({cvs:"CVS_DIALOG"+i, cno:param.imgbtns[i][0], zoom:0.5});
			}
		}
	}
}
//################[ エレメント作成 ]#################
//DIV レイヤー設置
function CreateLay(arg){
	var Attr = {id:arg.id}
	var Class = "";
	//Div生成
	if(arg.opt && arg.opt == "click"){
		Attr["onmousedown"] = "GridClick("+arg.gno+")";
		Attr["onmouseover"] = "GridInfo("+arg.gno+")";
		Attr["onmouseout"] = "GridInfo(0)";
		Attr["oncontextmenu"] = "GridGuidePop("+arg.gno+");return false;";
		//Class設定
		Class = "CLS_CLICK";
	}
    //Style設定
    var Css = {
        position:"absolute",
        width:arg.w+"px",
        height:arg.h+"px",
        left:arg.l+"px",
        top:arg.t+"px",
        zIndex:arg.z,
	    textAlign:"center"
    }
    if(arg.opt && arg.opt == "img"){
        Css["backgroundImage"] = "url(img/"+arg.imgsrc+".gif)";
        Css["backgroundRepeat"] = "no-repeat";
    }
	//ドキュメントに追加
	Maker.addDiv({base:"#DIV_FRAME", attr:Attr, css:Css, class:Class})
}
//
function SetPlayerIcon(pno, file){
	if(file == ""){
		$("#DIV_PICON"+pno).remove();
	}else{
		$("#DIV_PICON"+pno).remove();
		var img = "<img src='img/"+file+".gif' width='32' height='22'>";
		var div = "<div id='DIV_PICON"+pno+"' style='position:absolute;top:-18px;left:48px;'>"+img+"</div>";
		$("#DIV_PLAYER"+pno).append(div);
		switch(Player[pno].direction){
		case 1:
		case 4:
			if($T.browser() == "chrome"){
				$("#DIV_PICON"+pno).css("-webkit-transform", "scale(-1,1)");
			}else if($T.browser() == "firefox"){
				$("#DIV_PICON"+pno).css("-moz-transform", "scale(-1,1)");
			}
			break;
		}
	}
}
//#############[ IMAGE DATA ]###############
function LoadImage(){
	Canvas.srcs["CARDFRAMEC1"] = "img/card/frame_glay.gif";
	Canvas.srcs["CARDFRAMEC2"] = "img/card/frame_red.gif";
	Canvas.srcs["CARDFRAMEC3"] = "img/card/frame_blue.gif";
	Canvas.srcs["CARDFRAMEC4"] = "img/card/frame_green.gif";
	Canvas.srcs["CARDFRAMEC5"] = "img/card/frame_yellow.gif";
	Canvas.srcs["CARDFRAMEI"] = "img/card/frame_item.gif";
	Canvas.srcs["CARDFRAMES"] = "img/card/frame_spell.gif";
	Canvas.srcs["GRID0"] = "img/grid0.gif";
	Canvas.srcs["GRID1"] = "img/grid1.gif";
	Canvas.srcs["GRID2"] = "img/grid2.gif";
	Canvas.srcs["GRID3"] = "img/grid3.gif";
	Canvas.srcs["GRID4"] = "img/grid4.gif";
	Canvas.srcs["GRID5"] = "img/grid5.gif";
	Canvas.srcs["GRIDT"] = "img/gicon_tele.gif";
	Canvas.srcs["GRIDF"] = "img/gicon_drop.gif";
}
//
function GifURI(filename, pno, direction){
	var returi = "";
	var dirno = ["f","u","d"];
	switch(filename){
	case "piece1":
	case "piece2":
	case "piece3":
	case "piece4":
		returi = "img/avator/"+filename+pno+dirno[direction]+".gif";
		break;
	default:
		returi = "img/avator/"+filename+dirno[direction]+".gif";
		break;
	}
	return returi;
}
// CONTROL PANEL
function ControlPanelDisp(){
	if($("#DIV_CONTROLPANEL").css("display") == "none"){
		$("#DIV_CONTROLPANEL").css("display", "block");
	}else{
		$("#DIV_CONTROLPANEL").css("display", "none");
	}
}
function WallPaperLoad(imgelement){
	if(window.File && window.FileList && window.FileReader){
		var file = imgelement.files[0];
		if(file.type.match(/image/)){
			var reader = new FileReader();
			reader.onload = function(){
				$("#DIV_BACK").css("backgroundImage", "url("+this.result+")");
			}
			reader.readAsDataURL(file);
		}
	}else{
		$("#DIV_BACK").css("backgroundImage", "");
	}
}
function WallPaperSet(flg){
	switch(flg){
	case 1:
		if($T.browser() == "chrome"){
			$("#DIV_BACK").css("-webkit-background-size", "");
		}else if($T.browser() == "firefox"){
			$("#DIV_BACK").css("-moz-background-size", "");
		}
		$("#DIV_BACK").css("backgroundRepeat", "repeat");
		break;
	case 2:
		if($T.browser() == "chrome"){
			$("#DIV_BACK").css("-webkit-background-size", "100% auto");
		}else if($T.browser() == "firefox"){
			$("#DIV_BACK").css("-moz-background-size", "100% auto");
		}
		$("#DIV_BACK").css("backgroundRepeat", "no-repeat");
		break;
	}
}