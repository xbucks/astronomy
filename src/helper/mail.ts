import nodemailer, { type Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { env } from "./env";

let transporter: Transporter<SMTPTransport.SentMessageInfo>;
let initRan = false;

async function main() {
	initRan = true;

	let user = "";
	let pass = "";

	const mode = env.MAIL_TYPE;
	if (mode === "ethereal") {
		const test = await nodemailer.createTestAccount();
		user = test.user;
		pass = test.pass;
	} else {
		user = env.MAIL_USER;
		pass = env.MAIL_PASS;
	}

	transporter = nodemailer.createTransport({
		host: mode === "prod" ? env.MAIL_HOST : "smtp.ethereal.email",
		port: mode === "prod" ? env.MAIL_PORT : 587,
		secure: false,
		auth: { user, pass },
		...(env.DKIM_ENABLED
			? {
					dkim: {
						domainName: env.DKIM_DOMAIN_NAME,
						keySelector: env.DKIM_KEY_SELECTOR,
						privateKey: env.DKIM_PRIVATE_KEY,
					},
			  }
			: {}),
	});
}

export async function sendMail(
	to: string,
	subject: string,
	body: { plaintext: string; html: string }
) {
	if (!initRan) await main();
	const info = await transporter.sendMail({
		from: "Galaxy <noreply@galaxy.click>",
		to,
		subject,
		text: body.plaintext,
		html: body.html,
	});

	if (env.MAIL_TYPE === "ethereal")
		console.log(nodemailer.getTestMessageUrl(info));
}


export async function sendVerifyMail(
	email: string,
	code: string
) {
	await sendMail(email, "Verify your email on Galaxy", {
		plaintext: `
Thanks for checking out Galaxy! Your verification code is:

${code}

If you didn't perform this action, you can safely ignore this email.
		`.trim(),
		html: `
<p>Thanks for checking out Galaxy!</p>

<p>
	Click <a href="https://galaxy.click/signedup?code=${code}">this link</a>
	to verify your account, or copy this verification code and paste it into the verification box:
	<code>${code}</code>
</p>

<p>If you didn't perform this action, you can safely ignore this email.</p>
		`.trim(),
	});
}