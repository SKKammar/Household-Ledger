<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	export let data;
	export let form: { error?: string; success?: boolean } | null;

	let copied = false;
	function copyLink() {
		const link = `${$page.url.origin}/join?code=${data.inviteCode}`;
		navigator.clipboard.writeText(link);
		copied = true;
		setTimeout(() => copied = false, 2000);
	}
</script>

<svelte:head>
	<title>Admin Panel</title>
</svelte:head>

<div class="admin-container">
	<h1>Admin Panel</h1>

	{#if form?.error}
		<div class="error-stamp">{form.error}</div>
	{/if}

	<div class="admin-section">
		<h2>Household Settings</h2>
		<form method="POST" action="?/updateHouseholdName" use:enhance class="add-form">
			<input type="text" name="householdName" value={data.householdName} required />
			<button type="submit">Save Name</button>
		</form>
		
		<div style="margin-top: 20px;">
			<p>Invite Code: <strong>{data.inviteCode}</strong></p>
			<p>Share link: <code>{$page.url.origin}/join?code={data.inviteCode}</code></p>
			<div class="invite-code-container">
				<button type="button" class="small-btn" on:click={copyLink}>
					{copied ? 'Copied!' : 'Copy Link'}
				</button>
				<form method="POST" action="?/regenerateInviteCode" use:enhance>
					<button type="submit" class="small-btn">Regenerate Code</button>
				</form>
			</div>
		</div>
	</div>

	<div class="admin-section">
		<h2>Add New Member (Email Invite)</h2>
		<form method="POST" action="?/addMember" use:enhance class="add-form">
			<input type="text" name="name" placeholder="Name" required />
			<input type="email" name="email" placeholder="Email" required />
			<button type="submit">Send Invite</button>
		</form>
	</div>

	<div class="admin-section">
		<h2>Household Members</h2>
		<div class="members-list">
			{#each data.allMembers as member}
				<div class="member-row" class:deleted={member.deletedAt}>
					<div class="member-info">
						<strong>{member.name}</strong> 
						<span class="ink-muted">({member.email})</span>
						{#if member.isAdmin}
							<span class="admin-badge">ADMIN</span>
						{/if}
						{#if member.deletedAt}
							<span class="deleted-badge">REMOVED</span>
						{/if}
					</div>
					
					{#if !member.deletedAt}
						<div class="member-actions">
							{#if !member.isAdmin}
								<form method="POST" action="?/promoteAdmin" use:enhance>
									<input type="hidden" name="memberId" value={member.id} />
									<button type="submit" class="small-btn">Promote to Admin</button>
								</form>
							{/if}
							
							<form method="POST" action="?/removeMember" use:enhance>
								<input type="hidden" name="memberId" value={member.id} />
								<button type="submit" class="small-btn delete-btn">Remove</button>
							</form>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="admin-section">
		<h2>My Admin Status</h2>
		<div class="admin-controls">
			<a href="/admin/categories" class="small-btn edit-btn">Manage Categories</a>
			<form method="POST" action="?/stepDown" use:enhance style="display:inline-block;">
				<button type="submit" class="small-btn delete-btn">Step Down as Admin</button>
			</form>
		</div>
	</div>

	{#if data.isOnlyAdmin}
		<div class="admin-section danger-zone">
			<h2>Danger Zone</h2>
			<p>Resetting the household will permanently delete all data.</p>
			<form method="POST" action="?/resetHousehold" use:enhance class="reset-form">
				<input type="text" name="confirm" placeholder="Type CONFIRM to proceed" required />
				<button type="submit" class="delete-btn">Reset Household</button>
			</form>
		</div>
	{/if}
</div>

<style>
	.admin-container {
		max-width: 800px;
		margin: 40px auto;
		padding: 20px;
	}
	.admin-section {
		margin-bottom: 40px;
		padding-bottom: 20px;
		border-bottom: 1px solid var(--rule);
	}
	.add-form {
		display: flex;
		gap: 10px;
	}
	.add-form input {
		padding: 8px;
	}
	.invite-code-container {
		display: flex;
		align-items: center;
		gap: 15px;
		margin-top: 10px;
	}
	.member-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 0;
		border-bottom: 1px solid var(--paper-dark);
	}
	.member-row.deleted {
		opacity: 0.6;
	}
	.admin-badge, .deleted-badge {
		font-size: 0.7em;
		padding: 2px 6px;
		border-radius: 4px;
		margin-left: 10px;
		font-family: 'Special Elite', cursive;
	}
	.admin-badge {
		background: var(--stamp-blue);
		color: white;
	}
	.deleted-badge {
		background: var(--stamp-red);
		color: white;
	}
	.member-actions {
		display: flex;
		gap: 10px;
	}
	.small-btn {
		padding: 4px 8px;
		font-size: 0.9em;
		text-decoration: none;
	}
	.edit-btn {
		color: var(--stamp-blue);
		border: 1px solid var(--stamp-blue);
		background: none;
	}
	.admin-controls {
		display: flex;
		gap: 15px;
		align-items: center;
	}
	.delete-btn {
		color: var(--stamp-red);
		border-color: var(--stamp-red);
		background: none;
	}
	.danger-zone {
		border: 1px dashed var(--stamp-red);
		padding: 20px;
		background: rgba(139, 58, 42, 0.05);
	}
	.reset-form {
		display: flex;
		gap: 10px;
		margin-top: 15px;
	}
	.error-stamp {
		color: var(--stamp-red);
		margin-bottom: 20px;
	}

	@media (max-width: 600px) {
		.admin-container {
			padding: 0;
			margin: 0 auto;
		}
		.add-form {
			flex-direction: column;
		}
		.member-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 10px;
		}
		.invite-code-container {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
