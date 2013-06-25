var Graph = {
	cvsid:"CVS_GRAPH",
	data:[0,[],[],[],[]],
	target:4000,
	BaseInit:function(){
		var oCanvas = document.getElementById(Graph.cvsid).getContext("2d");
		oCanvas.clearRect(0, 0, 400, 200);
		oCanvas.save();
		oCanvas.fillStyle = "rgb(10,10,10)";
		oCanvas.fillRect(0, 0, 400, 200);
		oCanvas.restore();
	},
	Draw:function(){
		var oCanvas = document.getElementById(Graph.cvsid).getContext("2d");
		var maxg = 0;
		var palet = ["","255,0,0","0,80,255","0,255,0","255,255,0"];
		//調査
		for(var pno=1; pno<=4; pno++){
			for(var logno=0; logno<=Graph.data[0]; logno++){
				if(maxg <= Graph.data[pno][logno]){
					maxg = Graph.data[pno][logno];
				}
			}
		}
		maxg = Math.floor((maxg + 1000) / 1000) * 1000;
		//Baseline
		var xmv = 400 / Graph.data[0];
		var ymv = 200 / maxg;
		var ytgt = 200 - Math.floor(200 * (Graph.target / maxg))
		var yline = Math.ceil(Graph.data[0] / 5);
		oCanvas.save();
		oCanvas.beginPath();
		oCanvas.strokeStyle = "rgb(128,128,128)";
		for(var i=1; i<yline; i++){
			oCanvas.moveTo(xmv * i * 5, 0);
			oCanvas.lineTo(xmv * i * 5, 200);
		}
		oCanvas.stroke();
		oCanvas.beginPath();
		oCanvas.strokeStyle = "rgb(200,200,200)";
		for(var i=1; i<=4; i++){
			oCanvas.moveTo(0, i * 40);
			oCanvas.lineTo(400, i * 40);
		}
		oCanvas.stroke();
		oCanvas.beginPath();
	    oCanvas.strokeStyle = "rgb(255,0,0)";
	    oCanvas.moveTo(0, ytgt);
	    oCanvas.lineTo(400, ytgt);
	    oCanvas.stroke();
		oCanvas.restore();
		//font
		oCanvas.save();
		oCanvas.beginPath();
		oCanvas.font = "16px Consolas";
		oCanvas.fillStyle = "rgb(250,250,250)";
		for(var i=1; i<yline; i++){
			var str = i * 5;
			oCanvas.fillText(str, xmv * i * 5, 12);
		}
		for(var i=1; i<=4; i++){
			var str = Math.ceil(maxg / 5) * i;
			oCanvas.fillText(str, 2, 196 - 40 * i);
		}
		oCanvas.stroke();
		oCanvas.restore();
		//Graph
		for(var pno=1; pno<=4; pno++){
			oCanvas.save();
			oCanvas.beginPath();
			oCanvas.strokeStyle = "rgb("+palet[pno]+")";
			oCanvas.lineWidth = "1.5";
			for(var logno=0; logno<=Graph.data[0]; logno++){
				var gx = xmv * logno;
				var gy = 200 - Math.floor(ymv * Graph.data[pno][logno]);
				if(logno == 0) oCanvas.moveTo(gx, gy);
				oCanvas.lineTo(gx, gy);
			}
			oCanvas.stroke();
			oCanvas.restore();
		}
	}
}
