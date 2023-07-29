import { Schema, model } from "mongoose";
import type { IChannel } from "../types";

const ChannelSchema = new Schema<IChannel>({
	id: String,
	name: String,
	description: {
		type: String,
		default: "",
	},
	owner: Number,
	admins: {
		type: [Number],
		default: [],
	},
	moderators: {
		type: [Number],
		default: [],
	},
	enabled: {
		type: Boolean,
		default: true,
	},
	pinnedMessages: {
		type: [Schema.Types.ObjectId],
		default: [],
	},
	webhookURL: {
		type: String,
		default: "",
	},
	webhookType: {
		type: String,
		default: "disabled",
	},
});

export const Channel = model<IChannel>("Channels", ChannelSchema);
