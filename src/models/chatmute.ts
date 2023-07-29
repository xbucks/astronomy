import { Schema, model } from "mongoose";
import type { IChatMute } from "../types";

const ChatMuteSchema = new Schema<IChatMute>({
	channel: String,
	user: String,
	staff: Number,
	reason: {
		type: String,
		default: "",
	},
	active: {
		type: Boolean,
		default: true,
	},
	issuedMs: {
		type: Number,
		default: Date.now,
	},
	expiresMs: {
		type: Number,
		default: -1,
	},
});

export const ChatMute = model<IChatMute>("ChatMutes", ChatMuteSchema);
