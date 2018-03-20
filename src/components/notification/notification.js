const $ = require("jquery");
const LauncherClient =  FSBL.Clients.LauncherClient;
const WindowClient =  FSBL.Clients.WindowClient;

FSBL.addEventListener('onReady', function () {
	let spawnData = FSBL.Clients.WindowClient.getSpawnData();
	Logger.log("Notifications spawn data: " + JSON.stringify(spawnData));
	if (spawnData && spawnData.text){
		$('#content').text(spawnData.text);
	}
	if (spawnData && spawnData.action){
		$('body').click(function (event) {
			let finwin = WindowClient.getCurrentWindow();
			LauncherClient.spawn(spawnData.action.componentType, spawnData.action.params, function() {

				//notify the service that this notification is gone and others can move down.


				//close the notification
				finwin.close(true);
			});
		});
	}
});