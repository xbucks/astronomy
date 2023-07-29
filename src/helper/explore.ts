import type { FilterQuery } from "mongoose";
import { Game } from "../models/game";
import type { IGame } from "../types";
import { filterFilter } from "./filters";

const exploreFilter: FilterQuery<IGame> = { verified: true };

//           sec  * min* hr * day* wk
// const WEEK = 1000 * 60 * 60 * 24 * 7;

export type ExploreType =
	| "recent"
	| "top"
	| "faves"
	| "playtime"
	| "hot"
	| "new"
	| "random";

export interface ExploreResponse {
	games: IGame[];
	pages: number;
}

async function exploreBy(
	sort: keyof IGame,
	page: number,
	limit: number,
	filter: string
): Promise<ExploreResponse> {
	const result = await Game.paginate(
		{ ...exploreFilter, ...filterFilter(filter) },
		{
			sort: `-${sort}`,
			page,
			limit,
			// LEAN!!!!!
			lean: true,
			// DON'T ENABLE: mongoose-paginate-v2 will overwrite `.id` (Our REAL 100% American-made Numeric Identifier) with `._id` (Their LIBERAL Stringified ObjectID), removing the id we really want. Help me
			leanWithId: false,
		}
	);
	return {
		games: result.docs,
		pages: result.totalPages,
	};
}

export const explorers: {
	[key in ExploreType]: (
		page: number,
		limit: number,
		filter: string
	) => Promise<ExploreResponse>;
} = {
	recent(page: number, limit: number, filter: string) {
		return exploreBy("lastUpdate", page, limit, filter);
	},
	top(page: number, limit: number, filter: string) {
		return exploreBy("sortRating", page, limit, filter);
	},
	faves(page: number, limit: number, filter: string) {
		return exploreBy("favorites", page, limit, filter);
	},
	playtime(page: number, limit: number, filter: string) {
		return exploreBy("playMinutes", page, limit, filter);
	},
	hot(page: number, limit: number, filter: string) {
		// TODO: some kind of "hotness" rating to sort
		return exploreBy("playMinutes", page, limit, filter);
	},
	new(page: number, limit: number, filter: string) {
		return exploreBy("id", page, limit, filter);
	},
	async random(page: number, limit: number, filter: string) {
		const result = await Game.aggregate<IGame>([
			{ $sample: { size: limit } },
			{ $match: { ...exploreFilter, ...filterFilter(filter) } },
		]);
		return {
			games: result,
			pages: 1,
		};
	},
};

export const exploreNames: { [key in ExploreType]: string } = {
	recent: "recently updated",
	top: "top rated",
	faves: "top favorited",
	playtime: "most grinded",
	hot: "hot",
	new: "newly created",
	random: "randomly picked",
};

export function explore(
	type: ExploreType,
	page: number,
	perPage: number,
	filter: string
): Promise<ExploreResponse> {
	return explorers[type](page, perPage, filter);
}

export function validExploreType(type: string): type is ExploreType {
	return Object.keys(explorers).includes(type);
}
