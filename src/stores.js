/* global PKG_NAME, PKG_VERSION */

import {writable, readable} from 'svelte/store'

export const profile = writable(null)
export const pkg = readable({
    name: PKG_NAME,
    version: PKG_VERSION
})
