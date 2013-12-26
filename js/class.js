//###################################
//# pgname:class
//# auther:a
//# update:20061213
//###################################
//Boardクラス
function clsBoard(){
	this.mapno    = 0;
	this.status   = 0;
	this.dice     = 0;
	this.flag     = 0;
	this.bonus    = 0;
	this.bonus_f  = 0;
	this.target   = 0;
	this.endround = 0;
	this.sudden   = false;
	this.suddenon = false;
	this.grid     = [];
	this.round    = 0;
	this.role     = 0;
	this.turn     = 0;
	this.step     = 0;
	this.wait     = 0;
	this.grave    = [];
	this.spelled  = [];
	this.timer    = 0;
	this.playcnt  = 0;
	this.joincnt  = 0;
	this.deckcnt  = 0;
	this.readycnt = 0;
	this.playorder= "";
	this.discardstep = 0;
	this.alliance  = false;
	this.joincntA = 0;
	this.joincntB = 0;
}
//Gridクラス
function clsGrid(){
	this.link1   = 0;
	this.link2   = 0;
	this.link3   = 0;
	this.link4   = 0;
	this.linkx   = 0;
	this.linkarr = [];
	this.arrow   = "";
	this.gold    = 0;
	this.color   = 0;
	this.owner   = 0;
	this.level   = 0;
	this.cno     = "";
	this.st      = 0;
	this.lf      = 0;
	this.maxlf   = 0;
	this.status  = "";
	this.statime = 0;
	this.top     = 0;
	this.left    = 0;
	this.flush=function(){
		this.owner = 0;
		this.cno = "";
		this.st = 0;
		this.lf = 0;
		this.maxlf = 0;
		this.status = "";
		this.statime = 0;
	};
	this.GetArrow = function(gno){
		var ret = 0;
		switch(Number(gno)){
		case this.link1:
			ret = Number(this.arrow.substr(0,1));
			break;
		case this.link2:
			ret = Number(this.arrow.substr(1,1));
			break;
		case this.link3:
			ret = Number(this.arrow.substr(2,1));
			break;
		case this.link4:
			ret = Number(this.arrow.substr(3,1));
			break;
		}
		return ret;
	};
	this.GetLink = function(arrow){
		var ret = 0;
		switch(String(arrow)){
		case this.arrow.substr(0,1):
			ret = this.link1;
			break;
		case this.arrow.substr(1,1):
			ret = this.link2;
			break;
		case this.arrow.substr(2,1):
			ret = this.link3;
			break;
		case this.arrow.substr(3,1):
			ret = this.link4;
			break;
		}
		return ret;
	};
}
//Playerクラス
function clsPlayer() {
	this.id      = "000000";
	this.name    = "noname";
	this.avatar  = "";
	this.rate    = 0;
	this.number  = 0;
	this.flag    = "";
	this.gold    = 0;
	this.status  = "";
	this.statime = 0;
	this.dicepass = false;
	this.direction = 0;
	this.stand   = 0;
	this.shadow  = 0;
	this.lap     = 0;
	this.medal   = 0;
	this.foot    = 0;
	this.draw    = "";
	this.hand    = [];
	this.deckid  = "";
	this.deck    = "";
	this.deckname= "";
	this.deckdata= "";
	this.decknext= [];
	this.HandDel =function(cno){
		var hno;
		var cnos = [];
		switch($T.typer(cno)){
		case "Array":
			cnos = cnos.concat(cno);
			break;
		case "String":
			cnos.push(cno);
			break;
		}
		this.hand = $T.arrconflict(this.hand, cnos);
	}
	this.DeckAdd =function(i_cno){
		this.deck += (this.deck == "") ? i_cno : ":" + i_cno;
	}
	this.DeckDel =function(i_no){
		var wkarr = this.deck.split(":");
		var wkcno = wkarr.splice(i_no - 1, 1);
		this.deck = wkarr.join(":");
		return wkcno[0];
	}
	this.DeckCount=function(){
		var wkarr = this.deck.split(":");
		return (this.deck == "") ? 0 : wkarr.length;
	}
	this.DeckAllCount=function(){
		var wkarr = this.deckdata.split(":");
		return (this.deckdata == "") ? 0 : wkarr.length;
	}
	this.DeckShift=function(){
		var wkarr = this.deck.split(":");
		var cno = wkarr.shift();
		this.deck = wkarr.join(":");
		return cno;
	}
	this.DeckInsert=function(cno, dno){
		var wkarr = this.deck.split(":");
		wkarr.splice(dno - 1, 0, cno);
		this.deck = wkarr.join(":");
	}
	this.DeckCard=function(i_no){
		var wkarr = this.deck.split(":");
		if(wkarr.lenth < i_no){
			return "";
		}else{
			var topno = i_no - 1;
			return wkarr[topno];
		}
	}
}
//Spell
function clsSpell(){
	this.pno    = 0;
	this.cno    = "";
	this.tgttype= "";
	this.check  = [];
	this.target = [];
}
//Summon
function clsSummon(){
	this.from = "";
	this.pno   = 0;
	this.gno   = 0;
	this.cno   = "";
	this.hand  = 0;
	this.st    = 0;
	this.lf    = 0;
	this.maxlf = 0;
	this.status = "";
}
//Territory
function clsTerritory(){
	this.pno  = 0;
	this.target = [];
	this.gno  = 0;
	this.cno  = "";
	this.gno2 = "";
	this.mvgno= [];
	this.ability = "";
}
//Fighter
function clsFighter(){
	this.pno    = 0;
	this.cno    = "";
	this.st     = 0;
	this.stbase = 0;
	this.stplus = 0;
	this.lf     = 0;
	this.lfbase = 0;
	this.lfplus = 0;
	this.lftemp = 0;
	this.maxlf  = 0;
	this.speed  = 0;
	this.damage = 0;
	this.attack = 0;
	this.item   = "";
	this.rnd    = "";
	this.opt    = [];
	this.status = "";
	this.active = "";
	this.direct = false;
}
//Battle
function clsBattle(){
	this.from    = 0;
	this.result  = 0;
	this.gno     = 0;
	this.gno_atk = 0;
	this.p       = [];
	this.p[0]    = new clsFighter();
	this.p[1]    = new clsFighter();
	this.log     = [];
	this.hand    = 0;
	this.check   = [];
	this.wait    = 0;
}
//Analytics
function clsAnalytics(){
	this.rankmode = "";
	this.rank = [];
	this.hhmm = ["00:00","00:00"];
	this.invasion = [0,0,0,0,0];
	this.invasionwin = [0,0,0,0,0];
	this.guard = [0,0,0,0,0];
	this.guardwin = [0,0,0,0,0];
	this.spell = [0,0,0,0,0];
	this.paycnt = [0,0,0,0,0];
	this.paygold = [0,0,0,0,0];
	this.takecnt = [0,0,0,0,0];
	this.takegold = [0,0,0,0,0];
	this.costspell = [0,0,0,0,0];
	this.costsummon = [0,0,0,0,0];
}