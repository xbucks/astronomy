import { readFileSync } from "fs";

let currentRev: string | null;
try {
	// https://stackoverflow.com/a/34518749
	const rev = readFileSync(".git/HEAD").toString().trim();
	if (rev.indexOf(":") === -1) {
		currentRev = rev;
	} else {
		currentRev = readFileSync(".git/" + rev.substring(5))
			.toString()
			.trim();
	}
} catch {
	currentRev = null;
}

export const longHash = currentRev;

export const shortHash = currentRev?.slice(0, 7);
