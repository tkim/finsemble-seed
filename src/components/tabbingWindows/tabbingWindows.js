let componentType;
let firstChild;
let stackedWindow;
let i = -1;
const addChildWindow = async () => {
    if (!firstChild) {
        console.log("*** Creating first child");
        const spawnParams = {
            groupOnSpawn: true,
            top: "adjacent",
            position: "relative"
        };
        firstChild = (await FSBL.Clients.LauncherClient.spawn(componentType, spawnParams)).response;
        console.log("*** First child created");
    } else if (!stackedWindow) {
        console.log("*** Creating second child");
        const spawnParams = {
            top: "adjacent",
            position: "relative"
        };
        const secondChild = (await FSBL.Clients.LauncherClient.spawn(componentType, spawnParams)).response;
        console.log("*** Second child created");
        const stackedWindowParams = {
            windowIdentifiers: [
                firstChild.windowIdentifier,
                secondChild.windowIdentifier
            ],
            visibleWindowIdentifier: secondChild.windowIdentifier,
            create: true
        };
		console.log("*** Creating stacked window", stackedWindowParams);
		const onParentSet = (evt) => {
			const windowName = evt.data.parentName;
			secondChild.finWindow.setParent(
				{
					windowName
				},
				(err, res) => {
					if (err) {
						console.err(err);
					} else {
						console.log("*** Stacked window created")
						stackedWindow = res;
					}
				}
			)
			secondChild.finWindow.removeListener("parent-set", onParentSet);
		};
		secondChild.finWindow.addListener("parent-set", onParentSet);

		FSBL.Clients.WindowClient.getStackedWindow(stackedWindowParams, () => { });
    } else {
        console.log("*** Adding to stacked window");
        const spawnParams = {
            top: "adjacent",
            position: "relative"
        };
        child = (await FSBL.Clients.LauncherClient.spawn(componentType, spawnParams)).response;
        stackedWindow.addWindow({ windowIdentifier: child.windowIdentifier, position: i })
        console.log("** Window added to stacked window");
    }
    i++;
}

const FSBLReady = () => {
	try {
		// Do things with FSBL in here.	
		componentType = FSBL.Clients.WindowClient.getWindowIdentifier().componentType;

		const button = document.createElement("button");
		const text = document.createTextNode("Add Child Window");
		button.appendChild(text);
		button.onclick = addChildWindow;

		const container = document.getElementById("container");
		if (container) {
			container.appendChild(button);
		} else {
			document.body.appendChild(button);
		}
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}