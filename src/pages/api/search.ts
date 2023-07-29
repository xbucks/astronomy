import { queryFromSearchParams, search } from "../../helper/search";
import type { APIContext } from "astro";
import { rdata } from "../../helper/res";

export async function get({ url }: APIContext) {
	// const games = await Game.aggregate([{ $match: { $text: { $search: t } } }])
	// const games = await search({ t: "Tree", s: "ratingBest", tags: [] })

	const query = queryFromSearchParams(url.searchParams);
	const games = await search(query);
	return rdata({ message: "here u go", games });
}
