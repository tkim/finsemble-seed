const Logger = FSBL.Clients.Logger;
const RouterClient =  FSBL.Clients.RouterClient;
const WindowClient =  FSBL.Clients.WindowClient;
const LauncherClient =  FSBL.Clients.LauncherClient;

const stackedHeightCorrection = 40;

export function stackWindow(cb) {
    Logger.log("stackingClient: stackWindow called");
    let winId = WindowClient.getWindowIdentifier();
    let finwin = WindowClient.getCurrentWindow();
    finwin.getBounds(function (bounds) {
        Logger.log(
`Stacking client: current window bounds:
    top: ${bounds.top}
    left: ${bounds.left}
    height: ${bounds.height}
    width: ${bounds.width}
    right: ${bounds.right}
    bottom: ${bounds.bottom}`);

        RouterClient.query("stackingService functions", { query: "stackWindow", winId: winId, bounds: bounds }, function (err, response) {
            //response with new height from bottom and width/height to set
            Logger.log("stackingClient: stackingService.stackWindow response: ", response.data);

            //set new window bounds
            finwin.setBounds(bounds.left, bounds.top, response.data.stackedWidth, response.data.stackedHeight + stackedHeightCorrection, function(){
                //move window
                LauncherClient.showWindow(winId, 
                    {
                        right: 0,
                        bottom: response.data.distFromBottom
                    }, 
                    function () {
                        //let docking service know about the change
                        finwin.getBounds(function (newBounds) {
                            Logger.log(
                                `Stacking client: New window bounds:
    top: ${newBounds.top}
    left: ${newBounds.left}
    height: ${newBounds.height}
    width: ${newBounds.width}
    right: ${newBounds.right}
    bottom: ${newBounds.bottom}`);
                            
                            RouterClient.transmit("DockingService.updateWindowLocation", {windowName: winId.windowName, location: newBounds});
                            if (cb){ 
                                cb(); 
                            }
                        });
                    }
                );
            }, function(err) {Logger.error("Stacking client: Error while resizing window...", err)});
        });
    });
};

export function popWindow(cb) {
    Logger.log("Stacking client: popWindow called");
    let finwin = WindowClient.getCurrentWindow();
    let winId = WindowClient.getWindowIdentifier();
    
    RouterClient.query("stackingService functions", { query: "popWindow", winId: winId }, function (err, response) {
        Logger.log("Stacking client: stackingService.popWindow response: ", response.data);
        let oldBounds =  response.data.bounds;

         //set new window bounds
        finwin.setBounds(oldBounds.left, oldBounds.top, oldBounds.width, oldBounds.height, function(){
            //let docking service know about the change
            finwin.getBounds(function (newBounds) {
                Logger.log(
                    `Stacking client: New window bounds:
top: ${newBounds.top}
left: ${newBounds.left}
height: ${newBounds.height}
width: ${newBounds.width}
right: ${newBounds.right}
bottom: ${newBounds.bottom}`);
                
                RouterClient.transmit("DockingService.updateWindowLocation", {windowName: winId.windowName, location: newBounds});
                if (cb){ 
                    cb(); 
                }
            });
        });
    });
};

export function spawnNotification(textContent, action, cb) {
    Logger.log("Stacking client: spawnNotification called");
    
    RouterClient.query("stackingService functions", { query: "spawnNotification", textContent: textContent, action: action }, function (err, response) {
        Logger.log("Stacking client: stackingService.spawnNotificatio response: ", response.data);
    });


}
