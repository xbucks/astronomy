<script lang="ts">
	import { post } from "../../libgalaxy";

	export let id: number;
	export let chatEnabled: boolean;

	async function enableChat() {
		const res = await post("/api/games/enableChat", { id });
		if (res._resCode === 200) chatEnabled = true;
	}
</script>

<h2>chat</h2>
{#if chatEnabled}
	<p>
		Your game has chat enabled.
		<a class="button" href={`/chat/game-${id}`}>edit chat</a>
	</p>
{:else}
	<p>
		galaxy provides free, simple, live chat for people playing your game. If
		you enable it, you can't delete the chat, but you can disable it.
		<br />
		<br />
		<button on:click={enableChat}>enable chat</button>
	</p>
{/if}
