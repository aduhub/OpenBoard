//average(arr)       平均
//inarray(tgt, arr)  配列存在

var $T = {
	result:false,
	_rndlog:[""],
	_timecupcel:[],
	browser:function(){
		var ua = navigator.userAgent.toLowerCase();
		if(ua.indexOf("chrome") != -1){
			return "chrome";
		}else if(ua.indexOf("firefox") != -1){
			return "firefox";
		}else{
			return "";
		}
	},
	//平均取得
	average:function(arr){
		var total = 0;
		if(arr.length > 0){
			for(var i=0; i<arr.length; i++){
				total += arr[i];
			}
			return Math.floor(total / arr.length);
		}else{
			return 0;
		}
	},
	//文字列変更
	chgstr:function(str, idx, rstr){
		var retstr = str.substring(0, idx);
		retstr += rstr;
		retstr += str.substring(idx + rstr.length);
		return  retstr;
	},
	//範囲チェック
	inrange:function(val, min, max){
		var ret = false;
		if(val >= min && val <= max){
			ret = true;
		}
		return ret;
	},
	//配列内チェック
	inarray:function(tgt, arr){
		try{
			switch($T.typer(tgt)){
			case "Number":
				for(var i=0; i<arr.length; i++){
					if(Number(arr[i]) === tgt){
						return true;
					}
				}
				break;
			case "String":
			case "RegExp": //RegExp
				for(var i=0; i<arr.length; i++){
					if(arr[i].match(tgt)){
						return true;
					}
				}
				break;
			}
			return false;  
		}catch(e){
			return false;
		}
	},
	//配列内カウント
	countarray:function(tgt, arr){
		var ret = 0;
		try{
			switch($T.typer(tgt)){
			case "Number":
				for(var i=0; i<arr.length; i++){
					if(Number(arr[i]) === tgt){
						ret++;
					}
				}
				break;
			case "String":
			case "RegExp": //RegExp
				for(var i=0; i<arr.length; i++){
					if(arr[i].match(tgt)){
						ret++;
					}
				}
				break;
			}
			return ret;  
		}catch(e){
			return 0;
		}
	},
	//配列減算javascript 衝突
	arrconflict:function(arr1, arr2){
		try{
			var tgt, idx;
			var arr2c = [];
			arr2c = arr2c.concat(arr2);
			while(tgt = arr2c.shift()){
				idx = arr1.indexOf(tgt)
				if(idx >= 0){
					arr1.splice(idx, 1)
				}
			}
			return arr1;
		}catch(e){
			return [];
		}
	},
	//配列検索
	search:function(arr, pnm, tgt){
		try{
			for(var i=0; i<arr.length; i++){
				switch($T.typer(tgt)){
				case "Number":
					if(Number(arr[i][pnm]) === tgt){
						this.result = arr[i];
						return true;
					}
					break;
				case "String":
				case "RegExp":
					if(arr[i][pnm].match(tgt)){
						this.result = arr[i];
						return true;
					}
					break;
				}
			}
			return false;  
		}catch(e){
			return false;
		}
	},
	//範囲縮小
	shrink:function(val, min, max){
		var ret = Math.min(max, Math.max(min, val));
		return ret;
	},
	//ランダム文字(重複なし)
	rndstr:function(len){
		var rnd, retstr = "";
		var seedstr = "123456789ABCDEFGHJKLPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
		while(this._rndlog.indexOf(retstr) >= 0){
			retstr = "";
			for(var i=1; i<=(len || 8); i++){
				rnd = Math.floor(Math.random() * seedstr.length);
				retstr += seedstr.substr(rnd, 1);
			}
		}
		this._rndlog.push(retstr);
		return retstr;
	},
	//ランダムソート
	rndsort:function(arr){
		try{
			var rnd, ret = [], seed = [];
			seed = seed.concat(arr);
			while(seed.length > 0){
				rnd = Math.floor(Math.random() * seed.length);
				ret.push(seed[rnd]);
				seed.splice(rnd, 1);
			}
			return ret;
		}catch(e){
			return [];
		}
	},
	strlength:function(str){
		try{
			var strlen = 0;
			for(var i=0; i<str.length; i++){
				if(escape(str.charAt(i)).length >= 4){
					strlen += 2;
				}else{
					strlen += 1;
				}
			}
			return strlen;
		}catch(e){
			return 0;
		}
	},
	//object type string
	typer:function(o){
		if(typeof o !== "undefined"){
			return o.constructor.name;
		}else{
			return "Nothing";
		}
	},
	//stacktime({fnc:実行関数, msec:待機ミリ秒})
	stacktimer:function (arg){
		var key = arg.key || "default";
		var box = {fnc:arg.fnc, msec:arg.msec, base:new Date};
		if($T._timecupcel[key] && $T._timecupcel[key].length >= 1){
			$T._timecupcel[key].push(box);
		}else{
			$T._timecupcel[key] = [];
			$T._timecupcel[key].push(box);
			setTimeout(arg.fnc, 0);
			setTimeout($T._timer_loop, 2);
		}
	},
	_timer_loop:function (){
		var loop_continue = false;
		for(var key in $T._timecupcel){
			if($T._timecupcel[key].length >= 1){
				var now = new Date;
				var buffer = now - $T._timecupcel[key][0].base;
				if (buffer >= $T._timecupcel[key][0].msec) {
					$T._timecupcel[key].shift();
					if($T._timecupcel[key].length >= 1){
						setTimeout($T._timecupcel[key][0].fnc, 0);
						$T._timecupcel[key][0].base = new Date;
					}
				}
				if($T._timecupcel[key].length >= 1){
					loop_continue = true;
				}
			}
		}
		if(loop_continue == true){
			setTimeout($T._timer_loop, 2);	
		}
	}
}