Chessclock = {
	_classname:"chessclock",
	_time:[0, 0, 0],
	_init:300,
	_bank:300,
	_switch:0,
	_tgts:[],
	_type:0,
	_step:0,
	use:false,
	set:function(step, evttype){
		if(Chessclock.use){
			var runstep = step || 0;
			var runevttype = evttype || "click";
			var clsnm = Chessclock._classname + $T.rndstr();
			Chessclock._tgts.unshift([clsnm, runstep, runevttype]);
			return clsnm;
		}else{
			return "";
		}
	},
	remove:function(){
		if(Chessclock.use){
			if(Chessclock._tgts.length > 0){
				var clsnm = Chessclock._tgts.shift();
				$("."+clsnm[0]).removeClass("."+clsnm[0]);
			}
		}
	},
	clear:function(){
		while(Chessclock._tgts.length > 0){
			Chessclock.remove();
		}
		Chessclock._type = 0;
	},
	main:function(){
		if(Chessclock.use){
			if(Chessclock._type > 0){
				var timerno = 9;
				var div, evt, clsnm, step, idx, bak;
				if(Chessclock._time[Chessclock._type] == 0){
					if(Chessclock._type == 1){
						while(Chessclock._tgts.length > 0){
							clsnm = Chessclock._tgts[0][0];
							step = Chessclock._tgts[0][1];
							evttype = Chessclock._tgts[0][2];
							div = document.getElementsByClassName(clsnm)[0];
							if(document.getElementsByClassName(clsnm)[0]){
								if(Board.step == step || (Board.step == 30 && step == 20) || step == 0){
									//click
									div = document.getElementsByClassName(clsnm)[0];
									evt = document.createEvent("MouseEvents");
									evt.initEvent(evttype, false, true);
									div.dispatchEvent(evt);
								}
								break;
							}else{
								//remove
								Chessclock.remove();
							}
						}
					}else{
						if(Board.step % 10  == 8){
							if(Board.discardstep == 2){
								clsnm = Chessclock._tgts[0][0];
								div = document.getElementsByClassName(clsnm)[0];
								Chessclock._type = 0;
							}else{
								div = document.getElementById("BTN_PhaseEnd");
							}
						}else{
							div = document.getElementById("BTN_PhaseEnd");
							Chessclock._type = 0;
						}
						evt = document.createEvent("MouseEvents");
						evt.initEvent("click", false, true);
						div.dispatchEvent(evt);
					}
				}else{
					bak = Chessclock._time[0];
					idx = (Chessclock._time[0] > 0) ? 0 : Chessclock._type;
					Chessclock._time[idx]--;
					if(Chessclock._time[idx] % 10 == 0){
						//timeup check
						if(Chessclock._time[Chessclock._type] == 0){
							Logprint({msg:"タイムアップ", ltype:"system"});
							$("#DIV_TIMEKEEP").html("");
						}else{
							Chessclock._disp();
						}
						//bank check
						if(Chessclock._type == 1 && Chessclock._switch == 0){
							if(bak == 0 && Chessclock._time[0] == 0){
								Chessclock._bank--;
								if(Chessclock._bank <= 0){
									Logprint({msg:"持ち時間オーバー", ltype:"system"});
									Logprint({msg:"以降は15カウントとなります", ltype:"system"});
									Chessclock._switch = 1;
								}
							}
						}
					}
				}
			}
		}
	},
	stepchk:function(){
		if(Chessclock.use){
			if(Chessclock._type == 2 && Board.step != Chessclock._step){
				Chessclock._type = 0;
			}
			Chessclock._step = Board.step;
			if(Board.role == Board.turn){
				switch(Board.step){
				case 12:
					Chessclock._timeset(0);
					break;
				case 13:
					Chessclock.clear();
					break;
				case 18: //tmp
					Chessclock._timeset(2);
					break;
				case 20:
					Chessclock._timeset(1);
					break;
				case 23:
					Chessclock.clear();
					break;
				case 24:
					Chessclock._type = 0;
					break;
				case 25:
					Chessclock._type = 0;
					break;
				case 28: //tmp
					Chessclock._timeset(2);
					break;
				case 30:
					Chessclock._type = 1;
					break;
				case 31:
					Chessclock.clear();
					break;
				case 32:
					Chessclock._timeset(1);
					break;
				case 38: //tmp
					Chessclock._timeset(2);
					break;
				case 40:
					Chessclock._timeset(1);
					break;
				case 42:
					Chessclock._type = 0;
					break;
				case 58: //tmp
					Chessclock._timeset(2);
					break;
				case 71:
					Chessclock._type = 0;
					break;
				case 72: //tmp
					Chessclock._timeset(2);
					break;
				case 73:
					Chessclock._type = 0;
					break;
				case 91:
					Chessclock.clear();
					break;
				}
			}else{
				switch(Board.step){
				case 72: //tmp
					Chessclock._timeset(2);
					break;
				case 73:
					Chessclock._type = 0;
					break;
				}
			}
			//disp
			Chessclock._disp();
		}
	},
	_timeset:function(i){
		switch(i){
		case 0:
			Chessclock._type = 1;
			Chessclock._time[0] = (Chessclock._switch == 0) ? 50 : 0;
			Chessclock._time[1] = 50;
			break;
		case 1:
			if(Chessclock._type != 1){
				Chessclock._type = 1;
				Chessclock._time[0] = (Chessclock._switch == 0) ? 50 : 0;
				Chessclock._time[1] = (Chessclock._switch == 0) ? 250 : 150;
			}
			break;
		case 2:
			Chessclock._type = 2;
			Chessclock._time[0] = 0;
			Chessclock._time[2] = 150;
			break;
		}
	},
	_disp:function(){
		if(Chessclock._type >= 1){
			var opa, clr, cnt;
			if(Chessclock._type == 1){
				if(Chessclock._switch == 0){
					opa = (Chessclock._time[0] > 0) ? 0.2 : 1.0;
					clr = "#FF4400";
					//bank timer
					var height = Math.floor(200 * ((Chessclock._init - Chessclock._bank) / Chessclock._init));
					$("#DIV_TIMEBAR_BLACK").css({"height":height+"px"});
					$("#DIV_TIMEBAR_BACK").css({"display":"block"});
				}else{
					opa = 1.0;
					clr = "#0044FF";
				}
				cnt = Math.floor((Chessclock._time[0] + Chessclock._time[1]) / 10);
			}else{
				opa = 1.0;
				clr = "#0044FF";
				cnt = Math.floor(Chessclock._time[2] / 10);
			}
			//set
			$("#DIV_TIMEKEEP").css({opacity:opa, color:clr});
			$("#DIV_TIMEKEEP").html(cnt);
		}else{
			$("#DIV_TIMEKEEP").html("");
			$("#DIV_TIMEBAR_BACK").css({"display":"none"});
		}
	}
};
