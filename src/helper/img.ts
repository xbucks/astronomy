import { constants, promises } from "fs";
import type { Sharp } from "sharp";

const BASE = import.meta.env.DEV ? "public/" : "img/";

async function doesFileExist(file: string) {
	try {
		await promises.access(file, constants.R_OK | constants.W_OK);
		return true;
	} catch {
		return false;
	}
}

function updateImages(options: {
	root: "pfp" | "thumb";
	largeWidth: number;
	largeHeight: number;
	medWidth: number;
	medHeight: number;
	smallWidth: number;
	smallHeight: number;
}): (
	sharpFile: Sharp,
	id: number,
	timestamp: number,
	oldTimestamp: number
) => Promise<void> {
	const {
		root,
		largeWidth,
		largeHeight,
		medWidth,
		medHeight,
		smallWidth,
		smallHeight,
	} = options;
	return async (sharpFile, id, timestamp, oldTimestamp) => {
		const largeImg = sharpFile.webp().resize(largeWidth, largeHeight);
		const medImg = largeImg.clone().resize(medWidth, medHeight);
		const smallImg = medImg.clone().resize(smallWidth, smallHeight);

		const largeBuffer = await largeImg.toBuffer();
		const medBuffer = await medImg.toBuffer();
		const smallBuffer = await smallImg.toBuffer();

		const types = ["large", "medium", "small"];
		if (await doesFileExist(BASE + `${root}/${types[0]}/${id}.webp`)) {
			// old
			for (const type of types) {
				await promises.unlink(BASE + `${root}/${type}/${id}.webp`);
			}
		} else if (
			await doesFileExist(
				BASE + `${root}/${types[0]}/${id}-${oldTimestamp}.webp`
			)
		) {
			// new
			for (const type of types) {
				await promises.unlink(
					BASE + `${root}/${type}/${id}-${oldTimestamp}.webp`
				);
			}
		}
		await promises.writeFile(
			BASE + `${root}/large/${id}-${timestamp}.webp`,
			largeBuffer
		);
		await promises.writeFile(
			BASE + `${root}/medium/${id}-${timestamp}.webp`,
			medBuffer
		);
		await promises.writeFile(
			BASE + `${root}/small/${id}-${timestamp}.webp`,
			smallBuffer
		);
	};
}

export const updatePfps = updateImages({
	root: "pfp",
	largeWidth: 256,
	largeHeight: 256,
	medWidth: 64,
	medHeight: 64,
	smallWidth: 16,
	smallHeight: 16,
});

export const updateThumbs = updateImages({
	root: "thumb",
	largeWidth: 500,
	largeHeight: 300,
	medWidth: 375,
	medHeight: 225,
	smallWidth: 250,
	smallHeight: 150,
});
