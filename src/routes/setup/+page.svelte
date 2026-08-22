<script lang="ts">
	import { enhance } from '$app/forms';
	export let form: { error?: string; success?: boolean; message?: string } | null;
</script>

<div class="setup-container">
	<h1>Initial Setup</h1>
	<p>Welcome to Household Ledger! Set up the first admin user.</p>

	{#if form?.error}
		<div class="error-stamp">{form.error}</div>
	{/if}
	
	{#if form?.success}
		<div class="success-stamp">{form.message}</div>
	{:else}
		<form method="POST" use:enhance>
			<div class="form-group">
				<label for="name">Your Name</label>
				<input type="text" id="name" name="name" required />
			</div>
			
			<div class="form-group">
				<label for="email">Your Email</label>
				<input type="email" id="email" name="email" required />
			</div>
			
			<button type="submit">Create Ledger</button>
		</form>
	{/if}
</div>

<style>
	.setup-container {
		max-width: 400px;
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
	input {
		width: 100%;
		padding: 8px;
	}
	.error-stamp {
		color: var(--stamp-red, #8b3a2a);
		margin-bottom: 20px;
	}
	.success-stamp {
		color: var(--stamp-green, #3a6b4a);
		margin-bottom: 20px;
	}
</style>
