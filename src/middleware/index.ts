import { astroCookiesToUser } from "../helper/auth";
import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware(async ({ cookies, locals }, next) => {
	locals.auth = await astroCookiesToUser(cookies);

	return next();
});
