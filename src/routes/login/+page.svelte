<script lang="ts">
  import { enhance } from '$app/forms';

  let step: 'email' | 'picker' | 'sent' = 'email';
  let email = '';
  let households: Array<{
    memberId: string;
    householdName: string;
    createdAt: string;
  }> = [];
  let errorMessage = '';

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  function handleEmailResult({ result }: any) {
    if (result.type === 'success') {
      errorMessage = '';
      if (result.data?.error) {
         errorMessage = result.data.error;
      } else if (result.data?.sent) {
        step = 'sent';
      } else if (result.data?.households) {
        households = result.data.households;
        email = result.data.email;
        step = 'picker';
      }
    }
  }

  function handlePickResult({ result }: any) {
    if (result.type === 'success') {
       errorMessage = '';
       if (result.data?.error) {
           errorMessage = result.data.error;
       } else if (result.data?.sent) {
           step = 'sent';
       }
    }
  }
</script>

<div class="login-container">
	<h1>Sign the register.</h1>

	{#if errorMessage}
		<div class="error-stamp">{errorMessage}</div>
	{/if}

    <!-- STEP 1: EMAIL -->
    {#if step === 'email'}
      <form method="POST" action="?/findHouseholds"
        use:enhance={() => handleEmailResult}>
        <div class="form-group">
            <label class="field-label" for="email">Email Address</label>
            <input class="field-input" id="email" name="email" type="email"
              placeholder="yourname@email.com" required>
        </div>
        <button class="stamp-button" type="submit">Continue</button>
      </form>

    <!-- STEP 2: HOUSEHOLD PICKER -->
    {:else if step === 'picker'}
      <div class="login-sub">
        Which household are you entering?
      </div>
      <form method="POST" action="?/sendLink"
        use:enhance={() => handlePickResult}>
        <div class="household-picker">
          {#each households as h}
            <button
              type="submit"
              name="memberId"
              value={h.memberId}
              class="household-card"
            >
              <div class="household-name">{h.householdName}</div>
              <div class="household-since">
                Since {formatDate(h.createdAt)}
              </div>
            </button>
          {/each}
        </div>
      </form>
      <button class="back-link" on:click={() => step = 'email'}>
        &larr; Use a different email
      </button>

    <!-- STEP 3: SENT -->
    {:else if step === 'sent'}
      <div class="login-heading">Check your inbox.</div>
      <div class="login-sub">
        Link sent to {email}.<br>
        Expires in 15 minutes.
      </div>
    {/if}

	<div style="margin-top: 40px; text-align: center; font-family: 'Special Elite', cursive; font-size: 12px;">
		<a href="/join">Have an invite code?</a><br/><br/>
		<a href="/setup">Create a new household</a>
	</div>
</div>

<style>
    .login-container {
        max-width: 400px;
        margin: 40px auto;
        padding: 20px;
    }
    
    h1 {
        margin-bottom: 24px;
        font-size: 28px;
    }

	.form-group {
		margin-bottom: 20px;
	}

    .login-sub, .login-heading {
        margin-bottom: 16px;
        font-family: 'Playfair Display', serif;
        font-size: 18px;
    }
    
    .login-heading {
        font-weight: bold;
    }

    .error-stamp {
        color: var(--stamp-red, #8b3a2a);
        margin-bottom: 20px;
        font-family: 'Special Elite', cursive;
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
    
    .stamp-button {
        width: 100%;
        padding: 10px;
        background-color: var(--ink, #1a1a1a);
        color: #fff;
        border: none;
        cursor: pointer;
        font-family: 'Special Elite', cursive;
        transition: background-color 0.2s;
    }
    
    .stamp-button:hover {
        background-color: #333;
    }

    .household-picker {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 16px 0;
      width: 100%;
    }

    .household-card {
      width: 100%;
      text-align: left;
      background: none;
      border: 1px solid var(--rule, #d0c8b8);
      padding: 14px 16px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: border-color 0.15s, background 0.15s;
    }

    /* Left stripe — ledger identity */
    .household-card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 3px;
      background: var(--ink, #1a1a1a);
      transform: scaleY(0);
      transition: transform 0.15s;
      transform-origin: center;
    }

    .household-card:hover {
      border-color: var(--ink, #1a1a1a);
      background: rgba(44, 37, 24, 0.03);
    }

    .household-card:hover::before {
      transform: scaleY(1);
    }

    .household-name {
      font-family: 'Playfair Display', serif;
      font-size: 15px;
      font-weight: 500;
      color: var(--ink, #1a1a1a);
      margin-bottom: 3px;
    }

    .household-since {
      font-family: 'Special Elite', cursive;
      font-size: 10px;
      letter-spacing: 0.08em;
      color: var(--ink-muted, #666);
    }

    .back-link {
      font-family: 'Special Elite', cursive;
      font-size: 10px;
      letter-spacing: 0.1em;
      color: var(--ink-muted, #666);
      background: none;
      border: none;
      cursor: pointer;
      margin-top: 12px;
      transition: color 0.15s;
    }

    .back-link:hover { color: var(--ink, #1a1a1a); }
</style>
