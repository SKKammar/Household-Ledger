<script lang="ts">
	import { enhance } from '$app/forms';
	export let form: { error?: string; success?: boolean; message?: string } | null;
</script>

<svelte:head>
	<title>Join Household Ledger</title>
</svelte:head>

<div class="join-container">
	<h1>Join a Household</h1>
	<p>Enter the invite code provided by your household admin.</p>

	{#if form?.error}
		<div class="error-stamp">{form.error}</div>
	{/if}
	
	{#if form?.success}
		<div class="success-stamp">{form.message}</div>
	{:else}
		<form method="POST" use:enhance>
			<div class="form-group">
				<label for="inviteCode">Invite Code</label>
				<input type="text" id="inviteCode" name="inviteCode" placeholder="e.g. X7K2P9" required />
			</div>

			<div class="form-group">
				<label for="name">Your Name</label>
				<input type="text" id="name" name="name" required />
			</div>
			
			<div class="form-group">
				<label for="email">Your Email</label>
				<input type="email" id="email" name="email" required />
			</div>
			
			<button type="submit">Join Household</button>
		</form>
	{/if}

	<div style="margin-top: 30px; text-align: center;">
		<a href="/login">Already a member? Log in</a><br/><br/>
		<a href="/setup">Or create a new household</a>
	</div>
</div>

<style>
	.join-container {
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
		text-transform: uppercase;
	}
	input[type="email"], input[type="text"]#name {
		text-transform: none;
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
