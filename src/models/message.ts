import { Schema, model } from "mongoose";
import type { IMessage } from "../types";

const MessageSchema = new Schema<IMessage>(
	{
		from: Number,
		to: Number,
		title: {
			type: String,
			maxLength: 128,
			default: "<no subject>",
		},
		content: {
			type: String,
			maxLength: 16384,
			default: "<no content>",
		},
		read: {
			type: Boolean,
			default: false,
		},
		deleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

export const Message = model<IMessage>("Messages", MessageSchema);
