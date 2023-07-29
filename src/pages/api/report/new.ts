import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { ChatMessage } from "../../../models/chatmessage";
import { Comment } from "../../../models/comment";
import { Game } from "../../../models/game";
import { Message } from "../../../models/message";
import { Report } from "../../../models/report";
import { User } from "../../../models/user";
import { env } from "../../../helper/env";
import sendWebhook from "../../../helper/sendWebhook";

export async function post({ locals, request }: APIContext) {
	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();
	if (user.muted !== false) return rfu("You are currently muted.", 403);

	if (typeof req !== "object") return rmsg("what", 400);

	let data = {};

	switch (req.data?.type) {
		case "comment": {
			const comment = await Comment.findOne({
				id: parseInt(req.data.id),
				deleted: false,
			});
			if (!comment) return rmsg("Invalid comment", 400);

			data = comment;
			break;
		}
		case "game": {
			const game = await Game.findOne({ id: parseInt(req.data.id) });
			if (!game) return rmsg("Invalid game", 400);

			data = game;
			break;
		}
		case "user": {
			const user = await User.findOne({ id: parseInt(req.data.id) });
			if (!user) return rmsg("Invalid game", 400);

			// system user
			if (user.id === -1) return rfu("Cannot report system user.", 403);
			user.password = null;
			user.passwordReset = null;
			user.passwordResetExpiry = null;
			user.email = null;
			data = user;
			break;
		}
		case "chat": {
			const msg = await ChatMessage.findOne({
				_id: req.data.mid,
				deleted: false,
			});
			if (!msg) return rmsg("Invalid message", 400);

			let msgBeforeContext = await ChatMessage.find({
				createdAt: { $lt: msg.createdAt },
				channel: msg.channel,
			})
				.sort({
					createdAt: -1,
				})
				.limit(20);
			msgBeforeContext = msgBeforeContext.reverse();

			const msgAfterContext = await ChatMessage.find({
				createdAt: { $gt: msg.createdAt },
				channel: msg.channel,
			})
				.sort({
					createdAt: 1,
				})
				.limit(20);

			data = {
				before: msgBeforeContext,
				after: msgAfterContext,
				msg,
			};
			break;
		}
		case "message": {
			const msg = await Message.findOne({
				_id: req.data._id,
				to: user.id,
				deleted: false,
			});
			if (!msg) return rmsg("Invalid message", 400);

			data = msg;
			break;
		}
		default:
			return rmsg("Invalid report type", 400);
	}

	const report = new Report({
		author: user.id,
		part: req.part,
		reason: req.reason,
		type: req.data.type,
		data,
	});

	await report.save();

	if (env.STAFF_WEBHOOK)
		await sendWebhook(env.STAFF_WEBHOOK, {
			content: `New report\n${report.part} | ${report.reason}\nhttps://galaxy.click/admin/`,
		});

	return rmsg("Thanks for helping to keep Galaxy safe!");
}
