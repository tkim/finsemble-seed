import React, { useEffect, useState } from "react";

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
    const [bbgConnStatus, setBbgConnStatus] = useState("down");
    const [statusText, setStatusText] = useState(errText);

    useEffect(() => {
        FSBL.Clients.Logger.log(`HEY1: ${bbgConnStatus}`)
        // based on that, then adjust the statusText
        if (bbgConnStatus === "up") {
            setStatusText("Bloomberg: UP");
        } else if (bbgConnStatus === "down") {
            setStatusText("Bloomberg: DOWN");
        } else {
            // assume if not the others, then some error state
            setStatusText(errText);
        }
    }, [bbgConnStatus]);

    const buttonTestA = React.createElement("div", {
        className: wrapperClasses, title: title, onClick: () => {
            // should clicking on this while the pref panel is open then close it out?
            //  or only rely on the pref panel UI to do so?
            //
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
    }, statusText);

    // this is only a temp test to simulate changing the connection and what that looks like in the buttons
    const buttonTestB = React.createElement("div", {
        className: wrapperClasses, title: "BBG Toggle", onClick: () => {
            if (bbgConnStatus === "up" || bbgConnStatus === "err") {
                FSBL.Clients.Logger.log("HEY2: A");
                setBbgConnStatus("down");
            }
            else {
                FSBL.Clients.Logger.log("HEY2: B");
                setBbgConnStatus("up");
            }
        }
    }, "Toggle BBG State");

    return <>{buttonTestA} {buttonTestB}</>;
};
