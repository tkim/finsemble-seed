var componentToTrackName
var componentToTrack
var currentBounds

var trackingStore

const FSBLReady = async () => {
	document.getElementById("backup").onclick = persistTrackedState;
	document.getElementById("restore").onclick = restoreTrackedState;

	try {
		FSBL.Clients.DistributedStoreClient.createStore(
			{ store: `tracking-state-${finsembleWindow.identifier.windowName}`, global: true, persist:true, values: {} },
			(err, storeObject) => {
				trackingStore = storeObject;
			}
		);


		FSBL.Clients.WindowClient.getBounds(async (err, bound) => {
			let spawnData = FSBL.Clients.WindowClient.getSpawnData();
			componentToTrackName = spawnData.componentToTrack
			await restoreComponentToTrack(bound)
			moveComponentToTrack()

			//Add hotkey to move componentToTrack to current move position
			FSBL.Clients.HotkeyClient.addGlobalHotkey(["ctrl", "shift", "m"], moveComponentToTrackToMousePos, () => {})
		})
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

const moveComponentToTrackToMousePos = () => {
	constgetMousePosition((err, mousePosition) => {
		componentToTrack.setBounds(mousePosition, () => {})
		currentBounds.top = mousePosition.top
		currentBounds.left = mousePosition.left

		componentToTrack.setBounds(currentBounds, () => {
			FSBL.Clients.WindowClient.setComponentState({
				field: 'bound',
				value: currentBounds
			});
		})
	})
}

const getMousePosition = (cb) => {
	fin.desktop.System.getMousePosition((mousePosition) => {
		if (mousePosition.left || mousePosition.left === 0)
			mousePosition.x = mousePosition.left;
		if (mousePosition.top || mousePosition.top === 0)
			mousePosition.y = mousePosition.top;
		cb(null, mousePosition);
	}, (err) => {
		cb(err, null);
	});
}

const restoreComponentToTrack = async (bound) => {
	await FSBL.Clients.LauncherClient.showWindow({
		name: componentToTrackName,
		componentType: componentToTrackName
	}, {
		top: bound.top,
		left: bound.left,
		width: bound.width,
		height: bound.height,
		autoFocus: true,
		spawnIfNotFound: true
	}, async (err, windowIdentifier) => {
		componentToTrack = windowIdentifier.finWindow
		componentToTrack.restore(() => {
			restoreTrackedState();
			componentToTrack.focus()
		})
	})
}

const moveComponentToTrack = () => {
	// use tracking Component's state
	FSBL.Clients.WindowClient.getComponentState({
		field: 'bound',
	}, (err, state) => {
		if (state) {
			currentBounds = state
			setTrackingComponentPosition(state)
		} else {
			FSBL.Clients.WindowClient.getBounds((err, bound) => {
				setTrackingComponentPosition(bound)
			})
		}
	});
}

const setTrackingComponentPosition = async (position) => {
	componentToTrack.setBounds(position, () => {
		componentToTrack.maximize(() => {
			componentToTrack.restore(() => {
				//FinsembleWindow to listen bounds-change-end
				componentToTrack.addEventListener("bounds-change-end", (event) => {
					FSBL.Clients.WindowClient.restore()
					bounds = event.data;
					delete bounds.right;
					delete bounds.bottom
					currentBounds = bounds
					//Save bound to trackingComponent's state
					FSBL.Clients.WindowClient.setComponentState({
						field: 'bound',
						value: bounds
					});
				});

				componentToTrack.addEventListener("closed", (event) => {
					FSBL.Clients.WindowClient.close()
				});

				componentToTrack.addEventListener("minimized", (event) => {
					FSBL.Clients.WindowClient.minimize()
				});

				componentToTrack.addEventListener("restored", (event) => {
					FSBL.Clients.WindowClient.restore()
				});
			})
		})
	})
}

const restoreTrackedState = async () => {
		let allChannels = FSBL.Clients.LinkerClient.getAllChannels();

			allChannels.forEach((channel) => {
				try {
					console.log(`unlnking ${channel}`);
					FSBL.Clients.LinkerClient.unlinkFromChannel(channel.name, componentToTrack.identifier);
				} catch (e) {
					console.log(e);
				}
			})

		trackingStore.getValue('channels', (err, channels) => {
			if(!err && channels) {
				channels.forEach((channelName) => {
					console.log(`linking ${channelName}`);
					// FSBL.Clients.LinkerClient.linkToChannel(channelName, componentToTrack.identifier)
				})
			}
		});
}
const persistTrackedState = async () => {
	let components = await FSBL.Clients.LinkerClient.getLinkedComponents({
		componentTypes: [componentToTrackName]
	});

	let channels = [];

	if(components && components.length) {
		channels = components[0].channels;
	}

	console.log(channels);

	trackingStore.setValue({field: "channels", value: channels});
}

const onunload = () => {
	persistTrackedState();
	componentToTrack.minimize()
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}

window.addEventListener("unload", onunload)

FSBL.Clients.LauncherClient.getActiveDescriptors((err, data) => {
	let keys = Object.keys(data);

	keys.forEach((key) => {
		if(key.includes("Welcome")) {
			console.log(data[key])
			FSBL.FinsembleWindow.wrap(data[key], (err, wrap) => {
				let id  = wrap.identifier;
				delete id["uuid"];
				delete id["windowType"];
				delete id["name"];
				// id["uuid"] = "xyz";
				id["componentType"] = "Welcome Component";
				console.log(id)
				// FSBL.Clients.LauncherClient.showWindow(id, null);
				FSBL.Clients.LinkerClient.linkToChannel("group4", id);
			});
		}
	})
});

FSBL.Clients.LinkerClient.getLinkedComponents();
