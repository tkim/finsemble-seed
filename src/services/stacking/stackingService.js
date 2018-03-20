const Finsemble = require("@chartiq/finsemble");
const RouterClient = Finsemble.Clients.RouterClient;
const LauncherClient = Finsemble.Clients.LauncherClient;
LauncherClient.initialize();
const baseService = Finsemble.baseService;
const Logger = Finsemble.Clients.Logger;

const stack = [];
const stackedHeight = 150;
const stackedWidth = 350;

const notifications = [];
const notificationHeight = 100;

function stackingService() {
	this.stackWindow = function(windowIdentifier, currBounds, cb){
		Logger.log(`Stacking window: ${windowIdentifier.windowName}`);
		let distFromBottom = stack.length * stackedHeight;
		stack.push({windowIdentifier: windowIdentifier, bounds: currBounds});

		//move notifications (if any) up
		
		cb({distFromBottom: distFromBottom, stackedWidth: stackedWidth, stackedHeight: stackedHeight});
	}
	
	this.popWindow = function(windowIdentifier, cb) {
		Logger.log(`Popping window: ${windowIdentifier.windowName}`);
		let foundIt = false;
		let stackSize = stack.length;
		let popIdx = 0;
		for (; popIdx < stackSize; popIdx++){
			if (stack[popIdx].windowIdentifier.windowName == windowIdentifier.windowName) {
				foundIt = true;
				break;
			}
		}
		if (foundIt) {
			var poppedWindow = stack[popIdx];
			stack.splice(popIdx,1);
			cb({bounds: poppedWindow.bounds});
			Logger.log(`popped ${poppedWindow.windowIdentifier.windowName}, adjusting other window positions`);

			//move other stacked windows down to accomodate
			let newStackSize = stack.length;
			for (; popIdx < newStackSize; popIdx++){
				let distFromBottom = popIdx * stackedHeight;
				
				LauncherClient.showWindow(stack[popIdx].windowIdentifier, 
					{
						right: 0,
						bottom: distFromBottom
					}, 
					function() {/* dummy callback for now as we already sent one back when we un-stacked the requested window */});
			}

			//move notifications down too



		} else {
			Logger.error("Did not find window " + windowIdentifier.windowName + " in the window stack... Stack: " + JSON.stringify(stack, undefined, 2));
		}
	}
	
	this.spawnNotification = function(textContent, action, cb) {
		//calcuate position (bottom)

		//spawn


	}

  return this;
}

stackingService.prototype = new baseService({
    startupDependencies: {
		services: ["dockingService", "authenticationService", "routerService"],
		clients: ["launcherClient"]
    }
});
let serviceInstance = new stackingService('stackingService');
serviceInstance.onBaseServiceReady(function (callback) {
    Logger.start();
    Logger.log("Adding general purpose Query responder");
    RouterClient.addResponder("stackingService functions", function(error, queryMessage) {
        if (!error) {
            Logger.log('stackingService Query: ' + JSON.stringify(queryMessage));

            if (queryMessage.data.query === "stackWindow") {
				if (queryMessage.data.winId && queryMessage.data.bounds){
					serviceInstance.stackWindow(queryMessage.data.winId, queryMessage.data.bounds, function (stackData) {
						stackData.msg = "you have been stacked";
						queryMessage.sendQueryResponse(null, stackData);
					});
				} else {
					Logger.error("Missing windowIdentifier or bounds in StackingService queryMessage.data: " + JSON.stringify(queryMessage.data, undefined, 2));
				}    
            } else if (queryMessage.data.query === "popWindow") {
				if (queryMessage.data.winId){
					serviceInstance.popWindow(queryMessage.data.winId, function (popData) {
						popData.msg = "you have been popped";
						queryMessage.sendQueryResponse(null, popData);
					});
				} else {
					Logger.error("Missing windowIdentifier or bounds in StackingService queryMessage.data: " + JSON.stringify(queryMessage.data, undefined, 2));
				}    
            } else if (queryMessage.data.query === "spawnNotification") {
				if (queryMessage.data.textContent && queryMessage.data.action){
					serviceInstance.spawnNotification(queryMessage.data.textContent, queryMessage.data.action, function () {
						let spawnData = {msg: `Notification spawned, text content: ${queryMessage.data.textContent}, action: ${JSON.stringify(queryMessage.data.action, undefined, 2)}`};
						queryMessage.sendQueryResponse(null, spawnData);
					});
				} else {
					Logger.error("Spawn Notification requested with insufficient data, queryMessage.data: " + JSON.stringify(queryMessage.data, undefined, 2));
				}    
            } else {
                queryMessage.sendQueryResponse("Unknown query function: " + queryMessage, null);
                Logger.error("Unknown query function: ", queryMessage);
            }
        } else {
            Logger.error("Failed to setup query responder", error);
        }
    });

    Logger.log("stackingService ready");
    callback();
});

serviceInstance.start();
window.stackingService = serviceInstance;