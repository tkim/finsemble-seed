import {stackWindow, popWindow, spawnNotification} from '../../services/stacking/stackingClient';
const $ = require("jquery");

FSBL.addEventListener('onReady', function () {
	//do things with FSBL in here.

	$('#stackButton').click(function (event) { stackWindow(); });
	$('#popButton').click(function (event) { popWindow(); });
	$('#notifyButton').click(
		function (event) { 
			spawnNotification("Test notification content", {componentType: "test-stack", params: {left: "center", top: "center"}} ); 
		}
	);
	
});