var UI = {};
UI.Html = {};
UI.Event = {};
UI.Tool = {};
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
	Maker.addDiv({base:"#DIV_FRAME", attr:Attr, css:Css, class:Class})
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
		SetPlayerImg(0);
	}
}
//情報クリック判定
UI.Event.mouseoverInfo = function (i_no){
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
//Player
UI.Event.clickPlayer = function (i_no){
	if(Board.round >= 1){
		if(i_no >= 0){
			//non battle
			if(Board.step <= 70 || (Board.step >= 80 && Board.step < 100)){
				//スクロール
				UI.Tool.scrollBoard(Player[i_no].stand);
				//情報表示
				DispPlayer(i_no);
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
			HandMulligan(hno);
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
//ウィンドウスクロール
UI.Tool.scrollBoard = function (i_no){
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