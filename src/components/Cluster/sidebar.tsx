import { Component } from "react";

function attemptLeave() {
	if (confirm("Are you sure?")) window.location.href = "/";
}

export class Sidebar extends Component {
	render() {
		return (
			<div className="sidebar">
				<button className="sidebar-btn new-btn" draggable>
					+
				</button>
				<button
					className="sidebar-btn leave-btn"
					onClick={attemptLeave}
				>
					Leave
				</button>
			</div>
		);
	}
}
