import { mkdirSync, writeFileSync } from "fs";
import { randomBytes } from "crypto";

// TODO make this rerun-safe

// Generate secret
// NOTE is 32 an acceptable length?
const token = randomBytes(32).toString("hex");
writeFileSync(
	".env",
	`DB_URL=mongodb://0.0.0.0/galaxy
AUTH_SECRET=${token}

# prod | ethereal
# Use ethereal for testing
MAIL_TYPE=ethereal
# only applies to prod
MAIL_USER=noreply
MAIL_PASS=abcdefg
MAIL_HOST=galaxy.click
MAIL_PORT=587

# optional webhook for logging actions staff must respond to
STAFF_WEBHOOK=

# cloudflare turnstile captcha
TURNSTILE_SITEKEY=3x00000000000000000000FF
TURNSTILE_SECRETKEY=1x0000000000000000000000000000000AA
`
);

mkdirSync("public/pfp");
mkdirSync("public/pfp/small");
mkdirSync("public/pfp/medium");
mkdirSync("public/pfp/large");

mkdirSync("public/thumb");
mkdirSync("public/thumb/small");
mkdirSync("public/thumb/medium");
mkdirSync("public/thumb/large");

mkdirSync("img");

mkdirSync("img/pfp");
mkdirSync("img/pfp/small");
mkdirSync("img/pfp/medium");
mkdirSync("img/pfp/large");

mkdirSync("img/thumb");
mkdirSync("img/thumb/small");
mkdirSync("img/thumb/medium");
mkdirSync("img/thumb/large");

// specifically de-authing accounts (should i specify this?)
console.log(
	"you're good to go! be warned, if you re-run this, it may mess things up."
);
