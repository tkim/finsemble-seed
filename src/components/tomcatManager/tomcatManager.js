const FSBLReady = () => {
	try {
		// Do things with FSBL in here.
		// const startServiceButton = document.createElement("button");
		// startServiceButton.appendChild(document.createTextNode("Start Tomcat"));
		// startServiceButton.onclick = () => FSBL.Clients.LauncherClient.spawn("Start Tomcat Service");
		// document.body.appendChild(startServiceButton);

		// const stopServiceButton = document.createElement("button");
		// stopServiceButton.appendChild(document.createTextNode("Stop Tomcat Service"));
		// stopServiceButton.onclick = () => FSBL.Clients.LauncherClient.spawn("Stop Tomcat Service");
		// document.body.appendChild(stopServiceButton);

		const startScriptButton = document.createElement("button");
		startScriptButton.appendChild(document.createTextNode("Start Tomcat Script"));
		startScriptButton.onclick = () => FSBL.Clients.LauncherClient.spawn("Start Tomcat Script");
		document.body.appendChild(startScriptButton);

		const stopScriptButton = document.createElement("button");
		stopScriptButton.appendChild(document.createTextNode("Stop Tomcat Script"));
		stopScriptButton.onclick = () => FSBL.Clients.LauncherClient.spawn("Stop Tomcat Script");
		document.body.appendChild(stopScriptButton);

		const tomcatStatus = document.createElement("div");
		document.body.appendChild(tomcatStatus);
		tomcatStatus.innerText = "unknown";

		setInterval(async () => {
			const data = (await FSBL.Clients.LauncherClient.getActiveDescriptors()).data;
			const tomcatStarts = Object.keys(data).filter(key => key.startsWith("Start Tomcat Script"));
			const tomcatStops = Object.keys(data).filter(key => key.startsWith("Stop Tomcat Script"));
			const isRunning = tomcatStarts.length > tomcatStops.length;
			const status = isRunning ? "Running" : "Stopped";
			tomcatStatus.innerText = status;
		}, 1000)
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}