var UI = {};
UI.Html = {};
UI.Event = {};
UI.Tool = {};
UI.Dialog = {};
//Drag
UI.dragObject = null;
UI.dragOffset = null;
//-----[ HTML ]-----
//DIV レイヤー設置
UI.Html.createDiv = function CreateLay(arg){
	var Attr = {id:arg.id}
	var Class = "";
	//Div生成
	if(arg.opt && arg.opt == "click"){
		Attr["onmousedown"] = "UI.Event.clickGrid("+arg.gno+")";
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
	Maker.addDiv({base:"#DIV_FRAME", attr:Attr, css:Css, class:Class});
}
//DIV表示設定
UI.Html.setDiv = function (arg){
	var css = {};
	var divid = "#" + arg.id;
	if(arg.visible){
		css.visibility = "visible";
	}
	if(arg.hidden){
		css.visibility = "hidden";
		css.zIndex = 0;
	}
	if(arg.clear){
		css.backgrounImage = "";
	}
	if(arg.img){
		css.backgrounImage = "url(img/"+arg.img+")";
	}
	if(arg.zidx){
		css.zIndex = arg.zidx;
	}
	$(divid).css(css);
}
//z-Index操作
UI.Html.sortZindex = function (flg){
	var yarr = [];
	var yzarr = [];
	for(var i=1; i<Board.grid.length; i++){
		if(yarr.indexOf(Board.grid[i].top) == -1){
			yarr.push(Board.grid[i].top);
		}
	}
	yarr.sort();
	for(var i in yarr){
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
		UI.Tool.setImgCharactor(0);
	}
}
//-----[ Tool ]-----
//キャラクター
UI.Tool.createCharactor = function (pno){
	var imgsrc = [];
	var dirtype = ["f","u","d"];
	var baseavator = ["piece1","piece2","piece3","piece4"];
	var plus = (baseavator.indexOf(Player[pno].avatar) >= 0) ? pno : "";
	//ICON
	for (var i in dirtype){
		imgsrc.push("url(img/avator/"+Player[pno].avatar+plus+dirtype[i]+".gif)");
	}
	$("#DIV_PLAYER"+pno).css("backgroundImage", imgsrc.join(","));
	$("#DIV_PLAYER"+pno).css("backgroundPosition", "0px 0px, 128px 0px, 128px 0px");
}
//アイコン
UI.Tool.playerIcon = function (pno){
	var imgsrc;
	$("#DIV_PICON"+pno).remove();
	if(imgsrc = StatusIcon(Player[pno].status)){
		var img = "<img src='img/"+imgsrc+".gif' width='32' height='22'>";
		var div = "<div id='DIV_PICON"+pno+"' style='position:absolute;top:-18px;left:48px;'>"+img+"</div>";
		$("#DIV_PLAYER"+pno).append(div);
		if([1, 4].indexOf(Player[pno].direction) >= 0){
			$("#DIV_PICON"+pno).css("-webkit-transform", "scale(-1, 1)");
		}
	}
}
//
UI.Tool.setImgCharactor = function (pno){
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
//ウィンドウスクロール
UI.Tool.scrollBoard = function (gno){
	//ドラッグストップ
	UI.dragObject = null;
	var def_t, def_x;
	def_t = 300; //600
	def_x = 340; //800
	if(!$("#DIV_FRAME").hasClass("CLS_AREAMAP")){
		//スクロール
		var wk_y = Board.grid[gno].top - def_t;
		var wk_x = Board.grid[gno].left - def_x;
		$("#DIV_FRAME").animate({scrollTop:wk_y, scrollLeft:wk_x}, 400, 'swing');

	}
}
//画面サイズ変更
UI.Tool.chgBoardSize = function (flg){
	switch(flg){
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
//キャッシュ
UI.Tool.cacheImg = function (){
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
//Wall Paper
UI.Tool.loadWallpaper = function (imgelement){
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
UI.Tool.setWalltpye = function (flg){
	switch(flg){
		case 1:
			$("#DIV_BACK").css("-webkit-background-size", "");
			$("#DIV_BACK").css("backgroundRepeat", "repeat");
			break;
		case 2:
			$("#DIV_BACK").css("-webkit-background-size", "100% auto");
			$("#DIV_BACK").css("backgroundRepeat", "no-repeat");
			break;
	}
}
// CONTROL PANEL
UI.Tool.openControl = function (){
	if($("#DIV_CONTROLPANEL").css("display") == "none"){
		$("#DIV_CONTROLPANEL").css("display", "block");
	}else{
		$("#DIV_CONTROLPANEL").css("display", "none");
	}
}
//-----[ Event ]-----
//情報クリック判定
UI.Event.mouseoverInfo = function (flg){
	if(Board.round >= 1){
		if(flg == 0){
			Game.Info.dispAreaInfo(false);
		}else{
			//non battle
			if(Board.step <= 70 || (Board.step >= 80 && Board.step < 100)){
				//情報表示
				Game.Info.dispAreaInfo(true);
			}
		}
	}
}
//Player
UI.Event.clickPlayer = function (pno){
	if(Board.round >= 1){
		if(pno >= 0){
			//non battle
			if(Board.step <= 70 || (Board.step >= 80 && Board.step < 100)){
				//スクロール
				UI.Tool.scrollBoard(Player[pno].stand);
				//情報表示
				Game.Info.dispPlayerbox(pno);
			}
		}
	}
}
//グリッドクリック判定
UI.Event.clickGrid = function (gno){
	if(Board.turn == Board.role){
		switch(Board.step){
			case 21:
				Spell.Step.chkGrid(gno);
				break;
			case 25:
				if(Spell.check.indexOf(gno) >= 0){
					//使用確認
					Spell.Step.second({step:1, gno:gno});
				}
				break;
			case 32:
				//移動先決定
				Dice.Step.move(gno);
				break;
			case 36:
				if(Dice.teleport.indexOf(gno) >= 0){
					Dice.Step.teleport({step:1, gno:gno});
				}
				break;
			case 40:
				//スクロール
				UI.Tool.scrollBoard(gno);
				//領地選択
				Territory.Step.start(gno);
				break;
			case 52:
				//移動先決定
				Territory.Step.move(gno, 0);
				break;
			case 54:
				//領地選択
				if(Territory.check.indexOf(gno) >= 0){
					Territory.Step.ability(gno);
				}
				break;
			case 92:
				Grid.trans(gno);
				break;
			default:
				if(sessionStorage.iPhone == "Y"){
					return false;
				}
				//スクロール
				UI.Tool.scrollBoard(gno);
				break;
		}
	}else{
		if(sessionStorage.iPhone == "Y"){
			return false;
		}
		//スクロール
		UI.Tool.scrollBoard(gno);
	}
	//Sound Effect
	Audie.seplay("click");

	//###### Debug ######
	if(sessionStorage.Mode == "debug"){
		if(Board.step == 20){
			DebugGridInfo(gno);
		}
	}
}
//ハンドクリック判定
UI.Event.clickHand = function (hno){
	if(Board.step == 1){
		if(Board.role >= 1){
			Deck.Tool.mulligan(hno);
			return;
		}
	}
	if(Board.turn == Board.role){
		if(hno < Player[Board.role].hand.length){
			switch(Board.step){
				case 20:
					//コストチェック
					Spell.Step.chkTarget(hno);
					break;
				case 40: //Summon
					//コストチェック
					if(Summon.Tool.chkcost(Player[Board.role].stand, Player[Board.role].hand[hno]) == "OK"){
						Summon.Step.confirm({from:"summon", step:0, hno:hno});
					}
					break;
				case 53: //Trritory(Summon)
					//コストチェック
					if(Summon.Tool.chkcost(Territory.gno, Player[Board.role].hand[hno]) == "OK"){
						Summon.Step.confirm({from:"change", step:0, hno:hno});
					}
					break;
				case 98: //Dicard(TurnEnd)
					if(Board.discardstep == 1){
						Deck.Tool.discard({pno:Board.role, hno:hno});
					}
					break;
			}
		}
	}
	if(Battle.p[0].pno == Board.role || Battle.p[1].pno == Board.role){
		switch(Board.step){
			case 72:
				if(hno < Player[Board.role].hand.length){
					var cno = Player[Board.role].hand[hno];
					//コストチェック
					if(Battle.check.indexOf(cno) >= 0){
						BattleItem({pno:Board.role, hno:hno});
					}
				}
				break;
		}
	}
	//Sound Effect
	Audie.seplay("click");
}
//マウスホイール
UI.Event.mouseWheel = function (e){
	var e = e || window.event;
	var delta = 0;
	delta = e.wheelDelta;
	if (delta){
		if (delta < 0){
			UI.Tool.chgBoardSize(1);
		}else{
			UI.Tool.chgBoardSize(0);
		}
	}
	if (event.preventDefault) {
		event.preventDefault();
	}
	event.returnValue = false;
}
//ドラッグスクロール
UI.Tool.mapDragStart = function (){
	$("BODY").mouseup(UI.Event.mouseupDrag);
	$("BODY").mousemove(UI.Event.mousemoveDrag);
	$("#DIV_BACK").mousedown(UI.Event.mousedownDrag);
	$("#DIV_BACK").bind("mousewheel", UI.Event.mouseWheel);
}
UI.Event.mousedownDrag = function (e){
	//縮小クリア
	if($("#DIV_FRAME").hasClass("CLS_AREAMAP")){
		$("#DIV_FRAME").removeClass("CLS_AREAMAP");
		$("#DIV_FRAME").css({width:"", height:""});
		$("#DIV_FRAME").scrollTop(300);
		$("#DIV_FRAME").scrollLeft(400);
	}
	UI.dragObject = this;
	UI.dragOffset = {x:e.clientX, y:e.clientY};
	return false;
}
UI.Event.mouseupDrag = function (e){
	UI.dragObject = null;
}
UI.Event.mousemoveDrag = function (e){
	if(!UI.dragObject) return;
	var mousePos = {x:e.clientX, y:e.clientY};
	if(mousePos.x < 0 || mousePos.x > 800 || mousePos.y < 0 || mousePos.y > 600){
		UI.dragObject = null;
		return;
	}
	var y = $("#DIV_FRAME").scrollTop() - (mousePos.y - UI.dragOffset.y);
	var x = $("#DIV_FRAME").scrollLeft() - (mousePos.x - UI.dragOffset.x);
	$("#DIV_FRAME").scrollTop(y);
	$("#DIV_FRAME").scrollLeft(x);
	UI.dragOffset = mousePos;
}
//################## ダイアログ表示 ####################
UI.Dialog.show = function (arg){
	var html = "", action = "", cls = "";
	var size = "390px";
	//インフォ非表示
	GridInfo(0);
	if(arg.cnos){
		for(var i in arg.cnos){
			html += "<canvas id='CVS_DIALOG"+i+"' width='100' height='130'></canvas>";
		}
	}
	if(arg.msgs){
		for(var i in arg.msgs){
			if(html != "") html += "<BR>";
			html += arg.msgs[i];
		}
	}
	if(arg.imgbtns){
		if(arg.imgbtns.length >= 4){
			size = "640px";
		}
		for(var i=0; i<arg.imgbtns.length; i++){
			html += "<a href=\"javascript:"+arg.imgbtns[i][1]+"\" oncontextmenu=\"Card.Tool.info({cno:'"+arg.imgbtns[i][0]+"'});return false;\">";
			html += "<canvas id='CVS_DIALOG"+i+"' width='100' height='130'></canvas></a>";
		}
	}
	if(arg.btns){
		if(arg.dtype && arg.dtype == "yesno"){
			if(html != "") html += "<br>";
			for(var i=0; i<=1; i++){
				cls = (i == 1 && arg.timer) ? " class='"+Chessclock.set()+"'" : "";
				html += "<button onclick=\""+arg.btns[i]+"\" style='width:120px' "+cls+">"+["はい","いいえ"][i]+"</button>";
			}
		}else{
			for(var i=0; i<arg.btns.length; i++){
				if(html != "") html += "<BR>";
				html += "<button style='width:160px'";
				if(arg.btns[i][1] == ""){
					html += " disabled";
				}else{
					html += " onclick=\""+arg.btns[i][1]+"\"";
				}
				if(arg.btns[i][2]){
					html += " class='"+Chessclock.set(arg.btns[i][2])+"'";
				}
				html += ">" + arg.btns[i][0] + "</button>";
			}
		}
	}else{
		if(arg.dtype == "ok"){
			html += "<br><button onclick='UI.Dialog.close()' style='width:160px'>閉じる</button>";
		}
	}
	$("#DIV_DIALOG").css({width:size});
	$("#DIV_DIALOG").html(html);
	$("#DIV_DIALOG_BACK").css({display:"block"});
	$("#DIV_FRAME").css({webkitFilter:"blur(3px)"});
	//canvas
	if(arg.cnos){
		for(var i in arg.cnos){
			Card.Tool.imgset({cvs:"CVS_DIALOG"+i, cno:arg.cnos[i], zoom:0.5});
		}
	}
	if(arg.imgbtns){
		for(var i in arg.imgbtns){
			Card.Tool.imgset({cvs:"CVS_DIALOG"+i, cno:arg.imgbtns[i][0], zoom:0.5});
		}
	}
}
UI.Dialog.close = function(){
	$("#DIV_FRAME").css({webkitFilter:""});
	$("#DIV_DIALOG_BACK").css({display:"none"});
	$("#DIV_DIALOG").html("");
}
