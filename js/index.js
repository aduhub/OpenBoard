//===================================
// filename : index.js
// update   : 2010-06-14 adu
//===================================
var url = 'perl/oclogin.cgi';
var roomtype = 0;
var netflg = 0;
var bookflg = 0;
var roombuilds = 0;
var roomlistlock = 0;
var ranklistlock = 0;

//初期処理
window.onload = function(){
	//ajax setup
	jQuery.ajaxSetup({type:"GET", datatype:"text", cache:false});
	//Init Load
	initEditor();
	initMap();
	//
	var mapno = 1;
	var selstr = "selected";
	while(true){
		var maparr = MapDataSet(mapno);
		if(maparr != ""){
			var maprule = maparr[0].split(":");
			if(maprule.length == 5){
				var optstr = "<OPTION value=\'"+mapno+"\' "+selstr+">"+maprule[0]+"</OPTION>";
				selstr = "";
				var optobj = $(optstr);
				$("#MAPNO").append(optobj);
				//
				var button = "<button onclick='MapDisp2(" + mapno + ")'>" + maprule[0] + "</button>";
				$("#DIV_MAPLIST").append(button);
			}
			mapno++;
			if(mapno > 99) break;
		}else{
			break;
		}
	}
	//Login Check
	if(sessionStorage.USERID && sessionStorage.USERID != ""){
		LoginDisp();
	}else{
		//if(localStorage.ob_userid){
		//	NetSend("LOGIN_STORAGE");
		//}else{
			PageOpen(1);
		//}
	}
	$("#btn_menu1").css("display","block");
	$("#btn_menu4").css("display","block");
	$("#btn_menu5").css("display","block");
	//$("#btn_menu6").css("display","block");
	//$("#btn_menu7").css("display","block");
	
	//lobbychat
	//obNet.socketinit();
}
function AlertPop(msg){
	$("#div_alert").html(msg);
	$("#div_alert").css("display", "block");
	$("#div_alert").addClass("animeMsgpop");
	switch($T.browser()){
	case "chrome":
		$("#div_alert").bind('webkitAnimationEnd', function(){
			$(this).unbind('webkitAnimationEnd');
			$(this).css("display", "none"); 
		});
		break;
	case "firefox":
		$("#div_alert").bind('animationend', function(){
			$(this).unbind('animationend');
			$(this).removeClass("animeMsgpop");
			$(this).css("display", "none"); 
			console.log("animationend");
		});
		break;
	}
}
function PageOpen(i_page){
	for(var i=0; i<=6; i++){
		if(i == i_page){
			$("#div_page"+i).css({display:"block"});
		}else{
			$("#div_page"+i).css({display:"none"});
		}
	}
	switch(i_page){
	case 3: //DECK
		if(initdeckdisp){
			DeckList();
			ListDisplay();
		}
		break;
	case 4: //cardlist
		if(bookflg == 0){
			BookDisplay();
			bookflg = 1;
		}
		break;
	}
}
function LoginDisp(){
	$("#SPANUSERNM").html(sessionStorage.USERNAME+"("+sessionStorage.USERRATE+")");
	$("#div_head_login").css("display", "none");
	$("#div_head_user").css("display", "block");
	$("#btn_menu2").css("display","block");
	$("#btn_menu3").css("display","block");
	NetSend('LIST');
}
function Logout(){
	$("#div_head_login").css("display", "block");
	$("#div_head_user").css("display", "none");
	$("#btn_menu2").css("display","none");
	$("#btn_menu3").css("display","none");
	//local
	initdeckdisp = true;
	localStorage.ob_userid = "";
	localStorage.ob_userpw = "";
	//toppage
	PageOpen(1);
}
function EntryId(){
	if(!CheckItem($("#ENTRYNAME").val(), 2, 12, false)){
		return false;
	}
	if(!CheckItem($("#ENTRYID").val(), 4, 6, true)){
		return false;
	}
	if(!CheckItem($("#ENTRYPW").val(), 4, 4, true)){
		return false;
	}
	//登録
	NetSend("ENTRY");
}
function CheckItem(i_str, i_min, i_max, i_zenkaku){
	var chklen = $T.strlength($.trim(i_str));
	if(chklen == 0){
		AlertPop("文字を入力してください");
		return false;
	}
	if(i_zenkaku && chklen != i_str.length){
		AlertPop("半角で入力してください");
		return false;
	}
	if(!$T.inrange(chklen, i_min, i_max)){
		AlertPop("文字数が範囲内に収まっていません");
		return false;
	}
	return true;
}
//###################################################
function NetSend(i_cmd){
	if(netflg == 0){
		var pars = "";
        var ping = $T.rndstr(16);
        pars += "HASH=" + CryptoJS.SHA1(ping).toString();
		switch(i_cmd){
		case "LOGIN":
			//local
			localStorage.ob_userid = $("#USERID").val();
			localStorage.ob_userpw = $("#USERPW").val();
            pars += "&LOGCMD=LOGIN";
            pars += "&USERID=" + $("#USERID").val();
            pars += "&USERPW=" + $("#USERPW").val();
			break;
		case "LOGIN_STORAGE":
            pars += "&LOGCMD=LOGIN";
            pars += "&USERID=" + localStorage.ob_userid;
            pars += "&USERPW=" + localStorage.ob_userpw;
			break;
		case "ROOM":
			if(roombuilds <= 3){
				if($.trim($("#ROOMNAME").val()) != ""){
					var playnum = $("#MAPPLAYCNT").val();
					pars += "&LOGCMD=ROOM";
					pars += "&USERID=" + sessionStorage.USERID;
					pars += "&NAME=" + $("#ROOMNAME").val();
					pars += "&MAPNO=" + $("#MAPNO").val();
					pars += "&TARGET=" + $("#MAPTARGET").val();
					pars += "&ROUND=" + $("#MAPROUND").val();
					pars += "&TIMER=" + $("#MAPTIMER").val();
					pars += "&SUDDEN" + $("#MAPSUDDEN").val();
					switch(playnum){
					case "A":
						pars += "&PLAYCNT=4";
						pars += "&ROOMMODE=ALLIANCE";
						break;
					case "AR":
						pars += "&PLAYCNT=4";
						pars += "&ROOMMODE=ALLIANCER";
						break;
					default:
						pars += "&PLAYCNT=" + $("#MAPPLAYCNT").val();
						pars += "&ROOMMODE=NORMAL";
						break;
					}
				}
			}else{
				AlertPop("現在使用中の部屋があります");
				return;
			}
			break;
		case "LIST":
			if(roomlistlock == 0){
				pars +="&LOGCMD=LIST";
				roomlistlock = 1;
				setTimeout(function(){roomlistlock = 0;}, 1000);
			}
			break;
        case "ENTRY":
            pars += "&LOGCMD=ENTRY";
            pars += "&ENTRYNAME=" + $("#ENTRYNAME").val();
            pars += "&ENTRYID=" + $("#ENTRYID").val();
            pars += "&ENTRYPW=" + $("#ENTRYPW").val();
			break;
		}
		netflg = 1;
		//Ajax
		$.ajax({url:url, data:pars, success:NetRecv});
	}
}
function JoinRoom(arg){
    var userid = sessionStorage.USERID;
    if(userid != ""){
        sessionStorage.RoomID = arg.room;
        sessionStorage.Online = (arg.comet) ? "Y" : "N";
        if(!(arg.gallery)){
            sessionStorage.Mode = (arg.debug) ? "debug" : "join";
            //Ajax
            var pars = "";
            var ping = $T.rndstr(16);
            pars += "HASH=" + CryptoJS.SHA1(ping).toString();
            pars += "&LOGCMD=JOIN";
            pars += "&ROOMID=" + arg.room;
            pars += "&USERID=" + userid;
            pars += "&MODE=" + arg.mode;
            if(arg.mode == "ALLIANCE"){
                pars += "&TEAM=" + arg.team;
            }
            $.ajax({url:url, data:pars, success:NetRecv});
        }else{
            sessionStorage.Mode = (arg.comet) ? "gallery" : "replay";;
            //ボード移動
            JumpBoard();
        }
    }
}
function KillRoom(i_room){
	if(confirm("部屋("+i_room+")を削除しますがよろしいですか？")){
		var pars = "LOGCMD=KILL&ROOMID=" + i_room + "&PING="+$T.rndstr(8);
		$.ajax({url:url, data:pars, success:NetRecv});
	}
}
function NetRecv(recvstr){
	netflg = 0;
	var recvcmd = recvstr.split(",");
	switch(recvcmd[0]){
	case "LOGIN":
		if(sessionStorage == null){
			alert("Storage not supported by the browser");
		}else{
			//session
			sessionStorage.USERID = recvcmd[1];
			sessionStorage.USERNAME = recvcmd[2];
			sessionStorage.USERTYPE = recvcmd[3];
			sessionStorage.USERRATE = recvcmd[5];
			sessionStorage.USERRATE2 = recvcmd[7];
			//login
			LoginDisp();
			//chat
			setTimeout(function(){obNet.msgsend(sessionStorage.USERNAME+"さんがログインしました");}, 1000);
		}
		break;
	case "ROOM":
		roomlistlock = 0;
		NetSend('LIST');
		break;
	case "JOIN":
		//ボード移動
		JumpBoard();
		break;
	case "LIST":
		var divlist = "";
		var wkrecv = recvcmd.shift();
		var wkroom = [];
		//ページ切替
		PageOpen(2);
		//クリア
		roombuilds = 0;
		//ソート
		recvcmd.sort();
		//リスト
		while(wkrecv = recvcmd.shift()){
			var wklist = wkrecv.split(":");
			if(wklist[2]=="room"){
				var maparr = MapDataSet(Number(wklist[3]));
				var maprule = maparr[0].split(":");
				var playcnt = Number(wklist[8]);
				var joincnt = Number(wklist[13]);
				var roommode = wklist[11];
				var roomsts = Number(wklist[14]);
				var addButton = function(cmd, name){
					return "<BUTTON onclick='"+cmd+"' class='base glay'>"+name+"</BUTTON>";
				}
				if(playcnt > 1 || wklist[9] == sessionStorage.USERID){
					var roomline = "<div class='LISTLINE'>";
					roomline += "<div>"+wklist[10]+"</div>";
					switch(roommode){
					case "NORMAL":
						roomline += "<div>"+maprule[0]+"</div>";
						break;
					case "YOSEN":
						roomline += "<div>ランダム</div>";
						break;
					case "ALLIANCE":
					case "ALLIANCER":
						roomline += "<div><imgsrc src='imgsrc/alliance.gif' width='20' height='18'>"+maprule[0]+"</div>";
						break;
					}
					roomline += "<div>"+wklist[4]+"G</div>";
					roomline += "<div>"+wklist[5]+"R</div>";
					roomline += "<div>";
					for(var i=1; i<=playcnt; i++){
						var gifno = (joincnt >= i) ? 1 : 0;
						roomline += "<imgsrc src='imgsrc/man"+gifno+".gif' width='12' height='18'>";
					}
					roomline += "</div><div>";
					//button
					var strtype = (sessionStorage.USERTYPE == "1") ? 0 : 1;
					if([0, 1].indexOf(roomsts) >= 0 && joincnt < playcnt){
						var opt = (playcnt > 1) ? ", comet:true" : "";
						switch(roommode){
						case "ALLIANCE":
							roomline += addButton("JoinRoom({room:"+wklist[0]+opt+",mode:\"ALLIANCE\",team:\"A\"})", "Ａ"); 
							roomline += addButton("JoinRoom({room:"+wklist[0]+opt+",mode:\"ALLIANCE\",team:\"B\"})", "Ｂ"); 
							break;
						case "ALLIANCER":
							roomline += addButton("JoinRoom({room:"+wklist[0]+opt+",mode:\"ALLIANCE\",team:\"R\"})", ["J", "参加"][strtype]); 
							break;
						default:
							roomline += addButton("JoinRoom({room:"+wklist[0]+opt+",mode:\""+roommode+"\"})", ["J", "参加"][strtype]); 
							break;
						}
					}
					if([0, 1].indexOf(roomsts) >= 0){
						roomline += addButton("JoinRoom({room:"+wklist[0]+", gallery:true, comet:true})", ["W", "観戦"][strtype]);
					}
					if([2, 3].indexOf(roomsts) >= 0){
						roomline += addButton("JoinRoom({room:"+wklist[0]+", gallery:true})", ["R", "リプレイ"][strtype]);
					}
					if(sessionStorage.USERTYPE != "1"){
						if([0, 1].indexOf(roomsts) >= 0 && wklist[9] == sessionStorage.USERID && Number(wklist[15]) == 0){
							roomline += "<BUTTON onclick='KillRoom("+wklist[0]+", 0)' class='base glay'>×</BUTTON>"; 
						}
					}else{
						if(roomsts == 0 && joincnt == 0){
							roomline += "<BUTTON onclick='JoinRoom({room:"+wklist[0]+",team:\"R\", debug:true})' class='base glay'>D</BUTTON>";
						}
						roomline += "<BUTTON onclick='KillRoom("+wklist[0]+", 0)' class='base glay'>X</BUTTON>"; 
					}
					roomline += "</div><div>";
					switch(roomsts){
					case 0:
						roomline += "募集中"; 
						break;
					case 1:
						if(playcnt == joincnt){
							roomline += wklist[15]+"R 対戦中"; 
						}else{
							roomline += "募集中"; 
						}
						break;
					case 2:
						roomline += wklist[15]+"R 中断"; 
						break;
					case 3:
						roomline += wklist[15]+"R <BUTTON onclick='ResultDisp(\""+wklist[6]+"\", \""+wklist[8]+"\", \""+wklist[16]+"\", \""+wklist[17]+"\")' class='base glay'>結果</BUTTON>"; 
						break;
					case 9:
						roomline += wklist[15]+"デバッグ";
						break;
					}
					roomline += "</div></div>";
					wkroom.unshift(roomline);

					//builds count
					if(wklist[9] == sessionStorage.USERID && Number(roomsts) <= 2 && sessionStorage.USERTYPE == "0"){
						roombuilds += 1;
					}
				}
			}
		}
		$("#DIVLIST").html(wkroom.join(""));
		break;
	case "RANK":
		var rank = 0;
		var rate = 0;
		var rankitem = [];
		var wkrecv = recvcmd.shift();
		//ソート
		recvcmd.sort();
		recvcmd = recvcmd.reverse();
		//html
		var html = "<table>";
		html += "<tr style='background-color:#ddddee;'><td width='50'>Rank</td><td width='80'>Rate</td><td>Name</td><td width='50'></td></tr>";
		while(wkrecv = recvcmd.shift()){
			if(rank == 5){
				break;
			}
			rankitem = wkrecv.split(":");
			if(rate != rankitem[0]){
				rank++;
			}
			html += "<tr style='background-color:#eeeeee;'><td>"+rank+"</td><td>"+rankitem[0]+"</td><td align='left'>"+rankitem[2]+"</td><td>"+rankitem[1]+"</td></tr>";
		}
		html += "</table>";
		html += "<br><button onclick=\"ResultDisp('')\" class='base glay'>閉じる</button>";
		$("#DIVRESULT").html(html);
		$("#DIVRESULT_BACK").css({display:"block"});
		break;
	case "KILL":
		roomlistlock = 0;
		NetSend('LIST');
		break;
	case "ERROR":
		switch(recvcmd[1]){
		case "ENTRY":
			AlertPop("IDが既に使用されていました。");
			break;
		case "LOGIN":
		case "LOGIN2":
			AlertPop("IDまたはパスワードが間違っています。");
			break;
		default:
			AlertPop("ERROR:" + recvcmd[1]);
			break;
		}
	}
}
//ボード移動
function JumpBoard(){
	if(sessionStorage.iPhone != "Y"){
		window.location.href = "board.htm";
	}else{
		localStorage.Ob_Temp_USERID = sessionStorage.USERID;
		localStorage.Ob_Temp_USERNAME  = sessionStorage.USERNAME;
		localStorage.Ob_Temp_USERTYPE  = sessionStorage.USERTYPE;
		localStorage.Ob_Temp_USERRATE  = sessionStorage.USERRATE;
		localStorage.Ob_Temp_USERRATE2 = sessionStorage.USERRATE2;
		localStorage.Ob_Temp_RoomID = sessionStorage.RoomID;
		localStorage.Ob_Temp_iPhone = sessionStorage.iPhone;
		localStorage.Ob_Temp_Mode = sessionStorage.Mode;
		localStorage.Ob_Temp_Online = sessionStorage.Online;
		window.open("board_i.htm", "_blank");
	}
}
//ダイアログ表示
function ResultDisp(){
	var arg = arguments;
	if(arg[0] == ""){
		$("#DIVRESULT_BACK").css({display:"none"});
	}else{
		var order = arg[0];
		for(var i = Number(arg[1]) + 1; i<=4; i++){
			order = order.replace(String(i), "");
		}
		var names = arg[2].split("{}");
		var tmp, joinno, result = [];
		var resultarr = arg[3].split("{}");
		resultarr.pop();
		for(var i=0; i<resultarr.length; i++){
			tmp = resultarr[i].split("()");
			result.push({pno:tmp[0], rank:Number(tmp[1]), gold:tmp[2]});
		}
		var html = "<table>";
		html += "<tr style='background-color:#ddddee;'><td width='50'>Rank</td><td width='180'>Name</td><td>G</td></tr>";
		for(var irank=1; irank<=4; irank++){
			for(var i=0; i<result.length; i++){
				if(irank == result[i].rank){
					tmp = (irank == 1) ? "Winner" : irank;
					joinno = order.indexOf(result[i].pno);
					html += "<tr style='background-color:#eeeeee;'><td>"+tmp+"</td><td align='left'>"+names[joinno]+"</td><td align='right'>"+result[i].gold+" G</td></tr>";
				}
			}
		}
		html += "</table>";
		html += "<br><button onclick=\"ResultDisp('')\" class='base glay'>閉じる</button>";
		$("#DIVRESULT").html(html);
		$("#DIVRESULT_BACK").css({display:"block"});
	}
}
function OpenIcons(){
	$("#div_icons").css("display","block");
}
function ChangeIcon(iconno){
	var pars = "LOGCMD=UPDATE&USERID=" + sessionStorage.USERID + "&PIECE=piece" + iconno;
	$.ajax({url:'perl/oclogin.cgi', data:pars, timeout:5000, success:function(recvstr){AlertPop("変更しました");}});
	$("#div_icons").css("display","none");
}
function Tweet(){
	var comment;
	if(comment = prompt("@Openboardがツイートします(コメントをどうぞ)","")){
		var pars = {NAME:sessionStorage.USERNAME, HHMM:comment};
		//Ajax
		$.ajax({url:"perl/octwitter.cgi", data:pars, timeout:5000, success:function(recvstr){AlertPop("Tweetしました");}});
	}
}
//##############################################
function MapDisp(){
	//マップデータ
	var Mapno = Number($("#MAPNO").val());
	MapWrite({mapno:Mapno, cvs:"CVS_MAP", zoom:0.25});
}
function MapDisp2(mapno){
	MapWrite({mapno:mapno, cvs:"CVS_MAP2", zoom:0.5, detail:true});
}
function MapWrite(arg){
	//マップデータ
	var Mapdata = MapDataSet(arg.mapno);
	var Mapinfo = Mapdata[0].split(":");
	Board.dice = Number(Mapinfo[1]);
	Board.flag = Mapinfo[2];
	Board.bonus = Number(Mapinfo[3]);
	Board.bonus_f = Number(Mapinfo[4]);
	Board.grid = [];
	for(i in Mapdata){
		if(Mapdata[i].match(/^[0-9]+:/)){
			var Mapgrid = Mapdata[i].split(":");
			var gno = Number(Mapgrid[0]);
			Board.grid[gno] = new clsGrid();
			Board.grid[gno].color = Number(Mapgrid[1]);
			Board.grid[gno].top   = Number(Mapgrid[2]);
			Board.grid[gno].left  = Number(Mapgrid[3]);
			Board.grid[gno].gold  = Number(Mapgrid[9]);
		}
	}
	//詳細
	if(arg.detail){
		var html = "<table>";
		html += "<tr><td>Name</td><td>"+Mapinfo[0]+"</td></tr>";
		html += "<tr><td>Dice</td><td>"+Mapinfo[1]+"</td></tr>";
		html += "<tr><td>Fort</td><td>"+Mapinfo[2]+"</td></tr>";
		html += "<tr><td>Bonus</td><td>"+Mapinfo[3]+"G</td></tr>";
		html += "<tr><td></td><td>"+Mapinfo[4]+"G</td></tr>";
		html += "</table>";
		$("#DIV_MAPDETAIL").html(html);
	}
	//グリッド生成
	Canvas.clear({id:arg.cvs});
	for(var i in Board.grid){
		if(Board.grid[i].color != 0){
			var wkimgid, wkicon, wkcomposite;
			if(Board.grid[i].color >= 10 && Board.grid[i].color <= 14){
				wkicon = "GICON"+Board.grid[i].color;
				wkimgid = "GRID0";
			}else if(Board.grid[i].color == 21){
				wkicon = ""
				wkimgid = "GRIDT";
			}else if(Board.grid[i].color == 22 || Board.grid[i].color == 23){
				wkicon = "GICON"+Board.grid[i].color;
				wkimgid = "GRID0";
			}else if(Board.grid[i].color == 24){
				wkicon = ""
				wkimgid = "GRIDF";
			}else{
				wkicon = "";
				wkimgid = "GRID"+Board.grid[i].color;
			}
			//CANVAS
			var pos = {x:Number(Board.grid[i].left) * arg.zoom, y:Number(Board.grid[i].top) * arg.zoom};
			Canvas.draw({id:arg.cvs, src:Canvas.srcs[wkimgid], x:pos.x, y:pos.y, zoom:arg.zoom, composite:"destination-over"});
			if(wkicon != ""){
				Canvas.draw({id:arg.cvs, src:Canvas.srcs[wkicon], x:pos.x, y:pos.y - (24 * arg.zoom), zoom:arg.zoom, composite:"source-over"});
			}
		}
	}
}
//
function initMap(){
	Canvas.srcs["GICON10"] = "imgsrc/gicon_cas.gif";
	Canvas.srcs["GICON11"] = "imgsrc/gicon_n.gif";
	Canvas.srcs["GICON12"] = "imgsrc/gicon_s.gif";
	Canvas.srcs["GICON13"] = "imgsrc/gicon_w.gif";
	Canvas.srcs["GICON14"] = "imgsrc/gicon_e.gif";
	Canvas.srcs["GICON22"] = "imgsrc/gicon_brd.gif";
	Canvas.srcs["GICON23"] = "imgsrc/gicon_alt.gif";
	Canvas.srcs["GRID0"] = "imgsrc/grid0.gif";
	Canvas.srcs["GRID1"] = "imgsrc/grid1.gif";
	Canvas.srcs["GRID2"] = "imgsrc/grid2.gif";
	Canvas.srcs["GRID3"] = "imgsrc/grid3.gif";
	Canvas.srcs["GRID4"] = "imgsrc/grid4.gif";
	Canvas.srcs["GRID5"] = "imgsrc/grid5.gif";
	Canvas.srcs["GRIDT"] = "imgsrc/gicon_tele.gif";
	Canvas.srcs["GRIDF"] = "imgsrc/gicon_drop.gif";
}
//############################################################
function BookDisplay(){
	var html = "";
	var type, typebak, listcol;
	var listno = 0;
	var x = 0;
	var y = 10;
	listdata.sort();
	if(listdata.length > 0){
		typebak = "C1";
		for(var i=0; i<listdata.length; i++){
			listno++;
			listcol = listdata[i].split(",");
			type = Card[listcol[3]].ctype + Card[listcol[3]].color;
			if(typebak != type){
				if(listno % 2 == 0){
					y += 140;
					listno = 1;
				}
				typebak = type;
			}
			x = (listno % 2 == 1) ? 14 : 406;
			html = BookListItem({cno:listcol[3], x:x ,y:y});
			$("#DIV_CARDBOOKLIST").append(html);
			if(listno % 2 == 0){
				y += 142;
				listno = 0;
			}
		}
	}
}
function BookListItem(arg){
	//detail
	var frasrc = {C1:"frame_glay",C2:"frame_red",C3:"frame_blue",C4:"frame_green",C5:"frame_yellow",I0:"frame_item",S0:"frame_spell"}
	var frano = Card[arg.cno].ctype + Card[arg.cno].color;
	var imgtype = (Card[arg.cno].imgsrc.match(/.png$/)) ? "" : ".gif";
	var html = "<div class='item_frame' style='top:"+arg.y+"px; left:"+arg.x+"px;'>";

	html += "<div class='item_back'>";
	html += "<div class='item_cardb'><imgsrc src='imgsrc/card/"+Card[arg.cno].imgsrc+imgtype+"' width='100' height='130'></div>";
	html += "<div class='item_cardf'><imgsrc src='imgsrc/card/"+frasrc[frano]+".gif' width='100' height='130'></div>";
	if(Flavor[arg.cno]){
		html += "<div class='item_flavor'>"+Flavor[arg.cno]+"</div>";
	}
	html += "</div>";

	html += "<div class='item_info'>";
	switch(Card[arg.cno].ctype){
	case "C":
		var colorno = {N:1, F:2, W:3, E:4, D:5};
		var imgname = ["", "mark_n", "mark_r", "mark_b", "mark_g", "mark_y"];
		var itemimg = {"W":"iconweapon", "I":"iconitem"};
		var img = "<imgsrc src='imgsrc/"+imgname[Card[arg.cno].color]+".gif' height='26' width='26'>";
		html += "<div class='book_frame_r0'>"+img+"</div><div class='book_frame_r1'>"+Card[arg.cno].name+"</div>";
		html += "<div class='book_frame_r2'>";
		html += "<imgsrc src='imgsrc/infog.gif' height='12' width='11'><span class='book_g'>"+Card[arg.cno].cost;
		for(var i=0; i<Card[arg.cno].plus.length; i++){
			html += " <imgsrc src='imgsrc/"+imgname[colorno[Card[arg.cno].plus.substr(i, 1)]]+".gif' height='13' width='13'>";
		}
		html += "</span>";
		html += "<imgsrc src='imgsrc/infost.gif' height='12' width='11'><span class='book_st'>"+Card[arg.cno].st+"</span> ";
		html += "<imgsrc src='imgsrc/infohp.gif' height='12' width='11'><span class='book_hp'>"+Card[arg.cno].lf+"</span></div>";
		if(Card[arg.cno].item != "" || Card[arg.cno].walk != ""){
			html += "<div class='book_frame_r3'>不可";
			for(var i2=0; i2<=1; i2++){
				if(Card[arg.cno].item.match(["W", "I"][i2])){
					html += "<imgsrc src='imgsrc/x_"+["weapon","item"][i2]+".gif' height='13' width='13'>";
				}
			}
			for(var i2=0; i2<=6; i2++){
				if(Card[arg.cno].walk.match(["N", "F", "W", "E", "D", "T", "I"][i2])){
					html += "<imgsrc src='imgsrc/x_"+["newtral", "fire", "water", "earth", "wind", "walk", "invasion"][i2]+".gif' height='13' width='13' title='"+["無属性侵入", "火属性侵入", "水属性侵入", "地属性侵入", "風属性侵入", "領地移動", "侵略召喚"][i2]+"不可'>";
				}
			}
			html += "</div>";
		}
		if(Card[arg.cno].comment){
			html += "<div class='book_frame_r4'>"+WordReplace(Card[arg.cno].comment)+"</div>";
		}
		break;
	case "I":
		var imgname = {"W":"iconweapon", "I":"iconitem"};
		var img = "<imgsrc src='imgsrc/"+imgname[Card[arg.cno].item]+".gif' height='26' width='26'>";
		html += "<div class='book_frame_r0'>"+img+"</div><div class='book_frame_r1'>"+Card[arg.cno].name+"</div>";
		html += "<div class='book_frame_r2'><imgsrc src='imgsrc/infog.gif' height='12' width='11'><span class='book_g'>"+Card[arg.cno].cost+"</span></div>";
		html += "<div class='book_frame_r4'>"+WordReplace(Card[arg.cno].comment)+"</div>";
		break;
	case "S":
		var img = "<IMG src='imgsrc/iconspell.gif' height='26' width='26'>";
		html += "<div class='book_frame_r0'>"+img+"</div><div class='book_frame_r1'>"+Card[arg.cno].name+"</div>";
		html += "<div class='book_frame_r2'><imgsrc src='imgsrc/infog.gif' height='12' width='11'><span class='book_g'>"+Card[arg.cno].cost+"</span></div>";
		html += "<div class='book_frame_r4'>"+WordReplace(Card[arg.cno].comment)+"</div>";
		break;
	}
	html += "</div>";

	html += "</div>";
	return html;
}
//
function WordReplace(msg){
	var retmsg = msg;
	for(i in Word){
		retmsg = retmsg.replace(Word[i][0], "<a href='javascript:WordDisp(\""+Word[i][0]+"\")'>"+Word[i][0]+"</a>", 'g');
	}
	return retmsg;
}
//ダイアログ表示
function WordDisp(word){
	if(word == ""){
		$("#DIV_DIALOG_BACK").css({display:"none"});
	}else{
		var html = "<div class='dialog_head'>"+word+"</div>";
		html += "<div class='dialog_detail'>"+WordDic(word)+"</div>";
		html += "<br><button onclick=\"WordDisp('')\" class='base glay'>閉じる</button>";
		$("#DIV_DIALOG").html(html);
		$("#DIV_DIALOG_BACK").css({display:"block"});
	}
}