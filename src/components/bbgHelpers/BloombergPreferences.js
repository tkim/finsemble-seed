import React, { useEffect, useState } from "react";
import BloombergBridgeClient from "../../clients/BloombergBridgeClient/BloombergBridgeClient";
//Setup the BloombergBridgeClient that will be used for all messaging to/from Bloomberg
let bbg = new BloombergBridgeClient(FSBL.Clients.RouterClient, FSBL.Clients.Logger);

export const BloombergPreferences = () => {
    const [bbgRemoteAddress, setBbgRemoteAddress] = useState("");
    const [isRemote, setIsRemote] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("Disconnected");



    // TODO:
    // * is there a way to distinguish between the bridge being down and the bridge not running?
    // * should "Connect" actually start the Bridge if it hasn't yet been opened by the App Menu?
    //      * should Bridge just autostart in config?


    useEffect(() => {
        function checkConnection() {
            bbg.checkConnection((err, resp) => {
                if (!err && resp === true) {
                    setIsConnected(true);
                    setConnectionStatus("Connected");
                } else if (err) {
                    FSBL.Clients.Logger.error("Error received when checking connection", err);
                    setIsConnected(false);
                    setConnectionStatus("Disconnected");
                } else {
                    FSBL.Clients.Logger.debug("Negative response when checking connection: ", resp);
                    setIsConnected(false);
                    setConnectionStatus("Disconnected");
                }
            });
        };

        FSBL.Clients.ConfigClient.getValue('finsemble.custom.bloomberg.remoteAddress', (err, value) => {
            if (err) {
                FSBL.Clients.Logger.error(`ERR - Could not get Bloomberg remoteAddress: ${err}`);
                setBbgRemoteAddress("");
            } else {
                setBbgRemoteAddress(value);
            }
        });
        FSBL.Clients.ConfigClient.getValue('finsemble.custom.bloomberg.remote', (err, value) => {
            if (err) {
                FSBL.Clients.Logger.error(`ERR - Could not get Bloomberg remote state: ${err}`);
                setIsRemote(false);
            } else {
                setIsRemote(value);
            }
        });
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

    function toggleBloombergConnection() {
        bbg.setConnectState(!isConnected, (err, resp) => {
        //FSBL.Clients.BloombergBridgeClient.setConnectState(!isConnected, (err, resp) => {
            if (err) {
                FSBL.Clients.Logger.error("Error - There was an error setting the Bloomberg connection state:", err);
            }
            if (resp) {
                //console.log("Response: " + resp); 
                setIsConnected(!isConnected);
            }
        });
    }

    function updateAddress() {
        setBbgRemoteAddress(document.getElementById('address').value);
            FSBL.Clients.ConfigClient.setPreference({
                field: "finsemble.custom.bloomberg.remoteAddress",
                value: bbgRemoteAddress
            }, (err, response) => {
                //preference has been set
            });
    }

    // if only called onChange, it loses the last char (not sure why)
    // if only called onBlur, there are spots where it doesn't get saved
    //
    // if just using the boolean in the return, this pops in and out cleanly on use
    //  and on first load when it opens
    // but if using the slide in and out css, it works fine on use, but also does it on
    //  first load, which may look odd to users?
    const addressInput = React.createElement("input", {
        id: "address",
        type: "text",
        defaultValue: bbgRemoteAddress,
        disabled: isConnected,
        onChange: () => {
            updateAddress();
        },
        onBlur: () => {
            updateAddress();
        }
    }, null);
    const addressField = React.createElement("div", {
        style: {
            maxHeight: isRemote ? "100px" : "0",
            transition: isRemote ? "max-height 0.25s ease-in" : "max-height 0.15s ease-out",
            overflow: isRemote ? "visible" : "hidden"
        }
    }, [`Address:`, addressInput]);
    const connectionRadioLocal = React.createElement("input", {
        type: "radio",
        value: "local",
        name: "location",
        checked: !isRemote,
        disabled: isConnected,
        onClick: () => {
            setIsRemote(false);
            FSBL.Clients.ConfigClient.setPreference({
                field: "finsemble.custom.bloomberg.remote",
                value: false
            }, (err, response) => {
                //preference has been set
            });
        }
    }, null);
    const connectionRadioRemote = React.createElement("input", {
        type: "radio",
        value: "remote",
        name: "location",
        checked: isRemote,
        disabled: isConnected,
        onClick: () => {
            setIsRemote(true);
            FSBL.Clients.ConfigClient.setPreference({
                field: "finsemble.custom.bloomberg.remote",
                value: true
            }, (err, response) => {
                //preference has been set
            });
        }
    }, null);
    const connectionType = React.createElement("div", null, [
        "Connection Type:",
        connectionRadioLocal,
        "Local",
        connectionRadioRemote,
        "Remote"
    ]);
    const connectionButton = React.createElement("button", {
        onClick: () => {
            toggleBloombergConnection();
        }
    }, isConnected ? "Disconnect" : "Connect");

    // I can't figure out why it is squashing but doesn't in the toolbar
    const bbgStatusMarker = React.createElement("span", {
        style: {
            background: isConnected ? "green" : "orange",
            width: "15",
            height: "15px",
            borderRadius: "50%",
            margin: "5px",
            paddingLeft: "7px",
            paddingRight: "7px"
        }
    }, " ");

    const connection = React.createElement("div", {}, [connectionButton, bbgStatusMarker, connectionStatus]);


    const debugDiv = React.createElement("div", {},
        React.createElement("button", {
            onClick: () => {
                FSBL.Clients.ConfigClient.getValue('finsemble.custom.bloomberg.remoteAddress', (err, value) => {
                    if (err) {
                        FSBL.Clients.Logger.error(`ERR - Could not get Bloomberg remoteAddress: ${err}`);
                        setBbgRemoteAddress("");
                    } else {
                        setBbgRemoteAddress(value);
                    }
                });
                FSBL.Clients.ConfigClient.getValue('finsemble.custom.bloomberg.remote', (err, value) => {
                    if (err) {
                        FSBL.Clients.Logger.error(`ERR - Could not get Bloomberg remote state: ${err}`);
                        setIsRemote(false);
                    } else {
                        setIsRemote(value);
                    }
                });
            }
        }, "Check Prefs"),
        React.createElement("div", {}, `Remote Bool: ${isRemote}, Remote Address: ${bbgRemoteAddress}`)

    )

    return <>
        <div>
            {connectionType}
            {addressField}
        </div>
        <hr />
        {connection}
        {debugDiv}
    </>;
};

