import { ChatMessage } from "../../../models/chatmessage";
import { Comment } from "../../../models/comment";
import { Favorite } from "../../../models/favorite";
import { Game } from "../../../models/game";
import { Playtime } from "../../../models/playtime";
import { Rating } from "../../../models/rating";
import { User } from "../../../models/user";
import { adminRoute } from "../../../helper/admin";
import sharp from "sharp";
import { updatePfps } from "../../../helper/img";

export const post = adminRoute(async req => {
	const { user } = await req.json();

	const u = await User.findOne({ id: user });
	u.banned = true;
	u.name = "[removed]";
	u.bio = "[removed]";

	const original = u.pfpTimestamp;
	u.pfpTimestamp = Date.now();
	u.playMinutes = 0;
	await u.save();

	await Game.deleteMany({ author: user });
	await Comment.deleteMany({ author: user });
	await ChatMessage.deleteMany({ author: user });
	await Rating.deleteMany({ author: user });
	await Favorite.deleteMany({ user });
	await updatePfps(
		sharp("public/unknown-user.webp"),
		user,
		u.pfpTimestamp,
		original
	);

	const playtimes = await Playtime.find({ user });
	const awaits = playtimes.map(p =>
		Game.updateOne({ id: p.game }, { $inc: { playMinutes: -p.minutes } })
	);
	await Promise.all(awaits);
	await Playtime.deleteMany({ user });
});
