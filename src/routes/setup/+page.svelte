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
				<label for="householdName">Household Name</label>
				<input type="text" id="householdName" name="householdName" required placeholder="e.g. Kammar Family" />
			</div>

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

	<div style="margin-top: 30px; text-align: center;">
		<a href="/join">Have an invite code? Join a household</a><br/><br/>
		<a href="/login">Already have an account? Log in</a>
	</div>
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

	@media (max-width: 600px) {
		.setup-container {
			padding: 15px;
			margin: 20px auto;
		}
	}
</style>
