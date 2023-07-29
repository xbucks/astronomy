import { Message } from "../../../models/message";
import { Report } from "../../../models/report";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { report } = await req.json();

	const reportDoc = await Report.findById(report);

	const message = new Message({
		from: -1,
		to: reportDoc.author,
		title: "Thank you!",
		content:
			"We've taken action based on a report you've made. Thank you for helping to keep Galaxy safe!",
	});

	await message.save();
});
