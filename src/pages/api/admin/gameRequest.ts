import { GameRequest } from "../../../models/gamerequest";
import { User } from "../../../models/user";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { oid, flair } = await req.json();

	const request = await GameRequest.findById(oid);
	request.resolved = true;
	request.successful = flair;
	await request.save();

	if (flair === true) {
		const user = await User.findOne({ id: request.requestAuthor });
		if (!user.flairs.includes("suggester"))
			await User.updateOne(
				{ id: request.requestAuthor },
				{ $push: { flairs: "suggester" } }
			);
	}
});
