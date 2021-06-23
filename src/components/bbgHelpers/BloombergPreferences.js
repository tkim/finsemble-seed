import React, { useEffect, useState } from "react";
import BloombergBridgeClient from "../../clients/BloombergBridgeClient/BloombergBridgeClient";

// cannot get either of these to work, seems to be the nested nature of how prefs work
//import { Button } from "@finsemble/finsemble-ui/react/components/shared/Button";
//import "../../../assets/css/theme.css";


// TODO: (maybe) - currnetly it is possible to get it into a Bridge up, Bloomberg down status,
//          in which if you press the Connect button, it will show Disconnect on the button,
//          but the connection status still (correctly) shows Disconnected.
//          Eventually (30s) if checks again and fixes the button state make to Connect.
//      But could make this show "...connecting..." or something in that middle state, or attempting, whatever

// the BloombergBridgeClient that will be used for all messaging to/from Bloomberg
let bbg = new BloombergBridgeClient(FSBL.Clients.RouterClient, FSBL.Clients.Logger);

export const BloombergPreferences = () => {
    const [bbgRemoteAddress, setBbgRemoteAddress] = useState("");
    const [isRemote, setIsRemote] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("Disconnected");
    const [indicatorColor, setIndicatorColor] = useState("red");

    useEffect(() => {
        function checkConnection() {
            bbg.checkConnection((err, resp) => {
                FSBL.Clients.Logger.log("RespBare", resp);
                if (!err && resp === true) {
                    setIsConnected(true);
                    setConnectionStatus("Connected");
                    setIndicatorColor("green");
                    FSBL.Clients.Logger.log("Resp1", resp);
                } else if (err) {
                    FSBL.Clients.Logger.error("Error received when checking connection", err);
                    FSBL.Clients.Logger.log("Resp2", resp);
                    setIsConnected(false);
                    setConnectionStatus("Confirm Bloomberg and Bridge are both running.");
                    setIndicatorColor("red");
                } else {
                    FSBL.Clients.Logger.debug("Negative response when checking connection: ", resp);
                    FSBL.Clients.Logger.log("Resp3", resp);
                    setIsConnected(false);
                    setConnectionStatus("Disconnected");
                    setIndicatorColor("orange");
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
        style: {
            backgroundColor: "var(--core-primary)",
            marginLeft: "70px",
            width: "300px",
            height: "34px",
            color: "#f5f6f7"
        },
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
            overflow: isRemote ? "visible" : "hidden",
            marginLeft: "55px",
            opacity: "0.75"
        }
    }, ["Address", addressInput]);
    const connectionRadioLocal = React.createElement("input", {
        type: "radio",
        value: "local",
        style: {
            marginLeft: "25px",
            backgroundColor: "var(--button-affirmative-background-color)"
        },
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
        style: {
            marginLeft: "20px",
            backgroundColor: "var(--button-affirmative-background-color)"
        },
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
    const connectionType = React.createElement("div", {
        style: {
            marginLeft: "55px",
            marginTop: "25px",
            opacity: "0.75"

        }
    }, [
        "Connection Type",
        connectionRadioLocal,
        "Local",
        connectionRadioRemote,
        "Remote"
    ]);
    const connectionButton = React.createElement("button", {
        style: {
            width: "62px",
            height: "24px",
            textAlign: "center",
            backgroundColor: "var(--button-affirmative-background-color)",
            color: "#000",
            fontSize: "11px",
            fontWeight: "600",
            border: "0px",
            borderRadius: "5px",
            verticalAlign: "middle"
        },
        onClick: () => {
            toggleBloombergConnection();
        }
    }, isConnected ? "Disconnect" : "Connect");

    // can't get this to work
    // const connectionButton = (<Button
    //     onClick={() => {
    //         toggleBloombergConnection();
    //     }}
    //     text={isConnected ? "Disconnect" : "Connect"}
    // />);

    // I can't figure out why it is squashing but doesn't in the toolbar
    const bbgStatusMarker = React.createElement("span", {
        style: {
            background: indicatorColor,
            width: "15",
            height: "15px",
            borderRadius: "50%",
            margin: "5px",
            marginLeft: "25px",
            marginRight: "25px",
            paddingLeft: "7px",
            paddingRight: "7px"
        }
    }, " ");

    const connection = React.createElement("div", {
        style: {
            opacity: "0.75",
            marginLeft: "55px"
        }
    }, [connectionButton, bbgStatusMarker, connectionStatus]);

    const customLine = React.createElement("div", {
        style: {
            width: "419px",
            height: "1px",
            margin: "14.5px 59px 14.5px 64px",
            border: "solid 1px #979797",
            opacity: "0.75"
        }
    }, "");

    // const debugDiv = React.createElement("div", {},
    //     React.createElement("button", {
    //         onClick: () => {
    //             FSBL.Clients.ConfigClient.getValue('finsemble.custom.bloomberg.remoteAddress', (err, value) => {
    //                 if (err) {
    //                     FSBL.Clients.Logger.error(`ERR - Could not get Bloomberg remoteAddress: ${ err } `);
    //                     setBbgRemoteAddress("");
    //                 } else {
    //                     setBbgRemoteAddress(value);
    //                 }
    //             });
    //             FSBL.Clients.ConfigClient.getValue('finsemble.custom.bloomberg.remote', (err, value) => {
    //                 if (err) {
    //                     FSBL.Clients.Logger.error(`ERR - Could not get Bloomberg remote state: ${ err } `);
    //                     setIsRemote(false);
    //                 } else {
    //                     setIsRemote(value);
    //                 }
    //             });
    //         }
    //     }, "Check Prefs"),
    //     React.createElement("div", {}, `Remote Bool: ${ isRemote }, Remote Address: ${ bbgRemoteAddress }`)
    // )

    return <>
        <div>
            {connectionType}
            {addressField}
        </div>
        {customLine}
        {connection}
    </>;
};

