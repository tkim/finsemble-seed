const Finsemble = require("@chartiq/finsemble");

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("callRequestListener Service starting up");

// Add and initialize any other clients you need to use (services are initialized by the system, clients are not):
// Finsemble.Clients.AuthenticationClient.initialize();
// Finsemble.Clients.ConfigClient.initialize();
// Finsemble.Clients.DialogManager.initialize();
// Finsemble.Clients.DistributedStoreClient.initialize();
// Finsemble.Clients.DragAndDropClient.initialize();
Finsemble.Clients.LauncherClient.initialize();
// Finsemble.Clients.LinkerClient.initialize();
// Finsemble.Clients.HotkeyClient.initialize();
// Finsemble.Clients.SearchClient.initialize();
// Finsemble.Clients.StorageClient.initialize();
// Finsemble.Clients.WindowClient.initialize();
// Finsemble.Clients.WorkspaceClient.initialize();

// NOTE: When adding the above clients to a service, be sure to add them to the start up dependencies.

//Ensure an instant of this component has been launched and is brought to front when starting a call
const COMPONENT_TYPE = "Welcome Component";
//response code indicating call was started successfully
const RESPONSE_CODE_SUCCESS = 0


class callRequestListenerService extends Finsemble.baseService {
	/**
	 * Initializes a new instance of the callRequestListenerService class.
	 */
	constructor() {
		super({
			// Declare any service or client dependencies that must be available before your service starts up.
			startupDependencies: {
				// If the service is using another service directly via an event listener or a responder, that service
				// should be listed as a service start up dependency.
				services: [],
				// When ever you use a client API with in the service, it should be listed as a client startup
				// dependency. Any clients listed as a dependency must be initialized at the top of this file for your
				// service to startup.
				clients: ["launcherClient"]
			}
		});

		this.readyHandler = this.readyHandler.bind(this);

		this.onBaseServiceReady(this.readyHandler);
	}

	/**
	 * Fired when the service is ready for initialization
	 * @param {function} callback
	 */
	readyHandler(callback) {
		this.createRouterEndpoints();
		Finsemble.Clients.Logger.log("callRequestListener Service ready");
		callback();
	}

	/**
	 * Ensure a particular component is on the screen, initiate a call and if successful,
	 * broadcast data about the call for other components to respond to as context.
	 * @param {*} data
	 */
	makeCall(data) {
		return new Promise(async (resolve) => {
			//Ensure a particular component is open
			await this.ensureOpen();
			//Attempt to initiate the call
			let responseCode = await this.sendRequest(data);
			if (responseCode === RESPONSE_CODE_SUCCESS) {
				// Notify other components by broadcasting context data about the call
				this.broadcastCall(data);
			}
			resolve(responseCode);
		})
	}

	/**
	 * Broadcast context data about the call.
	 * @param {*} data
	 */
	broadcastCall(data) {
		//TODO: Implement your context broadcast here, for example with an FDC3 desktop agent or the Finsemble ROuterClient
		Finsemble.Clients.RouterClient.transmit("callRequestListener.callStarted", data);
	}

	/**
	 * @param data
	 */
	sendRequest(data) {
		//TODO: Make a request to Cloud 9 service to initiate the call

		// E.g. via the Finsemble RouterClient
		// return new Promise((resolve, reject) => {
		// 	Finsemble.Clients.RouterClient.query(
		// 		"C9.channel.if.finsemble",
		// 		{},
		// 		((err, response) => {
		// 			if(err) {
		// 				reject(err)
		// 				return;
		// 			}
		// 			resolve(RESPONSE_CODE_SUCCESS) // successful response
		// 		})
		// 	)
		// });
		//

		// Successful response code
		return RESPONSE_CODE_SUCCESS;
	}


	/**
	 * Creates a router endpoint for you service.
	 * Add query responders, listeners or pub/sub topic as appropriate.
	 */
	createRouterEndpoints() {
		// Add query responder for initiating a call
		Finsemble.Clients.RouterClient.addResponder("callRequestListener.makeCall", (err, message) => {
			if (err) {
				return Finsemble.Clients.Logger.error("Failed to setup callRequestListener.makeCall responder", err);
			}

			Finsemble.Clients.Logger.log('callRequestListener Query: ' + JSON.stringify(message));

			try {
				//TODO: add any data validation here and raise an exception if necessary

				// Data in query message can be passed as parameters to a method in the service.
				this.makeCall(message.data).then(responseCode => {
					// Send query response to the function call, with optional data, back to the caller.
					message.sendQueryResponse(null, responseCode);
				});
			} catch (e) {
				// If there is an error, send it back to the caller
				message.sendQueryResponse(e);
			}
		});
	}

	/**
	 * Ensure that an instance of nominated component is open, if so bring it to front, or spawn it if not
	 */
	ensureOpen() {
		return new Promise(async (resolve) => {

			let windowIdentifiers = await findAnInstance(COMPONENT_TYPE);
			console.log(windowIdentifiers);
			if (windowIdentifiers.length > 0) {
				//do something with the windowIdentifiers, like bring one to front
				//await Finsemble.Clients.LauncherClient.showWindow(windowIdentifiers[0], {});

				// Temporary workaround for bug on showWindow from service https://chartiq.kanbanize.com/ctrl_board/106/cards/25979/details/
				await Finsemble.Clients.RouterClient.query(`WindowService-Request-bringToFront`, {windowIdentifier: windowIdentifiers[0]})

				resolve();
			} else {
				//lets go ahead and spawn one
				Finsemble.Clients.LauncherClient.spawn(COMPONENT_TYPE, {
					top: "center",
					left: "center"
				}, () => {
					resolve();
				});
			}
		})
			.catch(function (err) {
				console.error(err)
			});
	}
}

/** Example Function to check if one or more instances of a component currently exist
    and to return windowIdentifiers to allow you to make calls relating to them. */
async function findAnInstance(componentType) {
	let {err, data} = await Finsemble.Clients.LauncherClient.getActiveDescriptors();
	if (err) {
		console.error(err);
		return Promise.reject(err);
	} else {
		let windowIdentifiers = [];
		Object.keys(data).forEach(windowName => {
			if (data[windowName].componentType == componentType) {
				windowIdentifiers.push({
					componentType: componentType,
					windowName: windowName
				});
			}
		});
		return Promise.resolve(windowIdentifiers);
	}
}


const serviceInstance = new callRequestListenerService();

serviceInstance.start();
module.exports = serviceInstance;
