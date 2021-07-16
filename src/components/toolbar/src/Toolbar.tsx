/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import {
	ToolbarShell,
	FavoritesShell,
	DragHandle,
	RevealAll,
	MinimizeAll,
	NotificationControl,
	AutoArrange,
	Search,
	Dashbar,
	AdvancedAppLauncherMenu,
	AppLauncherMenu,
	WorkspaceManagementMenu,
	ToolbarSection,
} from "@finsemble/finsemble-ui/react/components/toolbar";
import { FileMenu } from "./FileMenu";
import { useHotkey } from "@finsemble/finsemble-ui/react/hooks/useHotkey";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../../assets/css/theme.css";
import { BloombergStatus } from "../../bbgHelpers/BloombergStatus";

/**
 * Note: Set `FSBL.debug = true` if you need to reload the toolbar during development.
 * By default, it prevents the system from closing it so that users aren't lost without
 * a main window into finsemble functionality.
 */
const Toolbar = () => {
	useHotkey(["ctrl", "alt", "shift", "r"], () => FSBL.restartApplication());
	useHotkey(["ctrl", "alt", "up"], () => FSBL.Clients.LauncherClient.bringWindowsToFront());
	useHotkey(["ctrl", "alt", "down"], () => window.FSBL.Clients.WorkspaceClient.minimizeAll());

	const [useDOMBasedMovement, setDOMBasedMovement] = useState(true);
    const [showBloomberg, setShowBloomberg] = useState(false);

    function BloombergStatusSection() {
        const bbg = <ToolbarSection className="right">
            <div className="divider"></div>
            <BloombergStatus />
        </ToolbarSection>;
        return (showBloomberg ? bbg : <></>);
    }

	useEffect(() => {
		async function fetchManifest() {
			const response = await FSBL.Clients.ConfigClient.getValue("finsemble-electron-adapter.useDOMBasedMovement");
			const { data: manifestValue } = response;
			if (manifestValue !== null) setDOMBasedMovement(manifestValue);
		}
        async function fetchBloomberg() {
            FSBL.Clients.ConfigClient.getValue('finsemble.custom.bloomberg.showStatus', (err: any, value: any) => {
                if (err) {
                    FSBL.Clients.Logger.error(`ERR - Could not determine Bloomberg show status: ${err}`);
                    setShowBloomberg(false);
                } else if (value) {
                    setShowBloomberg(true);
                }
                else {
                    setShowBloomberg(false);
                }
            });
        }

		fetchManifest();
        fetchBloomberg();

        let statusHandler = (err: any, status: any) => {
            if (err) {
                FSBL.Clients.Logger.error("Error received when checking bloomberg bridge config", err);
            } else {
                let bbgStatus = typeof status.value == "undefined" ? status : status.value;
                setShowBloomberg(bbgStatus);
            }
        };
        FSBL.Clients.ConfigClient.getValue({ field: "finsemble.custom.bloomberg.showStatus" }, statusHandler);
        FSBL.Clients.ConfigClient.addListener({ field: "finsemble.custom.bloomberg.showStatus" }, statusHandler);
	}, []);

	return (
		<ToolbarShell hotkeyShow={["ctrl", "alt", "t"]} hotkeyHide={["ctrl", "alt", "h"]}>
			<ToolbarSection className="left">
				<DragHandle useDOMBasedMovement={useDOMBasedMovement} />
				<FileMenu />
				<Search openHotkey={["ctrl", "alt", "f"]} />
				<WorkspaceManagementMenu />
				{/* Uncomment the following to enable the AdvancedAppLauncherMenu*/}
				{/* <AdvancedAppLauncherMenu enableQuickComponents={true} /> */}
				<AppLauncherMenu enableQuickComponents={true} />
			</ToolbarSection>
			<ToolbarSection className="center" hideBelowWidth={115}>
				<div className="divider" />
				<FavoritesShell />
			</ToolbarSection>
            <BloombergStatusSection />
            <ToolbarSection className="right">
                <div className="divider"></div>
				<AutoArrange />
				<MinimizeAll />
				<RevealAll />
				<NotificationControl />
			</ToolbarSection>
			<div className="resize-area"></div>
		</ToolbarShell>
	);
};

ReactDOM.render(
	<FinsembleProvider>
		<Toolbar />
		<Dashbar />
	</FinsembleProvider>,
	document.getElementById("Toolbar-tsx")
);
