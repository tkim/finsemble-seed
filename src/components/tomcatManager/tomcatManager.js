const FSBLReady = () => {
	try {
		// Do things with FSBL in here.
		const startServiceButton = document.createElement("button");
		startServiceButton.appendChild(document.createTextNode("Start Tomcat Service"));
		startServiceButton.onclick = () => FSBL.Clients.LauncherClient.spawn("Start Tomcat Service");
		document.body.appendChild(startServiceButton);

		const stopServiceButton = document.createElement("button");
		stopServiceButton.appendChild(document.createTextNode("Stop Tomcat Service"));
		stopServiceButton.onclick = () => FSBL.Clients.LauncherClient.spawn("Stop Tomcat Service");
		document.body.appendChild(stopServiceButton);

		const startScriptButton = document.createElement("button");
		startScriptButton.appendChild(document.createTextNode("Start Tomcat Script"));
		startScriptButton.onclick = () => FSBL.Clients.LauncherClient.spawn("Start Tomcat script");
		document.body.appendChild(startScriptButton);

		const stopScriptButton = document.createElement("button");
		stopScriptButton.appendChild(document.createTextNode("Stop Tomcat Script"));
		stopScriptButton.onclick = () => FSBL.Clients.LauncherClient.spawn("Stop Tomcat Script");
		document.body.appendChild(stopScriptButton);

	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}