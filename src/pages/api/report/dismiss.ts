import { Report } from "../../../models/report";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { report } = await req.json();

	await Report.findByIdAndUpdate(report, { resolved: true });
});
