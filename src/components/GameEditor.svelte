<script lang="ts">
	import Chat from "./GameEditor/Chat.svelte";
	import MainInfo from "./GameEditor/MainInfo.svelte";
	import Tags from "./GameEditor/Tags.svelte";
	import Thumbnail from "./GameEditor/Thumbnail.svelte";
	import Updates from "./GameEditor/Updates.svelte";
	import { json } from "../libgalaxy";

	const id = parseInt(window.location.pathname.split("/")[2]);

	const game = json("/api/games/info?id=" + id);
</script>

{#await game}
	<p>
		Fetching the game data for you.
		<span class="unimportant">I'm so cool.</span>
	</p>
{:then loaded}
	<Updates {id} />
	<MainInfo
		{id}
		name={loaded.game.name}
		link={loaded.game.link}
		description={loaded.game.description}
	/>
	<Tags {id} tags={loaded.game.tags} />
	<Thumbnail {id} thumbTimestamp={loaded.game.thumbTimestamp} />
	<Chat {id} chatEnabled={loaded.game.chatEnabled} />
{/await}
