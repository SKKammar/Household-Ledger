<script lang="ts">
	import { enhance } from '$app/forms';
	export let data;
	export let form: { error?: string } | null;

	let isSplit = false;
</script>

<div class="expense-form-container">
	<h1 class="page-title">Record Expense</h1>

	{#if form?.error}
		<div class="error-stamp">{form.error}</div>
	{/if}

	<form method="POST" use:enhance>
		<div class="form-group">
			<label class="field-label" for="amount">Amount (₹)</label>
			<input class="field-input" type="number" id="amount" name="amount" step="0.01" required min="0.01" />
		</div>

		<div class="form-group">
			<label class="field-label" for="categoryId">Category</label>
			<select class="field-input" id="categoryId" name="categoryId" required>
				<option value="" disabled selected>Select category...</option>
				{#each data.categories as category}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
		</div>

		<div class="form-group">
			<label class="field-label" for="date">Date</label>
			<input class="field-input" type="date" id="date" name="date" value={data.today} required />
		</div>

		<div class="form-group">
			<label class="field-label" for="note">Note (optional)</label>
			<input class="field-input" type="text" id="note" name="note" placeholder="e.g. tomato, onion" />
		</div>

		<div class="form-group split-group">
			<label class="field-label" style="display: flex; align-items: center; gap: 10px;">
				<input type="checkbox" name="isSplit" value="true" bind:checked={isSplit} style="width: auto;" />
				Split this expense
			</label>
		</div>

		{#if isSplit}
			<div class="form-group members-list">
				<p class="ink-muted" style="font-family: 'Special Elite', cursive; font-size: 12px; margin-bottom: 8px;">Select members to split with:</p>
				{#each data.members as member}
					<label class="member-checkbox field-label" style="font-weight: normal; margin-bottom: 8px;">
						<input type="checkbox" name="splitMembers" value={member.id} style="width: auto;" />
						{member.name}
					</label>
				{/each}
			</div>
		{/if}

		<button class="stamp-button" type="submit">Record Expense</button>
	</form>
</div>

<style>
	.expense-form-container {
		max-width: 500px;
		margin: 40px auto;
		padding: 20px;
	}
	.page-title {
		margin-bottom: 24px;
		font-size: 28px;
	}
	.form-group {
		margin-bottom: 20px;
	}
	.field-label {
		display: block;
		margin-bottom: 5px;
		font-family: 'Special Elite', cursive;
		font-size: 12px;
	}
	.field-input {
		width: 100%;
		padding: 8px;
		font-family: 'Special Elite', cursive;
	}
	.stamp-button {
		width: 100%;
		padding: 10px;
		background-color: var(--ink, #1a1a1a);
		color: var(--paper, #f0ebe0);
		border: none;
		cursor: pointer;
		font-family: 'Special Elite', cursive;
		transition: background-color 0.2s;
	}
	.stamp-button:hover {
		background-color: #333;
	}
	.split-group {
		margin-top: 30px;
	}
	.members-list {
		margin-left: 20px;
		border-left: 1px solid var(--rule, #c8b99a);
		padding-left: 15px;
	}
	.member-checkbox {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.error-stamp {
		color: var(--stamp-red, #8b3a2a);
		margin-bottom: 20px;
		font-family: 'Special Elite', cursive;
	}

	@media (max-width: 600px) {
		.expense-form-container {
			padding: 0;
			margin: 0 auto;
		}
	}
</style>
