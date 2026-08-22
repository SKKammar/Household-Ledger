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
		<div class="nav-links">
			{#if $page.url.pathname !== '/dashboard'}
				<a href="javascript:history.back()" class="back-btn">← Back</a>
				<span class="nav-separator">|</span>
			{/if}
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
	}
	.nav-links a:hover {
		color: var(--stamp-red);
		text-decoration: none;
	}
	.back-btn {
		font-weight: bold;
	}
	.nav-separator {
		color: var(--rule);
		margin: 0 5px;
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
