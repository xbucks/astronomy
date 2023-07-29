<script lang="ts">
	import { alert, convertFormat, formSvelte } from "../../libgalaxy";

	export let id: number;
	export let thumbTimestamp: number | undefined;

	let imageFormButton: HTMLInputElement;

	const thumbClick = formSvelte(
		"thumbForm",
		["image", "id"],
		res => {
			if (res._resCode === 200) {
				alert.success("Game thumbnail changed!");
				thumbTimestamp = res.time;
			}
		},
		true
	);
</script>

<h2>thumbnail</h2>
<div>
	<img
		src={convertFormat("/thumb/large/", id, thumbTimestamp)}
		alt="Game thumbnail"
	/>
	<br />
	Thumbnails are designed to be 500x300. They can also appear at smaller sizes,
	but they will always have the 5:3 aspect ratio.
	<br />
	<br />
	<div id="thumbForm" data-action="/api/games/thumb">
		<input
			type="file"
			name="image"
			accept="image/*"
			style="display: none"
			bind:this={imageFormButton}
			on:change={thumbClick}
		/>
		<!-- So I can insert the game ID into the multipart form LOL -->
		<input type="number" name="id" style="display: none" bind:value={id} />
		<!-- This is the easiest way to style the <input file> -->
		<button on:click={() => imageFormButton.click()}>upload</button>
	</div>
</div>

<style>
	img {
		max-width: 100%;
	}

	input[type="file"]::file-selector-button {
		content: "select";
	}
</style>
