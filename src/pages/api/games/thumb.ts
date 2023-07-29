import { rdata, rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { Game } from "../../../models/game";
import sharp from "sharp";
import { updateThumbs } from "../../../helper/img";

export async function post({ locals, request }: APIContext) {
	const req = await request.formData();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();
	if (user.muted !== false) return rfu("You are currently muted.", 403);

	const game = await Game.findOne({ id: req.get("id") });
	if (!game) return rmsg("Game not found", 400);
	if (game.author !== user.id)
		return rfu("You are not the author of this game", 403);
	if (req.get("image") === "undefined") return rmsg("No image provided", 400);

	// This is super stupid.
	// To put it simply, I hate this code.
	// But, alas, it works.
	//   FormDataEntryValue -> File -> ArrayBuffer -> Buffer -> Sharp
	const file: File = req.get("image") as File;
	if (file.size > 1024 * 1024 * 8)
		return rmsg("Please submit an image under 8 MB", 400);
	const abuf = await file.arrayBuffer();
	const buf = Buffer.from(abuf);

	let oops = false;

	const original = game.thumbTimestamp;
	game.thumbTimestamp = Date.now();
	await game.save();

	await updateThumbs(
		sharp(buf),
		game.id,
		game.thumbTimestamp,
		original
	).catch(e => {
		oops = e;
	});
	if (oops)
		return rmsg(`Something went wrong with image processing. ${oops}`, 400);

	return rdata({ message: "success", time: game.thumbTimestamp });
}
