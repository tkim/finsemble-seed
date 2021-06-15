import React, { useEffect, useState } from "react";
import { Button } from "@finsemble/finsemble-ui/react/components/common/Button";
import BloombergBridgeClient from "../../clients/BloombergBridgeClient/BloombergBridgeClient";
//Setup the BloombergBridgeClient that will be used for all messaging to/from Bloomberg
let bbg = new BloombergBridgeClient(FSBL.Clients.RouterClient, FSBL.Clients.Logger);

export const BloombergPreferences = () => {
    const [bbgRemoteAddress, setBbgRemoteAddress] = useState("");
    const [isRemote, setIsRemote] = useState(false);
    const [showAddressField, setShowAddressField] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // TODO:
    // * Show Connect/Disconnect as different button states (how?)
    // * Connect/Disconnect should use Button and not button, but when I tried it didn't work (try again, maybe other things were issue)
    // * once Connected, show Disconnect and disable all other fields
    //      once disconnected, enable them all again (and show Connect)
    // * not sure the bloomberg items are actually getting loaded - they are setup as components but this is appD
    //          how to do equivalent here?
    //      then test with BBG actually running
    // * then get working in toolbar
    //      should each check the status independantly or should they share a data store for that? 



    useEffect(() => {
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
    }, []);

    // TODO - should there be something periodically checking this and updating it? 
    //          if so, then especially in the toolbar
    function toggleBloombergConnection() {
        FSBL.Clients.Logger.log("HIT A");
        FSBL.Clients.BloombergBridgeClient.checkConnection((err, loggedIn) => {
            if (!err && loggedIn) {
                // connected: true
                setIsConnected(true);
                FSBL.Clients.Logger.log("HIT A true");
            } else if (!err && !loggedIn) {
                // connected: false
                setIsConnected(false);
                FSBL.Clients.Logger.log("HIT A false");
            }
            else {
                FSBL.Clients.Logger.error(`The Bloomberg Bridge Client had an error: ${err}`);
            }
        });
        FSBL.Clients.Logger.log("HIT B");
        FSBL.Clients.BloombergBridgeClient.setConnectState(!isConnected, (err, resp) => {
            if (err) {
                FSBL.Clients.Logger.error("Error - There was an error setting the Bloomberg connection state:", err);
                FSBL.Clients.Logger.log(`HIT B: ${err}`);
            }
            if (resp) {
                //console.log("Response: " + resp); 
                setIsConnected(!isConnected);
                FSBL.Clients.Logger.log(`HIT B: ${isConnected}`);
            }
        });
        FSBL.Clients.Logger.log("HIT C");
    }

    const addressInput = React.createElement("input", {
        id: "address",
        type: "text",
        value: bbgRemoteAddress,
        onBlur: () => {
            setBbgRemoteAddress(document.getElementById('address').value);
            FSBL.Clients.ConfigClient.setPreference({
                field: "finsemble.custom.bloomberg.remoteAddress",
                value: bbgRemoteAddress
            }, (err, response) => {
                //preference has been set
            });
        }

    }, null);
    const addressField = React.createElement("div", null, [`Address:`, addressInput]);
    const connectionRadioLocal = React.createElement("input", {
        type: "radio",
        value: "local",
        name: "location",
        checked: !isRemote,
        onClick: () => {
            setIsRemote(false);
            setShowAddressField(false);
        }
    }, null);
    const connectionRadioRemote = React.createElement("input", {
        type: "radio",
        value: "remote",
        name: "location",
        checked: isRemote,
        onClick: () => {
            setIsRemote(true);
            setShowAddressField(true);
        }
    }, null);
    const connectionType = React.createElement("div", null, [
        "Connection Type:",
        connectionRadioLocal,
        "Local",
        connectionRadioRemote,
        "Remote"
    ]);
    const connectionButton = React.createElement("Button", {
        onClick: () => {
            toggleBloombergConnection();
            isConnected ? setIsConnected(false) : setIsConnected(true);
        }
    }, isConnected ? "Connect" : "Disconnect");
    const connectionButton2 = React.createElement("button", {
        onClick: () => {
            toggleBloombergConnection();
        }
    }, isConnected ? "Disconnect" : "Connect");

    const connection = React.createElement("div", null, [connectionButton2, "B status", "Connection status text"]);


    return <>
        <div>
            {connectionType}
            {showAddressField && addressField}
        </div>
        <hr />
        {connection}
    </>;
};
