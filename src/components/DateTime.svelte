<script lang="ts">
	import {
		formatAbsolute,
		formatDateScreenReader,
		formats,
	} from "../helper/format";

	export let date: Date | number;
	export let small = false;
	export let unimportant = false;
	export let before = "";
	export let style: keyof typeof formats = "relative";

	const dateDate = typeof date === "number" ? new Date(date) : date;
</script>

<span
	class:unimportant
	class:small
	title={formatAbsolute(dateDate)}
	aria-hidden="true"
>
	{before}
	{formats[style](dateDate)}
</span>
<span class="screenreader">{formatDateScreenReader(dateDate)}</span>
