// Atom/RSS "polyfill"

import { el } from "./xml";
import { elFeed as elAtom } from "./atom";
import { elChannel as elRSS } from "./rss";

// TODO: maybe have an option to choose between plaintext and HTML for all title/description fields
// TODO: Icon/image
// TODO: more link options Maybe.

export type Feed = {
	// unique URI
	id: string;
	// plaintext title of feed
	title: string;
	// plaintext description/subtitle of feed
	description: string;
	// name of author
	author: string;
	// URL of Atom feed
	selfAtom: string;
	// URL of RSS feed
	selfRSS: string;
	// link to the feed (HTML page)
	// TODO: make optional?
	link: string;
	// time of creation
	published: Date;
	// time of last update
	updated: Date;
	// list of entries
	entries: Entry[];
};

export type Entry = {
	// unique URI
	id: string;
	// plaintext title of entry
	title: string;
	// HTML content of entry
	description: string;
	// link to the entry (HTML page)
	link: string;
	// time of creation
	published: Date;
	// time of last update
	updated: Date;
};

export const polyToAtom = (feed: Feed) =>
	elAtom({
		id: feed.id,
		title: { body: feed.title },
		subtitle: { body: feed.description },
		authors: [
			{
				name: feed.author,
			},
		],
		links: [
			{
				href: feed.selfAtom,
				rel: "self",
				type: "application/atom+xml",
			},
			{
				href: feed.link,
				type: "text/html",
			},
		],
		updated: feed.updated,
		entries: feed.entries.map(entry => ({
			id: entry.id,
			title: { body: entry.title },
			content: {
				type: "html",
				body: entry.description,
			},
			links: [
				{
					href: entry.link,
				},
			],
			published: entry.published,
			updated: entry.updated,
		})),
	}).attr("xml:lang", "en");

// NOTE: no author here because RSS requires an email for it.
export const polyToRSS = (feed: Feed) =>
	elRSS({
		language: "en",
		title: feed.title,
		description: feed.description,
		link: feed.link,
		pubDate: feed.published,
		lastBuildDate: feed.updated,
		ttl: 3600,
		items: feed.entries.map(entry => ({
			guid: {
				isPermaLink: false,
				text: entry.id,
			},
			title: entry.title,
			description: entry.description,
			link: entry.link,
			pubDate: entry.published,
		})),
	})
		.attr("xmlns:atom", "http://www.w3.org/2005/Atom")
		.push(
			el("atom:link")
				.attr("href", feed.selfRSS)
				.attr("rel", "self")
				.attr("type", "application/rss+xml")
		);

export const renderPoly = (feed: Feed, type: "atom" | "rss") => {
	const element = type === "atom" ? polyToAtom(feed) : polyToRSS(feed);
	return `<?xml version="1.0" encoding="utf-8"?>${element.render()}`;
};
