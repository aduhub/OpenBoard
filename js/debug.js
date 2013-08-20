var ping_cooldown = 0;
function DebugNetPing(){
	//if(confirm("送信要求をだします:"+obNet.logno)){
		if(ping_cooldown == 0){
			Net.getCGI("");
			ping_cooldown = 1;
			setTimeout(function(){ping_cooldown = 0}, 3000);
		}
	//}
}
//
function DebugHandDisp(i_pno){
	if(sessionStorage.Mode == "debug" && sessionStorage.iPhone == "N"){
		var handwork = Player[i_pno].hand.split(":");
		handwork.sort();
		for(var ihno=1; ihno<=7; ihno++){
			if(handwork[ihno - 1] != undefined && handwork[ihno - 1] != ""){
				CardImgSet({cvs:"CVS_DH"+i_pno+ihno, cno:handwork[ihno - 1], zoom:0.25});
			}else{
				Canvas.clear({id:"CVS_DH"+i_pno+ihno});
			}
		}
	}
}
function DebugFront(){
	if(sessionStorage.USERTYPE == "1" && sessionStorage.Mode == "replay" && sessionStorage.iPhone != "Y"){
		var html = Board.round + "R P" + Board.turn + " [" + Board.step+"]<br>";
		for(var i=1; i<=Board.playcnt; i++){
			html += "P"+i+".hand : "+Player[i].hand+"<br>";
		}
		for(var i=1; i<=Board.playcnt; i++){
			html += "P"+i+".deck : ("+Player[i].DeckCount()+")"+Player[i].deck.substr(0, 20)+"...<br>";
		}
		for(var i=1; i<=Board.playcnt; i++){
			html += "P"+i+".stand/shadow : "+Player[i].stand+"/"+Player[i].shadow+"<br>";
		}
		$("#debugfront").html(html);
	}
}

//Grid Setting
function DebugGridInfo(i_gno){
	var panels = "";
	var optstr = "";
	if(sessionStorage.Mode == "debug"){
		if(i_gno == 0){
			Board.step = 20;
			DisplaySet('DIV_INFOGRID', 0);
		}else{
			Board.step = 51;
			var carddat = CardDataSet();
			var listdata = [];
			//配列設定
			for(i in carddat){
				//add
				listdata.push(carddat[i].id);
			}
			listdata.sort();
			//
			if(Board.grid[i_gno].color <= 5){
				//Owner
				optstr = "<option value='0'>なし</option>";
				for(var i=1; i<=4; i++){
					optstr += "<option value='"+i+"'>プレイヤー"+i+"</option>";
				}
				panels += Infoblock.line({m:["Ow", "<select id='DEBUG_OWNER'>"+optstr+"</select>"], w:[30, 150]});
				//Level
				optstr = "";
				for(var i=1; i<=5; i++){
					optstr += "<option value='"+i+"'>レベル"+i+"</option>";
				}
				panels += Infoblock.line({m:["Lv", "<select id='DEBUG_LEVEL'>"+optstr+"</select>"], w:[30, 150]});
				optstr = "";
				//Color
				var colorlist = ["無属性","火属性","水属性","地属性","風属性"];
				optstr = "";
				for(var i=1; i<=colorlist.length; i++){
					optstr += "<option value='"+i+"'>"+colorlist[i-1]+"</option>";
				}
				panels += Infoblock.line({m:["El", "<select id='DEBUG_COLOR'>"+optstr+"</select>"], w:[30, 150]});
				//Creature
				optstr = "";
				for(var i=0; i<listdata.length; i++){
					var clrno = Card[listdata[i]].type;
					if(clrno == "C"){
						optstr += "<option value='"+listdata[i]+"'>"+Card[listdata[i]].name+"</option>";
					}
				}
				panels += Infoblock.line({m:["Cd", "<select id='DEBUG_CARD'>"+optstr+"</select>"], w:[30, 150]});
				//status
				var stslist = ["","_POISON_","_PROTECT_","_JAIL_","_CONTRACT_","_RECONSTRUCT_","_GRAVITY_","_SPIRITWALK_"];
				optstr = "";
				for(var i=0; i<stslist.length; i++){
					optstr += "<option value='"+stslist[i]+"'>"+Dic(stslist[i])+"</option>";
				}
				panels += Infoblock.line({m:["St", "<select id='DEBUG_STATUS'>"+optstr+"</select>"], w:[30, 150]});
				//Button
				panels += Infoblock.line({m:"設定", b:"onclick='DebugGridSetup("+i_gno+")'"});
				panels += Infoblock.line({m:"キャンセル", b:"onclick='DebugGridInfo(0)'"});
				//innerHTML
				$("#DIV_INFOGRID").html(panels);
				//
				DisplaySet("DIV_INFOGRID", 50);
			}
		}
	}
}
function DebugGridSetup(i_gno){
	Board.grid[i_gno].owner = Number($("#DEBUG_OWNER").val());
	Board.grid[i_gno].level = Number($("#DEBUG_LEVEL").val());
	Board.grid[i_gno].color = Number($("#DEBUG_COLOR").val());
	Board.grid[i_gno].cno = $("#DEBUG_CARD").val();
	Board.grid[i_gno].st = Card[Board.grid[i_gno].cno].st;
	Board.grid[i_gno].lf = Card[Board.grid[i_gno].cno].lf;
	Board.grid[i_gno].maxlf = Card[Board.grid[i_gno].cno].lf;
	Board.grid[i_gno].status = $("#DEBUG_STATUS").val();
	Board.grid[i_gno].statime = 99;
	//再表示
	DispPlayer();
	GridSetImage(i_gno);
	GridSetTax(i_gno)
	if(Board.grid[i_gno].owner == 0){
		$("#DIV_GICON"+i_gno).css({display:"none", backgroundImage: ""});
	}else{
		$("#DIV_GICON"+i_gno).css({display:"block", backgroundImage: "url(img/icon/"+Card[Board.grid[i_gno].cno].imgsrc.replace(".png", "")+".gif)"});
	}
	for(var i=1; i<=4; i++){
		GridSetPlayerTax(i);
	}
	Board.step = 20;
	DisplaySet('DIV_INFOGRID', 0);
}
//========[ Chat ]========
function ChatSend(){
	var wkcmd;
	var msg = $.trim($("#chatcomment").val());
	$("#chatcomment").val("");
	if(msg != ""){
		if(sessionStorage.Mode != "debug"){
            if(msg == "ping"){
                DebugNetPing();
            }else{
                var hash = CryptoJS.SHA1(msg).toString();
                var message = {"pno":Board.role, "cmd":"chat", "msg":sessionStorage.USERNAME+"{}"+msg, "hash":hash}
                // pubnub send
                Net.pubnub_send(message);
            }
		}
	}
	$("#chatcomment").focus();
}
