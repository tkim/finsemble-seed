import {inFrontInit, alertListWidget, alertWidget} from "./InFrontWidgets"

let infront;

//perform the initialisation required when Finsemble is ready
FSBL.addEventListener('onReady', function () {
	infront = inFrontInit(
		[alertListWidget,alertWidget], 
		["#alertList","#addAlert"], 
		[{linkChannels: 1}, {linkChannels: 1}]
	);
});