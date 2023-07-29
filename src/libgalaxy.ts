// oooo   o8o   .o8                            oooo
// `888   `"'  "888                            `888
//  888  oooo   888oooo.   .oooooooo  .oooo.    888   .oooo.   oooo    ooo oooo    ooo
//  888  `888   d88' `88b 888' `88b  `P  )88b   888  `P  )88b   `88b..8P'   `88.  .8'
//  888   888   888   888 888   888   .oP"888   888   .oP"888     Y888'      `88..8'
//  888   888   888   888 `88bod8P'  d8(  888   888  d8(  888   .o8"'88b      `888'
// o888o o888o  `Y8bod8P' `8oooooo.  `Y888""8o o888o `Y888""8o o88'   888o     .8'
//                        d"     YD                                        .o..P'
//                        "Y88888P'                                        `Y8P'
//
// This file is a remnant of an older time. It no longer needs to be a single file.
// But it's funny as shit.

//  _     _   _
// | |__ | |_| |_ _ __
// | '_ \| __| __| '_ \
// | | | | |_| |_| |_) |
// |_| |_|\__|\__| .__/
//               |_|
// `fetch` wrapper functions
// prevents a lot of redundant code

export async function json(url: string) {
	const req = await fetch(url);
	const out = await req.json();
	return out;
}

export async function post(
	url: string,
	body: any,
	{ method = "json", submitAsJson = true, errorOnFailure = true } = {}
) {
	const headers = {
		Accept: "application/json",
	};
	if (submitAsJson) headers["Content-Type"] = "application/json";

	const req = await fetch(url, {
		method: "POST",
		headers,
		body: submitAsJson ? JSON.stringify(body) : body,
	});

	if (method) {
		const out = await req[method]();
		if (req.status >= 400 && out.message && errorOnFailure)
			alert.error(out.message);
		out._resCode = req.status;

		return out;
	}
	return req;
}

//  _ __   ___  _ __  _   _ _ __  ___
// | '_ \ / _ \| '_ \| | | | '_ \/ __|
// | |_) | (_) | |_) | |_| | |_) \__ \
// | .__/ \___/| .__/ \__,_| .__/|___/
// |_|         |_|         |_|

export const alert = {
	error: createGalaxyAlert("alert-red"),
	success: createGalaxyAlert("alert-green"),
	info: createGalaxyAlert("alert-blue"),
};

// 	  __
//  / _| ___  _ __ _ __ ___  ___
// | |_ / _ \| '__| '_ ` _ \/ __|
// |  _| (_) | |  | | | | | \__ \
// |_|  \___/|_|  |_| |_| |_|___/
function formCore(
	id: string,
	props: string[],
	out,
	forceMultipart = false,
	checkInputs?: () => string | true
): [HTMLElement, () => void] {
	const form = document.getElementById(id);

	return [
		form,
		() => {
			if (checkInputs) {
				const validation = checkInputs();
				if (validation !== true) {
					alert.error(validation);
					return;
				}
			}
			const formData = new FormData();
			const jsonForm = {};

			props.forEach(prop => {
				const el = form.querySelector(`[name=${prop}]`);
				// @ts-expect-error
				if (el.files) formData.append(prop, el.files[0]);
				// @ts-expect-error
				else if (el.type === "checkbox")
					// @ts-expect-error
					formData.append(prop, el.checked);
				// @ts-expect-error
				else formData.append(prop, el.value);

				// @ts-expect-error
				jsonForm[prop] = el.type === "checkbox" ? el.checked : el.value;
			});

			post(
				form.getAttribute("data-action"),
				forceMultipart ? formData : jsonForm,
				{
					submitAsJson: !forceMultipart,
				}
			)
				.then(out)
				.catch(e => {
					alert.error(`There was an error with your input. ${e}`);
				});
		},
	];
}

export function form(
	id: string,
	props: string[],
	out,
	forceMultipart = false,
	checkInputs?: () => string | true
) {
	const [form, ev] = formCore(id, props, out, forceMultipart, checkInputs);

	// I don't know why, I just know it works!
	form.querySelector("button[type=submit]").addEventListener("click", ev);
}

export function formSvelte(
	id: string,
	props: string[],
	out,
	forceMultipart = false
) {
	return () => {
		formCore(id, props, out, forceMultipart)[1]();
	};
}

export function promptLogin() {
	// @ts-expect-error
	setMobileProfile();
	document.getElementById("loginEmail").focus();
}

//  _       _                        _
// (_)_ __ | |_ ___ _ __ _ __   __ _| |
// | | '_ \| __/ _ \ '__| '_ \ / _` | |
// | | | | | ||  __/ |  | | | | (_| | |
// |_|_| |_|\__\___|_|  |_| |_|\__,_|_|

function logout(cookieGone: boolean) {
	localStorage.removeItem("user");
	if (!cookieGone) {
		json("/api/users/logout");
		alert.success("Logged out. Redirecting...");
	}

	setTimeout(() => {
		if (cookieGone) window.location.reload();
		else window.location.pathname = "";
	}, 1000);
}

function createGalaxyAlert(elClass: string) {
	return (msg: string) => {
		const parent = document.createElement("div");
		parent.classList.add("alert", elClass);

		const text = document.createElement("span");
		text.textContent = msg;
		parent.appendChild(text);

		const close = document.createElement("span");
		close.classList.add("alert-close");
		close.textContent = "Ok";
		close.onclick = function () {
			// Shut the fuck up
			parent.remove();
		};
		parent.appendChild(close);

		document.body.insertBefore(parent, document.querySelector("main"));
	};
}

function submitReport() {
	const container = document.querySelector(".report-container");
	if (!container) return alert.error("You... weren't reporting anything?");

	const part = (document.getElementById("report-part") as HTMLInputElement)
		.value;
	const reason = (
		document.getElementById("report-reason") as HTMLInputElement
	).value;
	const data = JSON.parse(
		(document.getElementById("report-data") as HTMLInputElement).value
	);

	post("/api/report/new", {
		part,
		reason,
		data,
	});

	reportOpen = false;
	container.remove();
	alert.success("Thanks for your report!");
}

function ditchReport() {
	const container = document.querySelector(".report-container");
	if (!container) return;

	reportOpen = false;
	container.remove();
}

let reportOpen = false;
export function report(
	type: "comment" | "game" | "user" | "chat" | "message",
	data: any
) {
	if (reportOpen) return;

	reportOpen = true;

	// @ts-expect-error
	window.submitReport = submitReport;
	// @ts-expect-error
	window.ditchReport = ditchReport;

	const containerEl = document.createElement("dialog");
	containerEl.classList.add("report-container");
	containerEl.open = true;

	const windowEl = document.createElement("form");
	windowEl.method = "dialog";
	windowEl.classList.add("report-window");
	windowEl.innerHTML = `
	<h1>Thanks for your report.</h1>
	<p>To help us, please tell us a little more about why you're reporting this.</p>
	<input id="report-part" placeholder="What part of it is bad? (eg, content)" />
	<input id="report-reason" placeholder="Why is it bad? (eg, racism)" />
	<input id="report-data" style="display: none" />
	<button onclick="submitReport()">Submit Report</button>
	<button onclick="ditchReport()">Cancel Report</button>`;

	data.type = type;

	containerEl.appendChild(windowEl);
	document.body.appendChild(containerEl);

	// @ts-expect-error
	document.getElementById("report-data").value = JSON.stringify(data);
}

export function convertFormat(text: string, id: number, pfpTimestamp?: number) {
	return (
		text +
		(pfpTimestamp ? `${id}-${pfpTimestamp}` : id.toString()) +
		".webp"
	);
}
