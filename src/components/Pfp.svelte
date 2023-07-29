<script lang="ts">
	import { convertFormat } from "../libgalaxy";

	export let size: "small" | "medium" | "large";
	export let userId: number;
	export let inline = false;
	export let pfpTimestamp: number | undefined;
</script>

<img
	class={"profile-pic " + size + (inline ? " inline" : "")}
	src={convertFormat(`/pfp/${size}/`, userId, pfpTimestamp)}
	alt=""
/>
