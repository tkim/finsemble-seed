import React from "react";
import ReactDOM from "react-dom";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";
import { FinsembleDraggable } from "@chartiq/finsemble-react-controls";
import Title from "../../../../common/windowTitle"
/**
 * This component is pretty basic. It just takes a bunch of props and renders them.
 */
export default class Tab extends React.Component {
	constructor(props) {
		super(props);
		this.onDragOver = this.onDragOver.bind(this);
		this.onDragLeave = this.onDragLeave.bind(this);
		this.renameTabInput = React.createRef();

		this.state = {
			hoverState: "false",
			tabLogo: {},
			title: "",
			changeTabTitle: false
		};
		this.tabbingState = false;
	}
	componentDidMount() {
		FSBL.Clients.WindowClient.getComponentState(
			{ field: "persistedTitle" },
			(err, title) => {
				if (title) {
					FSBL.Clients.WindowClient.setWindowTitle(title);
				}
			}
		);
	}
	onDragLeave(e) {
		this.tabbingState = false;
		FSBL.Clients.RouterClient.publish('Finsemble.AmTabbing', false);
	}

	onDragOver(e) {
		let boundingBox = this.refs.Me.getBoundingClientRect();
		if (this.crossedMidline(e, boundingBox)) {
			this.props.onTabDraggedOver(e, this.props.windowIdentifier);
		}
		if (!this.tabbingState) {
			FSBL.Clients.RouterClient.publish('Finsemble.AmTabbing', true);
			this.tabbingState = true;
		}
	}

	crossedMidline(e, box) {
		return FSBL.Clients.WindowClient.isPointInBox({ x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }, box);
	}

	hoverAction(newHoverState) {
		this.setState({ hoverState: newHoverState });
	}

	updateTabTitle = e => {
		const title = e.target.value;
		FSBL.Clients.WindowClient.setComponentState({
			field: "persistedTitle",
			value: title
		});
		FSBL.Clients.WindowClient.setWindowTitle(title);
		this.setState({ changeTabTitle: false });
	};

	render() {
		let style = {
			width: this.props.tabWidth
		}
		return (
			<div
				ref="Me"
				onDrop={this.props.onDrop}
				onClick={() => {
					!this.state.changeTabTitle && this.props.setActiveTab();
				}}
				onDoubleClick={async () => {
					await this.setState({ changeTabTitle: true });
					this.renameTabInput.current.focus();
				}}
				onDragStart={e => {
					this.props.onDragStart(e, this.props.windowIdentifier);
				}}
				onDragEnd={this.props.onDragEnd}
				draggable={true}
				className={this.props.className}
				data-hover={this.state.hoverState}
				style={style}
			>
				{this.props.listenForDragOver &&
					<div className="tab-drop-region"
						onDragOver={this.onDragOver}
						onDragLeave={this.onDragLeave}
					></div>
				}
				<FinsembleHoverDetector edge="top" hoverAction={this.hoverAction.bind(this)} />
				{this.state.changeTabTitle ? (
					<input
						ref={this.renameTabInput}
						onBlur={e => this.updateTabTitle(e)}
						onKeyDown={e => {
							e.keyCode === 13 && this.updateTabTitle(e);
						}}
						type="text"
						className="tab__input"
						maxLength={32}
					/>
				) : (
						<Title
							titleWidth={this.props.titleWidth}
							windowIdentifier={this.props.windowIdentifier}
						/>
					)}
				<div className="fsbl-tab-close" onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					this.props.onTabClose(e);
				}}>
					<i className="ff-close"></i>
				</div>
			</div>
		);
	}
}
