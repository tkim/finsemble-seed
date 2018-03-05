FSBL.addEventListener('onReady', function () {
	var $ = require("jquery");
	$('iframe').height($(window).height()-34);
	$('iframe').width($(window).width());

	//reinject the report on window resize
	window.onresize = function() { 
		$('iframe').height($(window).height()-32);
		$('iframe').width($(window).width());
	};

	FSBL.Clients.WindowClient.setWindowTitle("YellowFin");
 
});