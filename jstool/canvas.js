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
	clear:function(arg){
		if(arg.id){
			var w = (arg.w) ? arg.w : document.getElementById(arg.id).width;
			var h = (arg.h) ? arg.h : document.getElementById(arg.id).height;
			var ctx = Canvas.ctx(arg.id);
			ctx.clearRect(0, 0, w, h);
		}
	},
	cache:function(arg){
		var key;
		if(arg.key.constructor.name == "Array"){
			key = arg.key.join(":");
		}else{
			key = arg.key;
		}
		var ctx = Canvas.ctx(arg.id);
		var img = new Image();
		img.src = ctx.toDataURL('image/png');
		img.onload = function(){
			Canvas.images[arg.key] = this;
		}
	},
	draw:function(arg){
		if(arg.src.constructor.name == "Array"){
			if(arg.src.length > 0){
				var src = arg.src.shift();
				src = Canvas.srcs[src] || src;
				var oImage = new Image();
				oImage.src = src;
				oImage.onload = function(){
					arg.img = this;
					Canvas._draw(arg);
					Canvas.draw(arg);
				}
			}else{
				if(arg.fnc){
					arg.fnc();
				}
			}
		}else{
			var oImage = new Image();
			oImage.src = Canvas.srcs[arg.src] || arg.src;
			oImage.onload = function(){
				arg.img = this;
				Canvas._draw(arg);
				if(arg.fnc){
					arg.fnc();
				}
			}
		}
	},
	_draw:function(arg){
		var ctx = Canvas.ctx(arg.id);
		var posx = (arg.x) ? arg.x : 0;
		var posy = (arg.y) ? arg.y : 0;
		var sizex, sizey, rotatex, rotatey;
		var zoom = (arg.zoom) ? arg.zoom : 1.0;
		if(arg.cut){
			sizex = Math.round(arg.cut.w * zoom);
			sizey = Math.round(arg.cut.h * zoom);
		}else{
			sizex = Math.round(arg.img.width * zoom);
			sizey = Math.round(arg.img.height * zoom);
		}
		ctx.save();
		if(arg.r){
			rotatex = posx + Math.round(sizex / 2);
			rotatey = posy + Math.round(sizey / 2);
			ctx.translate(rotatex, rotatey);
			ctx.rotate(arg.r * Math.PI / 180);
			ctx.translate(rotatex * -1 , rotatey * -1)
		}
		if(arg.alpha) ctx.globalAlpha = arg.alpha;
		if(arg.composite) ctx.globalCompositeOperation = arg.composite;
		if(arg.cut){
			ctx.drawImage(arg.img, arg.cut.x, arg.cut.y,  arg.cut.w, arg.cut.h, posx, posy, sizex, sizey);
		}else{
			ctx.drawImage(arg.img, posx, posy, sizex, sizey);
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
