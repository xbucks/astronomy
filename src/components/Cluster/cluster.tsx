import "./style.css";
import "flexlayout-react/style/dark.css";
import * as FlexLayout from "flexlayout-react";
import * as React from "react";
import type { IJsonModel, Model, TabNode } from "flexlayout-react";
import { Actions } from "flexlayout-react";

import { Chunk } from "./chunk";
import { Sidebar } from "./sidebar";

const game = new URLSearchParams(location.search).get("game");

const json: IJsonModel = {
	global: { tabSetEnableMaximize: false },
	layout: {
		type: "row",
		weight: 100,
		children: [
			{
				type: "tabset",
				weight: 50,
				children: [
					{
						type: "tab",
						name: "New Tab",
						component: game ? `game-${game}` : "window",
					},
				],
			},
		],
	},
	borders: [
		{
			type: "border",
			location: "left",
			size: 74,
			minSize: 74,
			enableAutoHide: false,
			show: true,
			children: [
				{
					type: "tab",
					name: "Sidebar",
					component: "sidebar",
					enableClose: false,
					enableDrag: false,
					enableRename: false,
					enableFloat: false,
				},
			],
		},
	],
};

interface IProps {}
interface IState {
	model: Model;
}

const id = 0;

export class Cluster extends React.Component<IProps, IState> {
	constructor(props) {
		super(props);

		this.comms = this.comms.bind(this);
		this.externalDrag = this.externalDrag.bind(this);
		this.factory = this.factory.bind(this);

		this.state = {
			model: FlexLayout.Model.fromJson(json),
		};
	}

	factory(node: TabNode) {
		// console.log(node);
		const component = node.getComponent();
		if (component === "window") {
			return <Chunk node={node} comms={this.comms} purpose="nothing" />;
		} else if (component === "sidebar") {
			return <Sidebar />;
		} else if (component.startsWith("game-")) {
			return (
				<Chunk
					node={node}
					comms={this.comms}
					purpose={parseInt(component.split("-")[1])}
				></Chunk>
			);
		}
	}

	comms(id: string, msg: string) {
		this.state.model.doAction(Actions.renameTab(id, msg));
	}

	externalDrag(...args) {
		return {
			dragText: "",
			json: {
				type: "tab",
				name: "New Tab",
				component: "window",
			},
			onDrop: (tab, drop) => {
				if (!tab || !drop) return; // aborted drag
				const text = drop.dataTransfer.getData("text/plain");
				const url = "http://localhost:3000";
				this.state.model.doAction(
					FlexLayout.Actions.updateNodeAttributes(tab.getId(), {
						config: { url },
					})
				);
			},
		};
	}

	render() {
		return (
			<div className="big">
				<FlexLayout.Layout
					model={this.state.model}
					factory={this.factory}
					realtimeResize={true}
					onExternalDrag={this.externalDrag}
				/>
			</div>
		);
	}
}

// https://stackoverflow.com/a/7317311
window.addEventListener("beforeunload", e => {
	const msg = "Are you sure you want to leave Cluster?";
	(e || window.event).returnValue = msg;
	return msg;
});
