// backend search things, re-exports frontend for convenience

import {
	defaultSearchType,
	defaultSortOrder,
	searchTypeToField,
} from "./searchShared";
import { Game } from "../models/game";
import type { IGame } from "../types";
import type { PipelineStage } from "mongoose";
import type { SearchQuery } from "./searchShared";
import { filterFilter } from "./filters";

export * from "./searchShared";

export async function search(
	{ q, type, sort, tags, global }: SearchQuery,
	filter?: string
): Promise<IGame[]> {
	// Appease TS gods
	const globalBool: boolean = global ?? false;

	const pipeline: PipelineStage[] = [
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
				// For sorting
				sortRating: 1,
				lastUpdate: 1,
				thumbTimestamp: 1,
				shared: { $setIntersection: [tags, "$tags"] },
			},
		},
		{
			$match: {
				verified: true,
				...(globalBool ? filterFilter(filter) : {}),
			},
		},
	];

	if (q != null && q.length !== 0) {
		pipeline.unshift({
			$match: {
				$text: { $search: q },
			},
		});
	}

	if (tags && tags.length !== 0) {
		pipeline.push({
			$match: {
				[`shared.${tags.length - 1}`]: { $exists: true },
			},
		});
	}

	const field = searchTypeToField[type ?? defaultSearchType]; // default to sort by rating
	pipeline.push({
		$sort: { [field]: sort ?? defaultSortOrder }, // default to sort ascending
	});

	// TODO: pagination
	const games = await Game.aggregate(pipeline).limit(50);
	return games;
}
