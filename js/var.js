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
//Battle
var Battle = new clsBattle();
//Analytics
var Analytics = new clsAnalytics();

//Const
const pcolor = {1:"#FF0000",2:"#0000FF",3:"#00CC00",4:"#FFCC00"}
const EleName = ["","無","火","水","地","風"];

var Temp = {
	mulligan:"00000"
}