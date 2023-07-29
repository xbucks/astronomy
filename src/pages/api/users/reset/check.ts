import { rdata, rmsg } from "../../../../helper/res";
import type { APIContext } from "astro";
import { User } from "../../../../models/user";

export async function get({ url }: APIContext) {
	const token = url.searchParams.get("token");
	if (token == null) return rmsg("no");

	const user = await User.findOne({
		passwordReset: token,
		passwordResetExpiry: { $gt: Date.now() },
	});
	if (!user) return rmsg("no");

	return rdata({ message: "yes", id: user.id, name: user.name });
}
