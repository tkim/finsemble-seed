import {inFrontInit, focusWidget} from "./InFrontWidgets"

let infront;

//perform the initialisation required when Finsemble is ready
FSBL.addEventListener('onReady', function () {
	infront = inFrontInit([focusWidget]);
});