<script lang="ts">
	import { enhance } from '$app/forms';
	export let data;
</script>

<div class="edit-container">
	<h1>Edit/Delete Expense</h1>
	<p>Amount: ₹{data.expense.amount} on {data.expense.date}</p>
	<p class="ink-muted">Editing details is a placeholder. You can delete this expense below.</p>
	
	<form method="POST" action="?/delete" use:enhance>
		<button type="submit" class="delete-btn">Delete Expense</button>
	</form>
</div>

<style>
	.edit-container {
		max-width: 500px;
		margin: 40px auto;
		padding: 20px;
	}
	.delete-btn {
		background: none;
		border: 1px solid var(--stamp-red, #8b3a2a);
		color: var(--stamp-red, #8b3a2a);
		padding: 8px 16px;
		cursor: pointer;
		margin-top: 20px;
	}
	.delete-btn:hover {
		background: var(--stamp-red, #8b3a2a);
		color: var(--paper);
	}
</style>
