import { adminRoute } from "../../../helper/admin";
import { keyv } from "../../../models/keyv";

export const post = adminRoute(async req => {
	const bool = await req.json();

	await keyv.set("commentsLocked", bool);
	await keyv.set("gamesLocked", bool);
	await keyv.set("updatesLocked", bool);
	await keyv.set("usersLocked", bool);
	await keyv.set("feedbackLocked", bool);
	await keyv.set("messagesLocked", bool);
	await keyv.set("chatLocked", bool);
}, 2);
