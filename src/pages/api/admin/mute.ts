import { User } from "../../../models/user";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { user } = await req.json();
	const u = await User.findOne({ id: user });
	u.muted = !u.muted;
	await u.save();
});
