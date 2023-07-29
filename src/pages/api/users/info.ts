import { rdata, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { User } from "../../../models/user";

export async function get({ url }: APIContext) {
	const id = parseInt(url.searchParams.get("id"));

	if (isNaN(id)) return rmsg("Invalid user ID", 400);

	const user = await User.findOne({ id });

	if (user) return rdata({ message: "yes", user });
	return rmsg("no", 404);
}
