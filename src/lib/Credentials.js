import {RandomString} from './Utils'
import {DecodeString} from './Base64Utils'
import storage from './StorageService'
import IdTokenVerifier from 'idtoken-verifier'

/**
 * Returns true if a string represents a JWT token. This only checks if the string is in the right format, and doesn't parse the token.
 *
 * @param {string} string - String to test
 * @returns {boolean} True if the string is in the format of a JWT token
 */
export function IsJWT(string) {
    return string && !!string.match(/^([A-Za-z0-9\-_~+/]+[=]{0,2})\.([A-Za-z0-9\-_~+/]+[=]{0,2})(?:\.([A-Za-z0-9\-_~+/]+[=]{0,2}))?$/)
}

class Nonce {
    constructor() {
        this._nonceKeyName = 'calendar-next-nonce'
        this._nonceLength = 7
    }

    /**
     * Generates a new nonce and stores it in the session storage
     *
     * @returns {string} A nonce
     */
    generate() {
        // Generate a nonce
        const nonce = RandomString(this._nonceLength)

        // Store the nonce in the session
        storage.sessionStorage.setItem(this._nonceKeyName, nonce)

        return nonce
    }

    /**
     * Retrieves the last nonce from session storage
     *
     * @returns {string} A nonce
     */
    retrieve() {
        const read = storage.sessionStorage.getItem(this._nonceKeyName)

        const regExp = new RegExp('^[A-Za-z0-9_\\-]{' + this._nonceLength + '}$')
        if (!read || !read.match(regExp)) {
            return null
        }

        return read
    }
}

export class AuthenticationAttempts {
    constructor() {
        this._attemptsKeyName = 'calendar-next-attempts'
    }

    getAttempts() {
        return parseInt((storage.sessionStorage.getItem(this._attemptsKeyName) || 0), 10)
    }

    increaseAttempts() {
        const attempts = this.getAttempts()
        storage.sessionStorage.setItem(this._attemptsKeyName, attempts + 1)
        return attempts
    }

    resetAttempts() {
        storage.sessionStorage.setItem(this._attemptsKeyName, 0)
    }
}

export class Credentials {
    constructor() {
        this._sessionKeyName = 'calendar-next-jwt'
        this._accessTokenKeyName = 'calendar-next-token'
        this._tokenExpiryKeyName = 'calendar-next-expiry'
        this._tokenValidated = false
        this._nonce = new Nonce()
        this._profile = null
        this._accessToken = null
    }

    /**
     * Returns the authorization URL to point users to, storing the nonce
     *
     * @returns {string} Authorization URL
     */
    authorizationUrl() {
        if (!process.env.AUTH_URL) {
            throw Error('Empty AUTH_URL env variable')
        }
        if (!process.env.AUTH_CLIENT_ID) {
            throw Error('Empty AUTH_CLIENT_ID env variable')
        }

        // Return URL
        // Use APP_URL env var or fallback to the current URL
        let appUrl
        if (process.env.APP_URL) {
            appUrl = process.env.APP_URL
        }
        else {
            // Remove the fragment from the URL
            let href = window.location.href
            if (window.location.hash && window.location.hash.length) {
                href = href.slice(0, -1 * window.location.hash.length)
            }
            // Remove index.html from the end if present
            if (href.endsWith('index.html')) {
                href = href.slice(0, -10)
            }
            appUrl = href
        }

        // Ensure it ends with a /
        appUrl += appUrl.endsWith('/') ? '' : '/'

        // Generate a nonce
        const nonce = this._nonce.generate()

        // Generate the URL
        const map = {
            '{clientId}': process.env.AUTH_CLIENT_ID,
            '{nonce}': nonce,
            '{appUrl}': encodeURIComponent(appUrl)
        }
        return process.env.AUTH_URL.replace(
            new RegExp(Object.keys(map).join('|'), 'g'),
            (matched) => map[matched]
        )
    }
    /**
     * Returns the profile object from the JWT token
     *
     * @returns {Object} Profile for the authenticated user
     * @async
     */
    async getProfile() {
        // If we have a pre-parsed and pre-validated profile in memory, return that
        if (this._profile) {
            return this._profile
        }

        // Get the token
        const jwt = this.getToken()
        if (!jwt) {
            return {}
        }

        // Get the profile out of the token
        try {
            let profile = await this._validateToken(jwt)
            if (!profile) {
                profile = {}
            }
            this._profile = profile
            return profile
        }
        catch (e) {
            this._profile = {}
            throw e
        }
    }

    /**
     * Returns the JWT token for the session
     *
     * @returns {string|null} JWT Token, or null if no token
     */
    getToken() {
        const read = storage.sessionStorage.getItem(this._sessionKeyName)
        if (!read || !read.length) {
            return null
        }

        let data
        try {
            data = JSON.parse(read)
        }
        catch (error) {
            /* eslint-disable-next-line no-console */
            console.error('Error while parsing JSON from sessionStorage', error)
            throw Error('Could not get the token from session storage')
        }

        if (!data || !data.jwt || !IsJWT(data.jwt)) {
            return null
        }

        return data.jwt
    }

    /**
     * Returns the access_token for the session if it hasn't expired
     *
     * @returns {string|null} access_token, or null if it isn't set or it has expired
     */
    getAccessToken() {
        // If we have the token in memory, return it
        if (this._accessToken) {
            return this._accessToken
        }

        const read = storage.sessionStorage.getItem(this._accessTokenKeyName)
        if (!read || !read.length) {
            return null
        }

        // Check if it has expired
        const expiryRead = storage.sessionStorage.getItem(this._tokenExpiryKeyName)
        if (!expiryRead || !expiryRead.length) {
            return null
        }
        const expiry = (new Date(expiryRead)).getTime()
        const now = Date.now()
        if (expiry <= now) {
            return null
        }

        // Decode the token
        let data
        try {
            data = JSON.parse(read)
        }
        catch (error) {
            /* eslint-disable-next-line no-console */
            console.error('Error while parsing JSON from sessionStorage', error)
            throw Error('Could not get the token from session storage')
        }

        if (!data || !data.accessToken) {
            return null
        }

        // Set cache
        this._accessToken = data.accessToken

        return data.accessToken
    }

    /**
     * Stores the JWT token for the session
     *
     * @param {string} jwt - JWT Token
     * @async
     */
    async setToken(jwt) {
        // Delete the profile in memory
        this._profile = null

        // First, validate the token
        const profile = await this._validateToken(jwt)
        if (!profile) {
            throw Error('Token validation failed')
        }

        // Store the token
        storage.sessionStorage.setItem(this._sessionKeyName, JSON.stringify({jwt}))

        // Set the profile in memory
        this._profile = profile
    }

    /**
     * Stores the access_token for the session
     *
     * @param {string} accessToken
     * @param {number} expiry
     * @async
     */
    setAccessToken(accessToken, expiry) {
        // Store the token
        storage.sessionStorage.setItem(this._accessTokenKeyName, JSON.stringify({accessToken}))

        // Set the access token in memory
        this._accessToken = accessToken

        // If there's an expiry, store the time
        if (expiry) {
            storage.sessionStorage.setItem(this._tokenExpiryKeyName, (new Date(Date.now() + (expiry * 1000))).toISOString())
        }
    }

    /**
     * Validates a token
     *
     * @param {string} jwt - JWT token to validate
     * @returns {Promise<Object>} Extracted payload
     * @private
     */
    async _validateToken(jwt) {
        if (!process.env.AUTH_ISSUER) {
            throw Error('Empty AUTH_ISSUER env variable')
        }
        if (!process.env.AUTH_CLIENT_ID) {
            throw Error('Empty AUTH_CLIENT_ID env variable')
        }
        if (!process.env.JWKS_URL) {
            throw Error('Empty JWKS_URL env variable')
        }

        // Check the format
        if (!jwt || !IsJWT(jwt)) {
            throw Error('Invalid token')
        }

        // Replace the tenant id in the issuer. We need to parse the jwt and look at the tid property
        // We already know that the format is right
        let tenant
        try {
            const [, jwtPayloadB64] = jwt.split('.')
            const jwtPayloadStr = DecodeString(jwtPayloadB64)
            const jwtPayload = JSON.parse(jwtPayloadStr)
            tenant = jwtPayload && jwtPayload.tid
        }
        catch (e) {
            throw Error('JWT payload is invalid')
        }
        if (!tenant) {
            throw Error('Tenant ID missing in payload')
        }

        // Get the issuer
        const issuer = process.env.AUTH_ISSUER.replace('{tenant}', tenant)

        // Validate the token
        const verifier = new IdTokenVerifier({
            jwksURI: process.env.JWKS_URL,
            issuer,
            audience: process.env.AUTH_CLIENT_ID
        })
        const payload = await new Promise((resolve, reject) => {
            verifier.verify(jwt, this._nonce.retrieve(), (error, payload) => {
                if (error) {
                    // eslint-disable-next-line no-console
                    console.error('Validation error', error)
                    reject(error)
                }

                resolve(payload)
            })
        })

        return payload
    }
}

const credentials = new Credentials()
export default credentials
