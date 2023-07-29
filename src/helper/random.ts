// Credit: https://stackoverflow.com/a/1349426
const characters =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const charactersLength = characters.length;
export function randomString(length: number) {
	let result = "";
	for (let i = 0; i < length; i++) {
		result += characters.charAt(
			// TODO crypto random string?
			Math.floor(Math.random() * charactersLength)
		);
	}
	return result;
}
