<script lang="ts">
	import type {
		DeleteDetail,
		ReplyDetail,
		RevealDetail,
		VoteDetail,
	} from "./Comment.svelte";
	import CommentList from "./CommentList.svelte";
	import type { INamedFrontendComment } from "../types";
	import MarkdownEditor from "./MarkdownEditor.svelte";
	import { comment as md } from "../helper/markdown";
	import { post } from "../libgalaxy";

	export let gameId: number;
	export let userId: number;
	export let isDev: boolean;
	export let isLoggedIn: boolean;
	export let isStaff: boolean;
	export let newComments: INamedFrontendComment[];
	export let topComments: INamedFrontendComment[];

	let composingComment = "";
	let newCommentDiv: CommentList;
	let topCommentDiv: CommentList | undefined;

	$: single =
		newComments.length < 5 ||
		newComments.filter(({ id: nid }) =>
			topComments.find(({ id: tid }) => nid === tid)
		).length === 5;

	async function publishComment() {
		const res = await post(`/api/comments/new`, {
			game: gameId,
			content: composingComment,
		});

		if (res._resCode === 201) {
			res.content.date = new Date(res.content.date);
			newComments.unshift(res.content);
			if (newComments.length > 5) newComments.pop();
			if (topComments.length < 5) topComments.push(res.content);
			newComments = newComments;
			topComments = topComments;
			composingComment = "";
		}
	}

	function handleVote({ detail }: CustomEvent<VoteDetail>) {
		newCommentDiv.doVote(detail);
		topCommentDiv?.doVote(detail);
	}

	function handleDelete({ detail }: CustomEvent<DeleteDetail>) {
		newCommentDiv.doDelete(detail);
		topCommentDiv?.doDelete(detail);
	}

	function handleReveal({ detail }: CustomEvent<RevealDetail>) {
		newCommentDiv.doReveal(detail);
		topCommentDiv?.doReveal(detail);
	}

	function handleReply({ detail }: CustomEvent<ReplyDetail>) {
		newCommentDiv.doReply(detail);
		topCommentDiv?.doReply(detail);
	}
</script>

<h1>comments</h1>
<div class="container">
	<div id="compose-comment">
		{#if isLoggedIn}
			<MarkdownEditor
				bind:value={composingComment}
				options={md}
				placeholder="what do you think about this game? (supports markdown)"
				maxlength={4096}
			/>
			<div>
				<button
					on:click={publishComment}
					disabled={!isLoggedIn || composingComment.length === 0}
				>
					submit comment
				</button>
			</div>
		{:else}
			<textarea disabled placeholder="log in to leave a comment" />
		{/if}
	</div>
	<div id="comment-holder">
		{#if newComments.length === 0}
			<div style="text-align: center; margin: 12px" class="unimportant">
				there are no comments yet. be the first one to leave a response!
			</div>
		{:else if single}
			<div class="single-list">
				<h2>all comments</h2>
				<hr />
				<CommentList
					comments={newComments}
					{userId}
					{isDev}
					{isLoggedIn}
					{isStaff}
					on:vote={handleVote}
					on:delete={handleDelete}
					on:reveal={handleReveal}
					on:reply={handleReply}
					bind:this={newCommentDiv}
				/>
			</div>
		{:else}
			<div>
				<h2>newest comments</h2>
				<hr />
				<CommentList
					comments={newComments}
					{userId}
					{isDev}
					{isLoggedIn}
					{isStaff}
					on:vote={handleVote}
					on:delete={handleDelete}
					on:reveal={handleReveal}
					on:reply={handleReply}
					bind:this={newCommentDiv}
				/>
			</div>
			<div>
				<h2>top comments</h2>
				<hr />
				<CommentList
					comments={topComments}
					{userId}
					{isDev}
					{isLoggedIn}
					{isStaff}
					on:vote={handleVote}
					on:delete={handleDelete}
					on:reveal={handleReveal}
					on:reply={handleReply}
					bind:this={topCommentDiv}
				/>
			</div>
		{/if}
	</div>
	{#if !single}
		<p style="text-align: center">
			<a
				href="/comments/{gameId}?sort=top"
				class="button"
				target="_blank"
				rel="noreferrer"
			>
				read all comments
			</a>
		</p>
	{/if}
</div>

<style>
	#compose-comment textarea {
		display: block;
		width: calc(100% - 12px);
		margin-top: 12px;
		padding: 6px;
		display: block;
		height: 40px;
		font-size: 14px;
		color: var(--color-0);
		outline: 1px solid #7770;
		border-radius: 3px;
	}
	#compose-comment :global(.markdown-editor) {
		margin-top: 12px;
	}
	#compose-comment > div {
		text-align: right;
	}
	#compose-comment > div > button {
		margin: 2px 0 0 0;
	}

	#comment-holder {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
		align-content: center;
		gap: 10px;
	}

	#comment-holder > div > h2:first-child {
		margin-bottom: 0;
	}

	#comment-holder > div.single-list {
		margin: auto;
		width: 50%;
	}

	#compose-comment textarea:disabled {
		background: var(--background-2);
		color: var(--color-5);
		height: 20px;
	}
</style>
