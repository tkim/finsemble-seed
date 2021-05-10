import React from "react";
import { FinsembleDialog } from "@finsemble/finsemble-ui/react/components/legacyControls/FinsembleDialog";
import { FinsembleDialogTextInput } from "@finsemble/finsemble-ui/react/components/legacyControls/FinsembleDialogTextInput";
import { FinsembleDialogButton } from "@finsemble/finsemble-ui/react/components/legacyControls/FinsembleDialogButton";
import "./customSingleInputDialog.css";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "@finsemble/finsemble-ui/react/assets/css/dialogs.css";

interface IProps {}
interface IState {
	inputLabel: string;
	affirmativeResponseLabel: string;
	renderInput: boolean;
	title?: string;
	cancelResponseLabel?: string;
	showCancelButton?: boolean;
	hideModalOnClose?: boolean;
	inputValue?: string | null;
}

/**
 * This is our standard input dialog. It gives the user a single button and a text field, and ferries that data back to the window that opened it.
 *
 * @class SingleInputDialog
 * @extends {React.Component}
 */
class CustomSingleInputDialog extends React.Component<IProps, IState> {
	constructor(props = {}) {
		super(props);
		this.bindCorrectContext();
		this.state = {
			inputLabel: "No question.",
			affirmativeResponseLabel: "Yes",
			/** Our input uses the HTML autoFocus attribute. This only fires when the element is rendered for the 1st time. Since we re-use the dialogs, the 2nd time the dialog is shown, autoFocus will not trigger. To force it to trigger, we change this boolean when a response is sent back to the opener, which unmounts the element from the dom. The next time the dialog is used, we will render the element again, and autoFocus will trigger. */
			renderInput: false,
		};
		document.body.addEventListener("keydown", this.handleKeydownOnBody);
	}

	bindCorrectContext() {
		this.handleKeydownOnBody = this.handleKeydownOnBody.bind(this);
		this.onShowRequested = this.onShowRequested.bind(this);
		this.setInputValue = this.setInputValue.bind(this);
		this.sendResponse = this.sendResponse.bind(this);
	}

	/**
	 * Handles escape and enter.
	 *
	 * @param {any} e
	 * @memberof SingleInputDialog
	 */
	handleKeydownOnBody(e: KeyboardEvent) {
		if (e.code === "Enter" && e.shiftKey === false) {
			this.sendResponse("affirmative");
		}

		if (e.code === "Escape") {
			this.sendResponse("cancel");
		}
	}

	/**
	 * When the opener requests that the dialog show itself, it also passes in initialization data. This function grabs that data, calls setState, and then fits the window to the contents of the DOM. Then we call `showDialog`, which will display the dialog on the proper monitor.
	 *
	 * @param {any} err
	 * @param {any} response
	 * @memberof SingleInputDialog
	 */
	onShowRequested(err: any, response: any) {
		let { data } = response;
		this.setState(
			{
				title: data.title || "Title",
				inputValue: null,
				hideModalOnClose:
					typeof data.hideModalOnClose === "undefined"
						? true
						: data.hideModalOnClose,
				inputLabel: data.inputLabel,
				affirmativeResponseLabel: data.affirmativeResponseLabel || "OK",
				cancelResponseLabel: data.cancelResponseLabel || "Cancel",
				showCancelButton:
					typeof data.showCancelButton === "undefined"
						? false
						: data.showCancelButton,
				renderInput: true,
			},
			this.fitAndShow
		);
	}

	/**
	 * Fits the contents of the DOM to the window, then calls `showDialog`, which positions the dialog on the proper monitor and toggles the visibility of the window.
	 *
	 * @memberof SingleInputDialog
	 */
	fitAndShow() {
		FSBL.Clients.WindowClient.fitToDOM(undefined, () => {
			FSBL.Clients.DialogManager.showDialog();
		});
	}

	/**
	 * Sends user input to the opener.
	 *
	 * @param {any} response
	 * @memberof SingleInputDialog
	 */
	sendResponse(response: any) {
		FSBL.Clients.DialogManager.respondToOpener({
			value: this.state.inputValue,
			choice: response,
			hideModalOnClose: this.state.hideModalOnClose,
		});

		this.setState({
			inputValue: null,
			renderInput: false,
		});
		Array.from(document.querySelectorAll("input")).forEach(
			(el) => (el.value = "")
		);
	}

	/**
	 * onChange handler. When the user types, we keep the value up to date in the dialog's state.
	 *
	 * @param {any} e
	 * @memberof SingleInputDialog
	 */
	setInputValue(e: React.ChangeEvent<HTMLInputElement>) {
		if (/^$|[A-Z0-9]+$/i.test(e.target.value)) {
			this.setState({
				inputValue: e.target.value,
			});
		} else {
			this.setState({
				inputValue: this.state.inputValue,
			});
		}
	}

	render() {
		return (
			<FinsembleDialog
				userInputTimeout={10000}
				behaviorOnResponse="hide"
				onShowRequested={this.onShowRequested}
				isModal={true}
			>
				<div className="dialog-title">{this.state.title}</div>
				{this.state.renderInput && (
					<FinsembleDialogTextInput
						onInputChange={this.setInputValue}
						placeholder="New Workspace"
						autoFocus={true}
						value={this.state.inputValue || ""}
					/>
				)}
				<div className="button-wrapper">
					{this.state.showCancelButton && (
						<FinsembleDialogButton
							className="fsbl-button-neutral"
							onClick={() => {
								this.sendResponse("cancel");
							}}
						>
							{this.state.cancelResponseLabel}
						</FinsembleDialogButton>
					)}
					<FinsembleDialogButton
						className="fsbl-button-affirmative"
						show={true}
						onClick={() => {
							this.sendResponse("affirmative");
						}}
					>
						{this.state.affirmativeResponseLabel}
					</FinsembleDialogButton>
				</div>
			</FinsembleDialog>
		);
	}
}

export default CustomSingleInputDialog;
