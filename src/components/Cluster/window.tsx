import { Component } from "react";

interface IProps {
	link: string;
}
interface IState {
	// link: string;
	// title: string;
}

export class Window extends Component<IProps, IState> {
	constructor(props) {
		super(props);
		// this.state = { link: "", title: "Loading..." };
	}

	async componentDidMount(): Promise<void> {}

	render() {
		return (
			<div className="big">
				<iframe
					src={this.props.link}
					className="big"
					style={{
						border: "none",
					}}
				></iframe>
			</div>
		);
	}
}
