<script lang="ts">
	import { enhance } from '$app/forms';
	export let form: { error?: string; success?: boolean; message?: string } | null;
</script>

<svelte:head>
	<title>Join Household Ledger</title>
</svelte:head>

<div class="join-container">
	<h1 class="page-title">Join a Household</h1>
	<p class="page-subtitle">Enter the invite code provided by your household admin.</p>

	{#if form?.error}
		<div class="error-stamp">{form.error}</div>
	{/if}
	
	{#if form?.success}
		<div class="success-stamp">{form.message}</div>
	{:else}
		<form method="POST" use:enhance>
			<div class="form-group">
				<label class="field-label" for="inviteCode">Invite Code</label>
				<input class="field-input uppercase-input" type="text" id="inviteCode" name="inviteCode" placeholder="e.g. X7K2P9" required />
			</div>

			<div class="form-group">
				<label class="field-label" for="name">Your Name</label>
				<input class="field-input" type="text" id="name" name="name" required />
			</div>
			
			<div class="form-group">
				<label class="field-label" for="email">Your Email</label>
				<input class="field-input" type="email" id="email" name="email" required />
			</div>
			
			<button class="stamp-button" type="submit">Join Household</button>
		</form>
	{/if}

	<div style="margin-top: 30px; text-align: center; font-family: 'Special Elite', cursive; font-size: 12px;">
		<a href="/login">Already a member?</a><br/><br/>
		<a href="/setup">Create a new household</a>
	</div>
</div>

<style>
	.join-container {
		max-width: 400px;
		margin: 40px auto;
		padding: 20px;
	}
	.page-title {
		margin-bottom: 8px;
		font-size: 28px;
	}
	.page-subtitle {
		margin-bottom: 24px;
		font-family: 'Playfair Display', serif;
		font-size: 16px;
		color: var(--ink-faded);
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
	.uppercase-input {
		text-transform: uppercase;
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
	.error-stamp {
		color: var(--stamp-red, #8b3a2a);
		margin-bottom: 20px;
		font-family: 'Special Elite', cursive;
	}
	.success-stamp {
		color: var(--stamp-green, #3a6b4a);
		margin-bottom: 20px;
		font-family: 'Special Elite', cursive;
	}

	@media (max-width: 600px) {
		.join-container {
			padding: 15px;
			margin: 20px auto;
		}
	}
</style>
