export interface WebhookMessage {
	title?: string;
	content: string;
	// display name
	name?: string;
	// icon/avatar url
	icon?: string;
}

export default function sendWebhook(
	webhook: string,
	{ title, content, name, icon }: WebhookMessage
) {
	return fetch(webhook, {
		method: "POST",
		body: JSON.stringify({
			version: "1.0",
			title,
			format: "plain",
			text: content,
			message: content,
			// Discord
			content:
				content.length > 2000
					? "(This message is over 2,000 characters. This is the start) " +
					  content.substring(0, 1900)
					: content,
			username: name,
			displayName: name,
			avatar_url: icon,
			icon_url: icon,
			avatarUrl: icon,
			allowed_mentions: {
				parse: [],
			},
		}),
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
	});
}
