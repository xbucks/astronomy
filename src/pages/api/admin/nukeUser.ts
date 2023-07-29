import { Comment } from "../../../models/comment";
import { Game } from "../../../models/game";
import { User } from "../../../models/user";
import { adminRoute } from "../../../helper/admin";
import sharp from "sharp";
import { updatePfps } from "../../../helper/img";

export const post = adminRoute(async req => {
	const { user } = await req.json();

	const u = await User.findOne({ id: user });
	u.banned = true;
	u.bio = "[removed]";

	const original = u.pfpTimestamp;
	u.pfpTimestamp = Date.now();
	await u.save();

	await Game.deleteMany({ author: user });
	await Comment.deleteMany({ author: user });
	await updatePfps(
		sharp("public/unknown-user.webp"),
		user,
		u.pfpTimestamp,
		original
	);
});
