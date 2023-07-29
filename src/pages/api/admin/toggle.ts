import { adminRoute } from "../../../helper/admin";
import { keyv } from "../../../models/keyv";

export const post = adminRoute(async req => {
	const { key } = await req.json();

	await keyv.toggle(key);
}, 2);
