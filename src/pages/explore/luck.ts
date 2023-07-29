import type { APIContext } from "astro";
import { Game } from "../../models/game";
import type { IGame } from "../../types";
import { filterFilter } from "../../helper/filters";

export async function get({ redirect, cookies }: APIContext) {
	const [game] = await Game.aggregate<IGame>([
		{ $match: filterFilter(cookies.get("filters").value) },
		{ $sample: { size: 1 } },
	]);
	// In case no games exist
	if (game === undefined) return redirect("/");
	return redirect(`/play/${game.id}`);
}
