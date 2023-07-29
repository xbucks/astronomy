import { Schema, model } from "mongoose";
import type { IKeyV } from "../types";

const KeyVSchema = new Schema<IKeyV>(
	{
		prop: String,
		val: Schema.Types.Mixed,
	},
	{
		collection: "keyv",
	}
);

export const KeyV = model<IKeyV>("KeyV", KeyVSchema);

export const keyv = {
	async get<T>(prop: string, fallback: T): Promise<T> {
		const out = await KeyV.findOne({ prop });
		if (!out) return fallback;
		return out.val;
	},

	async set<T>(prop: string, val: T) {
		let entry = await KeyV.findOne({ prop });
		if (!entry) entry = new KeyV({ prop, val });
		else entry.val = val;
		await entry.save();
	},

	async id(prop: string): Promise<number> {
		const out = await KeyV.findOneAndUpdate(
			{ prop },
			{ $inc: { val: 1 } },
			{ returnDocument: "after" }
		);
		if (!out) {
			// TODO just upsert? I don't feel like doing that though
			const newDoc = new KeyV({ prop, val: 1 });
			await newDoc.save();
			return 1;
		}
		return out.val;
	},

	async toggle(prop: string): Promise<boolean> {
		let input = await KeyV.findOne({ prop });
		if (!input) {
			input = new KeyV({ prop, val: true });
		} else {
			// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- we know what we're doing
			input.val = !input.val;
		}

		await input.save();

		return input.val;
	},
};
