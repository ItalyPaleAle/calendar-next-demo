<p>
    Your next appointment is
    {#if (start.getTime() - now) < 7200 * 1000}
        in {parseInt((start.getTime() - now) / (60 * 1000))} minutes
    {:else if (start.getTime() - now) < 86400 * 1000}
        in {parseInt((start.getTime() - now) / (3600 * 1000))} hours
    {:else}
        at {start.toString()}
    {/if}
</p>
<pre>{JSON.stringify(data, null, 2)}</pre>

<script>
export let data = {}
const now = Date.now()
let start
let end
$: {
    start = new Date(data.start.dateTime + 'Z')
    end = new Date(data.end.dateTime + 'Z')
}
</script>