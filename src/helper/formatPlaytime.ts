export default function formatPlaytime(playMinutes: number): string {
	if (playMinutes < 60) {
		return `${playMinutes}m`;
	} else {
		return (playMinutes / 60).toFixed(1) + "h";
	}
}
