import { User } from "../../../models/user";
import { adminRoute } from "../../../helper/admin";
import sharp from "sharp";
import { updatePfps } from "../../../helper/img";

export const post = adminRoute(async req => {
	const { user } = await req.json();

	const u = await User.findOne({ id: user });

	const original = u.pfpTimestamp;
	u.pfpTimestamp = Date.now();
	await u.save();

	await updatePfps(
		sharp("public/unknown-user.webp"),
		user,
		u.pfpTimestamp,
		original
	);
});
