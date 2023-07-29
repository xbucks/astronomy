import { Game } from "../models/game";
import type { IGame } from "../types";
import { filterFilter } from "./filters";

const MINIMUM_TAG_OVERLAP = 2;
const MINIMUM_TAG_QUERY = `shared.${MINIMUM_TAG_OVERLAP - 1}`;

export async function fromGame(game: IGame, filter: string): Promise<IGame[]> {
	const out = await Game.aggregate([
		{
			$project: {
				_id: 0,
				id: 1,
				author: 1,
				name: 1,
				ratingAvg: 1,
				ratingCount: 1,
				favorites: 1,
				description: 1,
				tags: 1,
				playMinutes: 1,
				verified: 1,
				thumbTimestamp: 1,
				shared: { $setIntersection: [game.tags, "$tags"] },
			},
		},
		{
			// This is stupid as fuck but it works.
			// It basically makes sure `shared` has `n` elements by checking if `shared[n-1]` exists
			// I tried doing $match:{shared:{$size:{$gte:2}}} but it didn't work
			// Update (the next day): apparently smiley found an SO post that says this is a good way to do it.
			$match: {
				[MINIMUM_TAG_QUERY]: { $exists: true },
				id: { $ne: game.id },
				verified: true,
				...filterFilter(filter),
			},
		},
		{
			$project: {
				id: 1,
				author: 1,
				name: 1,
				ratingAvg: 1,
				ratingCount: 1,
				favorites: 1,
				description: 1,
				tags: 1,
				playMinutes: 1,
				verified: 1,
				shared: 1,
				thumbTimestamp: 1,
				sharedCount: { $size: "$shared" },
			},
		},
		{
			$sort: { sharedCount: -1 },
		},
	]).limit(12);

	return out;
}
