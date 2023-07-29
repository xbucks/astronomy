<script lang="ts">
	import { convertFormat } from "../libgalaxy";

	export let size: "small" | "medium" | "large";
	export let gameId: number;
	export let thumbTimestamp: number | undefined;
</script>

<!-- FIXME better alt="" tag -->
<img
	class={"thumb-pic " + size}
	src={convertFormat(`/thumb/${size}/`, gameId, thumbTimestamp)}
	alt="Thumbnail"
/>
