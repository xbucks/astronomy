import { ChatMessage } from "../../../models/chatmessage";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { user } = await req.json();

	await ChatMessage.deleteMany({ author: user });
});
