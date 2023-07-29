import { Schema, model } from "mongoose";
import type { IReport } from "../types";

const ReportSchema = new Schema<IReport>(
	{
		author: Number,
		part: String,
		reason: String,
		type: String,
		data: Schema.Types.Mixed,
		resolved: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

export const Report = model<IReport>("Reports", ReportSchema);
