const FSBLReady = () => {
	try {
		window.showOrSpawn = async (args) => {
			var { name, params = {}, componentType = 'Welcome Component' } = args;

			params.spawnIfNotFound = true;
			params.addToWorkspace = true;

			await FSBL.Clients.LauncherClient.showWindow({windowName: name, componentType: componentType}, params);
		}
		window.hide = async (args) => {
			var { name } = args;
			let window = await FSBL.FinsembleWindow.getInstance({windowName: name});
			await window.wrap.hide();
		}
		window.toggle = (e, args) => {
			var { name, params = {} } = args;
			let element = e.target;
			FSBL.Clients.LauncherClient.toggleWindowOnClick(element, {windowName: name}, params);
		}
		document.getElementsByClassName('defaultTab')[0].click();
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}