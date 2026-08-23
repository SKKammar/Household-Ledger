<script lang="ts">
	import { enhance } from '$app/forms';
	export let data;
	export let form: { error?: string } | null;

	let isSplit = false;
</script>

<div class="expense-form-container">
	<h1>Record Expense</h1>

	{#if form?.error}
		<div class="error-stamp">{form.error}</div>
	{/if}

	<form method="POST" use:enhance>
		<div class="form-group">
			<label for="amount">Amount (₹)</label>
			<input type="number" id="amount" name="amount" step="0.01" required min="0.01" />
		</div>

		<div class="form-group">
			<label for="categoryId">Category</label>
			<select id="categoryId" name="categoryId" required>
				<option value="" disabled selected>Select category...</option>
				{#each data.categories as category}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
		</div>

		<div class="form-group">
			<label for="date">Date</label>
			<input type="date" id="date" name="date" value={data.today} required />
		</div>

		<div class="form-group">
			<label for="note">Note (optional)</label>
			<input type="text" id="note" name="note" placeholder="e.g. tomato, onion" />
		</div>

		<div class="form-group split-group">
			<label>
				<input type="checkbox" name="isSplit" value="true" bind:checked={isSplit} />
				Split this expense
			</label>
		</div>

		{#if isSplit}
			<div class="form-group members-list">
				<p class="ink-muted">Select members to split with:</p>
				{#each data.members as member}
					<label class="member-checkbox">
						<input type="checkbox" name="splitMembers" value={member.id} />
						{member.name}
					</label>
				{/each}
			</div>
		{/if}

		<button type="submit">Record Expense</button>
	</form>
</div>

<style>
	.expense-form-container {
		max-width: 500px;
		margin: 40px auto;
		padding: 20px;
	}
	.form-group {
		margin-bottom: 20px;
	}
	label {
		display: block;
		margin-bottom: 5px;
	}
	input, select {
		width: 100%;
		padding: 8px;
	}
	.split-group label {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.split-group input {
		width: auto;
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
		margin-bottom: 8px;
		font-weight: normal;
	}
	.member-checkbox input {
		width: auto;
	}
	.error-stamp {
		color: var(--stamp-red, #8b3a2a);
		margin-bottom: 20px;
	}

	@media (max-width: 600px) {
		.expense-form-container {
			padding: 0;
			margin: 0 auto;
		}
	}
</style>
