<script lang="ts">
	import { alert, convertFormat, formSvelte, json, post } from "../libgalaxy";
	import MarkdownEditor from "./MarkdownEditor.svelte";
	import { userBio } from "../helper/markdown";

	let user: any = json("/api/users/whoami");

	let pfpInput: HTMLInputElement;
	let loaded = false;

	function logout() {
		window.location.href = "/api/users/logout";
	}

	const pfpClick = formSvelte(
		"pfpForm",
		["image"],
		({ time }) => {
			user.pfpTimestamp = time;
		},
		true
	);

	const bioClick = formSvelte("bioForm", ["bio"], res => {
		if (res._resCode === 200) alert.success("Bio updated!");
	});

	let oldPW = "";
	let newPW = "";
	let doublePW = "";
	async function updatePassword() {
		if (newPW !== doublePW)
			return alert.error("The new passwords don't match.");

		const res = await post("/api/users/password", {
			old: oldPW,
			new: newPW,
		});
		if (res._resCode === 200) alert.success(res.message);
		else alert.error(res.message);
	}

	async function awaitTheUser() {
		user = await user;
		loaded = true;
	}
	awaitTheUser();

	async function setFlair(flair: string) {
		user.equippedFlair = flair;
		await post("/api/users/flair", flair);
	}
</script>

{#if loaded}
	<br />

	<!-- <button>Change Name (COMING SOON)</button> -->
	<a class="button" href="/manage">manage games</a>
	<button on:click={logout}>log out</button>

	<div>
		<h2>profile picture</h2>
		<img
			src={convertFormat("/pfp/large/", user.id, user.pfpTimestamp)}
			alt="Your icon"
		/>
		<br />
		<button on:click={() => pfpInput.click()}>upload</button>
		<span class="unimportant">recommended size: 256x256</span>
		<div id="pfpForm" data-action="/api/users/pfp">
			<input
				type="file"
				name="image"
				accept="image/*"
				style="display: none"
				bind:this={pfpInput}
				on:change={pfpClick}
			/>
		</div>
	</div>

	<div>
		<h2>bio</h2>
		<data id="bioForm" data-action="/api/users/bio">
			<MarkdownEditor
				form="bioForm"
				name="bio"
				maxlength={1024}
				background="var(--background-2)"
				options={userBio}
				bind:value={user.bio}
			/>
			<br />
			<button on:click={bioClick}>update</button>
		</data>
	</div>

	<div>
		<h2>flairs</h2>
		<p>
			have a little text appear next to your name!
			<a href="/docs/flairs">what are flairs?</a>
		</p>
		<p>
			current flair:
			<button class="flair" data-flair={user.equippedFlair}>
				{user.equippedFlair}
			</button>
		</p>
		<p>
			unlocked flairs:
			{#each user.flairs as flair}
				<button
					class="flair"
					data-flair={flair}
					on:click={() => setFlair(flair)}
				>
					{flair}
				</button>
			{/each}
		</p>
	</div>

	<div>
		<h2>danger zone</h2>
		<div>
			<h3>change your password</h3>
			<input
				bind:value={oldPW}
				type="password"
				placeholder="current password"
			/><br />
			<input
				bind:value={newPW}
				type="password"
				placeholder="new password"
			/><br />
			<input
				bind:value={doublePW}
				type="password"
				placeholder="new password (repeat)"
			/><br />
			{#if newPW !== doublePW}
				<p>the new passwords don't match</p>
			{/if}
			<button disabled={newPW !== doublePW} on:click={updatePassword}>
				change
			</button>
		</div>
	</div>
{:else}
	<p>Loading... <span class="unimportant">You don't mind, do you?</span></p>
{/if}

<style>
	input[type="password"] {
		width: 250px;
	}

	input {
		background: var(--background-2);
	}
</style>
