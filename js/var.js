//===================================
// filename : var.js
// update   : 2007-01-12 adu
//===================================
//Const
const pcolor = {1:"#FF0000",2:"#0000FF",3:"#00CC00",4:"#FFCC00"}
const EleName = ["","無","火","水","地","風"];
//===================================
//ボード
var Board = {
	mapno:0,
	status: 0,
	dice:0,
	flag:0,
	bonus:0,
	bonus_f:0,
	target:0,
	endround:0,
	sudden:false,
	suddenon:false,
	grid:[],
	round:0,
	role:0,
	turn:0,
	step:0,
	grave:[],
	spelled:[],
	timer:0,
	playcnt:0,
	joincnt:0,
	deckcnt:0,
	readycnt:0,
	playorder:"",
	discardstep:0,
	alliance:false,
	joincntA:0,
	joincntB:0
}
//Player
var Player = [];
Player[1] = new clsPlayer();
Player[2] = new clsPlayer();
Player[3] = new clsPlayer();
Player[4] = new clsPlayer();
//Battle
var Battle = new clsBattle();
//Analytics
var Analytics = {
	rankmode:"",
	rank:[],
	hhmm:["00:00","00:00"],
	invasion:[0,0,0,0,0],
	invasionwin:[0,0,0,0,0],
	guard:[0,0,0,0,0],
	guardwin:[0,0,0,0,0],
	spell:[0,0,0,0,0],
	paycnt:[0,0,0,0,0],
	paygold:[0,0,0,0,0],
	takecnt:[0,0,0,0,0],
	takegold:[0,0,0,0,0],
	costspell:[0,0,0,0,0],
	costsummon:[0,0,0,0,0]
}
//====================================
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
