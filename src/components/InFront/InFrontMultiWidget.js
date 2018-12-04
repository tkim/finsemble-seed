import * as widgets from "./InFrontWidgets"

let infront;

//perform the initialisation required when Finsemble is ready
FSBL.addEventListener('onReady', function () {
	let spawnData = FSBL.Clients.WindowClient.getSpawnData();
	let componentTitle = spawnData.title;
	let widgetCells = spawnData.widgetCells;

	let widgetIds = [];
	let widgetConfigs = [];
	let widgetTypes = [];

	let title = 'InFront';
	if (componentTitle) {
		title += " - " + componentTitle;
	}
	FSBL.Clients.WindowClient.setWindowTitle(title)
	document.title = title;

	if (widgetCells && Array.isArray(widgetCells) && Array.isArray(widgetCells[0])) {
		for (let r=0; r<widgetCells.length; r++){
			let row = document.createElement("div");
			row.setAttribute("class", "cell-row");
			for (let c = 0; c < widgetCells[r].length; c++) {
				let cell = document.createElement("div");
				cell.setAttribute("class", "cell " + widgetCells[r][c].cell_class);
				let cellInner = document.createElement("div");
				cellInner.setAttribute("class", "cell-content");
				cellInner.setAttribute("id", widgetCells[r][c].id);
				
				cell.appendChild(cellInner);
				row.appendChild(cell);

				//prepare config arrays for init
				widgetIds.push("#" + widgetCells[r][c].id);
				widgetTypes.push(widgets[widgetCells[r][c].type]);
				widgetConfigs.push(widgetCells[r][c].config);

				if(typeof widgets[widgetCells[r][c].type] !== 'function') {
					FSBL.Clients.Logger.error(`InFront widgetType: ${widgetCells[r][c].type} not found...`);
				}

			}
			let body = document.getElementsByTagName("body")[0];
			body.appendChild(row);
		}

		FSBL.Clients.Logger.log('Rendering InFront multi-widget component');
		
		infront = widgets.inFrontInit(widgetTypes, widgetIds, widgetConfigs);

	} else {
		FSBL.Clients.Logger.error('InFront Multi-Widget Component: widgetCells configuration not provided or format incorrect. widgetCells: ', widgetCells);
	}
});