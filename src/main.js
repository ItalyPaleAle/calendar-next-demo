import App from './views/App.svelte'

import './main.css'

const app = (async function() {
    // Crete a Svelte app by loading the main view
    window.svelteApp = new App({
        target: document.body
    })
})()

export default app
