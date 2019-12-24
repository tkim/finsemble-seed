

const FSBLReady = () => {
	try {
		// ================================
		// Setup service manager buttons

		// --------------------------------
		// Tomcat managed via start/stop script
		const startScriptButton = document.createElement("button");
		startScriptButton.className = "button";
		startScriptButton.appendChild(document.createTextNode("Start Tomcat Script"));
		startScriptButton.onclick = () => FSBL.Clients.LauncherClient.spawn("Start Tomcat Script");
		document.body.appendChild(startScriptButton);

		const stopScriptButton = document.createElement("button");
		stopScriptButton.className = "button";
		stopScriptButton.appendChild(document.createTextNode("Stop Tomcat Script"));
		stopScriptButton.onclick = () => FSBL.Clients.LauncherClient.spawn("Stop Tomcat Script");
		document.body.appendChild(stopScriptButton);

		const tomcatStatus = document.createElement("div");
		document.body.appendChild(tomcatStatus);
		tomcatStatus.innerText = "status: unknown";

		setInterval(async () => {
			const data = (await FSBL.Clients.LauncherClient.getActiveDescriptors()).data;
			const tomcatStarts = Object.keys(data).filter(key => key.startsWith("Start Tomcat Script"));
			const tomcatStops = Object.keys(data).filter(key => key.startsWith("Stop Tomcat Script"));
			const isRunning = tomcatStarts.length > tomcatStops.length;
			const status = isRunning ? "Running" : "Stopped";
			tomcatStatus.innerText = "status: " + status;
		}, 1000);


		// --------------------------------
		// Headless java component
		const startHeadlessButton = document.createElement("button");
		startHeadlessButton.className = "button";
		startHeadlessButton.appendChild(document.createTextNode("Start Headless java script"));
		startHeadlessButton.onclick = () => FSBL.Clients.LauncherClient.spawn("commerz_poc_headless");
		document.body.appendChild(startHeadlessButton);

		const stopHeadlessButton = document.createElement("button");
		stopHeadlessButton.className = "button";
		stopHeadlessButton.appendChild(document.createTextNode("Stop all Headless java Scripts"));
		stopHeadlessButton.onclick = () => {
			closeComponents("commerz_poc_headless");
		};
		document.body.appendChild(stopHeadlessButton);

		const headlessStatus = document.createElement("div");
		document.body.appendChild(headlessStatus);
		headlessStatus.innerText = "status: unknown";

		setInterval(async () => {
			findInstances("commerz_poc_headless")
			.then(function(windowIdentifiers){
				const numRunning = windowIdentifiers.length;
				const status = numRunning > 0 ? numRunning + " running" : "Stopped";
				headlessStatus.innerText = "status: " + status;
			})
			.catch(function(err){
				console.error(err)
			});
			
		}, 1000);

	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
} 

/**
	Example function to close all instances of a component
*/
function closeComponents(componentType) {
	findInstances(componentType)
	.then(function(windowIdentifiers){
		windowIdentifiers.forEach(element => {
			FSBL.FinsembleWindow.getInstance(element)
			.then(({wrap}) => { wrap.close({removeFromWorkspace:true});} )
			.catch(function(err){
				console.error(err);
			});
		}); 
	})
	.catch(function(err){
		console.error(err)
	});
}

/** Example Function to check if one or more instances of a component currently exist and to return 
windowIdentifiers to allow you to make calls relating to them. */
async function findInstances(componentType){
	let {err, data} = await FSBL.Clients.LauncherClient.getActiveDescriptors();
	if (err) {
		console.error(err);
		return Promise.reject(err);
	} else {
		let windowIdentifiers = [];
		Object.keys(data).forEach(windowName => {
			if(data[windowName].componentType == componentType) {
				windowIdentifiers.push({componentType: componentType, windowName: windowName});
			}
		});
		return Promise.resolve(windowIdentifiers);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}