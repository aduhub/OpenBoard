//===================================
// filename : deckedit.js
// update   : 2010-10-18 adu
//===================================
var initdeckdisp = true;
var seldeckid = "";
var seldecknm = "";
var classno = "0";
var deckdata = [];
var listdata = [];
var palet = {"C1":"DDDDDD","C2":"FFCCCC","C3":"CCCCFF","C4":"CCFFCC","C5":"FFFFCC","I":"EEEEEE","S":"EEDDFF"};
var btns = {C1:1,C2:1,C3:1,C4:1,C5:1,I:1,S:1};

// ######[ リスト ]######
function DeckList(){
	//DECK LIST READ
	var pars = "DECKCMD=LIST&USERID="+sessionStorage.USERID;
	$.ajax({url:'perl/ocdeck.cgi', data:pars, timeout:5000, success:onDeckList, error:function(){setTimeout(DeckList, 2000)}});
}
//リスト取得値セット
function onDeckList(recvstr){
	var recvcmd = recvstr.split(",");
	$("#SEL_DECKLIST button").remove();
	if (recvcmd[0] != "0"){
		for(var i=1; i<=Number(recvcmd[0]); i++){
			var wkdeck = recvcmd[i].split(":");
			var wkarr, csscls, deckname;
			if(wkdeck[1].match(/\([0-9]+\)$/)){
				wkarr = wkdeck[1].match(/^(.*)\(([0-9]+)\)$/);
				deckname = wkarr[1];
				csscls = "class='DeckColor" + wkarr[2] + "'";
			}else{
				deckname = wkdeck[1];
				csscls = "";
			}
			var button = "<button onclick='DeckSelect(\"" + recvcmd[i] + "\")' oncontextmenu='DeckView(\"" + recvcmd[i] + "\");return false;' id='BTN_DECK"+wkdeck[0]+"' "+csscls+">" + deckname + "</button>";
			$("#SEL_DECKLIST").append(button);
		}
		//Clear
		DeckClear();
		//Displayed
		initdeckdisp = false;
	}
}
// ######[ 登録 ]######
function DeckEntry(){
	var deckstr = "", additem, addlist = [];
	if(deckdata.length != 50){
		AlertPop("50枚選択してください。");
	}else{
		var decknm = $.trim($("#DECKNAME").val());
		if($.trim(decknm) == ""){
			AlertPop("デッキ名を入力してください。");
			return;
		}
		var clsno = $("#DECKCOLOR").val();
		if(clsno != "0"){
			decknm += "("+clsno+")";
		}
		for(var i=0; i<50; i++){
			additem = deckdata[i].split(",");
			addlist.push(additem[3]);
		}
		deckstr = addlist.join(":");
		//DECK LIST READ
		var pars = "DECKCMD=ENTRY&USERID="+sessionStorage.USERID+"&AUTHER="+sessionStorage.USERNAME+"&DECKNAME="+decknm+"&DECKDATA="+deckstr;
		$.ajax({url:'perl/ocdeck.cgi', data:pars, timeout:5000, success:onDeckEntry, error:function(){alert("Error")}});
	}
}
//
function onDeckEntry(recvstr){
	var recvcmd = recvstr.split(",");
	if(seldeckid == ""){
		DeckList();
		AlertPop("保存しました。");
	}else{
		if(confirm("保存しました。\n変更前の「"+seldecknm+"」を削除しますか？")){
			//DECK LIST READ
			var pars = "DECKCMD=DELETE&USERID="+sessionStorage.USERID+"&DECKID="+seldeckid;
			$.ajax({url:'perl/ocdeck.cgi', data:pars, timeout:5000, success:onDeckDelete, error:function(){alert("Error")}});
		}else{
			DeckList();
		}
	}
}
// ######[ 削除 ]######
function DeckDelete(){
	if(seldeckid != ""){
		if(confirm("「"+seldecknm+"」を削除しますか？")){
			//DECK LIST READ
			var pars = "DECKCMD=DELETE&USERID="+sessionStorage.USERID+"&DECKID="+seldeckid;
			$.ajax({url:'perl/ocdeck.cgi', data:pars, timeout:5000, success:onDeckDelete, error:function(){alert("Error")}});
		}
	}
}
//
function onDeckDelete(recvstr){
	var recvcmd = recvstr.split(",");
	DeckList();
	AlertPop("削除しました");
}
// ######[ インポート ]######
function DeckImport(){
	var deckno;
	if(deckno = prompt("デッキIDを入力してください", "")){
		if(!deckno.match(/^DT[0-9]{4}$/)){
			return;
		}
		//DECK LIST READ
		var pars = "DECKCMD=IMPORT&USERID="+sessionStorage.USERID+"&DECKID="+deckno;
		$.ajax({url:'perl/ocdeck.cgi', data:pars, timeout:5000, success:onDeckImport, error:function(){alert("Error")}});
	}
}
//
function onDeckImport(recvstr){
	var recvcmd = recvstr.split(",");
	DeckList();
	AlertPop("保存しました。");
}
//----------------------------------------------------
//DECKデータ表示
function DeckSelect(deckstr){
	var additem;
	if(deckstr != null){
		if(seldeckid != ""){
			$("#BTN_DECK"+seldeckid).css("backgroundColor", "");
		}
		//Set
		deckdata = [];
		var deckdat = deckstr.split(":");
		seldeckid = deckdat.shift();
		seldecknm = deckdat.shift();
		if(seldecknm.match(/\([0-9]+\)$/)){
			seldecknm = seldecknm.match(/^(.*)\([0-9]+\)$/)[1];
		}
		$("#BTN_DECK"+seldeckid).css("backgroundColor", "#999999");
		$("#DECKID").val(seldeckid);
		$("#DECKNAME").val(seldecknm);
		for(var i=0; i<deckdat.length; i++){
			additem = [Card[deckdat[i]].ctype, Card[deckdat[i]].color, Card[deckdat[i]].name, deckdat[i]].join(",");
			deckdata.push(additem);
		}
		DeckDisplay();
	}
}
//
function DeckDisplay(){
	var cardcnt = {"C":0, "I":0, "S":0, "ALL":0};
	deckdata.sort();
	//Clear
	$("#SEL_DECKSET button").remove();
	if(deckdata.length > 0){
		for(var i=0; i<deckdata.length; i++){
			var listcol = deckdata[i].split(",");
			var clrno = Card[listcol[3]].ctype;
			if(clrno == "C") clrno += Card[listcol[3]].color;
			var button = "<button onclick=\"delList('"+listcol[3]+"')\" oncontextmenu='CardInfo(\""+listcol[3]+"\");return false;' style='background-color:#"+palet[clrno]+";'>" + Card[listcol[3]].name + "</button>";
			$("#SEL_DECKSET").append(button);
			cardcnt[Card[listcol[3]].ctype]++;
			cardcnt["ALL"]++;
		}
	}
	var cntstr = "("+cardcnt["C"]+"-"+cardcnt["I"]+"-"+cardcnt["S"]+")"+cardcnt["ALL"];
	$("#DECKCOUNT").val(cntstr)
}
//
function DeckClear(){
	if(seldeckid != ""){
		$("#BTN_DECK"+seldeckid).css("backgroundColor", "");
	}
	seldeckid = "";
	seldecknm = "";
	deckdata = [];
	$("#DECKID").val("");
	$("#DECKNAME").val("");
	DeckDisplay();
}
//
function addList(cno){
	var additem;
	if(deckdata.length < 50){
		var cnt = 0;
		additem = [Card[cno].ctype, Card[cno].color, Card[cno].name, cno].join(",");
		if(deckdata.length >= 1){
			for(var i=0; i<deckdata.length; i++){
				if(deckdata[i] == additem){
					cnt++;	
				}
			}
		}
		if(cnt <= 3){
			deckdata.push(additem);
			DeckDisplay();
		}
	}
}
function delList(cno){
	var delitem = [Card[cno].ctype, Card[cno].color, Card[cno].name, cno].join(",");
	var idx = $.inArray(delitem, deckdata);
	deckdata = $.grep(deckdata, function(v, i){return i != idx;});
	DeckDisplay();
}
//----------------------------------------------------
//Cardlist表示選択
function ListSelectBtn(btnno){
	if(btns[btnno] == 0){
		$("#SELBTN"+btnno).css("opacity", 1.0)
		btns[btnno] = 1;
	}else{
		$("#SELBTN"+btnno).css("opacity", 0.4)
		btns[btnno] = 0;
	}
	ListDisplay();
}
//Cardlist表示
function ListDisplay(){
	listdata.sort();
	//Clear
	$("#SEL_CARDLIST button").remove();
	if(listdata.length > 0){
		for(var i=0; i<listdata.length; i++){
			var listcol = listdata[i].split(",");
			var clrno = Card[listcol[3]].ctype;
			if(clrno == "C") clrno += Card[listcol[3]].color;
			if(btns[clrno] == 1){
				var button = "<button onclick=\"addList('"+listcol[3]+"')\" oncontextmenu='CardInfo(\""+listcol[3]+"\");return false;' style='background-color:#"+palet[clrno]+";'>" + Card[listcol[3]].name + "</button>";
				$("#SEL_CARDLIST").append(button);
			}
		}
	}
}
//
function DeckColorChange(){
	$("#DECKCOLOR").removeClass("DeckColor"+classno);
	classno = $("#DECKCOLOR").val();
	$("#DECKCOLOR").addClass("DeckColor"+classno);
}
//====================================================
function DeckView(deckstr){
	if(deckstr != null){
		if(deckstr == "CLOSE"){
			$("#DECKVIEW").css("display", "none");
		}else{
			//Set
			var x, y, frameid, tmp, imgtype, imgsrc;
			var deckdat = deckstr.split(":");
			tmp = deckdat.shift(); //id
			tmp = deckdat.shift(); //name
			//clear
			Canvas.clear({id:"CVSDECKVIEW"});
			//draw
			for(var i=0; i<deckdat.length; i++){
				var imgtype = (Card[deckdat[i]].imgsrc.match(/.png$/)) ? "" : ".gif";
				var imgsrc = "imgsrc/card/"+Card[deckdat[i]].imgsrc+imgtype;
				frameid = "CARDFRAME"+Card[deckdat[i]].ctype;
				frameid += (Card[deckdat[i]].ctype == "C") ? Card[deckdat[i]].color : "";
				x = 54 * (i % 10);
				y = 79 * Math.floor(i / 10);
				Canvas.draw({id:"CVSDECKVIEW", src:[imgsrc, Canvas.srcs[frameid]], x:x, y:y, zoom:0.25});
			}
			$("#DECKVIEW").css("display", "block");
		}
	}
}
//====================================================
function CardInfo(cno){
	if(cno == ""){
		$("#CARDINFO").css("display", "none");
	}else{
		//image set
		CardImgSet("CVS_CARDINFO", cno);
		//ifomation set
		CardInfoSet({tgt:"#CARDINFO_RIGHT", cno:cno});
		//display
		$("#CARDINFO").css("display", "block");
	}
}
//
function CardInfoSet(arg){
	if(arg.cno != ""){
		//detail
		var infoarg = [];
		infoarg.push({type:"width", px:190});
		switch(Card[arg.cno].ctype){
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
			//infoarg.push({ctype:"sptarget", target:Card[cno].target});
			infoarg.push({type:"comment", comment:Card[arg.cno].comment});
			break;
		}
		$(arg.tgt).html(Infoblock.block(infoarg));
	}
}
//###################################################################
function CardImgSet(cvsid, cno){
	var frameid = "CARDFRAME"+Card[cno].ctype;
	frameid += (Card[cno].ctype == "C") ? Card[cno].color : ""
	var imgtype = (Card[cno].imgsrc.match(/.png$/)) ? "" : ".gif";
	var imgsrc = "imgsrc/card/"+Card[cno].imgsrc+imgtype;
	Canvas.draw({id:cvsid, src:[imgsrc, Canvas.srcs[frameid]]});
}
//初期設定 [card.js]
function initEditor(){
	var sortkey;
	var cd = CardDataSet();
	//配列設定
	for(i in cd){
		Card[cd[i].id] = new clsCard();
		Card[cd[i].id].ctype = cd[i].ctype;
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
		Card[cd[i].id].imgsrc = (cd[i].imgsrc) ? cd[i].imgsrc : "";
		Card[cd[i].id].artist = (cd[i].art) ? cd[i].art : "";
		Card[cd[i].id].comment = (cd[i].com) ? cd[i].com : "";
		//add
		sortkey = [Card[cd[i].id].ctype, Card[cd[i].id].color, Card[cd[i].id].name, cd[i].id].join(",");
		listdata.push(sortkey);
	}
	//Image Load
	Canvas.srcs["CARDFRAMEC1"] = "imgsrc/card/frame_glay.gif";
	Canvas.srcs["CARDFRAMEC2"] = "imgsrc/card/frame_red.gif";
	Canvas.srcs["CARDFRAMEC3"] = "imgsrc/card/frame_blue.gif";
	Canvas.srcs["CARDFRAMEC4"] = "imgsrc/card/frame_green.gif";
	Canvas.srcs["CARDFRAMEC5"] = "imgsrc/card/frame_yellow.gif";
	Canvas.srcs["CARDFRAMEI"] = "imgsrc/card/frame_item.gif";
	Canvas.srcs["CARDFRAMES"] = "imgsrc/card/frame_spell.gif";
}
