const windowsInStack = [];
const componentType = "Welcome Component";
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
	return new Promise((resolve) => {
		FSBL.Clients.WindowClient.getBounds(async (err, bounds) => {
			if (err) {
				alert(err);
				return;
			}

			const spawnParams = {
				width: bounds.width,
				groupOnSpawn: windowsInStack.length === 0,
				top: "adjacent",
				position: "relative"
			};

			const child = (await FSBL.Clients.LauncherClient.spawn(componentType, spawnParams)).response;
			child.finWindow.addListener("clearParent", onParentCleared);
			child.finWindow.addListener("closed", onClosed);

			windowsInStack.push(child.windowIdentifier);

			resolve(child);
		});
	});
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
	const child = await createChildWindow();
	if ((windowsInStack.length > 0) && !stackedWindow) {
		stackedWindow = await createStackedWindow(child);
	} else {
		// Add the created child window to the StackedWindow.
		stackedWindow.addWindow(
			{
				windowIdentifier: child.windowIdentifier,
				position: windowsInStack.length - 1
			}, () => stackedWindow.setVisibleWindow({ windowIdentifier: child.windowIdentifier })
		);
	}
}

const removeChildWindow = async () => {
	return new Promise((resolve) => {
		if(windowsInStack.length > 1) {
			const identifier = windowsInStack[0];
			// Remove window from the tabGroup
			stackedWindow.removeWindow( {"windowIdentifier": identifier})

			// Remove window from the tabGroup and close it
			// stackedWindow.deleteWindow( {"windowIdentifier": identifier})

			FSBL.Clients.WindowClient.getBounds(async (err, bounds) => {
				if (err) {
					alert(err);
					return;
				}

				const spawnParams = {
					width: bounds.width,
					left: bounds.left + 25,
					top: bounds.bottom + 25,
					position: "relative"
				};

				const child = (await FSBL.Clients.LauncherClient.showWindow(identifier, spawnParams)).response;
				resolve(child);
			});
		} else {
			resolve();
		}

	});

}

const FSBLReady = () => {
	try {
		// Add a button to launch child windows to the page.
		const button = document.createElement("button");
		const text = document.createTextNode("Add Child Window");
		button.appendChild(text);
		button.onclick = addChildWindow;
		document.body.appendChild(button);

		// Add a button to launch child windows to the page.
		const button2 = document.createElement("button");
		button2.appendChild(document.createTextNode("Remove Child Window"));
		button2.onclick = removeChildWindow;
		document.body.appendChild(button2);
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}
