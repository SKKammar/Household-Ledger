<script lang="ts">
	import './styles.css';
	import { page } from '$app/stores';
	
	// Exclude nav on public routes or print mode
	$: isPublic = ['/login', '/setup', '/auth/verify'].includes($page.url.pathname);
	$: isPrint = $page.url.searchParams.get('print') === '1';
	$: showNav = !isPublic && !isPrint;
</script>

{#if showNav}
	<nav class="nav-container">
		{#if $page.url.pathname !== '/dashboard'}
			<button type="button" on:click={() => window.history.back()} class="back-btn">← Back</button>
		{/if}
		<div class="nav-links">
			<a href="/dashboard">Dashboard</a>
			<a href="/expenses">Record Expense</a>
			<a href="/statement">My Statement</a>
			<a href="/admin">Admin</a>
		</div>
	</nav>
{/if}

<div class={isPrint ? '' : 'page-container'}>
	<slot />
</div>

<style>
	.nav-container {
		background: var(--paper-dark);
		padding: 15px 52px; /* aligns with margin */
		border-bottom: 2px double var(--rule);
		margin-bottom: 20px;
		position: relative;
	}
	.nav-links {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		padding-left: 28px;
	}
	.nav-links a {
		font-family: 'Special Elite', cursive;
		color: var(--ink);
		text-transform: uppercase;
		font-size: 0.9rem;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}
	.nav-links a:hover {
		color: var(--stamp-red);
		text-decoration: none;
	}
	.back-btn {
		position: absolute;
		left: 15px;
		top: 50%;
		transform: translateY(-50%);
		font-weight: bold;
		font-family: 'Special Elite', cursive;
		color: var(--ink);
		text-transform: uppercase;
		font-size: 0.9rem;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}
	.back-btn:hover {
		color: var(--stamp-red);
	}

	@media (max-width: 600px) {
		.nav-container {
			padding: 15px 15px;
		}
		.nav-links {
			padding-left: 0;
			gap: 15px;
		}
	}
</style>
