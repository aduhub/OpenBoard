var d = new Date().getTime();
var scripts1 = ["chessclock","canvas","audio","debug","effect","graph","tool"];
var scripts2 = ["data_card","data_map","data_ability","dictionary"];
var scripts3 = ["var","battle","battle_ability","board","card","dice","flow","grid","infoblock","main","maker","net","spell","summon","territory","ui"];
//jstool
for(var i in scripts1){
	document.write("<script type='text/javascript' src='jstool/"+scripts1[i]+".js?"+d+"'></script>");
}
//data
for(var i in scripts2){
	document.write("<script type='text/javascript' src='jsdata/"+scripts2[i]+".js?"+d+"'></script>");
}
//js
for(var i in scripts3){
	document.write("<script type='text/javascript' src='js/"+scripts3[i]+".js?"+d+"'></script>");
}
