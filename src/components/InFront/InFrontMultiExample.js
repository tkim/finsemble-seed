import {inFrontInit, indexOverviewWidget, myListsWidget, focusWidget, orderbookWidget} from "./InFrontWidgets"

let infront;

//perform the initialisation required when Finsemble is ready
FSBL.addEventListener('onReady', function () {
	infront = inFrontInit([indexOverviewWidget,myListsWidget,focusWidget,orderbookWidget], ["#index","#my-list","#focus","#orderbook1"]);
});