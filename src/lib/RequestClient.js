import {TimeoutPromise} from './Utils'

const requestTimeout = 20000 // 20s

/**
 * Performs API requests.
 */
export async function Request(url, token, options) {
    if (!options) {
        options = {}
    }

    // Set the options
    const reqOptions = {
        method: 'GET',
        cache: 'no-store',
        credentials: 'omit',
        headers: new Headers()
    }

    // HTTP method
    if (options.method) {
        reqOptions.method = options.method
    }

    // POST data, if any
    if (options.postData) {
        // Ensure method is POST
        reqOptions.method = 'POST'

        const postParams = new URLSearchParams()
        for (const key in options.postData) {
            if (!Object.prototype.hasOwnProperty.call(options.postData, key)) {
                continue
            }
            postParams.set(key, options.postData[key])
        }

        reqOptions.body = postParams
    }

    // Headers
    if (options.headers && typeof options.headers == 'object') {
        for (const key in options.headers) {
            if (Object.prototype.hasOwnProperty.call(options.headers, key)) {
                reqOptions.headers.set(key, options.headers[key])
            }
        }
    }

    // Auth header
    reqOptions.headers.set('Authorization', 'Bearer ' + token)

    // Make the request
    const response = await TimeoutPromise(fetch(url, reqOptions), requestTimeout)

    // Check if we have a response with status code 200-299
    if (!response || !response.ok) {
        throw Error('Invalid response status code')
    }

    // We're expecting JSON data
    if (response.headers.get('content-type') != 'application/json') {
        throw Error('Response was not JSON')
    }

    // Read the response stream and get the data as text
    const data = await response.text()

    return data
}
