import {inFrontInit, indexWidget, myListsWidget, focusWidget, orderbookWidget} from "./InFrontWidgets"

let infront;

//perform the initialisation required when Finsemble is ready
FSBL.addEventListener('onReady', function () {
	infront = inFrontInit([indexWidget,myListsWidget,focusWidget,orderbookWidget]);
});