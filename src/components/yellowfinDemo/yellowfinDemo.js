FSBL.addEventListener('onReady', function () {
	var $ = require("jquery");
	$('iframe').height(window.innerHeight-50);
	$('iframe').width(window.innerWidth-5);

	//reinject the report on window resize
	window.onresize = function() { 
		$('iframe').height(window.innerHeight-50);
		$('iframe').width(window.innerWidth-5);
	};

	FSBL.Clients.WindowClient.setWindowTitle("YellowFin (Demo server)");
 
}); 