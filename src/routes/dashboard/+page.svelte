<script lang="ts">
	import { goto } from '$app/navigation';
	export let data;

	function getMonthName(monthNumber: number) {
		const date = new Date();
		date.setMonth(monthNumber - 1);
		return date.toLocaleString('default', { month: 'long' });
	}

	function handleMonthChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const [year, month] = select.value.split('-');
		goto(`?year=${year}&month=${month}`);
	}
</script>

<div class="dashboard-container">
	<div class="header">
		<h1>Household Dashboard</h1>
		<div class="month-selector">
			<select on:change={handleMonthChange}>
				<option value="{data.selectedYear}-{data.selectedMonth}" selected>
					{getMonthName(data.selectedMonth)} {data.selectedYear}
				</option>
				<!-- Generate a few previous months for demonstration -->
				{#each Array(6) as _, i}
					{@const d = new Date(data.selectedYear, data.selectedMonth - 1 - (i+1))}
					<option value="{d.getFullYear()}-{d.getMonth() + 1}">
						{getMonthName(d.getMonth() + 1)} {d.getFullYear()}
					</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="actions">
		<a href="/expenses" class="button">Record New Expense</a>
	</div>

	<div class="members-grid">
		{#each data.memberData as { member, totalPaid, netShare }}
			<div class="member-card">
				<div class="member-header">
					<div class="avatar" style="background-color: {member.avatarColor}">{member.name.charAt(0)}</div>
					<h2>{member.name}</h2>
				</div>
				<div class="stats">
					<div class="stat-box">
						<span class="ink-muted">Total Paid</span>
						<span class="amount">₹{totalPaid.toFixed(2)}</span>
					</div>
					<div class="stat-box">
						<span class="ink-muted">Net Share</span>
						<span class="amount highlight">₹{netShare.toFixed(2)}</span>
					</div>
				</div>
				<div class="actions-link">
					<a href="/statement/{member.id}">View Statement →</a>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.dashboard-container {
		max-width: 800px;
		margin: 40px auto;
		padding: 20px;
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30px;
		padding-bottom: 20px;
		border-bottom: 2px solid var(--rule, #c8b99a);
	}
	.actions {
		margin-bottom: 30px;
	}
	.button {
		display: inline-block;
		padding: 10px 20px;
		background: var(--stamp-blue, #2a4a6b);
		color: white;
		text-decoration: none;
		border-radius: 2px;
	}
	.members-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
	}
	.member-card {
		background: var(--paper-dark, #e4dccc);
		padding: 20px;
		border-radius: 4px;
	}
	.member-header {
		display: flex;
		align-items: center;
		gap: 15px;
		margin-bottom: 20px;
	}
	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;
		font-size: 1.2em;
	}
	.stats {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;
	}
	.stat-box {
		display: flex;
		flex-direction: column;
	}
	.amount {
		font-size: 1.2em;
		font-weight: bold;
		font-family: 'Special Elite', cursive;
	}
	.highlight {
		color: var(--stamp-green, #3a6b4a);
	}
	.actions-link a {
		color: var(--ink, #2c2518);
		text-decoration: underline;
	}
</style>
