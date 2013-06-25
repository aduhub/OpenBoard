// Effect.js
function EffectBox(arg){
	switch(arg.pattern){
	case "discard":
		var fnc = function(){
			var effid = "discard"+$T.rndstr();
			var effdiv = $("<div><canvas id='cvs"+effid+"' height='130' width='100'></canvas></div>");
			effdiv.addClass("animeDiscard");
			effdiv.css({position:"fixed", top:245, left:390, zIndex:300});
			if($T.browser() == "chrome"){
				effdiv.one('webkitAnimationEnd', function(){$(this).remove();});
			}else{
				effdiv.one('animationend', function(){$(this).remove();});
			}
			$("BODY").append(effdiv);
			//Img
			CardImgSet({cvs:"cvs"+effid, cno:arg.cno, zoom:0.5});
		}
		$T.stacktimer({key:"cardeffect", fnc:fnc, msec:800});
		break;
	case "drawcard":
		var fnc = function(){
			var effid = "drawcard"+$T.rndstr();
			var effdiv = $("<div><canvas id='cvs"+effid+"' height='130' width='100'></canvas></div>");
			effdiv.addClass("animeDrawcard");
			effdiv.css({position:"fixed", top:160, left:390, zIndex:300});
			if($T.browser() == "chrome"){
				effdiv.one('webkitAnimationEnd', function(){$(this).remove();});
			}else{
				effdiv.one('animationend', function(){$(this).remove();});
			}
			$("BODY").append(effdiv);
			//Img
			CardImgSet({cvs:"cvs"+effid, cno:arg.cno, zoom:0.5});
		}
		$T.stacktimer({key:"cardeffect", fnc:fnc, msec:800});
		break;
	case "piecemove":
		var imgno = 0;
		var msec = arg.msec || 150;
		//Arrow
		if(Player[arg.pno].shadow > 0){
			imgno = Board.grid[Player[arg.pno].shadow].GetArrow(arg.gno);
		}
		Player[arg.pno].direction = imgno;
		//img
		SetPlayerImg(arg.pno);
		//Move
		var mvy = Board.grid[arg.gno].top - 64;
		var mvx = Board.grid[arg.gno].left - 0;
		//css tmp anime
		CSSAnimation({id:"#DIV_PLAYER"+arg.pno, css:{top:mvy+"px", left:mvx+"px"}, msec:msec});
		break;
	case "taxjump":
	 	var element = $("#DIV_PLAYER"+arg.pno);
		if(arg.tax <= 240){
			element.animate({top:"-=20"},120).animate({top:"+=20"},120);
		}else if(arg.tax <= 480){
			element.animate({top:"-=40"},160).animate({top:"+=40"},160);
			//SoundEffect
			Audie.seplay("tax1");
		}else if(arg.tax <= 960){
			element.animate({top:"-=80"},200).animate({top:"+=100"},200).animate({top:"-=20"},200);
			//SoundEffect
			Audie.seplay("tax1");
		}else{
			element.animate({top:"-=120"},200).animate({top:"+=160"},200).animate({top:"-=120"},200).animate({top:"+=100"},200).animate({top:"-=20"},200);
			//SoundEffect
			Audie.seplay("tax2");
		}
		break;
	case "piecejump":
		var element = $("#DIV_PLAYER"+arg.pno);
		element.animate({top:"-=40"}, 200).animate({top:"+=40"}, 200);
		break;
	case "pieceshake":
		//css tmp anime
		$("#DIV_PLAYER"+arg.pno).animate({left:"-=10"},100).animate({left:"+=20"},100).animate({left:"-=20"},100).animate({left:"+=20"},100).animate({left:"-=10"},100);
		break;
	case "piecespin":
		//css tmp anime
		if($T.browser() == "chrome"){
			CSSAnimation({id:"#DIV_PLAYER"+arg.pno, css:{"-webkit-transform":"rotateY(360deg)"}, msec:1000, reset:true});
		}else{
			CSSAnimation({id:"#DIV_PLAYER"+arg.pno, css:{"-moz-transform":"rotateY(360deg)"}, msec:1000, reset:true});
		}
		break;
	case "fortpuff": //CastleFort Icon puff
		var divy = Number(Board.grid[Player[arg.pno].stand].top) - 22;
		var divx = Number(Board.grid[Player[arg.pno].stand].left);
		var effdiv = $("<div><img src='img/"+arg.img+".gif' height='90' width='128'></div>");
		effdiv.addClass("animePuff");
		effdiv.css({position:"absolute", top:divy, left:divx});
		if($T.browser() == "chrome"){
			effdiv.one('webkitAnimationEnd', function(){
				$(this).remove();
			});
		}else{
			effdiv.one('animationend', function(){
				$(this).remove();
			});
		}
		$("#DIV_FRAME").append(effdiv);
		break;
	case "spellpuff":
		var effid = "puff"+$T.rndstr();
		var effdiv = $("<div><canvas id='cvs"+effid+"' height='260' width='200'></canvas></div>");
		effdiv.addClass("animeSpellpuff");
		effdiv.css({position:"fixed", top:180, left:340, zIndex:300});
		if($T.browser() == "chrome"){
			effdiv.one('webkitAnimationEnd', function(){$(this).remove();});
		}else{
			effdiv.one('animationend', function(){$(this).remove();});
		}
		$("BODY").append(effdiv);
		//Img
		CardImgSet({cvs:"cvs"+effid, cno:Spell.cno});
		//Sound
		Audie.seplay("spell");
		break;
	case "focusin": //Territory Color
		var divy = Number(Board.grid[arg.gno].top);
		var divx = Number(Board.grid[arg.gno].left);
		var effdiv = $("<div><img src='img/grid"+Board.grid[arg.gno].color+".gif' height='64' width='128'></div>");
		effdiv.addClass("animeFocusin");
		effdiv.css({position:"absolute", top:divy, left:divx});
		if($T.browser() == "chrome"){
			effdiv.one('webkitAnimationEnd', function(){$(this).remove();});
		}else{
			effdiv.one('animationend', function(){$(this).remove();});
		}
		$("#DIV_FRAME").append(effdiv);
		//se
		if($T.inrange(Board.grid[arg.gno].color, 2, 5)){
			Audie.seplay("color" + Board.grid[arg.gno].color);
		}
		break;
	case "levelup":
		var img = "img/border" + Board.grid[arg.gno].owner + Board.grid[arg.gno].level + ".gif";
		var divy = Number(Board.grid[arg.gno].top);
		var divx = Number(Board.grid[arg.gno].left);
		var effdiv = $("<div><img src='"+img+"' height='64' width='128'></div>");
		effdiv.addClass("animeLevelup");
		effdiv.css({position:"absolute", top:divy, left:divx});
		if($T.browser() == "chrome"){
			effdiv.one('webkitAnimationEnd', function(){$(this).remove();});
		}else{
			effdiv.one('animationend', function(){$(this).remove();});
		}
		$("#DIV_FRAME").append(effdiv);
		//se
		Audie.seplay("tr_levelup");
		break;
	case "invasion":
		var img = "img/icon/"+Card[arg.cno].imgsrc.replace(".png", "")+".gif";
		var divy = Number(Board.grid[arg.gno1].top) - 26;
		var divx = Number(Board.grid[arg.gno1].left);
		var effid = "invasion"+$T.rndstr();
		var effdiv = $("<div id='"+effid+"'><img src='"+img+"' height='90' width='128'></div>");
		effdiv.css({position:"absolute", top:divy, left:divx, zIndex:200, opacity:0.2});
		$("#DIV_FRAME").append(effdiv);
		//Move
		var mvy = Number(Board.grid[arg.gno2].top) - 26;
		var mvx = Number(Board.grid[arg.gno2].left);
		//css tmp anime
		var css = {top:mvy+"px", left:mvx+"px", opacity:0.9};
		CSSAnimation({id:"#"+effid, css:css, msec:1000, remove:true});
		break;
	case "impact":
		$("#DIV_GICON"+arg.gno).addClass("animeHitimpact");
		if($T.browser() == "chrome"){
			$("#DIV_GICON"+arg.gno).one('webkitAnimationEnd', function(){
				$(this).removeClass("animeHitimpact");
			});
		}else{
			$("#DIV_GICON"+arg.gno).one('animationend', function(){
				$(this).removeClass("animeHitimpact");
			});
		}
		//Sound
		Audie.seplay("mapdmg");
		break;
	case "summon":
		var css;
		var img = "img/icon/"+Card[arg.cno].imgsrc.replace(".png", "")+".gif";
		var divy = Number(Board.grid[arg.gno].top) - 26;
		var divx = Number(Board.grid[arg.gno].left);
		var effid = "summon"+$T.rndstr();
		var effdiv = $("<div id='"+effid+"'><img src='"+img+"' height='90' width='128'></div>");
		if($T.browser() == "chrome"){
			effdiv.css({position:"absolute", top:divy, left:divx, zIndex:200, "-webkit-transform":"scale(0.6, 1.0)", opacity:0.0});
		}else{
			effdiv.css({position:"absolute", top:divy, left:divx, zIndex:200, "-moz-transform":"scale(0.6, 1.0)", opacity:0.0});
		}
		$("#DIV_FRAME").append(effdiv);
		$("#DIV_GICON"+arg.gno).css({display:"none", backgroundImage:"url("+img+")"});
		//css tmp anime
		if($T.browser() == "chrome"){
			css = {"-webkit-transform":"scale(1.0, 1.0)", opacity:1.0};
		}else{
			css = {"-moz-transform":"scale(1.0, 1.0)", opacity:1.0};
		}
		var fnc = function(){
			$("#DIV_GICON"+arg.gno).css({display:"block"});
		}
		CSSAnimation({id:"#"+effid, css:css, msec:1000, term:fnc, remove:true});
		//Sound
		Audie.seplay("summon");
		break;
	case "unsummon":
		var css;
		var img = "img/icon/"+Card[arg.cno].imgsrc.replace(".png", "")+".gif";
		var divy = Number(Board.grid[arg.gno].top) - 26;
		var divx = Number(Board.grid[arg.gno].left);
		var effid = "unsummon"+$T.rndstr();
		var effdiv = $("<div id='"+effid+"'><img src='"+img+"' height='90' width='128'></div>");
		effdiv.css({position:"absolute", top:divy, left:divx, zIndex:200});
		$("#DIV_FRAME").append(effdiv);
		//css tmp anime
		if($T.browser() == "chrome"){
			css = {"-webkit-transform":"scale(0.2, 1.0)", opacity:0.1};
		}else{
			css = {"-moz-transform":"scale(0.2, 1.0)", opacity:0.1};
		}
		CSSAnimation({id:"#"+effid, css:css, msec:1000, remove:true});
		break;
	case "destroy":
		var img = "url(img/icon/"+Card[arg.cno].imgsrc.replace(".png", "")+".gif)";
		for(var i=0; i<=3; i++){
			var effid = "destroy"+$T.rndstr();
			var effdiv = $("<div id='"+effid+"'></div>");
			var divy = Number(Board.grid[arg.gno].top) + [-26, -26, 19, 19][i];
			var divx = Number(Board.grid[arg.gno].left) + [0, 64, 0, 64][i];
			var mvy = divy + [-60, -60, 60, 60][i];
			var mvx = divx + [-60, 60, -60, 60][i];
			var divh = [60, 60, 30, 30][i];
			var posistr = ["left top", "right top", "left bottom", "right bottom"][i];
			effdiv.css({position:"absolute", top:divy, left:divx, height:divh, width:64, zIndex:200, opacity:1.0});
			effdiv.css({backgroundImage:img, backgroundRpeat:"no-repeat", backgroundPosition:posistr});
			$("#DIV_FRAME").append(effdiv);
			//css tmp anime
			CSSAnimation({id:"#"+effid, css:{top:mvy+"px", left:mvx+"px", opacity:0.1}, msec:800, remove:true});
		}
		//Sound
		Audie.seplay("mapdie");
		break;
	case "itemdestroy":
		var gif = (Card[arg.cno].imgsrc.match(".png")) ? "": ".gif";
		var img = "url(img/card/"+Card[arg.cno].imgsrc+gif+")";
		for(var i=0; i<=3; i++){
			var effid = "itemdestroy"+$T.rndstr();
			var effdiv = $("<div id='"+effid+"'></div>");
			var divy = 130 + [0, 0, 75, 75][i];
			var divx = [10, 690][arg.bno] + [0, 50, 0, 50][i];
			var mvy = divy + [-40, -40, 40, 40][i];
			var mvx = divx + [-40, 40, -40, 40][i];
			var posistr = ["left top", "right top", "left bottom", "right bottom"][i];
			effdiv.css({position:"absolute", top:divy, left:divx, height:75, width:50, zIndex:200, opacity:1.0});
			if($T.browser() == "chrome"){
				effdiv.css({backgroundImage:img, backgroundRpeat:"no-repeat", backgroundPosition:posistr, webkitBackgroundSize:"100px 130px"});
			}else{
				effdiv.css({backgroundImage:img, backgroundRpeat:"no-repeat", backgroundPosition:posistr, "-moz-background-size":"100px 130px"});
			}
			$("#DIV_VSBACK").append(effdiv);
			//css tmp anime
			CSSAnimation({id:"#"+effid, css:{top:mvy+"px", left:mvx+"px", opacity:0.1}, msec:800, remove:true});
		}
		break;
	case "soldout":
		var css;
		var img = "img/border" + Board.grid[arg.gno].owner + Board.grid[arg.gno].level + ".gif";
		var divy = Number(Board.grid[arg.gno].top);
		var divx = Number(Board.grid[arg.gno].left);
		var effid = "sold"+$T.rndstr(8);
		var effdiv = $("<div id='"+effid+"'><img src='"+img+"' height='64' width='128'></div>");
		effdiv.css({position:"absolute", top:divy, left:divx, zIndex:200, opacity:0.9});
		$("#DIV_FRAME").append(effdiv);
		//Move
		if($T.browser() == "chrome"){
			css = {"-webkit-transform":"translate(0px, -48px)", opacity:0.1};
		}else{
			css = {"-moz-transform":"translate(0px, -48px)", opacity:0.1};
		}
		CSSAnimation({id:"#"+effid, css:css, msec:1200, remove:true});
		break;
	case "msgpop":
		var divyopt = (arg.player) ? -64 : -26;
		var divy = Number(Board.grid[arg.gno].top) + divyopt;
		var divx = Number(Board.grid[arg.gno].left);
		var msgstr = String(arg.msg);
		for(var i=0; i<=2; i++){
			msgstr = msgstr.replace(["+", "-", ">"][i], ["&#9650;", "&#9660;", "&#9658;"][i]);
		}
		//msgstr = msgstr.replace("[C]", "<img height='20' width='14' src='img/icon_card.gif'>");
		//msgstr = msgstr.replace("[G]", "<img height='20' width='14' src='img/icon_g.gif'>");
		//msgstr = msgstr.replace("[R]", "<img height='20' width='14' src='img/icon_redg.gif'>");
		var fnc = function(){
			var effdiv = $("<div>"+msgstr+"</div>");
			effdiv.css({top:divy, left:divx});
			if(arg.color){
				effdiv.css("color", arg.color);
			}
			effdiv.addClass("CLS_GRIDPOP animeMsgpop");
			if($T.browser() == "chrome"){
				effdiv.one('webkitAnimationEnd', function(){
					$(this).remove(); 
				});
			}else{
				effdiv.one('animationend', function(){
					$(this).remove(); 
				});
			}
			$("#DIV_FRAME").append(effdiv);
		}
		$T.stacktimer({key:"grid"+arg.gno, fnc:fnc, msec:1400});
		break;
	case "roundmsgpop":
		$("#DIV_MSG2").css("display", "block");
		$("#DIV_MSG2").addClass("animeMsgpop");
		if($T.browser() == "chrome"){
			$("#DIV_MSG2").one('webkitAnimationEnd', function(){
				$(this).removeClass("animeMsgpop");
				$(this).css("display", "none");
			});
		}else{
			$("#DIV_MSG2").one('animationend', function(){
				$(this).removeClass("animeMsgpop");
				$(this).css("display", "none");
			});
		}
		break;
	case "bigmsgdown":
		$("#DIV_MSG").css("display", "block");
		$("#DIV_MSG").addClass("animeMsgdown");
		if($T.browser() == "chrome"){
			$("#DIV_MSG").one('webkitAnimationEnd', function(){
				$(this).removeClass('animeMsgdown'); 
				$(this).css("display", "none");
			});
		}else{
			$("#DIV_MSG").one('animationend', function(){
				$(this).removeClass('animeMsgdown'); 
				$(this).css("display", "none");
			});
		}
		break;
	case "itemopen":
		$("#DIV_VSITEM"+arg.bno).addClass("animeItemOpen");
		if($T.browser() == "chrome"){
			$("#DIV_VSITEM"+arg.bno).one('webkitAnimationEnd', function(){
				$(this).removeClass('animeItemOpen'); 
			});
		}else{
			$("#DIV_VSITEM"+arg.bno).one('animationend', function(){
				$(this).removeClass('animeItemOpen'); 
			});
		}
		break;
	case "ratepop":
		var effdiv = $("<div>"+arg.rate+"</div>");
		effdiv.addClass("CLS_RATEPOP animeMsgpopL");
		if($T.browser() == "chrome"){
			effdiv.one('webkitAnimationEnd', function(){
				$(this).remove(); 
			});
		}else{
			effdiv.one('animationend', function(){
				$(this).remove(); 
			});
		}
		$("body").append(effdiv);
		break;
	case "lvlpop":
		if(arg.level > 1 || arg.chain > 1){
			var effdiv = $("<div>LEVEL<span>"+arg.level+"</span>CHAIN<span>"+arg.chain+"</span></div>");
			effdiv.addClass("CLS_LVLPOP animeMsgSandV1");
			if($T.browser() == "chrome"){
				effdiv.one('webkitAnimationEnd', function(){
					$(this).remove(); 
				});
			}else{
				effdiv.one('animationend', function(){
					$(this).remove(); 
				});
			}
			$("body").append(effdiv);
		}
		break;
	}
}
//CSS Temp Animation
function CSSAnimation(arg){
	var css = [];
	var property = [];
	var backup = [];
	for(var key in arg.css){
		property.push(key);
		css[key] = arg.css[key];
		backup[key] = $(arg.id).css(key);
	}
	if($T.browser() == "chrome"){
		css["-webkit-transition-property"] = property.join(",");
		css["-webkit-transition-duration"] = arg.msec + "ms";
		$(arg.id).css(css).one('webkitTransitionEnd', function(){
			if(arg.remove){
				$(this).remove();
			}else{
				$(this).css({"-webkit-transition-property":"", "-webkit-transition-duration":""});
				if(arg.reset){
					for(i in property){
						$(this).css(property[i], backup[property[i]]);
					}
				}
			}
			if(arg.term){
				arg.term();
			}
		});
	}else{
		css["-moz-transition-property"] = property.join(",");
		css["-moz-transition-duration"] = arg.msec + "ms";
		$(arg.id).css(css);
		$(arg.id).one('transitionend', function(){
			if(arg.remove){
				$(this).remove();
			}else{
				$(this).css({"-moz-transition-property":"", "-moz-transition-duration":""});
				if(arg.reset){
					for(i in property){
						$(this).css(property[i], backup[property[i]]);
					}
				}
			}
			if(arg.term){
				arg.term();
			}
		});
	}
}
