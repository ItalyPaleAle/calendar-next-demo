{#await p}
    <p>Loading…</p>
{:then data}
    <CalendarDetail {data} />
{:catch err}
    <p>Error: {err}</p>
{/await}

<script>
import CalendarDetail from './CalendarDetail.svelte'

import {Request} from '../lib/RequestClient'

const formatDate = (date) => {
    return date.toISOString().slice(0, -5)
}

// From now to 1 month later
const startDate = formatDate(new Date())
const endDate = formatDate(new Date(Date.now() + 86400 * 30 * 1000))
const url = 'https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=' + startDate + '&endDateTime=' + endDate + '&$top=1'
const p = Request(url)
    .then((response) => {
        const data = response && response.value && response.value.length && response.value[0]
        if (!data) {
            throw Error('Invalid response')
        }

        return data
    })
</script>