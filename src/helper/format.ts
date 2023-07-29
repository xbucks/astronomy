function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() == b.getDate()
	);
}

export function formatRelative(date: Date, includeTime = true) {
	const formattedDate = formatDate(date);

	if (includeTime) {
		const formattedTime = date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
		return `${formattedDate} at ${formattedTime}`;
	} else {
		return formattedDate;
	}
}

export function formatAbsolute(date: Date) {
	return date.toLocaleString("en-US", {
		dateStyle: "full",
		timeStyle: "short",
	});
}

export function formatDate(date: Date) {
	const now = new Date();

	if (isSameDay(now, date)) return "today";
	now.setDate(now.getDate() - 1);
	if (isSameDay(now, date)) return "yesterday";

	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${year}/${month}/${day}`;
}

export function formatDateScreenReader(date: Date) {
	const now = new Date();

	if (isSameDay(now, date)) return "today";
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export const formats = {
	relative: formatRelative,
	absolute: formatAbsolute,
	date: formatDate,
};
