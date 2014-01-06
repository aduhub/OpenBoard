//########## AUDIO ##########
var Audie = {
	bank:[],
	loaded:{map1:false, map2:false, battle:false, goal:false},
	BGMvol:0.3,
	SEvol:0.8,
	nowplay:"",
	mapswt:"map1",
	loadsetting:function(){
		if(localStorage.ob_volume_bgm){
			$("#bgmvolume").val(Number(localStorage.ob_volume_bgm));
			Audie.volchg("bgm");
		}
		if(localStorage.ob_volume_se){
			$("#sevolume").val(Number(localStorage.ob_volume_se));
			Audie.volchg("se");
		}
	},
	seload:function(arg){
		Audie.bank[arg.id] = new Audio(arg.src);
		Audie.bank[arg.id].autoplay = false;
		Audie.bank[arg.id].loop = false;
		Audie.bank[arg.id].controls = false;
		Audie.bank[arg.id].addEventListener("canplaythrough", function(){
			Audie.seplay(arg.id);
		});
		Audie.bank[arg.id].load();
	},
	seplay:function(id){
		var delay = 0;
		switch(id){
		case "tr_levelup":
			delay = 1200;
		}
		if(Audie.bank[id] && Audie.bank[id].readyState >= 1){
			Audie.bank[id].currentTime = 0;
			Audie.bank[id].volume = Audie.SEvol;
			if(delay >= 1){
				setTimeout(function(){Audie.bank[id].play()}, delay);
			}else{
				Audie.bank[id].play();
			}
		}else{
			Audie.seload({id:id, src:"/openboard/audio/"+id+".mp3"});
		}
	},
	load:function(bgmelement, id){
		if(window.File && window.FileList && window.FileReader){
			var file = bgmelement.files[0];
			if(file.type.match(/audio.mp3/)){
				var reader = new FileReader();
				reader.onload = function(){
					Audie.bank[id] = new Audio(this.result);
					Audie.bank[id].autoplay = false;
					Audie.bank[id].loop = true;
					Audie.bank[id].controls = false;
					Audie.bank[id].addEventListener("canplaythrough", function(){
						$("#spanbgm"+id).html("<b>Ready</b>");
						Audie.loaded[id] = true;
						if(Audie.nowplay == id){
							Audie.play(Audie.nowplay);
						}
					});
					Audie.bank[id].load();
				}
				$("#spanbgm"+id).html("loading...");
				reader.readAsDataURL(file);
			}else{
				$("#spanbgm"+id).html("");
				Audie.loaded[id] = false;
				Audie.bank[id] = null;
			}
		}
	},
	play:function(id){
		if(sessionStorage.iPhone == "Y"){
			return false;
		}
		Audie.nowplay = (id == "map") ? Audie.mapswt : id;
		if(Audie.loaded[Audie.nowplay]){
			Audie.bank[Audie.nowplay].currentTime = 0;
			Audie.bank[Audie.nowplay].volume = Audie.BGMvol;
			setTimeout(function(){Audie.bank[Audie.nowplay].play();}, 500);
		}
	},
	stop:function(id){
		Audie.nowplay = "";
		var aid = (id == "map") ? Audie.mapswt : id;
		if(Audie.loaded[aid]){
			switch(id){
			case "map":
			case "battle":
				setTimeout(function(){Audie.bank[aid].pause()}, 500);
				break;
			default:
				Audie.bank[id].pause();
				break;
			}
		}
	},
	bgmchk:function(){
		var targethalf = 0;
		for(var i=1; i<=4; i++){
			if(TotalGold(i) >= Board.target / 2){
				targethalf++;
			}
		}
		if(targethalf >= 1 && Audie.mapswt == "map1"){
			if(Audie.loaded["map2"]){
				Audie.mapswt = "map2";
				Audie.stop("map1");
				Audie.play("map");
			}
		}
		if(targethalf == 0 && Audie.mapswt == "map2"){
			if(Audie.loaded["map1"]){
				Audie.mapswt = "map1";
				Audie.stop("map2");
				Audie.play("map");
			}
		}
	},
	volchg:function (type){
		if(type == "bgm"){
			var filetype = ["map1", "map2", "battle", "goal"];
			Audie.BGMvol = Number($("#bgmvolume").val()) / 100;
			for(var i = 0; i<filetype.length; i++){
				if(Audie.bank[filetype[i]]){
					Audie.bank[filetype[i]].volume = Audie.BGMvol;
				}
			}
			$("#spanvolbgm").html("("+$("#bgmvolume").val()+")");
			//save
			localStorage.ob_volume_bgm = $("#bgmvolume").val();
		}else{
			Audie.SEvol = Number($("#sevolume").val()) / 100;
			$("#spanvolse").html("("+$("#sevolume").val()+")");
			//save
			localStorage.ob_volume_se = $("#sevolume").val();
		}
	}
}
