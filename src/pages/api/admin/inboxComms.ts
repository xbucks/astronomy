import { Message } from "../../../models/message";
import { User } from "../../../models/user";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { title, content, to } = await req.json();
	if (to === true) {
		const users = await User.find({ banned: false, emailVerified: true });
		const reqs = users.map(user =>
			new Message({
				content,
				title,
				from: -1,
				to: user.id,
			}).save()
		);
		await Promise.all(reqs);
	} else {
		const msg = new Message({
			content,
			title,
			from: -1,
			to,
		});
		await msg.save();
	}
});
