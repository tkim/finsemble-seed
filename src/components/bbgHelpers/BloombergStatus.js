import React, { useEffect, useState } from "react";
import BloombergBridgeClient from "../../clients/BloombergBridgeClient/BloombergBridgeClient";
//Setup the BloombergBridgeClient that will be used for all messaging to/from Bloomberg
let bbg = new BloombergBridgeClient(FSBL.Clients.RouterClient, FSBL.Clients.Logger);

const title = "Bloomberg Preferences";
const wrapperClasses = "finsemble-toolbar-button";

export const BloombergStatus = () => {
    const errText = "Error Determining Bloomberg Status";
    // possible states:
    // up: connection to configured Bloomberg is up and working
    //      TODO: if up, should its mouseover or any visual denote which machine?
    // down: connection to configured Bloomberg is no active
    // err (??): do we need an error case separate from "down"?
    //         If so, does the Button need to show more info - e.g. mouseover text is error description?
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        function checkConnection() {
            bbg.checkConnection((err, resp) => {
                if (!err && resp === true) {
                    setIsConnected(true);
                } else if (err) {
                    FSBL.Clients.Logger.error("Error received when checking connection", err);
                    setIsConnected(false);
                } else {
                    FSBL.Clients.Logger.debug("Negative response when checking connection: ", resp);
                    setIsConnected(false);
                }
            });
        };

        try {
            //do the initial check
            checkConnection();
            //listen for connection events (listen/transmit)
            bbg.setConnectionEventListener(checkConnection);
            //its also possible to poll for connection status,
            //  worth doing in case the bridge process is killed off and doesn't get a chance to send an update
            setInterval(checkConnection, 30000);
        } catch (e) {
            FSBL.Clients.Logger.error(`error in bbg prefs: ${e}`);
        }

    }, []);

    const bbgStatusMarker = React.createElement("span", {
        style: {
            background: isConnected ? "green" : "orange",
            position: "relative",
            left: "7px",
            width: "15px",
            height: "15px",
            borderRadius: "50%"
        }
    }, " ");

    const bbgStatusButton = React.createElement("div", {
        className: wrapperClasses,
        title: title,
        onClick: () => {
            FSBL.Clients.RouterClient.transmit("FinsembleUserPreferencesChannel", {
                preferencesTab: "Bloomberg Terminal Connect",
            });
            FSBL.Clients.LauncherClient.showWindow(
                {
                    componentType: "UserPreferences",
                },
                {
                    monitor: "mine",
                    left: "center",
                    top: "center",
                }
            );
        }
    }, ["Bloomberg", bbgStatusMarker]);



    return <>{bbgStatusButton}</>;
};
