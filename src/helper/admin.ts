import { rdata, rfu, rmsg } from "./res";
import type { APIContext } from "astro";

export function adminRoute(fun: (req: Request) => Promise<void>, reqLevel = 1) {
	return async function ({ locals, request }: APIContext) {
		const { user, loggedIn } = locals.auth;
		if (!loggedIn) return rfu();
		if (user.modLevel < reqLevel)
			return rfu("Insufficient moderation permissions", 403);

		await fun(request);

		return rmsg("Done");
	};
}

export function adminDataRoute<T>(
	fun: (req: Request) => Promise<T>,
	reqLevel = 1
) {
	return async function ({ locals, request }: APIContext) {
		const { user, loggedIn } = locals.auth;
		if (!loggedIn) return rfu();
		if (user.modLevel < reqLevel)
			return rfu("Insufficient moderation permissions", 403);

		const data = await fun(request);

		return rdata({ message: "Done", ...data });
	};
}
