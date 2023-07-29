<script lang="ts">
	import Comment, {
		type DeleteDetail,
		type ReplyDetail,
		type RevealDetail,
		type VoteDetail,
	} from "./Comment.svelte";
	import type { INamedFrontendComment } from "../types";

	export let comments: INamedFrontendComment[];
	export let userId: number;
	export let isDev: boolean;
	export let isLoggedIn: boolean;
	export let isStaff: boolean;

	export function doVote({ id, vote, score }: VoteDetail) {
		comments = comments.map(c => {
			if (c.id !== id) return c;
			c.yourVote = vote;
			c.score = score;
			return c;
		});
	}

	export function doDelete({ id }: DeleteDetail) {
		comments = comments.map(c => {
			if (c.id !== id) return c;
			c.deleted = true;
			return c;
		});
	}

	export function doReveal({ id }: RevealDetail) {
		comments = comments.map(c => {
			if (c.id !== id) return c;
			c.hidden = false;
			return c;
		});
	}

	export function doReply({ id, content }: ReplyDetail) {
		comments = comments.map(c => {
			if (c.id !== id) return c;
			c.devResponse = content;
			return c;
		});
	}
</script>

{#each comments as comment (comment.id)}
	<Comment
		{comment}
		{userId}
		{isDev}
		{isLoggedIn}
		{isStaff}
		on:vote
		on:delete
		on:reveal
		on:reply
	/>
{/each}
