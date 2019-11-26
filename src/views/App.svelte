{#if $profile}
  <h1 class="mb-6">Hello, {$profile.name} <span class="text-gray-600 block md:ml-4 md:inline-block">What's next on your calendar</span></h1>
  <CalendarView />
{:else}
  <h1>Oopsie…</h1>
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
