// The Atom Syndication Format: https://www.rfc-editor.org/rfc/rfc4287

import { el } from "./xml";
import { maybe } from "./util";

// Constructs
export type Text = {
	type?: "text" | "html" | "xhtml";

	body: string;
};

export type Person = {
	name: string;
	uri?: string;
	email?: string;
};

// Metadata elements
export type Author = Person;

export type Category = {
	term: string;
	scheme?: string;
	label?: string;
};

export type Contributor = Person;

export type Generator = {
	uri?: string;
	version?: string;

	name: string;
};

export type Icon = string;

export type Id = string;

export type Link = {
	href: string;
	rel?: string;
	type?: string;
	hreflang?: string;
	title?: string;
	length?: string;
};

export type Logo = string;

export type Published = Date;

export type Rights = Text;

export type Source = {
	authors?: Author[];
	categories?: Category[];
	contributors?: Contributor[];
	generator?: Generator;
	icon?: Icon;
	id?: Id;
	links?: Link[];
	logo?: Logo;
	rights?: Rights;
	subtitle?: Subtitle;
	title?: Title;
	updated?: Updated;
};

export type Subtitle = Text;

export type Summary = Text;

export type Title = Text;

export type Updated = Date;

// Container elements
// (simplified)
export type Content = Text;

export type Entry = {
	authors?: Author[];
	categories?: Category[];
	content?: Content;
	contributors?: Contributor[];
	id: Id;
	links?: Link[];
	published?: Published;
	rights?: Rights;
	source?: Source;
	summary?: Summary;
	title: Title;
	updated: Updated;
};

export type Feed = {
	authors?: Author[];
	categories?: Category[];
	contributors?: Contributor[];
	entries?: Entry[];
	generator?: Generator;
	icon?: Icon;
	id: Id;
	links?: Link[];
	logo?: Logo;
	rights?: Rights;
	subtitle?: Subtitle;
	title: Title;
	updated: Updated;
};

// Constructs
export const elText = (tag: string, text: Text) =>
	el(tag).attr("type", text.type).text(text.body);

const elPersonName = (name: string) => el("name").text(name);

const elPersonUri = (uri: string) => el("uri").text(uri);

const elPersonEmail = (email: string) => el("email").text(email);

export const elPerson = (tag: string, person: Person) => {
	const name = elPersonName(person.name);
	const uri = maybe(elPersonUri, person.uri);
	const email = maybe(elPersonEmail, person.email);
	return el(tag).push(name, uri, email);
};

export const elDate = (tag: string, date: Date) =>
	el(tag).text(date.toISOString());

// Metadata elements
export const elAuthor = (author: Author) => elPerson("author", author);

export const elCategory = (category: Category) =>
	el("category")
		.attr("term", category.term)
		.attr("scheme", category.scheme)
		.attr("label", category.label);

export const elContributor = (contributor: Contributor) =>
	elPerson("contributor", contributor);

export const elGenerator = (generator: Generator) =>
	el("generator")
		.attr("uri", generator.uri)
		.attr("version", generator.version)
		.text(generator.name);

export const elIcon = (icon: Icon) => el("icon").text(icon);

export const elId = (id: Id) => el("id").text(id);

export const elLink = (link: Link) =>
	el("link")
		.attr("href", link.href)
		.attr("rel", link.rel)
		.attr("type", link.type)
		.attr("hreflang", link.hreflang)
		.attr("title", link.title)
		.attr("length", link.length);

export const elLogo = (logo: Logo) => el("logo").text(logo);

export const elPublished = (published: Published) =>
	elDate("published", published);

export const elRights = (rights: Rights) => elText("rights", rights);

export const elSource = (source: Source) => {
	const authors = source.authors?.map(elAuthor);
	const categories = source.categories?.map(elCategory);
	const contributors = source.contributors?.map(elContributor);
	const generator = maybe(elGenerator, source.generator);
	const icon = maybe(elIcon, source.icon);
	const id = maybe(elId, source.id);
	const links = source.links?.map(elLink);
	const logo = maybe(elLogo, source.logo);
	const rights = maybe(elRights, source.rights);
	const subtitle = maybe(elSubtitle, source.subtitle);
	const title = maybe(elTitle, source.title);
	const updated = maybe(elUpdated, source.updated);
	return el("source").push(
		authors,
		categories,
		contributors,
		generator,
		icon,
		id,
		links,
		logo,
		rights,
		subtitle,
		title,
		updated
	);
};

export const elSubtitle = (subtitle: Subtitle) => elText("subtitle", subtitle);

export const elSummary = (summary: Summary) => elText("summary", summary);

export const elTitle = (title: Title) => elText("title", title);

export const elUpdated = (updated: Updated) => elDate("updated", updated);

// Container elements
export const elFeed = (feed: Feed) => {
	const authors = feed.authors?.map(elAuthor);
	const categories = feed.categories?.map(elCategory);
	const contributors = feed.contributors?.map(elContributor);
	const generator = maybe(elGenerator, feed.generator);
	const icon = maybe(elIcon, feed.icon);
	const id = elId(feed.id);
	const links = feed.links?.map(elLink);
	const logo = maybe(elLogo, feed.logo);
	const rights = maybe(elRights, feed.rights);
	const subtitle = maybe(elSubtitle, feed.subtitle);
	const title = elTitle(feed.title);
	const updated = elUpdated(feed.updated);
	const entries = feed.entries?.map(elEntry);
	return el("feed")
		.attr("xmlns", "http://www.w3.org/2005/Atom")
		.push(
			authors,
			categories,
			contributors,
			generator,
			icon,
			id,
			links,
			logo,
			rights,
			subtitle,
			title,
			updated,
			entries
		);
};

export const elEntry = (entry: Entry) => {
	const authors = entry.authors?.map(elAuthor);
	const categories = entry.categories?.map(elCategory);
	const content = maybe(elContent, entry.content);
	const contributors = entry.contributors?.map(elContributor);
	const id = elId(entry.id);
	const links = entry.links?.map(elLink);
	const published = maybe(elPublished, entry.published);
	const rights = maybe(elRights, entry.rights);
	const source = maybe(elSource, entry.source);
	const summary = maybe(elSummary, entry.summary);
	const title = elTitle(entry.title);
	const updated = elUpdated(entry.updated);
	return el("entry").push(
		authors,
		categories,
		content,
		contributors,
		id,
		links,
		published,
		rights,
		source,
		summary,
		title,
		updated
	);
};

export const elContent = (content: Content) =>
	el("content").attr("type", content.type).text(content.body);
