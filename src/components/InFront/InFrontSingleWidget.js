import * as widgets from "./InFrontWidgets"

let infront;

//perform the initialisation required when Finsemble is ready
FSBL.addEventListener('onReady', function () {
	let spawnData = FSBL.Clients.WindowClient.getSpawnData();
	let widgetType = spawnData.widget;

	if(typeof widgets[widgetType] === 'function') {
		FSBL.Clients.Logger.log(`Rendering InFront widgetType: ${widgetType} in element: "#widget"`);
		FSBL.Clients.WindowClient.setWindowTitle(`InFront -  ${widgetType}`)
		infront = widgets.inFrontInit([widgets[widgetType]],["#widget"]);

	} else{
		FSBL.Clients.Logger.error(`InFront widgetType: ${widgetType} not found...`);
		FSBL.Clients.WindowClient.setWindowTitle(`InFront -  Unkown widget type: ${widgetType}`)
	}
});