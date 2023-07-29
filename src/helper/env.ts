import * as dotenv from "dotenv";
import { z } from "zod";

// this is extremely important. trust me
// (feel free to rip this out if necessary)

const makeStringyNumber = (
	parser: (input: string) => number,
	errorMessage: string
) => {
	return z.string().transform((input, ctx) => {
		const parsed = parser(input);
		if (isNaN(parsed)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: errorMessage,
			});

			return z.NEVER;
		}
		return parsed;
	});
};

const _stringyFloat = makeStringyNumber(parseFloat, "Not a number");

const stringyInt = makeStringyNumber(parseInt, "Not an integer");

// "false" | "0" | "" | undefined => false
const stringyFalse = z
	.union([z.literal("false"), z.literal("0"), z.literal(""), z.undefined()])
	.transform(() => false as const);

// "true" | "1" => true
const stringyTrue = z
	.union([z.literal("true"), z.literal("1")])
	.transform(() => true as const);

const _stringyBoolean = z.union([stringyFalse, stringyTrue]);

const schema = z
	.object({
		DB_URL: z.string(),
		AUTH_SECRET: z.string(),

		STAFF_WEBHOOK: z.string(),

		TURNSTILE_SITEKEY: z.string(),
		TURNSTILE_SECRETKEY: z.string(),
	})
	.and(
		z.union([
			z.object({
				MAIL_TYPE: z.literal("ethereal"),
			}),
			z.object({
				MAIL_TYPE: z.literal("prod"),
				MAIL_USER: z.string(),
				MAIL_PASS: z.string(),
				MAIL_HOST: z.string(),
				MAIL_PORT: stringyInt,
			}),
		])
	)
	.and(
		z.union([
			z.object({
				DKIM_ENABLED: stringyFalse,
			}),
			z.object({
				DKIM_ENABLED: stringyTrue,
				DKIM_DOMAIN_NAME: z.string(),
				DKIM_KEY_SELECTOR: z.string(),
				DKIM_PRIVATE_KEY: z.string(),
			}),
		])
	)
	.and(
		z.union([
			z.object({
				PATREON_ENABLED: stringyFalse,
			}),
			z.object({
				PATREON_ENABLED: stringyTrue,
				PATREON_CLIENT_ID: z.string(),
				PATREON_CLIENT_SECRET: z.string(),
			}),
		])
	);

const { parsed, error } = dotenv.config();
if (!parsed) {
	throw new Error("failed to load .env", { cause: error });
}

export const env = schema.parse(parsed);
