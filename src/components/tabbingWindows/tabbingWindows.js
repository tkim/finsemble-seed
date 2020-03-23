const windowsInStack = [];
let componentType;
let stackedWindow;

/**
 * Removes a window from the stack
 * @param {string} windowName the name of the window to remove
 */
const removeWindowFromStack = (windowName) => {
	let i = -1;
	windowsInStack.forEach((value, index) => {
		if (value.windowName === windowName) {
			i = index;
		}
	});

	// Only try to remove the window if it is actually in the stack
	if (i >= 0) {
		windowsInStack.splice(i, 1);
	}
}

/**
 * Handler for the parent cleared event.
 * 
 * @param {object} evt the event data
 */
const onParentCleared = (evt) => {
	// The when removing windows because of the parent cleared event, the last window should be left in the stack for
	// creating new stacks
	if (windowsInStack.length > 1) {
		removeWindowFromStack(evt.data.name);
	}

	// If there are fewer than two windows, the stack is destroyed.
	if (windowsInStack.length < 2) {
		stackedWindow = null;
	}
}

/**
 * Handler for the closed event.
 * 
 * @param {object} evt 
 */
const onClosed = (evt) => {
	// When closing windows, always remove the window from the stack.
	removeWindowFromStack(evt.data.name);
}

/**
 * Create a window
 * 
 * @returns the created window
 */
const createChildWindow = async () => {
	const spawnParams = {
		groupOnSpawn: windowsInStack.length === 0,
		top: "adjacent",
		position: "relative"
	};
	
	const child = (await FSBL.Clients.LauncherClient.spawn(componentType, spawnParams)).response;
	child.finWindow.addListener("clearParent", onParentCleared);
	child.finWindow.addListener("closed", onClosed);

	windowsInStack.push(child.windowIdentifier);

	return child;
}

/**
 * Creates a StackedWindow containing the child window.
 * 
 * @param {*} child The child window to add to the stack
 */
const createStackedWindow = async (child) => {
	return new Promise((resolve, reject) => {
		// Create the StackedWindow to contain the windows that are tabbed together.
		const stackedWindowParams = {
			windowIdentifiers: windowsInStack,
			visibleWindowIdentifier: child.windowIdentifier,
			create: true
		};
		console.log("*** Creating stacked window", stackedWindowParams);
		
		// Listen for the "parent-set" event to get a handle to the stacked window.
		// NOTE: This is only necessary because we are not tabbing windows together with the current window. If you
		//       tab windows together with the current window, the stacked window is returned by the callback passed to 
		//       getStackedWindow.
		const onParentSet = (evt) => {
			const windowName = evt.data.parentName;
			child.finWindow.setParent(
				{
					windowName
				},
				(err, res) => {
					if (err) {
						reject(err);
					} else {
						console.log("*** Stacked window created")
						resolve(res);
					}
				}
			);
			child.finWindow.removeListener("parent-set", onParentSet);

			// Set the window that is visible in the StackedWindow.
			stackedWindow.setVisibleWindow({ windowIdentifier: child.windowIdentifier })
		};
		child.finWindow.addListener("parent-set", onParentSet);

		FSBL.Clients.WindowClient.getStackedWindow(stackedWindowParams);
	});
}

const addChildWindow = async () => {
	if (windowsInStack.length === 0) {
		// Create the first window below the parent window and group the two windows together.
        console.log("*** Creating first child");
		await createChildWindow();
		console.log("*** First child created");
	} else if (!stackedWindow) {
		// Create the second window in the same location as the first window so it doesn't spawn in one location then
		// move to another. 
        console.log("*** Creating second child");
		const child = await createChildWindow();

		stackedWindow = await createStackedWindow(child);
	} else {
		// Create a child window in the same location as the first window so it doesn't spawn in one location then move 
		// to another. 
		console.log("*** Adding to stacked window");
		const child = await createChildWindow();

		// Add the created child window to the StackedWindow.
		stackedWindow.addWindow(
			{
				windowIdentifier: child.windowIdentifier,
				position: windowsInStack.length - 1
			}, () => stackedWindow.setVisibleWindow({ windowIdentifier: child.windowIdentifier })
		);
		console.log("** Window added to stacked window");
	}
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