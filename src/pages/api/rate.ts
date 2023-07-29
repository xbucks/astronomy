import { rdata, rfu, rmsg } from "../../helper/res";
import type { APIContext } from "astro";
import { Game } from "../../models/game";
import { Rating } from "../../models/rating";
import { keyv } from "../../models/keyv";

export async function post({ locals, request }: APIContext) {
	const isLockdown = await keyv.get("feedbackLocked", false);
	if (isLockdown)
		return rmsg("Game feedback is disabled at this moment.", 503);

	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();

	// Validate the request body first
	if (req.rating < 1 || req.rating > 5) return rmsg("Invalid rating", 400);

	// Find the game
	const gameId = parseInt(req.id);

	const game = await Game.findOne({ id: gameId });
	if (!game) return rmsg("Attempted to rate unknown game", 400);

	const author = user.id;

	// Check if rating already exists
	let rating = await Rating.findOne({
		game: gameId,
		author,
	});

	const stars = Math.round(req.rating);

	let ratingDeleted = false;
	if (rating) {
		if (rating.rating === stars) {
			// Remove rating
			// game.ratingValue -= rating.rating;
			// game.ratingCount--;
			await rating.deleteOne();
			ratingDeleted = true;
		} else {
			// Update rating
			// game.ratingValue -= rating.rating;
			rating.rating = stars;
		}
	} else {
		// Create rating
		rating = new Rating({
			game: gameId,
			author,
			rating: stars,
		});

		// game.ratingCount++;
	}

	if (!ratingDeleted) game.ratingValue += stars;

	if (!ratingDeleted) await rating.save();
	const query = await Rating.aggregate([
		{ $match: { game: gameId } },
		{
			$group: {
				_id: gameId,
				sum: { $sum: "$rating" },
				count: { $count: {} },
			},
		},
	]);

	if (query.length) {
		game.ratingCount = query[0].count;
		game.ratingValue = query[0].sum;
	} else {
		game.ratingCount = 0;
		game.ratingValue = 0;
	}

	if (game.ratingCount === 0) game.ratingAvg = 0;
	else game.ratingAvg = game.ratingValue / game.ratingCount;

	// "The usual trick for this is to add a 1 star and a 5 star review.
	// It'll have more impact on scores with fewer "real" votes, bringing
	// them closer to 3.0, but will basically not touch sufficiently rated
	// scores at all" -ThePaperPilot
	game.sortRating = (game.ratingValue + 6) / (game.ratingCount + 2);

	// game.sortRating = game.ratingAvg + Math.log10(Math.min(game.ratingCount, 100))

	await game.save();

	return rdata(
		{
			message: "success",
			rating: game.ratingAvg,
			count: game.ratingCount,
		},
		200
	);
}
