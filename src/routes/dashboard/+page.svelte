<script lang="ts">
	import { goto } from '$app/navigation';
	export let data;

	function getMonthName(monthNumber: number) {
		const date = new Date();
		date.setMonth(monthNumber - 1);
		return date.toLocaleString('default', { month: 'long' });
	}

	function prevMonth() {
		let y = data.selectedYear;
		let m = data.selectedMonth - 1;
		if (m < 1) { m = 12; y--; }
		goto(`?year=${y}&month=${m}`);
	}

	function nextMonth() {
		let y = data.selectedYear;
		let m = data.selectedMonth + 1;
		if (m > 12) { m = 1; y++; }
		goto(`?year=${y}&month=${m}`);
	}

	$: currentMonthName = getMonthName(data.selectedMonth);
	$: currentYear = data.selectedYear;
	$: prevMonthName = getMonthName(data.selectedMonth === 1 ? 12 : data.selectedMonth - 1);
	$: nextMonthName = getMonthName(data.selectedMonth === 12 ? 1 : data.selectedMonth + 1);
</script>

<div class="dashboard-container">
	<div class="header">
		<div class="month-switcher">
			<button on:click={prevMonth} class="month-nav">← {prevMonthName}</button>
			<span class="month-current">{currentMonthName} {currentYear}</span>
			<button on:click={nextMonth} class="month-nav">{nextMonthName} →</button>
		</div>
	</div>

	<div class="actions">
		<a href="/expenses" class="btn-primary">Record New Expense</a>
	</div>

	<div class="members-grid">
		{#each data.memberData as { member, totalPaid, netShare }}
			<div class="member-card" style="--member-color: {member.avatarColor}">
				<div class="member-header">
					<h2>{member.name}</h2>
				</div>
				<div class="stats">
					<div class="stat-box">
						<span class="ink-muted stat-label">Total Paid</span>
						<span class="amount">₹{totalPaid.toFixed(2)}</span>
					</div>
					<div class="stat-box">
						<span class="ink-muted stat-label">Net Share</span>
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
		margin-bottom: 30px;
		padding-bottom: 20px;
		border-bottom: 2px solid var(--rule, #c8b99a);
		display: flex;
		justify-content: center;
	}
	.month-switcher {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.month-nav {
		font-family: 'Special Elite', cursive;
		font-size: 10px;
		letter-spacing: 0.1em;
		color: #9c8f78;
		background: none;
		border: none;
		cursor: pointer;
		transition: color 0.15s;
	}
	.month-nav:hover { color: #2c2518; }
	.month-current {
		font-family: 'Playfair Display', serif;
		font-size: 24px; /* Increased size to match h1-ish feel */
		font-weight: bold;
		color: #2c2518;
		min-width: 220px;
		text-align: center;
	}
	.actions {
		margin-bottom: 30px;
		text-align: center;
	}
	.members-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
	}
	.member-card {
		border: 1px solid #c8b99a;
		border-radius: 0;
		padding: 14px 16px;
		position: relative;
		overflow: hidden;
		background: transparent;
	}
	.member-card::before {
		content: '';
		position: absolute;
		left: 0; top: 0; bottom: 0;
		width: 4px;
		background: var(--member-color);
	}
	.member-header {
		margin-bottom: 20px;
	}
	.member-header h2 {
		margin: 0;
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
	.stat-label {
		font-family: 'Special Elite', cursive;
		font-size: 10px;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		margin-bottom: 4px;
	}
	.amount {
		font-size: 1.6em;
		font-weight: bold;
		font-family: 'Special Elite', cursive;
	}
	.highlight {
		color: var(--stamp-green, #3a6b4a);
	}
	.actions-link a {
		color: var(--ink, #2c2518);
		text-decoration: underline;
		font-family: 'Special Elite', cursive;
		font-size: 12px;
	}

	@media (max-width: 600px) {
		.dashboard-container {
			padding: 0;
			margin: 0 auto;
		}
		.month-switcher {
			flex-wrap: wrap;
			justify-content: center;
			gap: 10px;
		}
		.month-current {
			min-width: auto;
			font-size: 20px;
		}
		.members-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
