<script lang="ts">
	import './styles.css';
	import { page, navigating } from '$app/stores';
	import { onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	
	// View Transitions API
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// Exclude nav on public routes or print mode
	$: isPublic = ['/login', '/setup', '/auth/verify', '/join'].includes($page.url.pathname);
	$: isPrint = $page.url.searchParams.get('print') === '1';
	$: showNav = !isPublic && !isPrint;
</script>

<svelte:head>
	<meta name="sveltekit:preload-data" content="hover" />
</svelte:head>

{#if $navigating}
	<div class="nav-progress"></div>
{/if}

{#if showNav}
	<header class="mobile-header">
		<span class="app-title">Household Ledger</span>
		<form action="/logout" method="POST" class="mobile-logout">
			<button type="submit" class="logout-btn">Logout</button>
		</form>
	</header>

	<nav class="nav-container">
		{#if $page.url.pathname !== '/dashboard'}
			<button type="button" on:click={() => window.history.back()} class="back-btn">← Back</button>
		{/if}
		<div class="nav-links">
			<a href="/dashboard" class:active={$page.url.pathname === '/dashboard'}>Dashboard</a>
			<a href="/expenses" class:active={$page.url.pathname.startsWith('/expenses')}>Record</a>
			<a href="/statement" class:active={$page.url.pathname.startsWith('/statement')}>Statement</a>
			<a href="/admin" class:active={$page.url.pathname.startsWith('/admin')}>Admin</a>
		</div>
		<form action="/logout" method="POST" class="logout-form desktop-only">
			<button type="submit" class="logout-btn">Logout</button>
		</form>
	</nav>
{/if}

<div class={isPrint ? '' : 'page-container'}>
	<slot />
</div>

<style>
	.nav-container {
		background: var(--paper);
		padding: 15px 52px; /* aligns with margin */
		border-bottom: 1px solid var(--rule);
		margin-bottom: 20px;
		position: relative;
		color: var(--ink);
	}
	.nav-links {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 20px;
	}
	.nav-links a, .back-btn, .logout-btn {
		font-family: 'Special Elite', cursive;
		font-size: 10px;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--ink-muted);
		text-decoration: none;
		transition: color 0.15s;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}
	.nav-links a:hover, .back-btn:hover, .logout-btn:hover, .nav-links a.active {
		color: var(--ink);
	}
	.nav-links a.active {
		font-weight: bold;
		border-bottom: 1px solid var(--ink);
		padding-bottom: 2px;
	}
	.back-btn {
		position: absolute;
		left: 15px;
		top: 50%;
		transform: translateY(-50%);
		font-weight: bold;
	}
	.logout-form {
		position: absolute;
		right: 15px;
		top: 50%;
		transform: translateY(-50%);
		margin: 0;
	}
	.logout-btn {
		font-weight: bold;
	}

	.mobile-header {
		display: none;
	}

	@media (max-width: 600px) {
		.mobile-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 15px 20px;
			background: var(--paper);
			border-bottom: 1px solid var(--rule);
			position: sticky;
			top: 0;
			z-index: 100;
		}
		.app-title {
			font-family: 'Playfair Display', serif;
			font-weight: 600;
			font-size: 1.2rem;
			color: var(--ink);
		}
		.desktop-only {
			display: none;
		}
		.nav-container {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			margin-bottom: 0;
			padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
			border-bottom: none;
			border-top: 1px solid var(--rule);
			z-index: 100;
			background: var(--paper);
			display: flex;
			justify-content: center;
		}
		.nav-links {
			width: 100%;
			justify-content: space-around;
			gap: 0;
		}
		.nav-links a {
			flex: 1;
			text-align: center;
			padding: 10px 5px;
			font-size: 11px;
		}
		.nav-links a.active {
			border-bottom: none;
			padding-bottom: 10px;
			color: var(--ink);
			background: var(--paper-dark);
			border-radius: 4px;
		}
		.back-btn {
			display: none; /* Let them use browser back on mobile or native swipe */
		}
	}
	
	.nav-progress {
		position: fixed;
		top: 0;
		left: 0;
		height: 3px;
		background: var(--ink);
		width: 100%;
		animation: progress 800ms ease-out forwards;
		z-index: 9999;
	}

	@keyframes progress {
		from { transform: scaleX(0); transform-origin: left; }
		to   { transform: scaleX(1); transform-origin: left; }
	}
</style>
