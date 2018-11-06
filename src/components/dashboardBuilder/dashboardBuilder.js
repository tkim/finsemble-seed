function renderPage() {
	FSBL.Clients.LauncherClient.spawn("dashboardCanvas", {}, (err, response) => {
	  if (err) {
		alert(err);
		alert(err);
	  }
	});
  }
  async function spawnCanvas() {
	var canvasAttributes = {
	  position: "unclaimed",
	  left: "25",
	  right: "25",
	  bottom: "25",
	  height: "400",
	  width: "400",
	  dockOnSpawn: false
	};
  
	await FSBL.Clients.LauncherClient.spawn("dashboardCanvas", canvasAttributes, (err, response) => {});
  }
  
  FSBL.addEventListener("onReady", function() {
	spawnCanvas();
  });
  