var Maker = {};
Maker.addDiv = function(arg){
		var jQ_Div;
		var id = arg["id"] || "DIV_MAKER_" + $T.rndstr(8);
		var baseframe = arg["base"] || "#DIV_FRAME";
		//Base
		if(arg["attr"]){
			jQ_Div = $("<div/>", arg["attr"]);
		}else{
			jQ_Div = $("<div/>");
		}
		//id設定
		if(arg["id"]){
			jQ_Div.attr("id", id);
		}
		//Style
		if(arg["css"]){
			jQ_Div.css(arg["css"]);
		}
		//Class
		if(arg["class"] && arg["class"] != ""){
			jQ_Div.addClass(arg["class"]);
		}
		//ドキュメントに追加
		$(baseframe).append(jQ_Div);
}
Maker.addCanvas = function(arg){
		var jQ_Canvas;
		var cvs_id = arg["id"] || "CVS_MAKER_" + $T.rndstr(8);
		var div_id = arg["div"];
		if(div_id.substring(0,1) != "#"){
			div_id = "#" + div_id;
		}
		//Base
		jQ_Canvas = $("<canvas></canvas>");
		//id設定
		jQ_Canvas.attr({id:cvs_id, height:arg.h, width:arg.w});
		//Style
		if(arg["css"]){
			jQ_Canvas.css(arg["css"]);
		}
		//Class
		if(arg["class"]){
			jQ_Canvas.addClass(arg["class"]);
		}
		//ドキュメントに追加
		$(div_id).append(jQ_Canvas);
}
Maker.addHand = function(){
		var hno = $(".CLS_HAND").length;
		var div_id = "DIV_HAND" + hno;
		var cvs_id = "CVS_HAND" + hno;
		var divitem = {base:"#DIV_HANDFRAME", id:div_id, class:"CLS_HAND", css:{zIndex:hno + 1, overflow:"hidden"}}
		divitem["attr"] = {"onclick":"UI.Event.clickHand("+hno+")", "oncontextmenu":"Card.Tool.info({hno:"+hno+"});return false;", "onmouseout":"Card.Tool.info()"}
		this.addDiv(divitem);
		this.addCanvas({div:div_id, id:cvs_id, h:"130", w:"100"});
}
