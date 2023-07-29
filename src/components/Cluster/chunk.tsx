import { Component } from "react";
import type { IGame } from "../../types";
import type { TabNode } from "flexlayout-react";
import { Window } from "./window";
import { json } from "../../libgalaxy";

// TODO: Use Map instead of objects
const dataStore: {
	games: { [key: number]: any };
	windows: { [key: string]: number };
} = {
	games: {},
	windows: {},
};

interface IProps {
	node: TabNode;
	comms(id: string, message: string): void;
	purpose: "nothing" | number;
}

interface IState {
	update: number;
	searching: string;
	searchResults: IGame[];
}

async function load(
	id: number,
	pid: string,
	comms: (id: string, message: string) => void
) {
	const data = await json(`/api/games/info?id=${id}`);
	dataStore.games[id] = data.game;
	comms(pid, data.game.name);
}

export class Chunk extends Component<IProps, IState> {
	constructor(props) {
		super(props);
		this.state = { update: 0, searching: "", searchResults: [] };

		this.load = this.load.bind(this);
		this.search = this.search.bind(this);
		this.handleNewSearch = this.handleNewSearch.bind(this);
	}

	load(id: number) {
		dataStore.windows[this.props.node.getId()] = id;
		this.setState(state => ({
			update: state.update + 1,
		}));
		load(id, this.props.node.getId(), this.props.comms);
	}

	async search(query: string) {
		if (/^https?:\/\//.test(query)) {
			const randId = Math.random();
			dataStore.windows[this.props.node.getId()] = randId;
			dataStore.games[randId] = { name: "Unknown", link: query };

			this.setState(state => ({ update: state.update + 1 }));
			this.props.comms(this.props.node.getId(), "Unknown Game");

			return;
		}

		const res = await json(`/api/search?q=${query}`);
		console.log(res);

		this.setState(state => ({
			update: state.update + 1,
			searchResults: res.games,
		}));
	}

	handleNewSearch(e) {
		this.setState(() => ({
			searching: e.target.value,
		}));
	}

	render() {
		if (dataStore.windows[this.props.node.getId()] === undefined)
			return (
				<div>
					<input
						value={this.state.searching}
						onChange={this.handleNewSearch}
						type="text"
						placeholder="Search or enter a URL"
					/>
					<button onClick={() => this.search(this.state.searching)}>
						Search (or go)
					</button>
					{this.state.searchResults.map(game => (
						<div key={game.id}>
							<h1>{game.name}</h1>
							<p>{game.description}</p>
							<button onClick={() => this.load(game.id)}>
								Load
							</button>
						</div>
					))}
				</div>
			);
		const data =
			dataStore.games[dataStore.windows[this.props.node.getId()]];
		if (data === undefined) return <h1>Loading...</h1>;
		return <Window link={data.link} />;
	}

	componentDidMount() {
		if (this.props.purpose !== "nothing") {
			this.load(this.props.purpose);
		}
	}
}
