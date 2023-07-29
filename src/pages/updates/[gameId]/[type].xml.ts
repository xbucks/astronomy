import { type Entry, renderPoly } from "../../../helper/feed/poly";
import type { APIContext } from "astro";
import { Game } from "../../../models/game";
import { Update } from "../../../models/update";
import { User } from "../../../models/user";
import { updateChangelogFeed as md } from "../../../helper/markdown";

// TODO: link to this in the actual updates page (https://en.wikipedia.org/wiki/Atom_(web_standard)#Including_in_HTML)
// TODO: *link* to this in the actual updates/game page (perhaps a button with the RSS icon?)
export async function get({ params, request }: APIContext) {
	const type = params.type;
	if (type !== "atom" && type !== "rss") {
		return new Response("Unknown feed type", { status: 404 });
	}

	const gameId = parseInt(params.gameId ?? "");
	if (isNaN(gameId)) {
		return new Response("Invalid game ID", {
			status: 400,
		});
	}

	const game = await Game.findOne({ id: gameId });
	if (!game) return new Response("Game not found", { status: 404 });

	const user = await User.findOne({ id: game.author });

	// TODO: is 50 a good limit here? how does this stuff work
	const updates = await Update.find({ game: gameId })
		.lean()
		.limit(50)
		.sort({ createdAt: -1 });

	// find the latest update date
	const lastUpdated = [
		game.updatedAt,
		...updates.map(update => update.updatedAt),
	].reduce((a, b) => (a > b ? a : b));

	// 304 Not Modified
	const ifModifiedSince = request.headers.get("If-Modified-Since");
	if (ifModifiedSince !== null && lastUpdated > new Date(ifModifiedSince)) {
		return new Response(null, { status: 304 });
	}

	// TODO: use a real link for the link and id?
	const entries: Entry[] = updates.map(update => ({
		id: `https://galaxy.click/updates/${gameId}/${update._id.toString()}`,
		title:
			update.name !== undefined && update.version !== undefined
				? `${update.name} - ${update.version}`
				: update.name !== undefined
				? update.name
				: update.version !== undefined
				? update.version
				: "(untitled)",
		description: md.render(update.changelog).trim(),
		link: `https://galaxy.click/updates/${gameId}`,
		published: update.createdAt,
		updated: update.updatedAt,
	}));

	const rendered = renderPoly(
		{
			id: `https://galaxy.click/updates/${gameId}`,
			title: `galaxy - ${game.name} updates`,
			description: `keep up with the latest updates for ${game.name}`,
			author: user ? user.name : "(unknown)",
			selfAtom: `https://galaxy.click/updates/${gameId}/atom.xml`,
			selfRSS: `https://galaxy.click/updates/${gameId}/rss.xml`,
			link: `https://galaxy.click/updates/${gameId}`,
			published: game.createdAt,
			updated: lastUpdated,
			entries,
		},
		type
	);

	return new Response(rendered, {
		headers: {
			"Content-Type": "application/xml; charset=UTF-8",
			"Last-Modified": lastUpdated.toUTCString(),
		},
		status: 200,
	});
}
