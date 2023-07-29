// frontend search things

import type { IGame } from "../types";

export type SearchType =
	| "alphabet"
	| "creation"
	| "favorite"
	| "playtime"
	| "rating"
	| "updated";

export type SortOrder = 1 | -1;

export interface SearchQuery {
	q?: string; // text search
	type?: SearchType; // search type
	sort?: SortOrder; // sort order
	tags?: string[];
	global?: boolean; // use site-wide filters
}

export const defaultSearchType: SearchType = "rating";

export const defaultSortOrder: SortOrder = -1;

export const searchTypeToField: { [key in SearchType]: keyof IGame } = {
	alphabet: "name",
	creation: "id",
	favorite: "favorites",
	playtime: "playMinutes",
	rating: "sortRating",
	updated: "lastUpdate",
};

export const searchTypes: SearchType[] = Object.keys(
	searchTypeToField
) as SearchType[];

export function queryFromSearchParams(params: URLSearchParams): SearchQuery {
	const q = params.get("q") ?? undefined;

	const typeRaw = params.get("type");
	let type: SearchType | undefined;
	if (typeRaw != null && validSearchType(typeRaw)) {
		// only include if valid
		type = typeRaw;
	}

	const sortRaw = params.get("sort");
	let sort: SortOrder | undefined;
	if (sortRaw != null) {
		const sortNum = parseInt(sortRaw);
		if (sortNum === 1 || sortNum === -1) {
			// only include if valid
			sort = sortNum;
		}
	}

	const tagsRaw = params.get("tags");
	let tags: string[] | undefined;
	if (tagsRaw != null) {
		// split and remove any empty tags
		tags = tagsRaw.split(",").filter(tag => tag.length !== 0);
	}

	const globalRaw = params.get("global");
	const global = globalRaw === "true";

	return {
		q,
		type,
		sort,
		tags,
		global,
	};
}

export function queryToSearchParams({
	q,
	type,
	sort,
	tags,
	global,
}: SearchQuery): URLSearchParams {
	const params = new URLSearchParams();

	// don't provide q if it's empty or undefined
	if (q !== undefined && q.length !== 0) {
		params.append("q", q);
	}

	// search type
	if (type !== undefined) {
		params.append("type", type);
	}

	// sort order
	if (sort !== undefined) {
		params.append("sort", sort.toString());
	}

	// don't provide tags if it's empty or undefined
	if (tags && tags.length !== 0) {
		params.append("tags", tags.join(","));
	}

	// site-wide filters (https://galaxy.click/filters)
	if (global !== undefined) {
		params.append("global", global);
	}

	return params;
}

export function validSearchType(type: string): type is SearchType {
	return (searchTypes as string[]).includes(type);
}
