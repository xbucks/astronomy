import { Game } from "../../../models/game";
import { Message } from "../../../models/message";
import { User } from "../../../models/user";
import { adminRoute } from "../../../helper/admin";
import { env } from "../../../helper/env";
import sendWebhook from "../../../helper/sendWebhook";

export const post = adminRoute(async req => {
	const { game, status } = await req.json();
	await Game.updateOne({ id: game }, { verified: status });
	const gameDoc = await Game.findOne({ id: game });
	const user = await User.findOne({ id: gameDoc.author });
	if (status === true) {
		let isFlairAwarded = false;

		gameDoc.lastUpdate = Date.now();
		if (!user.flairs.includes("gamedev")) {
			user.flairs.push("gamedev");
			await user.save();
			isFlairAwarded = true;
		}
		const msg = new Message({
			from: -1,
			to: gameDoc.author,
			title: `${gameDoc.name} was verified`,
			content: `
Your game ${gameDoc.name} has been verified. Now anyone on Galaxy can play it!
			
You can see it for yourself [here](/play/${gameDoc.id}).

${isFlairAwarded ? "You have also received the gamedev flair!" : ""}`.trim(),
		});
		await gameDoc.save();
		await msg.save();

		const unv = await Game.countDocuments({ verified: { $ne: true } });
		if (env.STAFF_WEBHOOK)
			await sendWebhook(env.STAFF_WEBHOOK, {
				content: `${gameDoc.name} has been verified. ${unv} left.`,
			});
	} else {
		const unv = await Game.countDocuments({ verified: { $ne: true } });
		const gamesVerified = await Game.countDocuments({
			author: gameDoc.author,
			verified: true,
		});

		if (gamesVerified === 0 && user.flairs.includes("gamedev")) {
			user.flairs.splice(user.flairs.indexOf("gamedev"), 1);
			await user.save();
		}

		if (env.STAFF_WEBHOOK)
			await sendWebhook(env.STAFF_WEBHOOK, {
				content: `${gameDoc.name} verification note changed to \`${status}\`. ${unv} left.`,
			});
	}
});
