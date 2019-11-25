import credentials, {AuthenticationAttempts} from './lib/Credentials'
import {profile} from './stores'
import App from './views/App.svelte'

import './main.css'

const attempts = new AuthenticationAttempts()

async function handleSession() {
    // Check if we have an id_token
    if (window.location.hash) {
        const match = window.location.hash.match(/id_token=(([A-Za-z0-9\-_~+/]+)\.([A-Za-z0-9\-_~+/]+)(?:\.([A-Za-z0-9\-_~+/]+)))/)
        if (match && match[1]) {
            // First thing: remove the token from the URL (for security)
            history.replaceState(undefined, undefined, '#')

            // Validate and store the JWT
            // If there's an error, redirect to auth page
            try {
                await credentials.setToken(match[1])

                // Reset attempts counter
                attempts.resetAttempts()
            }
            catch (error) {
                /* eslint-disable-next-line no-console */
                console.error('Token error', error)

                return false
            }
        }
    }

    // If we have credentials stored, redirect the user to the authentication page
    if (!credentials.getToken()) {
        return false
    }

    // Get the profile
    // If there's no session or it has expired, redirect to auth page
    let profileResult = null
    try {
        profileResult = await credentials.getProfile()
        profile.set(profileResult)
    }
    catch (error) {
        /* eslint-disable-next-line no-console */
        console.error('Token error', error)

        return false
    }

    return profileResult
}

const app = (async function() {
    // Load profile and check session
    const profileResult = await handleSession()

    // If we're not authenticated, and this is the first attempt, automatically redirect users
    if (!profileResult) {
        if (attempts.increaseAttempts() < 1) {
            window.location.href = credentials.authorizationUrl()
            return
        }
    }

    // Crete a Svelte app by loading the main view
    window.svelteApp = new App({
        target: document.body
    })
})()

export default app
