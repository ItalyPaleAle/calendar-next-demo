/**
 * Returns a random string, useful for example as nonce.
 *
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
export function RandomString(length = 7) {
    const bytes = new Uint8Array(length)
    const random = window.crypto.getRandomValues(bytes)
    const result = []
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-_'
    random.forEach((c) => {
        result.push(charset[c % charset.length])
    })
    return result.join('')
}

/**
 * Returns a Promise that resolves after a certain amount of time, in ms
 */
export function WaitPromise(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time || 0)
    })
}

/**
 * Sets a timeout on a Promise, so it's automatically rejected if it doesn't resolve within a certain time.
 * @param {Promise<T>} promise - Promise to execute
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<T>} Promise with a timeout
 */
export function TimeoutPromise(promise, timeout) {
    // Inspired by https://stackoverflow.com/a/49857905/192024
    return Promise.race([
        WaitPromise(timeout).then(() => {
            throw Error('Promise has timed out')
        }),
        promise
    ])
}
