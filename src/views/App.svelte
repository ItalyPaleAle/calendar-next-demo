<h1>My app goes here</h1>
{#if $profile}
  <p>Authenticated:</p>
  <pre>{JSON.stringify($profile, null, 2)}</pre>
{:else}
  <p>Your authentication failed or the session has expired.</p>
  <a href={authUrl} class="btn btn-primary">Authenticate</a>
{/if}

<script>
import {profile} from '../stores'

import credentials from '../lib/Credentials'

// If we're not authenticated, request a URL
const authUrl = $profile ? undefined : credentials.authorizationUrl()
</script>
