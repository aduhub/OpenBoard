var Infoblock = {
	_obj:null,
	_width:0,
	_height:0,
	block:function(arg){
		var imgtag, imgtag2;
		var html = "";
		var colorno = {N:1, F:2, W:3, E:4, D:5};
		var colorimg = ["", "mark_n", "mark_r", "mark_b", "mark_g", "mark_y"];
		var itemimg = {"W":"iconweapon", "I":"iconitem"};
		for(var i=0; i<arg.length; i++){
			switch(arg[i].ctype){
			case "width":
				Infoblock._width = arg[i].px;
				break;
			case "gridhead": //[180px]
				imgtag = "<imgsrc src='imgsrc/"+colorimg[arg[i].color]+".gif' height='26' width='26'>";
				html += Infoblock.line({m:["基本", imgtag, "レベル"+arg[i].level], w:[56, 30, 94]});
				break;
			case "gridvalue": //[180px]
				html += Infoblock.line({m:["価値", arg[i].gold+"G", ""], w:[56, 120, 4], ta:["","r",""]});
				break;
			case "clname":
				imgtag = "<imgsrc src='imgsrc/"+colorimg[arg[i].color]+".gif' height='26' width='26'>";
				html += Infoblock.line({m:[imgtag, arg[i].name], w:[28, Infoblock._width - 28]});
				break;
			case "itname":
				imgtag = "<imgsrc src='imgsrc/"+itemimg[arg[i].item]+".gif' height='26' width='26'>";
				html += Infoblock.line({m:[imgtag, arg[i].name], w:[28, Infoblock._width - 28]});
				break;
			case "spname":
				imgtag = "<imgsrc src='imgsrc/iconspell.gif' height='26' width='26'>";
				html += Infoblock.line({m:[imgtag, arg[i].name], w:[28, Infoblock._width - 28]});
				break;
			case "cost":
				imgtag = "<imgsrc src='imgsrc/infog.gif' height='20' width='11' style='margin-top:3px;'>";
				imgtag2 = "";
				for(var i2=0; i2<arg[i].plus.length; i2++){
					imgtag2 += "<imgsrc src='imgsrc/"+colorimg[colorno[arg[i].plus.substr(i2, 1)]]+".gif' height='26' width='26'>";
				}
				html += Infoblock.line({m:[imgtag, arg[i].cost, imgtag2], w:[14, 42, Infoblock._width - 66],  ta:["","r",""]});
				break;
			case "clsthp":
				imgtag = "<imgsrc src='imgsrc/infost.gif' height='20' width='11' style='margin-top:3px;'>";
				imgtag2 = "<imgsrc src='imgsrc/infohp.gif' height='20' width='11' style='margin-top:3px;'>";
				if(arg[i].mhp){
					html += Infoblock.line({m:[imgtag, arg[i].st, imgtag2, arg[i].hp+"/"+arg[i].mhp], w:[14, 42, 14, Infoblock._width - 70]});
				}else{
					html += Infoblock.line({m:[imgtag, arg[i].st, imgtag2, arg[i].hp], w:[14, 42, 14, Infoblock._width - 70]});
				}
				break;
			case "clitem":
				imgtag = "";
				for(var i2=0; i2<=1; i2++){
					if(arg[i].item.match(["W", "I"][i2])){
						imgtag += "<imgsrc src='imgsrc/x_"+["weapon","item"][i2]+".gif' height='26' width='26' title='"+["武具","道具"][i2]+"使用不可'>";
					}
				}
				for(var i2=0; i2<=6; i2++){
					if(arg[i].walk.match(["N", "F", "W", "E", "D", "T", "I"][i2])){
						imgtag += "<imgsrc src='imgsrc/x_"+["newtral", "fire", "water", "earth", "wind", "walk", "invasion"][i2]+".gif' height='26' width='26' title='"+["無属性侵入", "火属性侵入", "水属性侵入", "地属性侵入", "風属性侵入", "領地移動", "侵略召喚"][i2]+"不可'>";
					}
				}
				html += Infoblock.line({m:["不可", imgtag], w:[50, Infoblock._width - 50]});
				break;
			case "sptarget":
				var tgtstr;
				tgtstr = arg[i].target.substr(0, 3);
				tgtstr = tgtstr.replace("T", "対象・");
				tgtstr = tgtstr.replace("A", "全体・");
				tgtstr = tgtstr.replace("M", "自分・");
				tgtstr = tgtstr.replace("O", "相手・");
				tgtstr = tgtstr.replace("E", "");
				tgtstr = tgtstr.replace("SG", "空地");
				tgtstr = tgtstr.replace("P", "プレイヤー");
				tgtstr = tgtstr.replace("G", "領地");
				html += Infoblock.line({m:[tgtstr], w:[Infoblock._width]});
				break;
			case "comment":
				html += Infoblock.line({m:[arg[i].comment], w:[Infoblock._width], cls:"comment"});
				break;
			case "gridstatus":
				html += Infoblock.line({m:["状態", Dic(arg[i].status)+"呪い"], w:[50, Infoblock._width - 50]});
				break;
			case "gridowner":
				html += Infoblock.line({m:[arg[i].name], w:[Infoblock._width], bg:"#CCCCCC"});
				break;
			case "gridextra":
				var gridnm = {10:"城",11:"砦Ｎ",12:"砦Ｓ",13:"砦Ｗ",14:"砦Ｅ",21:"転送円",22:"交差橋",23:"祭壇",24:"転送門"}
				html += Infoblock.line({m:["基本", gridnm[arg[i].color]], w:[50, Infoblock._width - 50]});
				break;
			case "gridno":
				html += "<div class='CLS_INFOGNO'>"+arg[i].gno+"</div>";
				break;
			}
		}
		return html;
	},
	//パネルライン生成
	line:function (arg){
		var cls, dispstr = "";
		if(arg.b){
			cls = arg.cls || "";
			dispstr = "<div class='class_Info_Line2'>";
			dispstr += "<button class='CLS_W160 "+arg.cls+"' "+arg.b+">"+arg.m+"</button>";
		}else{
			var size = 0;
			var opt, width;
			for(var i=0; i<arg.w.length; i++){
				size += arg.w[i];
			}
			if(arg.cls){
				switch(arg.cls){
				case "point":
					dispstr = "<div class='class_Point_Line'>";
					break;
				case "point2":
					dispstr = "<div class='class_Point_Line2'>";
					break;
				case "comment":
					dispstr = "<div class='class_Info_Comment'>";
					break;
				}
			}else{
				dispstr = "<div class='class_Info_Line'>";
			}
			//items
			for(var i=0; i<arg.m.length; i++){
				opt = "";
				width = arg.w[i];
				if(arg.bg){
					opt += "background-color:"+arg.bg+";";
				}
				if(arg.ta){
					switch(arg.ta[i]){
					case "r":
						opt += "text-align:right;";
						break;
					case "c":
						opt += "text-align:center;";
						break;
					}
				}
				if(arg.pd){
					if(arg.pd[i] > 0){
						opt += "padding-left:"+arg.pd[i]+"px;";
						opt += "padding-right:"+arg.pd[i]+"px;";
					}
				}
				if(arg.sp){
					switch(arg.sp[i]){
					case "bw":
						opt += "color:#FFFFFF;background-color:#000000;";
						break;
					case "w":
						opt += "background-color:#FEFEFE;";
						break;
					}
				}
				if(arg.h){
					opt += "height:"+arg.h+"px;";
				}
				if(arg.bd){
					opt += "border-top:solid 2px rgba(32,32,32,0.4);";
				}
				dispstr += "<div style='width:"+width+"px;"+opt+"'>"+arg.m[i]+"</div>";
			}
		}
		dispstr += "</div>";
		return dispstr;
	}
}