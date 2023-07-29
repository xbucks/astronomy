<script lang="ts" context="module">
	export interface VoteDetail {
		id: number;
		vote: 1 | 0 | -1;
		score: number;
	}

	export interface DeleteDetail {
		id: number;
	}

	export interface RevealDetail {
		id: number;
	}

	export interface ReplyDetail {
		id: number;
		content: string;
	}
</script>

<script lang="ts">
	import { post, promptLogin, report } from "../libgalaxy";
	import DateTime from "./DateTime.svelte";
	import Dropdown from "./Dropdown.svelte";
	import type { INamedFrontendComment } from "../types";
	import Icon from "@iconify/svelte";
	import UserChip from "./UserChip.svelte";
	import { createEventDispatcher } from "svelte";
	import { comment as md } from "../helper/markdown";

	export let comment: INamedFrontendComment;
	export let userId: number;
	export let isDev: boolean;
	export let isLoggedIn: boolean;
	export let isStaff: boolean;

	const dispatcher = createEventDispatcher<{
		vote: VoteDetail;
		delete: DeleteDetail;
		reveal: RevealDetail;
		reply: ReplyDetail;
	}>();

	let replying = false;
	let composingReply = "";

	function cvote(id: number, vote: 1 | 0 | -1) {
		return async () => {
			if (!isLoggedIn) {
				promptLogin();
				return;
			}

			post(`/api/comments/vote`, { id, vote });

			if (comment.yourVote === vote) {
				comment.score -= vote;
				comment.yourVote = 0;
			} else {
				comment.score -= comment.yourVote;
				comment.score += vote;
				comment.yourVote = vote;
			}

			dispatcher("vote", {
				id,
				vote: comment.yourVote,
				score: comment.score,
			});
		};
	}

	function cdelete(id: number) {
		return async () => {
			await post(`/api/comments/delete`, {
				id,
			});

			comment.deleted = true;

			replying = false;
			composingReply = "";

			dispatcher("delete", {
				id,
			});
		};
	}

	function creveal(id: number) {
		return () => {
			comment.hidden = false;

			dispatcher("reveal", {
				id,
			});
		};
	}

	function creply(id: number) {
		return async () => {
			const content = composingReply;

			await post(`/api/comments/reply`, {
				id,
				content,
			});

			// TODO: don't update reply if request fails + keep reply input box open so it can be fixed
			comment.devResponse = composingReply;

			replying = false;
			composingReply = "";

			dispatcher("reply", {
				id,
				content,
			});
		};
	}

	function processReplyClick() {
		replying = true;
		composingReply = comment.devResponse;
	}
</script>

<div class="comment">
	<div class="comment-info">
		<UserChip
			id={comment.author}
			name={comment.name}
			flair={comment.flair}
			pfpTimestamp={comment.pfp}
		/>
		<DateTime
			unimportant
			date={comment.createdAt}
			before="•"
			style="date"
		/>
		<div class="floatright">
			<button
				on:click={cvote(comment.id, 1)}
				class="cvote cvote-agree"
				class:picked={comment.yourVote === 1}
				disabled={comment.deleted}
				aria-label="upvote"
			>
				<Icon icon="material-symbols:add-rounded" width="16" inline />
			</button><span class="c-score" aria-label="hidden"
				>{comment.score > 0 ? "+" : ""}{comment.score}</span
			><span class="screenreader">comment score: {comment.score}</span
			><button
				on:click={cvote(comment.id, -1)}
				class="cvote cvote-disagree"
				class:picked={comment.yourVote === -1}
				disabled={comment.deleted}
				aria-label="downvote"
			>
				<Icon
					icon="material-symbols:remove-rounded"
					width="16"
					inline
				/>
			</button>
			{#if isLoggedIn && !comment.deleted}
				<Dropdown openLeft>
					{#if isDev}
						<button on:click={() => processReplyClick()}>
							{comment.devResponse !== undefined
								? "edit response"
								: "respond as developer"}
						</button>
					{/if}
					{#if comment.author !== userId}
						<button on:click={() => report("comment", comment)}
							>report comment</button
						>
					{/if}
					{#if isStaff || comment.author === userId}
						<button on:click={cdelete(comment.id)}
							>delete comment</button
						>
					{/if}
				</Dropdown>
			{/if}
		</div>
	</div>
	{#if comment.deleted}
		<div class="comment-content unimportant">
			<i>[this comment is deleted]</i>
		</div>
	{:else if comment.hidden && comment.author !== userId}
		<div class="comment-content unimportant">
			<i>[this comment is unfavored]</i><br />
			<button class="fake-link" on:click={creveal(comment.id)}
				>(reveal comment)</button
			>
		</div>
	{:else}
		<div class="comment-content">
			{@html md.render(comment.content)}
		</div>
	{/if}
	{#if replying}
		<textarea
			id="reply"
			placeholder="write your response..."
			bind:value={composingReply}
		/>
		<button id="postreply" on:click={creply(comment.id)}>reply</button>
		<button on:click={() => (replying = false)}>cancel</button>
	{:else if comment.devResponse !== undefined}
		<div class="dev-reply">
			{@html md.render("**developer response:** " + comment.devResponse)}
		</div>
	{/if}
</div>

<style>
	.comment:not(:last-child) {
		margin-bottom: 15px;
	}

	.comment-content {
		margin: -10px 5px 5px 28px;
		padding: 15px 10px 5px 10px;
		background: var(--background-1);
		border-radius: 3px;
		word-wrap: break-word;
	}

	.comment-content:not(:last-child) {
		border-radius: 3px 3px 0 0;
		margin: -10px 5px 0 28px;
	}

	.comment-content :global(p) {
		margin: 0;
	}

	.c-score {
		display: inline-block;
		padding: 0 12px;
		height: 26px;
		line-height: 26px;
		background: var(--background-2);
		box-shadow: 1px 0 5px #0007;
		margin-right: 2px;
	}

	.cvote {
		width: 26px;
		height: 26px;
		padding: 0;
	}

	.cvote-agree {
		border-radius: 3px 0 0 3px;
	}

	.cvote-disagree {
		border-radius: 0 3px 3px 0;
	}

	.cvote-agree.picked {
		background: var(--background-green-1);
	}

	.cvote-disagree.picked {
		background: var(--background-red-1);
	}

	.dev-reply {
		background-color: var(--background-blue-0);
		margin: 0px 5px 5px 28px;
		padding: 5px 10px 5px 10px;
		border-radius: 0 0 3px 3px;
	}

	.dev-reply > :global(:first-child) {
		margin-top: 0;
	}

	.dev-reply > :global(:last-child) {
		margin-bottom: 0;
	}

	#reply {
		display: block;
		width: calc(100% - 53px);
		margin: 0px 5px 5px 28px;
		padding: 5px 10px;
		display: block;
		height: 40px;
		font-size: 14px;
		font-family: var(--content-font);
		background-color: var(--background-blue-0);
		color: var(--color-0);
		outline: 1px solid #7770;
		border-radius: 3px;
	}
</style>
