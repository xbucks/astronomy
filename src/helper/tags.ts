import { readFileSync } from "fs";

let tagData: Record<string, string>,
	tagCategories: Record<string, string[]>,
	tagList: string[];

export function validTagList(tags: string[]) {
	return Array.isArray(tags) && tags.length <= 30 && allValidTags(tags);
}

export function hasNoDuplicates(tags: any[]) {
	return tags.every((tag, i) => tags.indexOf(tag) === i);
}

export function allValidTags(tags: string[]) {
	// console.log(tags, tagData);
	return tags.every(oneValidTag) && hasNoDuplicates(tags);
}

export function oneValidTag(tag: string) {
	return (
		tagList.includes(tag) ||
		(typeof tag === "string" &&
			tag.length >= 2 &&
			tag.length <= 64 &&
			!tag.includes(" "))
	);
}

export function getTagData() {
	return tagData;
}

export function getTagCategories() {
	return tagCategories;
}

export function getAllTags() {
	return tagList;
}

export function reloadTags() {
	const data: Record<string, Record<string, string>> = JSON.parse(
		readFileSync("config/tags.json").toString()
	);

	tagData = {};
	tagCategories = {};
	tagList = [];

	for (const cat in data) {
		tagCategories[cat] = Object.keys(data[cat]);
		for (const tag in data[cat]) {
			tagData[tag] = data[cat][tag];
			tagList.push(tag);
		}
	}
}

reloadTags();
