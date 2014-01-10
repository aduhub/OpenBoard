var Game = {};
Game.Tool = {};
Game.Info = {};
//Start
Game.init = function (){
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
	UI.Tool.cacheImg();
	//Volume設定
	Audie.loadsetting();
	//観戦
	if($T.inarray(sessionStorage.Mode, ["gallery", "replay"])){
		//削除
		$("#DIV_DECK").remove();
		$("#DIV_HANDFRAME").remove();
	}
	//通信開始
	Net.init();
    Net.getCGI("");
    //main 10 frame/second
    Frame.init();
}
Game.setupBoard = function (){
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
			//Canvas.draw({id:"CVS_BACK", src:wkimgid, x:pos.x, y:pos.y, composite:wkcomposite});

			//GRID
			//UI.Html.createDiv({id:"DIV_GICON"+i, w:128, h:90, l:pos.x, t:pos.y - 26, z:10, opt:"img", imgsrc:wkicon});
			UI.Html.createDiv({id:"DIV_GCLICK"+i, w:64, h:64, l:pos.x + 32, t:pos.y, z:150, opt:"click", gno:i});
		}
	}
	//CreateJS
	UI.CreateJS.setup();
	//ソート
	UI.Html.sortZindex("map");
	//スクロール
	UI.Tool.scrollBoard(1);
	//役(観戦)
	Board.role = 9;
	//ドラッグ処理
	UI.Tool.mapDragStart();
}
Game.setupPlayer = function (){
	//ダイアログ
	UI.Dialog.show({msgs:["プレイヤー情報設定中・・・"]});
	//初期化
	for(var i=1; i<=Board.playcnt; i++){
		var imgsrc = [];
		Player[i].lap = 1;
		Player[i].stand = 1;
		Player[i].shadow = 1;
		Player[i].gold = Board.bonus;
		//ICON
		UI.Html.createDiv({id:"DIV_PLAYER"+i, w:128, h:128, l:Number(Board.grid[1].left), t:Number(Board.grid[1].top) - 64, z:11});
		//$("#DIV_PLAYER"+i).html("<div id='DIV_PNO"+i+"'>"+i+"P</div>");
		UI.Tool.createCharactor(i);
	}
	//##### Alliance #####
	if(Board.alliance){
		$("#DIV_POINT3").css("border-color", "#FF0000");
		$("#DIV_POINT4").css("border-color", "#0000CC");
		$("#DIV_PLAYER3").css("color", "#FF0000");
		$("#DIV_PLAYER4").css("color", "#0000CC");
	}
	//魔力ウィンドウ
	Game.Info.dispPlayerbox();
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
			Game.setupHand(0);
		}
	}
	$T.stacktimer({fnc:fnc, msec:0});
}
Game.setupHand = function(flg){
	var puttop = [];
	//ハンドセット
	Flow.step(1);
	if(flg == 0){
		//マリガンクリア
		Deck.handselect = "11111";
	}else{
		for(var i=0; i<=4; i++){
			if(Deck.handselect[i] == "1"){
				puttop.push(Player[Board.role].hand[i]);
			}
		}
	}
	//デッキシャッフル(残し)
	Deck.Tool.shuffle({pno:Board.role, tgt:"deck", puttop:puttop});
	//初期手札(5draw)
	Player[Board.role].hand = [];
	for(var i=1; i<=5; i++){
		Deck.Tool.draw({pno:Board.role, from:"deck", nlog:true});
	}
	//手札ソート
	Deck.Tool.sorthand();
	//引きなおしダイアログ
	if(flg == 0){
		//ダイアログ
		var msgarr = ["引きなおす手札を選択してください"];
		var btnarr = [["選択終了", "Game.setupHand(1)"]];
		UI.Dialog.show({msgs:msgarr, btns:btnarr});
	}else{
		//ハンドセット
		Flow.step(2);
		//ダイアログ
		UI.Dialog.show({msgs:["準備完了", "他のプレイヤーを待っています・・・"]});
		//送信
		var deck = Player[Board.role].hand.join(":") + ":" + Player[Board.role].deck;
		Net.send("ready:" + deck);
		//次を用意
		Deck.Tool.shuffle({pno:Board.role, tgt:"next"});
	}
}
//======================================================================
//順位関数(pno, [pno(top)])
Game.Tool.calcRank = function (pno, toppno){
	var arg = arguments;
	var rank = 1;
	var gold = Game.Tool.calcTotalGold(arg[0]);
	//pno = top
	if(pno == toppno){
		return 1;
	}
	if(Board.alliance){
		//### Alliance ###
		var teamarr = [];
		for(var i=1; i<=Board.playcnt; i++){
			if(Flow.Tool.team(pno) != Flow.Tool.team(i) && teamarr.indexOf(Flow.Tool.team(i)) == -1){
				if(Flow.Tool.team(toppno) == Flow.Tool.team(i) || gold < Game.Tool.calcTotalGold(i)){
					rank++;
				}
				teamarr.push(Flow.Tool.team(i));
			}
		}
	}else{
		for(var i=1; i<=Board.playcnt; i++){
			if(toppno == i || gold < Game.Tool.calcTotalGold(i)){
				rank++;
			}
		}
	}
	return rank;
}
//総計
Game.Tool.calcTotalGold = function (pno){
	var wktotal = 0;
	if(Board.alliance){
		for(var i=1; i<=Board.playcnt; i++){
			if(Flow.Tool.team(pno) == Flow.Tool.team(i)){
				wktotal += Player[i].gold;
			}
		}
	}else{
		wktotal = Player[pno].gold;
	}
	for(var i=1; i<Board.grid.length; i++){
		if([1, 2, 3, 4, 5].indexOf(Number(Board.grid[i].color)) >= 0){
			if(Flow.Tool.team(Board.grid[i].owner) == Flow.Tool.team(pno)){
				wktotal += Grid.value(i);
			}
		}
	}
	return wktotal;
}
//##########################################################
Game.Info.dispAreaInfo = function (flg){
	var html = "";
	var colorimg = ["", "mark_n", "mark_r", "mark_b", "mark_g", "mark_y"];
	if(flg){
		html += "<div>領地</div>";
		for(var i=1; i<=5; i++){
			html += "<div><img src='img/"+colorimg[i]+".gif' height='26' width='26'>";
			html += "x" + Grid.count({color:i}) + "</div>";
		}
		html += "<div>召還</div>";
		for(var i=1; i<=5; i++){
			html += "<div><img src='img/"+colorimg[i]+".gif' height='26' width='26'>";
			html += "x" + Grid.count({cno_color:i}) + "</div>";
		}
		$("#DIV_INFOMAP").html(html);
		$("#DIV_INFOMAP").toggle();
	}else{
		$("#DIV_INFOMAP").css({"display":"none"});
	}
}
Game.Info.dispPlayerbox = function (i_pno){
	//## Variable ##
	var dispstr = "";
	var cvsid = "";
	var imgsrc = "";
	var msgstr = "";
	var NSWE = ["n","s","w","e"];
	var wkwidth = ["15", "15", "20", "14"];
	var imgname = ["", "mark_n", "mark_r", "mark_b", "mark_g", "mark_y"];
	var parts = {pno:0, cls:"", htm:""}
	//## Function ##
	var fncDivMaker = function(arg){
		var div = $("<div></div>");
		div.addClass(arg.cls);
		div.html(arg.htm);
		$("#DIV_POINT"+arg.pno).append(div);
	}

	for(var i=1; i<=Board.playcnt; i++){
		parts.pno = i;
		$("#DIV_POINT"+i).html("");
		//TURN PLAYER
		//if(Board.turn == i){
		//	$("#DIV_POINT"+i).addClass("TURNPLAYERPOP");
		//}else{
		//	$("#DIV_POINT"+i).removeClass("TURNPLAYERPOP");
		//}
		//Game.Tool.calcRank(i, 0), Player[i].name

		//##############################
		//## PLAYER INFOMATION HEADER ##
		//##############################
		//## Total ##
		parts.cls = "class_Point_Total";
		parts.htm = Game.Tool.calcTotalGold(i);
		if(Game.Tool.calcTotalGold(i) >= Board.target && i_pno != 9){
			parts.cls += " animeAlert";
		}
		fncDivMaker(parts);
		//## NSWE ##
		parts.cls = "class_Point_NSWE";
		parts.htm = "<canvas height='48' width='60' id='CVS_NSWE"+i+"'></canvas>"
		fncDivMaker(parts);
		//if(Board.flag.length == Player[i].flag.length){
		//	Canvas.draw({id:"CVS_NSWE"+i, src:"img/nswego.png", x:0, y:0});
		var xx = [[15,30,45,30],[15,30,45,30],[ 0,15,30,15],[30,45,60,45]];
		var yy = [[12, 0,12,24],[36,24,36,48],[24,12,24,36],[24,12,24,36]];
		var rgb = [0,0,0];
		var alpha = 1.0;
		for(var i2 in NSWE){
			if(Board.flag.indexOf(NSWE[i2]) >= 0){
				imgsrc = "img/nswe-"+NSWE[i2]+".png";
				if(Player[i].flag.indexOf(NSWE[i2]) >= 0){
					rgb = [255,64,0];
					alpha = 1.0;
				}else{
					rgb = [0,0,0];
					alpha = 0.8;
				}
				Canvas.fill("CVS_NSWE"+i, {x:xx[i2], y:yy[i2], rgb:rgb, alpha:alpha});
				Canvas.draw({id:"CVS_NSWE"+i, x:xx[i2][1]-5, y:yy[i2][1]+7, src:imgsrc, alpha:alpha});
			}else{
				Canvas.fill("CVS_NSWE"+i, {x:xx[i2],y:yy[i2],rgb:[0,0,0],alpha:0.6});
			}
		}
		//## GOLD ##
		parts.cls = "class_Point_Gold";
		parts.htm = Player[i].gold+"<span>G</span>";
		fncDivMaker(parts);
		//## MEDAL ##
		parts.cls = "class_Point_Medal";
		parts.htm = "";
		for(var i2=1; i2<=3; i2++){
			if(Player[i].medal >= i2){
				imgsrc='img/medal1.png';
			}else{
				imgsrc='img/medal0.png';
			}
			parts.htm += "<IMG src='"+imgsrc+"' height='12' width='32'>";
		}
		fncDivMaker(parts);
		//## Hand ##
		parts.cls = "class_Point_Hand";
		parts.htm = "";
		for(var i2 in Player[i].hand){
			parts.htm += "<div></div>";
		}
		fncDivMaker(parts);

		//##############################
		//## PLAYER INFOMATION OPTION ##
		//##############################
		if(i_pno == i || i_pno == 9){
			if($("#DIV_POINT"+i).hasClass("windowopened")){
				$("#DIV_POINT"+i).removeClass("windowopened");
			}else{
				var wkpno = i;
				//##[Territories]##
				for(var i2=1; i2<=5; i2++){
					var wkgold = 0;
					for(var igno=1; igno<Board.grid.length; igno++){
						if(Flow.Tool.team(Board.grid[igno].owner) == Flow.Tool.team(wkpno) && Board.grid[igno].color == i2){
							wkgold += Grid.value(igno);
						}
					}
					var div = $("<div></div>").addClass("class_Point_Line");
					div.append("<div>"+EleName[i2]+"属性("+Grid.count({owner:wkpno, color:i2})+")</div>");
					div.append("<div>"+wkgold+"</div>");
					$("#DIV_POINT"+i).append(div);
				}
				//##[Book]##
				msgstr = Player[wkpno].DeckCount() + "/" + Player[wkpno].DeckAllCount();
				var div = $("<div></div>").addClass("class_Point_Line");
				div.append("<div>デッキ</div>");
				div.append("<div>"+msgstr+"</div>");
				$("#DIV_POINT"+i).append(div);
				//##[lap]##
				var div = $("<div></div>").addClass("class_Point_Line");
				div.append("<div>周回</div>");
				div.append("<div>"+Player[wkpno].lap+"</div>");
				$("#DIV_POINT"+i).append(div);
				if(i_pno != 9){
					//##[status]##
					if(Player[wkpno].status != ""){
						var div = $("<div></div>").addClass("class_Point_Line");
						div.append("<div>"+Dic(Player[wkpno].status)+"呪い</div>");
						if(Player[wkpno].statime <= 9){
							div.append("<div>"+Player[wkpno].statime+"R</div>");
						}else{
							div.append("<div>永続</div>");
						}
						$("#DIV_POINT"+i).append(div);
					}
				}else{
					//spell
					dispstr += Infoblock.line({m:["スペル", Analytics.spell[wkpno]], w:[100, 70], pd:[4, 4], ta:["", "r"], bg:"FEFEFE"});
					//battle
					msgstr = Analytics.invasion[wkpno] +"(" + Analytics.invasionwin[wkpno] + ")";
					dispstr += Infoblock.line({m:["侵略", msgstr], w:[100, 70], pd:[4, 4], ta:["", "r"], bg:"FEFEFE", bd:true});
					msgstr = Analytics.guard[wkpno] +"(" + Analytics.guardwin[wkpno] + ")";
					dispstr += Infoblock.line({m:["防衛", msgstr], w:[100, 70], pd:[4, 4], ta:["", "r"], bg:"FEFEFE"});
					//take
					dispstr += Infoblock.line({m:["収入回数", Analytics.takecnt[wkpno]], w:[100, 70], pd:[4, 4], ta:["", "r"], bg:"FEFEFE", bd:true});
					dispstr += Infoblock.line({m:["収入魔力", Analytics.takegold[wkpno]], w:[100, 70], pd:[4, 4], ta:["", "r"], bg:"FEFEFE"});
					//pay
					dispstr += Infoblock.line({m:["支払回数", Analytics.paycnt[wkpno]], w:[100, 70], pd:[4, 4], ta:["", "r"], bg:"FEFEFE"});
					dispstr += Infoblock.line({m:["支払魔力", Analytics.paygold[wkpno]], w:[100, 70], pd:[4, 4], ta:["", "r"], bg:"FEFEFE"});
					//take
					dispstr += Infoblock.line({m:["スペルＧ", Analytics.costspell[wkpno]], w:[100, 70], pd:[4, 4], ta:["", "r"], bg:"FEFEFE", bd:true});
					dispstr += Infoblock.line({m:["召還Ｇ", Analytics.costsummon[wkpno]], w:[100, 70], pd:[4, 4], ta:["", "r"], bg:"FEFEFE"});
					//deck
					if(Board.role != wkpno){
						msgstr = "<a href='javascript:DeckImport(\"" + Player[wkpno].deckid + "\");'>" + Player[wkpno].deckname + "</a>";
					}else{
						msgstr = Player[wkpno].deckname;
					}
					dispstr += Infoblock.line({m:[msgstr], w:[170], pd:[4], bg:"FEFEFE", bd:true});
				}
				//Size
				$("#DIV_POINT"+i).addClass("windowopened");
			}
		}else{
			$("#DIV_POINT"+i).removeClass("windowopened");
		}
	}
}


