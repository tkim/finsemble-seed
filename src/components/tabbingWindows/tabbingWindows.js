let componentType;
let firstChild;
let stackedWindow;
let i = -1;

const onParentCleared = () => {
	debugger
	stackedWindow = null;
}

const addChildWindow = async () => {
	if (!firstChild) {
		// Create the first window below the parent window and group the two windows together.
        console.log("*** Creating first child");
        const spawnParams = {
            groupOnSpawn: true,
            top: "adjacent",
            position: "relative"
        };
        firstChild = (await FSBL.Clients.LauncherClient.spawn(componentType, spawnParams)).response;
		firstChild.finWindow.addListener("clearParent", onParentCleared);
		console.log("*** First child created");
	} else if (!stackedWindow) {
		// Create the second window in the same location as the first window so it doesn't spawn in one location then
		// move to another. 
        console.log("*** Creating second child");
        const spawnParams = {
            top: "adjacent",
            position: "relative"
        };
        const secondChild = (await FSBL.Clients.LauncherClient.spawn(componentType, spawnParams)).response;
		secondChild.finWindow.addListener("clearParent", onParentCleared);
		
		// Create the StackedWindow to contain the windows that are tabbed together.
		const stackedWindowParams = {
			windowIdentifiers: [
				firstChild.windowIdentifier,
				secondChild.windowIdentifier
			],
			visibleWindowIdentifier: secondChild.windowIdentifier,
			create: true
		};
		console.log("*** Creating stacked window", stackedWindowParams);
		
		// Listen for the "parent-set" event to get a handle to the stacked window.
		// NOTE: This is only necessary because we are not tabbing windows together with the current window. If you
		//       tab windows together with the current window, the stacked window is returned by the callback passed to 
		//       getStackedWindow.
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
			);
			secondChild.finWindow.removeListener("parent-set", onParentSet);

			// Set the window that is visible in the StackedWindow.
			stackedWindow.setVisibleWindow({ windowIdentifier: secondChild.windowIdentifier })
		};
		secondChild.finWindow.addListener("parent-set", onParentSet);

		FSBL.Clients.WindowClient.getStackedWindow(stackedWindowParams);
	} else {
		// Create a child window in the same location as the first window so it doesn't spawn in one location then move 
		// to another. 
		console.log("*** Adding to stacked window");
		const spawnParams = {
			top: "adjacent",
			position: "relative"
		};
        child = (await FSBL.Clients.LauncherClient.spawn(componentType, spawnParams)).response;
		secondChild.finWindow.addListener("clearParent", onParentCleared);
		
		// Add the created child window to the StackedWindow.
		stackedWindow.addWindow({ windowIdentifier: child.windowIdentifier, position: i }, () => {
			stackedWindow.setVisibleWindow({ windowIdentifier: child.windowIdentifier })
		});
		console.log("** Window added to stacked window");
	}
	i++;
}

const FSBLReady = () => {
	try {
		// Get the current windows windowType so the child windows can be spawned as a known type.
		componentType = FSBL.Clients.WindowClient.getWindowIdentifier().componentType;

		// Add a button to launch child windows to the page.
		const button = document.createElement("button");
		const text = document.createTextNode("Add Child Window");
		button.appendChild(text);
		button.onclick = addChildWindow;
		document.body.appendChild(button);
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}