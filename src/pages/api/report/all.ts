import { rdata, rfu } from "../../../helper/res";
import type { APIContext } from "astro";
import { Report } from "../../../models/report";

export async function get({ locals }: APIContext) {
	const { user, loggedIn } = locals.auth;

	if (!loggedIn) return rfu();
	if (user.modLevel === 0)
		return rfu("You need to be a moderator to view reports", 403);

	const reports = await Report.find({ resolved: false });

	return rdata({ data: reports });
}
