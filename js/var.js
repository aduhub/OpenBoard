//===================================
// filename : var.js
// update   : 2007-01-12 adu
//===================================

//ボード
var Board = new clsBoard();
//Player
var Player = [];
Player[1] = new clsPlayer();
Player[2] = new clsPlayer();
Player[3] = new clsPlayer();
Player[4] = new clsPlayer();
//Spell
var Spell = new clsSpell();
//Summon
var Summon = new clsSummon();
//Territory
var Territory = new clsTerritory();
//Battle
var Battle = new clsBattle();
//Analytics
var Analytics = new clsAnalytics();

//Const
var pcolor = {1:"#FF0000",2:"#0000FF",3:"#00CC00",4:"#FFCC00"}
var EleName = ["","無","火","水","地","風"];
//Drag
var dragObject = null;
var dragOffset = null;

var Temp = {
	mulligan:"00000"
}