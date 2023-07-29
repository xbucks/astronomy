import { Game } from "../../../models/game";
import { GameRequest } from "../../../models/gamerequest";
import { Report } from "../../../models/report";
import { adminDataRoute } from "../../../helper/admin";

export const get = adminDataRoute(async () => {
	const unverified = await Game.find({ verified: { $ne: true } });
	const unresolved = await Report.find({ resolved: { $ne: true } });
	const requests = await GameRequest.find({ resolved: false });

	return { unverified, unresolved, requests };
});
