<script lang="ts">
	import { enhance } from '$app/forms';
	export let data;
	export let form: { error?: string; success?: boolean } | null;
</script>

<div class="categories-container">
	<h1>Manage Categories</h1>

	{#if form?.error}
		<div class="error-stamp">{form.error}</div>
	{/if}

	<div class="add-category">
		<h3>Add New Category</h3>
		<form method="POST" action="?/add" use:enhance>
			<input type="text" name="name" placeholder="Category name" required />
			<button type="submit">Add</button>
		</form>
	</div>

	<div class="category-list">
		<h3>Active Categories</h3>
		{#each data.categories as category}
			<div class="category-item">
				<form class="rename-form" method="POST" action="?/rename" use:enhance>
					<input type="hidden" name="id" value={category.id} />
					<input type="text" name="name" value={category.name} required />
					<button type="submit" class="small-btn">Rename</button>
				</form>
				
				<form method="POST" action="?/delete" use:enhance>
					<input type="hidden" name="id" value={category.id} />
					<button type="submit" class="small-btn delete-btn">Delete</button>
				</form>
			</div>
		{/each}
	</div>
</div>

<style>
	.categories-container {
		max-width: 600px;
		margin: 40px auto;
		padding: 20px;
	}
	.add-category, .category-list {
		margin-bottom: 40px;
	}
	.add-category form {
		display: flex;
		gap: 10px;
	}
	.category-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 0;
		border-bottom: 1px solid var(--rule);
	}
	.rename-form {
		display: flex;
		gap: 10px;
		flex-grow: 1;
		margin-right: 20px;
	}
	.small-btn {
		padding: 4px 8px;
		font-size: 0.9em;
	}
	.delete-btn {
		color: var(--stamp-red);
		border-color: var(--stamp-red);
		background: none;
	}
	.error-stamp {
		color: var(--stamp-red);
		margin-bottom: 20px;
	}

	@media (max-width: 600px) {
		.categories-container {
			padding: 0;
			margin: 0 auto;
		}
		.category-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 10px;
		}
		.rename-form {
			margin-right: 0;
			width: 100%;
		}
	}
</style>
