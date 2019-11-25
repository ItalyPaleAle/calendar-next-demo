{#if $profile}
  <h1>Hello, {$profile.name}</h1>
  <CalendarView />
{:else}
  <p>Your authentication failed or the session has expired.</p>
  <a href={authUrl} class="btn btn-primary">Authenticate</a>
{/if}

<script>
import CalendarView from './CalendarView.svelte'

import {profile} from '../stores'
import credentials from '../lib/Credentials'

// If we're not authenticated, request a URL
const authUrl = $profile ? undefined : credentials.authorizationUrl()
</script>
