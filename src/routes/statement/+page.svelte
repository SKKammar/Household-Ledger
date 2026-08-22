<script lang="ts">
	import { page } from '$app/stores';
	export let data;

	$: printMode = $page.url.searchParams.get('print') === '1';

	function getMonthName(monthNumber: number) {
		const date = new Date();
		date.setMonth(monthNumber - 1);
		return date.toLocaleString('default', { month: 'long' });
	}

	function formatDate(dateStr: string) {
		const [_, m, d] = dateStr.split('-');
		const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		return `${d} ${months[parseInt(m) - 1]}`;
	}
</script>

<svelte:head>
	<title>{data.targetMember.name}'s Statement</title>
</svelte:head>

<main class="statement-wrapper" class:screenshot-mode={printMode}>
	<div class="statement-header">
		<h1>{data.targetMember.name}</h1>
		<div class="statement-date">{getMonthName(data.month)} {data.year}</div>
	</div>

	{#if !printMode}
		<div class="no-print">
			<a href="?print=1&year={data.year}&month={data.month}" class="button">Print View</a>
		</div>
	{/if}

	<div class="divider"></div>

	<div class="expense-list">
		{#if data.ownExpenses.length === 0}
			<div class="empty-state ink-muted">No expenses recorded for this month.</div>
		{/if}
		{#each data.ownExpenses as expense, i}
			<div class="expense-row" style="animation-delay: {i * 0.07}s">
				<div class="expense-date">{formatDate(expense.date)}</div>
				<div class="expense-category">{expense.category?.name || 'Unknown'}</div>
				<div class="expense-amount">₹{expense.amount.toFixed(2)}</div>
				<div class="expense-note">
					{#if expense.note}{expense.note}{/if}
					{#if expense.isSplit}<span class="split-badge">(split among {expense.splitAmong})</span>{/if}
				</div>
			</div>
		{/each}
	</div>

	<div class="divider thick"></div>

	<div class="totals-row">
		<div class="total-label">Total Paid</div>
		<div class="total-amount">₹{data.totalPaid.toFixed(2)}</div>
	</div>
	<div class="totals-row accent">
		<div class="total-label">Net Share</div>
		<div class="total-amount highlight">₹{data.netShare.toFixed(2)}</div>
	</div>

	{#if data.filteredSplits.length > 0}
		<div class="splits-section">
			<h3>Split Contributions Received</h3>
			<div class="divider"></div>
			{#each data.filteredSplits as split, i}
				<div class="expense-row split-row" style="animation-delay: {i * 0.07}s">
					<div class="expense-date">{formatDate(split.expense.date)}</div>
					<div class="expense-category">{split.expense.category?.name || 'Unknown'}</div>
					<div class="expense-desc">
						<strong>{split.expense.member.name}</strong> split with you
					</div>
					<div class="expense-amount highlight">₹{split.shareAmount.toFixed(2)}</div>
				</div>
			{/each}
		</div>
	{/if}
</main>

<style>
	.statement-wrapper {
		max-width: 700px;
		margin: 40px auto;
		padding: 40px;
		background: var(--paper, #f0ebe0);
		border-radius: 4px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.05);
	}
	
	.screenshot-mode {
		margin: 0;
		padding: 20px;
		box-shadow: none;
		max-width: 100%;
		border-radius: 0;
	}
	.screenshot-mode :global(.nav-container) {
		display: none !important;
	}

	.statement-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 20px;
	}
	.statement-date {
		font-family: 'Special Elite', cursive;
		color: var(--ink-faded, #6b5f4a);
		font-size: 1.2em;
	}

	.divider {
		height: 1px;
		background: var(--rule, #c8b99a);
		margin: 20px 0;
	}
	.divider.thick {
		height: 2px;
		background: var(--accent-line, #b8a070);
	}

	.expense-row {
		display: grid;
		grid-template-columns: 80px 120px 100px 1fr;
		gap: 15px;
		padding: 8px 0;
		border-bottom: 1px solid var(--paper-dark, #e4dccc);
		font-family: 'Lato', sans-serif;
	}
	
	.expense-amount, .total-amount {
		font-family: 'Special Elite', cursive;
		text-align: right;
	}

	.expense-note {
		color: var(--ink-faded, #6b5f4a);
		font-size: 0.9em;
	}

	.split-badge {
		color: var(--stamp-amber, #7a5a1a);
		font-style: italic;
	}

	.totals-row {
		display: flex;
		justify-content: space-between;
		padding: 10px 0;
		font-size: 1.2em;
	}
	.totals-row.accent {
		font-weight: bold;
		font-size: 1.4em;
	}
	.highlight {
		color: var(--stamp-green, #3a6b4a);
	}

	.splits-section {
		margin-top: 40px;
	}
	.splits-section h3 {
		font-family: 'Special Elite', cursive;
		color: var(--ink-faded, #6b5f4a);
	}

	@keyframes ink-draw {
		from { opacity: 0; transform: translateX(-4px); clip-path: inset(0 100% 0 0); }
		to { opacity: 1; transform: translateX(0); clip-path: inset(0 0% 0 0); }
	}
	
	.expense-row {
		animation: ink-draw 0.4s ease-out forwards;
		opacity: 0;
	}
	
	@media (prefers-reduced-motion: reduce) {
		.expense-row {
			animation: none;
			opacity: 1;
		}
	}
</style>
