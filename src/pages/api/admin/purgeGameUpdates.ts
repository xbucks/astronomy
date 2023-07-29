import { Update } from "../../../models/update";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { game } = await req.json();

	await Update.deleteMany({ game });
});
