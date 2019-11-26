import credentials, {AuthenticationAttempts} from './lib/Credentials'
import {profile} from './stores'
import App from './views/App.svelte'

import './main.css'

const attempts = new AuthenticationAttempts()

async function handleSession() {
    // Check if we have an id_token and an access_token
    if (window.location.hash) {
        const matchIdToken = window.location.hash.match(/id_token=(([A-Za-z0-9\-_~+/]+)\.([A-Za-z0-9\-_~+/]+)(?:\.([A-Za-z0-9\-_~+/]+)))/)
        const matchAccessToken = window.location.hash.match(/access_token=(([A-Za-z0-9\-_~+/]+)\.([A-Za-z0-9\-_~+/]+)(?:\.([A-Za-z0-9\-_~+/]+)))/)
        const matchExpires = window.location.hash.match(/expires_in=([0-9]+)/)
        if (matchIdToken && matchIdToken[1] && matchAccessToken && matchAccessToken[1]) {
            // First thing: remove the token from the URL (for security)
            history.replaceState(undefined, undefined, '#')

            // Validate and store the JWT
            // If there's an error, redirect to auth page
            try {
                // Set (and validate) the JWT
                await credentials.setToken(matchIdToken[1])

                // Check if we have an expiry for the token
                const expiry = parseInt((matchExpires && matchExpires[1]) || 0, 10)

                // Set the access_token
                credentials.setAccessToken(matchAccessToken[1], expiry)

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

    // If we don't have credentials stored, redirect the user to the authentication page
    if (!credentials.getToken()) {
        return false
    }
    const accessToken = credentials.getAccessToken()
    if (!accessToken) {
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
        target: document.getElementById('appcontainer')
    })
})()

export default app
