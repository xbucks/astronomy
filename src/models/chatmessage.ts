import { Schema, model } from "mongoose";
import type { IChatMessage } from "../types";

const ChatMessageSchema = new Schema<IChatMessage>(
	{
		content: String,
		author: Number,
		channel: String,
		deleted: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

export const ChatMessage = model<IChatMessage>(
	"ChatMessages",
	ChatMessageSchema
);
