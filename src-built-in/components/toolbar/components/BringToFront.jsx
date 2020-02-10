import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";
import { ReactComponent as BringToFrontIcon } from "../../../../assets/img/toolbar/bring-to-front.svg";
import NotificationIcon from "../../../../src/components/finsemble-notifications/components/notification-icon/NotificationIcon";
// Store
import ToolbarStore from "../stores/toolbarStore";

const BringToFront = props => {
	const BringToFront = () => {
		FSBL.Clients.LauncherClient.bringWindowsToFront({}, () => {
			ToolbarStore.bringToolbarToFront();
		});
	};
	let wrapperClasses = props.classes + " icon-only window-mgmt-right";

	return (
		<div>
			{/* <NotificationIcon /> */}
			<FinsembleButton
				className={wrapperClasses}
				buttonType={["Toolbar"]}
				title="Reveal All"
				onClick={BringToFront}
			>
				<span>
					<BringToFrontIcon />
				</span>
			</FinsembleButton>
		</div>
	);
};

export default BringToFront;
