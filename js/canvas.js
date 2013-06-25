var Canvas = {
	//Property
	id:"",
	images:[],
	srcs:[],
	timer:null,
	actobj:new Array(),
	ctx:function(id){
		if(id){
			Canvas.cvsid = id;
		}else{
			id = Canvas.id;
		}
		return document.getElementById(id).getContext("2d");
	},
	//Method
	clear:function(arr){
		if(arr.id){
			var w = (arr.w) ? arr.w : document.getElementById(arr.id).width;
			var h = (arr.h) ? arr.h : document.getElementById(arr.id).height;
			var ctx = Canvas.ctx(arr.id);
			ctx.clearRect(0, 0, w, h);
		}
	},
	cache:function(arr){
		var key;
		if(arg.key.constructor.name == "Array"){
			key = arg.key.join(":");
		}else{
			key = arg.key;
		}
		var ctx = Canvas.ctx(arr.id);
		var img = new Image();
		img.src = ctx.toDataURL('image/png');
		img.onload = function(){
			Canvas.images[arr.key] = this;
		}
	},
	draw:function(arr){
		if(arr.src.constructor.name == "Array"){
			if(arr.src.length > 0){
				var src = arr.src.shift();
				src = Canvas.srcs[src] || src;
				var oImage = new Image();
				oImage.src = src;
				oImage.onload = function(){
					arr.img = this;
					Canvas._draw(arr);
					Canvas.draw(arr);
				}
			}else{
				if(arr.fnc){
					arr.fnc();
				}
			}
		}else{
			var oImage = new Image();
			oImage.src = Canvas.srcs[arr.src] || arr.src;
			oImage.onload = function(){
				arr.img = this;
				Canvas._draw(arr);
				if(arr.fnc){
					arr.fnc();
				}
			}
		}
	},
	_draw:function(arr){
		var ctx = Canvas.ctx(arr.id);
		var posx = (arr.x) ? arr.x : 0;
		var posy = (arr.y) ? arr.y : 0;
		var sizex, sizey, rotatex, rotatey;
		var zoom = (arr.zoom) ? arr.zoom : 1.0;
		if(arr.cut){
			sizex = Math.round(arr.cut.w * zoom);
			sizey = Math.round(arr.cut.h * zoom);
		}else{
			sizex = Math.round(arr.img.width * zoom);
			sizey = Math.round(arr.img.height * zoom);
		}
		ctx.save();
		if(arr.r){
			rotatex = posx + Math.round(sizex / 2);
			rotatey = posy + Math.round(sizey / 2);
			ctx.translate(rotatex, rotatey);
			ctx.rotate(arr.r * Math.PI / 180);
			ctx.translate(rotatex * -1 , rotatey * -1)
		}
		if(arr.alpha) ctx.globalAlpha = arr.alpha;
		if(arr.composite) ctx.globalCompositeOperation = arr.composite;
		if(arr.cut){
			ctx.drawImage(arr.img, arr.cut.x, arr.cut.y,  arr.cut.w, arr.cut.h, posx, posy, sizex, sizey);
		}else{
			ctx.drawImage(arr.img, posx, posy, sizex, sizey);
		}
		ctx.restore();
	},
	rect:function(i_id, i_opt){
		var ctx = Canvas.ctx(i_id);
		ctx.save();
		ctx.fillStyle = "rgb("+i_opt.rgb[0]+","+i_opt.rgb[1]+","+i_opt.rgb[2]+")";
		if(i_opt.alpha) ctx.globalAlpha = i_opt.alpha;
		ctx.fillRect(i_opt.x, i_opt.y, i_opt.w, i_opt.h);
		ctx.restore();
	},
	fill:function(i_id, i_opt){
		var ctx = Canvas.ctx(i_id);
		var rotatex, rotatey;
		ctx.save();
		if(i_opt.rgb){
			ctx.fillStyle = "rgb("+i_opt.rgb[0]+","+i_opt.rgb[1]+","+i_opt.rgb[2]+")";
		}
		if(i_opt.r){
			rotatex = (i_opt.rx) ? i_opt.rx : 0;
			rotatey = (i_opt.ry) ? i_opt.ry : 0;
			ctx.translate(rotatex, rotatey);
			ctx.rotate(i_opt.r * Math.PI / 180);
			ctx.translate(rotatex * -1 , rotatey * -1);
		}
		if(i_opt.alpha) ctx.globalAlpha = i_opt.alpha;
		if(i_opt.composite) ctx.globalCompositeOperation = i_opt.composite;
		ctx.beginPath();
		if(i_opt.arc){
			ctx.arc(i_opt.x, i_opt.y, i_opt.arc, 0,Math.PI*2);
		}else{
			ctx.moveTo(i_opt.x[0], i_opt.y[0]);
			for(var i=1; i<i_opt.x.length; i++){
				ctx.lineTo(i_opt.x[i], i_opt.y[i]);
			}
		}
		ctx.fill();
		ctx.restore();
	},
	//Method(Animation)
	start:function(i_opt){
		if(i_opt.items){
			var aobj = {id:"", actcnt:0, actgroup:false, loopcnt:0, loopstop:0, items:new Array()}
			aobj.id = (i_opt.id) ? i_opt.id : "";
			aobj.loopstop = (i_opt.times) ? i_opt.times : 0;
			aobj.items = i_opt.items;
			this.actobj.push(aobj);
		}
		if(this.timer == null){
			var msec = (i_opt.interval) ? i_opt.interval * 1000 : 1000;
			this.timer = setInterval(function(){Canvas._anime();}, msec);
			this._anime();
		}
	},
	_anime:function(){
		jQuery.each(this.actobj, function(i_idx, i_obj){
			while(true){
				switch(i_obj.items[i_obj.actcnt]){
				case "wait":
					break;
				case "group":
					i_obj.actgroup = !(i_obj.actgroup);
					break;
				default:
					var cmd = "Canvas."+i_obj.items[i_obj.actcnt];
					eval(cmd);
					break;
				}
				i_obj.actcnt++;
				if(i_obj.items.length == i_obj.actcnt) break;
				if(i_obj.actgroup) continue;
				break;
			}
			if(i_obj.items.length == i_obj.actcnt){
				i_obj.actcnt = 0;
				i_obj.loopcnt++;
				if(i_obj.loopcnt == i_obj.loopstop) Canvas.stop(i_obj.id);
			}
		});
	},
	stop:function(i_id){
		//this.actobj = this.actobj.reject(function(i_obj){return (i_obj.id == i_id)});
		this.actobj = [];
		if(this.actobj.length == 0 && this.timer != null){
			clearInterval(this.timer);
			this.timer = null;
		}
	}
}
