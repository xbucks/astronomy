import type { FilterQuery } from "mongoose";
import type { IGame } from "../types";

export function getFilters(filters?: string): { neg: string[]; pos: string[] } {
	if (typeof filters !== "string") filters = "|";
	if (!filters.includes("|")) filters = "|";
	const tagParts = filters
		.split("|")
		.map(part => part.split(",").filter(tag => !!tag));

	return {
		neg: tagParts[0],
		pos: tagParts[1],
	};
}

// export function filterPipeline(filters?: string): PipelineStage[] {
// 	let { neg, pos } = getFilters(filters);
// 	let out: PipelineStage[] = [];

// 	if (neg.length) {
// 	}
// 	return out;
// }

export function filterFilter(filters?: string): FilterQuery<IGame> {
	const { neg, pos } = getFilters(filters);
	const negFilter = {
		// $in: <value> exists in array `neg`
		// $elemMatch: any element in `tags` meets criterion listed
		// $not: invert criterion inside query
		// All together: Matched game must not have any tags shared with `neg`
		tags: { $not: { $elemMatch: { $in: neg } } },
	};
	const posFilter = {
		// $all: All of `pos` must be in `tags`
		tags: { $all: pos },
	};
	if (neg.length && pos.length)
		return {
			$and: [posFilter, negFilter],
		};
	if (neg.length) return negFilter;
	if (pos.length) return posFilter;
	return {};
}
