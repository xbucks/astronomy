// RSS 2.0: https://www.rssboard.org/rss-specification

import { el } from "./xml";
import { maybe } from "./util";

// (simplified)
export type Channel = {
	title: string;
	link: string;
	description: string;
	language?: string;
	copyright?: string;
	managingEditor?: string;
	webMaster?: string;
	pubDate?: Date;
	lastBuildDate?: Date;
	categories?: Category[];
	generator?: string;
	docs?: string;
	ttl?: number;
	image?: Image;
	items?: Item[];
};

export type Category = {
	domain?: string;

	name: string;
};

export type Enclosure = {
	url: string;
	length: number;
	type: string;
};

export type Guid = {
	isPermaLink?: boolean;

	text: string;
};

export type Image = {
	url: string;
	title: string;
	link: string;
	width?: number;
	height?: number;
	description?: string;
};

export type Item = {
	title?: string;
	link?: string;
	description?: string;
	author?: string;
	categories?: Category[];
	comments?: string;
	enclosure?: Enclosure;
	guid?: Guid;
	pubDate?: Date;
	source?: Source;
};

export type Source = {
	url: string;

	name: string;
};

export const stringifyDate = (date: Date) => date.toUTCString();

export const elAuthor = (author: string) => el("author").text(author);

export const elComments = (comments: string) => el("comments").text(comments);

export const elTitle = (title: string) => el("title").text(title);

export const elLink = (link: string) => el("link").text(link);

export const elDescription = (description: string) =>
	el("description").text(description);

export const elLanguage = (language: string) => el("language").text(language);

export const elCopyright = (copyright: string) =>
	el("copyright").text(copyright);

export const elManagingEditor = (managingEditor: string) =>
	el("managingEditor").text(managingEditor);

export const elWebMaster = (webMaster: string) =>
	el("webMaster").text(webMaster);

export const elPubDate = (pubDate: Date) =>
	el("pubDate").text(stringifyDate(pubDate));

export const elLastBuildDate = (lastBuildDate: Date) =>
	el("lastBuildDate").text(stringifyDate(lastBuildDate));

export const elCategory = (category: Category) =>
	el("category").attr("domain", category.domain).text(category.name);

export const elGenerator = (generator: string) =>
	el("generator").text(generator);

export const elDocs = (docs: string) => el("docs").text(docs);

export const elTtl = (ttl: number) => el("ttl").text(ttl.toString());

const elImageUrl = (url: string) => el("url").text(url);

const elImageTitle = (title: string) => el("title").text(title);

const elImageLink = (link: string) => el("link").text(link);

const elImageWidth = (width: number) => el("width").text(width.toString());

const elImageHeight = (height: number) => el("height").text(height.toString());

const elImageDescription = (description: string) =>
	el("description").text(description);

export const elImage = (image: Image) => {
	const url = elImageUrl(image.url);
	const title = elImageTitle(image.title);
	const link = elImageLink(image.link);
	const width = maybe(elImageWidth, image.width);
	const height = maybe(elImageHeight, image.height);
	const description = maybe(elImageDescription, image.description);
	return el("image").push(url, title, link, width, height, description);
};

export const elItem = (item: Item) => {
	const title = maybe(elTitle, item.title);
	const link = maybe(elLink, item.link);
	const description = maybe(elDescription, item.description);
	const author = maybe(elAuthor, item.author);
	const categories = item.categories?.map(elCategory);
	const comments = maybe(elComments, item.comments);
	const enclosure = maybe(elEnclosure, item.enclosure);
	const guid = maybe(elGuid, item.guid);
	const pubDate = maybe(elPubDate, item.pubDate);
	const source = maybe(elSource, item.source);
	return el("item").push(
		title,
		link,
		description,
		author,
		categories,
		comments,
		enclosure,
		guid,
		pubDate,
		source
	);
};

export const elEnclosure = (enclosure: Enclosure) =>
	el("enclosure")
		.attr("url", enclosure.url)
		.attr("length", enclosure.length.toString())
		.attr("type", enclosure.type);

export const elGuid = (guid: Guid) =>
	el("guid")
		.attr(
			"isPermaLink",
			guid.isPermaLink === true
				? "true"
				: guid.isPermaLink === false
				? "false"
				: guid.isPermaLink
		)
		.text(guid.text);

export const elSource = (source: Source) =>
	el("source").attr("url", source.url).text(source.name);

export const elChannel = (channel: Channel) => {
	const title = elTitle(channel.title);
	const link = elLink(channel.link);
	const description = elDescription(channel.description);
	const language = maybe(elLanguage, channel.language);
	const copyright = maybe(elCopyright, channel.copyright);
	const managingEditor = maybe(elManagingEditor, channel.managingEditor);
	const webMaster = maybe(elWebMaster, channel.webMaster);
	const pubDate = maybe(elPubDate, channel.pubDate);
	const lastBuildDate = maybe(elLastBuildDate, channel.lastBuildDate);
	const categories = channel.categories?.map(elCategory);
	const generator = maybe(elGenerator, channel.generator);
	const docs = maybe(elDocs, channel.docs);
	const ttl = maybe(elTtl, channel.ttl);
	const image = maybe(elImage, channel.image);
	const items = channel.items?.map(elItem);
	return el("rss")
		.attr("version", "2.0")
		.push(
			el("channel").push(
				title,
				link,
				description,
				language,
				copyright,
				managingEditor,
				webMaster,
				pubDate,
				lastBuildDate,
				categories,
				generator,
				docs,
				ttl,
				image,
				items
			)
		);
};
