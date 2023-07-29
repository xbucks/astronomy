import { User } from "../../../models/user";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { id, flairs } = await req.json();
	await User.updateOne({ id }, { flairs });
});
