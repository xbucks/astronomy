import { rdata, rfu } from "../../../helper/res";
import type { APIContext } from "astro";
import { Message } from "../../../models/message";
import { User } from "../../../models/user";

export async function get({ locals }: APIContext) {
	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();

	const messages = await Message.find({ to: user.id, deleted: false }).sort({
		createdAt: -1,
	});
	const users = new Set();
	messages.forEach(m => users.add(m.from));

	const userMap = {};
	const userList = await User.find({ id: { $in: [...users.values()] } });

	userList.forEach(u => (userMap[u.id] = [u.name, u.pfpTimestamp]));

	return rdata({
		messages: messages.map(m => ({
			from: m.from,
			fromName: userMap[m.from][0],
			fromPic: userMap[m.from][1],
			title: m.title,
			read: m.read,
			id: m.id,
			createdAt: +m.createdAt,
		})),
	});
}
