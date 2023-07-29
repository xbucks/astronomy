import MarkdownIt from "markdown-it";

// add a render rule to set links to open in a new tab
const openLinksInNewTab = (md: MarkdownIt) => {
	const defaultRule =
		md.renderer.rules.link_open ??
		((tokens, idx, options, _env, self) => {
			return self.renderToken(tokens, idx, options);
		});

	md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
		tokens[idx].attrSet("target", "_blank");
		return defaultRule(tokens, idx, options, env, self);
	};
};

// chat messages
export const chat = MarkdownIt({ linkify: true })
	.disable(["link", "image", "fence", "code", "hr", "list", "heading"])
	.use(openLinksInNewTab);

// comments
export const comment = MarkdownIt({})
	.disable(["link", "image", "fence", "code", "hr", "list", "heading"])
	.use(openLinksInNewTab);

// game descriptions
export const gameDescription = MarkdownIt({ linkify: true })
	.disable(["image"])
	.use(openLinksInNewTab);

// inbox messages (normal user)
export const message = MarkdownIt({ linkify: true })
	.disable(["link", "image"])
	.use(openLinksInNewTab);

// inbox messages (staff user)
export const staffMessage = MarkdownIt({ linkify: true }).use(
	openLinksInNewTab
);

// update changelogs
export const updateChangelog = MarkdownIt({})
	.disable(["link", "image"])
	.use(openLinksInNewTab);

// update changelogs (syndication edition)
export const updateChangelogFeed = MarkdownIt({}).disable(["link", "image"]);

// user bios
export const userBio = MarkdownIt({ linkify: true })
	.disable(["link", "image"])
	.use(openLinksInNewTab);

// forums posts
// TODO: links?
export const forumPost = MarkdownIt({ linkify: true })
	.disable(["link", "image"])
	.use(openLinksInNewTab);
